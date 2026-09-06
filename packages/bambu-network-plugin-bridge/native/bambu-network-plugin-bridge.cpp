// SPDX-License-Identifier: MPL-2.0

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <softpub.h>
#include <wincrypt.h>
#include <wintrust.h>

#include <algorithm>
#include <chrono>
#include <filesystem>
#include <functional>
#include <iostream>
#include <mutex>
#include <optional>
#include <string>
#include <thread>
#include <vector>

namespace {

constexpr char ABI_PREFIX[] = "02.08.02";

using OnDiscovery = std::function<void(std::string)>;
using OnLocalConnect = std::function<void(int, std::string, std::string)>;
using OnLocalMessage = std::function<void(std::string, std::string)>;

using CheckDebugConsistent = bool (*)(bool);
using GetPluginVersion = std::string (*)();
using CreateAgent = void* (*)(std::string);
using DestroyAgent = int (*)(void*);
using SetConfigDirectory = int (*)(void*, std::string);
using SetCertificateFile = int (*)(void*, std::string, std::string);
using SetCountryCode = int (*)(void*, std::string);
using StartAgent = int (*)(void*);
using SetDiscoveryCallback = int (*)(void*, OnDiscovery);
using StartDiscovery = bool (*)(void*, bool, bool);
using SetLocalConnectCallback = int (*)(void*, OnLocalConnect);
using SetLocalMessageCallback = int (*)(void*, OnLocalMessage);
using ConnectPrinter = int (*)(void*, std::string, std::string, std::string, std::string, bool);
using DisconnectPrinter = int (*)(void*);

std::mutex output_mutex;

std::string to_utf8(const std::wstring& value) {
    if (value.empty()) {
        return {};
    }
    const int required = WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr, nullptr);
    std::string output(static_cast<std::size_t>(required), '\0');
    WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), output.data(), required, nullptr, nullptr);
    return output;
}

std::string json_escape(const std::string& value) {
    std::string output;
    output.reserve(value.size());
    for (const unsigned char character : value) {
        switch (character) {
            case '\\': output += "\\\\"; break;
            case '"': output += "\\\""; break;
            case '\n': output += "\\n"; break;
            case '\r': output += "\\r"; break;
            case '\t': output += "\\t"; break;
            default:
                if (character >= 0x20) {
                    output += static_cast<char>(character);
                }
        }
    }
    return output;
}

std::string base64_encode(const std::string& input) {
    static constexpr char alphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string output;
    output.reserve(((input.size() + 2) / 3) * 4);
    std::size_t index = 0;
    while (index + 2 < input.size()) {
        const unsigned value = (static_cast<unsigned char>(input[index]) << 16) |
                               (static_cast<unsigned char>(input[index + 1]) << 8) |
                               static_cast<unsigned char>(input[index + 2]);
        output.push_back(alphabet[(value >> 18) & 0x3f]);
        output.push_back(alphabet[(value >> 12) & 0x3f]);
        output.push_back(alphabet[(value >> 6) & 0x3f]);
        output.push_back(alphabet[value & 0x3f]);
        index += 3;
    }
    if (index < input.size()) {
        unsigned value = static_cast<unsigned char>(input[index]) << 16;
        output.push_back(alphabet[(value >> 18) & 0x3f]);
        if (index + 1 < input.size()) {
            value |= static_cast<unsigned char>(input[index + 1]) << 8;
            output.push_back(alphabet[(value >> 12) & 0x3f]);
            output.push_back(alphabet[(value >> 6) & 0x3f]);
            output.push_back('=');
        } else {
            output.push_back(alphabet[(value >> 12) & 0x3f]);
            output.push_back('=');
            output.push_back('=');
        }
    }
    return output;
}

void emit_line(const std::string& line) {
    std::lock_guard<std::mutex> lock(output_mutex);
    std::cout << line << std::endl;
}

void emit_payload(const char* type, const std::string& payload) {
    emit_line(std::string("{\"type\":\"") + type + "\",\"payloadBase64\":\"" + base64_encode(payload) + "\"}");
}

bool verify_authenticode(const std::filesystem::path& path) {
    WINTRUST_FILE_INFO file_info{};
    file_info.cbStruct = sizeof(file_info);
    file_info.pcwszFilePath = path.c_str();

    WINTRUST_DATA trust_data{};
    trust_data.cbStruct = sizeof(trust_data);
    trust_data.dwUIChoice = WTD_UI_NONE;
    trust_data.fdwRevocationChecks = WTD_REVOKE_NONE;
    trust_data.dwUnionChoice = WTD_CHOICE_FILE;
    trust_data.pFile = &file_info;
    trust_data.dwStateAction = WTD_STATEACTION_VERIFY;
    trust_data.dwProvFlags = WTD_CACHE_ONLY_URL_RETRIEVAL | WTD_REVOCATION_CHECK_NONE;

    GUID policy = WINTRUST_ACTION_GENERIC_VERIFY_V2;
    const LONG result = WinVerifyTrust(nullptr, &policy, &trust_data);
    trust_data.dwStateAction = WTD_STATEACTION_CLOSE;
    WinVerifyTrust(nullptr, &policy, &trust_data);
    return result == ERROR_SUCCESS;
}

std::optional<std::vector<BYTE>> signer_hash(const std::filesystem::path& path) {
    HCERTSTORE store = nullptr;
    HCRYPTMSG message = nullptr;
    DWORD encoding = 0;
    DWORD content = 0;
    DWORD format = 0;
    if (!CryptQueryObject(
            CERT_QUERY_OBJECT_FILE,
            path.c_str(),
            CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED_EMBED,
            CERT_QUERY_FORMAT_FLAG_BINARY,
            0,
            &encoding,
            &content,
            &format,
            &store,
            &message,
            nullptr)) {
        return std::nullopt;
    }

    DWORD signer_size = 0;
    if (!CryptMsgGetParam(message, CMSG_SIGNER_INFO_PARAM, 0, nullptr, &signer_size)) {
        CryptMsgClose(message);
        CertCloseStore(store, 0);
        return std::nullopt;
    }
    std::vector<BYTE> signer_buffer(signer_size);
    if (!CryptMsgGetParam(message, CMSG_SIGNER_INFO_PARAM, 0, signer_buffer.data(), &signer_size)) {
        CryptMsgClose(message);
        CertCloseStore(store, 0);
        return std::nullopt;
    }

    const auto* signer = reinterpret_cast<const CMSG_SIGNER_INFO*>(signer_buffer.data());
    CERT_INFO certificate_info{};
    certificate_info.Issuer = signer->Issuer;
    certificate_info.SerialNumber = signer->SerialNumber;
    PCCERT_CONTEXT certificate = CertFindCertificateInStore(
        store,
        X509_ASN_ENCODING | PKCS_7_ASN_ENCODING,
        0,
        CERT_FIND_SUBJECT_CERT,
        &certificate_info,
        nullptr);
    if (!certificate) {
        CryptMsgClose(message);
        CertCloseStore(store, 0);
        return std::nullopt;
    }

    DWORD hash_size = 0;
    CertGetCertificateContextProperty(certificate, CERT_SHA256_HASH_PROP_ID, nullptr, &hash_size);
    std::vector<BYTE> hash(hash_size);
    const bool success = hash_size > 0 &&
                         CertGetCertificateContextProperty(certificate, CERT_SHA256_HASH_PROP_ID, hash.data(), &hash_size);
    CertFreeCertificateContext(certificate);
    CryptMsgClose(message);
    CertCloseStore(store, 0);
    if (!success) {
        return std::nullopt;
    }
    hash.resize(hash_size);
    return hash;
}

bool is_matching_official_install(const std::filesystem::path& plugin, const std::filesystem::path& studio) {
    if (_wcsicmp(plugin.filename().c_str(), L"bambu_networking.dll") != 0 ||
        _wcsicmp(studio.filename().c_str(), L"bambu-studio.exe") != 0 ||
        !std::filesystem::is_regular_file(plugin) ||
        !std::filesystem::is_regular_file(studio) ||
        !verify_authenticode(plugin) ||
        !verify_authenticode(studio)) {
        return false;
    }
    const auto plugin_signer = signer_hash(plugin);
    const auto studio_signer = signer_hash(studio);
    return plugin_signer && studio_signer && *plugin_signer == *studio_signer;
}

std::optional<std::wstring> option_value(int argc, wchar_t** argv, const wchar_t* option) {
    for (int index = 2; index + 1 < argc; ++index) {
        if (wcscmp(argv[index], option) == 0) {
            return std::wstring(argv[index + 1]);
        }
    }
    return std::nullopt;
}

std::optional<std::string> take_environment_value(const wchar_t* name) {
    const DWORD required = GetEnvironmentVariableW(name, nullptr, 0);
    if (required == 0) {
        return std::nullopt;
    }
    std::wstring value(required, L'\0');
    const DWORD written = GetEnvironmentVariableW(name, value.data(), required);
    SetEnvironmentVariableW(name, nullptr);
    if (written == 0) {
        return std::nullopt;
    }
    value.resize(written);
    return to_utf8(value);
}

template <typename Function>
Function resolve(HMODULE module, const char* name) {
    return reinterpret_cast<Function>(GetProcAddress(module, name));
}

struct Runtime {
    HMODULE module = nullptr;
    DLL_DIRECTORY_COOKIE directory_cookie = nullptr;
    void* agent = nullptr;
    CheckDebugConsistent check_debug = nullptr;
    GetPluginVersion get_version = nullptr;
    CreateAgent create_agent = nullptr;
    DestroyAgent destroy_agent = nullptr;
    SetConfigDirectory set_config_directory = nullptr;
    SetCertificateFile set_certificate_file = nullptr;
    SetCountryCode set_country_code = nullptr;
    StartAgent start_agent = nullptr;
    SetDiscoveryCallback set_discovery_callback = nullptr;
    StartDiscovery start_discovery = nullptr;
    SetLocalConnectCallback set_local_connect_callback = nullptr;
    SetLocalMessageCallback set_local_message_callback = nullptr;
    ConnectPrinter connect_printer = nullptr;
    DisconnectPrinter disconnect_printer = nullptr;

    void close() {
        if (agent && destroy_agent) {
            destroy_agent(agent);
            agent = nullptr;
        }
        if (module) {
            FreeLibrary(module);
            module = nullptr;
        }
        if (directory_cookie) {
            RemoveDllDirectory(directory_cookie);
            directory_cookie = nullptr;
        }
    }

    ~Runtime() { close(); }
};

bool load_runtime(const std::filesystem::path& plugin, const std::filesystem::path& studio, Runtime& runtime) {
    if (!is_matching_official_install(plugin, studio)) {
        return false;
    }
    SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_DEFAULT_DIRS | LOAD_LIBRARY_SEARCH_USER_DIRS);
    runtime.directory_cookie = AddDllDirectory(plugin.parent_path().c_str());
    runtime.module = LoadLibraryExW(
        plugin.c_str(),
        nullptr,
        LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR | LOAD_LIBRARY_SEARCH_DEFAULT_DIRS | LOAD_LIBRARY_SEARCH_USER_DIRS);
    if (!runtime.module) {
        return false;
    }

    runtime.check_debug = resolve<CheckDebugConsistent>(runtime.module, "bambu_network_check_debug_consistent");
    runtime.get_version = resolve<GetPluginVersion>(runtime.module, "bambu_network_get_version");
    runtime.create_agent = resolve<CreateAgent>(runtime.module, "bambu_network_create_agent");
    runtime.destroy_agent = resolve<DestroyAgent>(runtime.module, "bambu_network_destroy_agent");
    runtime.set_config_directory = resolve<SetConfigDirectory>(runtime.module, "bambu_network_set_config_dir");
    runtime.set_certificate_file = resolve<SetCertificateFile>(runtime.module, "bambu_network_set_cert_file");
    runtime.set_country_code = resolve<SetCountryCode>(runtime.module, "bambu_network_set_country_code");
    runtime.start_agent = resolve<StartAgent>(runtime.module, "bambu_network_start");
    runtime.set_discovery_callback = resolve<SetDiscoveryCallback>(runtime.module, "bambu_network_set_on_ssdp_msg_fn");
    runtime.start_discovery = resolve<StartDiscovery>(runtime.module, "bambu_network_start_discovery");
    runtime.set_local_connect_callback = resolve<SetLocalConnectCallback>(runtime.module, "bambu_network_set_on_local_connect_fn");
    runtime.set_local_message_callback = resolve<SetLocalMessageCallback>(runtime.module, "bambu_network_set_on_local_message_fn");
    runtime.connect_printer = resolve<ConnectPrinter>(runtime.module, "bambu_network_connect_printer");
    runtime.disconnect_printer = resolve<DisconnectPrinter>(runtime.module, "bambu_network_disconnect_printer");

    return runtime.check_debug && runtime.get_version && runtime.create_agent && runtime.destroy_agent &&
           runtime.set_config_directory && runtime.set_certificate_file && runtime.set_country_code &&
           runtime.start_agent && runtime.set_discovery_callback && runtime.start_discovery &&
           runtime.set_local_connect_callback && runtime.set_local_message_callback &&
           runtime.connect_printer && runtime.disconnect_printer && runtime.check_debug(false) &&
           runtime.get_version().rfind(ABI_PREFIX, 0) == 0;
}

bool initialize_agent(
    Runtime& runtime,
    const std::filesystem::path& config_directory,
    const std::filesystem::path& certificate_file) {
    const std::string config = to_utf8(config_directory.wstring());
    runtime.agent = runtime.create_agent(config);
    if (!runtime.agent) {
        return false;
    }
    return runtime.set_config_directory(runtime.agent, config) == 0 &&
           runtime.set_certificate_file(
               runtime.agent,
               to_utf8(certificate_file.parent_path().wstring()),
               to_utf8(certificate_file.filename().wstring())) == 0 &&
           runtime.set_country_code(runtime.agent, "US") == 0;
}

int run_probe(Runtime& runtime) {
    emit_line("{\"type\":\"probe\",\"available\":true,\"pluginVersion\":\"" +
              json_escape(runtime.get_version()) + "\",\"abiPrefix\":\"" + ABI_PREFIX + "\"}");
    return 0;
}

int run_discovery(
    Runtime& runtime,
    const std::filesystem::path& config_directory,
    const std::filesystem::path& certificate_file,
    int timeout_ms) {
    if (!initialize_agent(runtime, config_directory, certificate_file)) {
        return 6;
    }
    OnDiscovery on_discovery = [](std::string payload) { emit_payload("discovery", payload); };
    if (runtime.set_discovery_callback(runtime.agent, on_discovery) != 0 || runtime.start_agent(runtime.agent) != 0) {
        return 7;
    }
    runtime.start_discovery(runtime.agent, true, false);
    std::this_thread::sleep_for(std::chrono::milliseconds(timeout_ms));
    runtime.start_discovery(runtime.agent, false, false);
    emit_line("{\"type\":\"complete\"}");
    return 0;
}

int run_monitor(
    Runtime& runtime,
    const std::filesystem::path& config_directory,
    const std::filesystem::path& certificate_file) {
    auto device_id = take_environment_value(L"BPD_BRIDGE_DEVICE_ID");
    auto host = take_environment_value(L"BPD_BRIDGE_HOST");
    auto username = take_environment_value(L"BPD_BRIDGE_USERNAME");
    auto access_code = take_environment_value(L"BPD_BRIDGE_ACCESS_CODE");
    if (!device_id || !host || !username || !access_code ||
        !initialize_agent(runtime, config_directory, certificate_file)) {
        return 6;
    }

    OnLocalConnect on_connect = [](int state, std::string, std::string) {
        if (state == 0) {
            emit_line("{\"type\":\"state\",\"state\":\"connected\"}");
        } else if (state == 2) {
            emit_line("{\"type\":\"state\",\"state\":\"closed\"}");
        } else {
            emit_line("{\"type\":\"error\",\"category\":\"connection-failed\"}");
        }
    };
    OnLocalMessage on_message = [](std::string, std::string payload) { emit_payload("status", payload); };
    if (runtime.set_local_connect_callback(runtime.agent, on_connect) != 0 ||
        runtime.set_local_message_callback(runtime.agent, on_message) != 0 ||
        runtime.start_agent(runtime.agent) != 0) {
        return 7;
    }

    const int connect_result = runtime.connect_printer(
        runtime.agent,
        std::move(*device_id),
        std::move(*host),
        std::move(*username),
        std::move(*access_code),
        true);
    device_id.reset();
    host.reset();
    username.reset();
    access_code.reset();
    if (connect_result != 0) {
        emit_line("{\"type\":\"error\",\"category\":\"connection-failed\"}");
        return 8;
    }

    emit_line("{\"type\":\"ready\"}");
    std::string command;
    while (std::getline(std::cin, command)) {
        if (command == "stop") {
            break;
        }
    }
    runtime.disconnect_printer(runtime.agent);
    return 0;
}

}  // namespace

int wmain(int argc, wchar_t** argv) {
    if (argc < 2) {
        std::cerr << "bridge command required\n";
        return 2;
    }
    const auto plugin_value = option_value(argc, argv, L"--plugin");
    const auto studio_value = option_value(argc, argv, L"--studio");
    if (!plugin_value || !studio_value) {
        std::cerr << "official runtime paths required\n";
        return 2;
    }

    Runtime runtime;
    if (!load_runtime(*plugin_value, *studio_value, runtime)) {
        std::cerr << "official network plugin unavailable or incompatible\n";
        return 3;
    }

    const std::wstring command(argv[1]);
    if (command == L"probe") {
        return run_probe(runtime);
    }

    const auto config_value = option_value(argc, argv, L"--config-dir");
    const auto certificate_value = option_value(argc, argv, L"--cert-file");
    if (!config_value || !certificate_value) {
        std::cerr << "isolated runtime paths required\n";
        return 2;
    }
    if (command == L"discover") {
        const auto timeout_value = option_value(argc, argv, L"--timeout-ms");
        const int timeout_ms = timeout_value ? std::max(250, _wtoi(timeout_value->c_str())) : 5000;
        return run_discovery(runtime, *config_value, *certificate_value, timeout_ms);
    }
    if (command == L"monitor") {
        return run_monitor(runtime, *config_value, *certificate_value);
    }

    std::cerr << "unsupported bridge command\n";
    return 2;
}
