// SPDX-License-Identifier: MPL-2.0

import type {
  DeviceDetailDto,
  DeviceSummaryDto,
  HealthDto,
  RealPrinterCandidateDto,
  RealPrinterConnectionDto,
  RealPrinterConnectionRequest,
  RealPrinterReconfigurationRequest,
  SseEventDto
} from "@bpd/contracts";
import { Activity, Gauge, HardDrive, Pencil, PlugZap, RefreshCw, Router, Search, Trash2, WifiOff, X } from "lucide-react";
import type { FormEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, BrowserRouter as RouterProvider, Routes, useParams, useSearchParams } from "react-router-dom";
import {
  connectRealPrinter,
  fetchDevice,
  fetchDevices,
  fetchHealth,
  fetchRealPrinterCandidates,
  fetchRealPrinters,
  reconfigureRealPrinter,
  removeRealPrinter,
  subscribeToDeviceEvents
} from "./api.js";

type ConnectionState = "connecting" | "live" | "interrupted";
type DiscoveryState = "idle" | "searching" | "found" | "none" | "failed";
type TlsTrustProfile = NonNullable<RealPrinterConnectionRequest["tlsTrustProfile"]>;

/**
 * M1 browser application shell.
 */
export function App(): ReactElement {
  return (
    <RouterProvider>
      <DashboardShell />
    </RouterProvider>
  );
}

function DashboardShell(): ReactElement {
  const [devices, setDevices] = useState<DeviceSummaryDto[]>([]);
  const [health, setHealth] = useState<HealthDto | undefined>();
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const refresh = useCallback(async () => {
    const [nextDevices, nextHealth] = await Promise.all([fetchDevices(), fetchHealth()]);
    setDevices(nextDevices);
    setHealth(nextHealth);
  }, []);

  const showOfflineBanner = !isOnline || connectionState === "interrupted";

  useEffect(() => {
    void refresh().catch(() => setConnectionState("interrupted"));
    const unsubscribe = subscribeToDeviceEvents(
      (event) => {
        setConnectionState("live");
        if (event.type === "device.snapshot") {
          setDevices(event.devices);
        } else {
          setDevices((current) => upsertDevice(current, event));
        }
      },
      () => setConnectionState("interrupted")
    );
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    const healthTimer = window.setInterval(() => void fetchHealth().then(setHealth).catch(() => undefined), 5000);
    return () => {
      unsubscribe();
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.clearInterval(healthTimer);
    };
  }, [refresh]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BP</div>
          <div>
            <strong>Bambu Printer Dashboard</strong>
            <span>Independent read-only prototype</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary">
          <NavLink to="/">Fleet</NavLink>
          <NavLink to="/diagnostics">Diagnostics</NavLink>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">M2 real read-only prototype</p>
            <h1>Printer Monitoring</h1>
          </div>
          <div className="topbar-actions">
            <StatusPill label={isOnline ? "Browser online" : "Offline"} tone={isOnline ? "live" : "unavailable"} />
            <StatusPill label={`SSE ${connectionState}`} tone={connectionState === "live" ? "live" : "degraded"} />
          </div>
        </header>
        {showOfflineBanner ? (
          <section className="offline-banner" role="status">
            <WifiOff size={18} /> Offline or disconnected: cached shell only; live read-only updates are paused.
          </section>
        ) : null}
        <Routes>
          <Route path="/" element={<FleetView devices={devices} health={health} onRefresh={refresh} />} />
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
          <Route path="/diagnostics" element={<DiagnosticsView health={health} />} />
        </Routes>
      </main>
    </div>
  );
}

function FleetView({
  devices,
  health,
  onRefresh
}: {
  devices: DeviceSummaryDto[];
  health: HealthDto | undefined;
  onRefresh(): Promise<void>;
}): ReactElement {
  const [searchParams] = useSearchParams();
  const showSynthetic = searchParams.get("synthetic") === "1";
  const visibleDevices = useMemo(
    () => (showSynthetic ? devices : devices.filter((device) => device.source !== "synthetic")),
    [devices, showSynthetic]
  );
  const summary = useMemo(
    () => ({
      total: visibleDevices.length,
      live: visibleDevices.filter((device) => device.quality === "live").length,
      stale: visibleDevices.filter((device) => device.quality === "stale").length,
      unavailable: visibleDevices.filter((device) => device.quality === "unavailable").length
    }),
    [visibleDevices]
  );

  return (
    <div className="content-grid">
      <section className="metrics-band" aria-label="Fleet metrics">
        <Metric label="Devices" value={summary.total.toString()} />
        <Metric label="Live" value={summary.live.toString()} tone="live" />
        <Metric label="Stale" value={summary.stale.toString()} tone="stale" />
        <Metric label="Unavailable" value={summary.unavailable.toString()} tone="unavailable" />
      </section>
      <RealPrinterPanel health={health} onRefresh={onRefresh} />
      <section className="device-grid" aria-label="Dashboard devices">
        {visibleDevices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
        {visibleDevices.length === 0 ? (
          <div className="empty-state">
            <strong>No real printers configured</strong>
            <span>Use onboarding to add an approved read-only printer.</span>
          </div>
        ) : null}
      </section>
      <section className="diagnostic-strip">
        <HealthTile icon={<HardDrive size={18} />} label="SQLite" value={health?.database.journalMode ?? "checking"} />
        <HealthTile icon={<Activity size={18} />} label="Simulator" value={health?.simulator.scenario ?? "checking"} />
        <HealthTile icon={<Router size={18} />} label="Local name" value={health?.discovery.targetHost ?? "checking"} />
      </section>
    </div>
  );
}

function DeviceCard({ device }: { device: DeviceSummaryDto }): ReactElement {
  return (
    <article className={`device-card quality-${device.quality}`}>
      <div className="card-topline">
        <div>
          <h2>{device.displayName}</h2>
          <p>{device.modelHint}</p>
        </div>
        <StatusPill label={device.lifecycle} tone={device.quality} />
      </div>
      <div className="source-row">
        <span>{device.source === "synthetic" ? "Synthetic source" : "Real read-only source"}</span>
        <span>{device.adapterId}</span>
      </div>
      <div className="progress-block">
        <div className="progress-label">
          <span>{device.activeJobName ?? "No active print"}</span>
          <strong>{device.progressPercent ?? 0}%</strong>
        </div>
        <div className="progress-track" aria-label={`${device.displayName} print progress`}>
          <span style={{ width: `${device.progressPercent ?? 0}%` }} />
        </div>
      </div>
      <p className="status-message">{device.statusMessage}</p>
      <div className="capability-row">
        {device.capabilities.slice(0, 5).map((capability) => (
          <span key={capability.key} className={`capability ${capability.support}`}>
            {capability.label}
          </span>
        ))}
      </div>
      <Link className="details-link" to={`/devices/${device.id}`}>
        View details
      </Link>
    </article>
  );
}

function RealPrinterPanel({
  health,
  onRefresh
}: {
  health: HealthDto | undefined;
  onRefresh(): Promise<void>;
}): ReactElement {
  const [configuredPrinters, setConfiguredPrinters] = useState<RealPrinterConnectionDto[]>([]);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingPrinter, setEditingPrinter] = useState<RealPrinterConnectionDto | undefined>();
  const [displayName, setDisplayName] = useState("");
  const [modelHint, setModelHint] = useState("A1 Mini");
  const [host, setHost] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [port, setPort] = useState("8883");
  const [tlsTrustProfile, setTlsTrustProfile] = useState<TlsTrustProfile | "">("local-printer-chain");
  const [candidates, setCandidates] = useState<RealPrinterCandidateDto[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [discoveryNote, setDiscoveryNote] = useState<string | undefined>();
  const [lastConnection, setLastConnection] = useState<RealPrinterConnectionDto | undefined>();
  const [pendingRemovalId, setPendingRemovalId] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>("idle");
  const [autoDiscoveryStarted, setAutoDiscoveryStarted] = useState(false);
  const [configuredLoaded, setConfiguredLoaded] = useState(false);
  const configuredCount = Math.max(health?.realPrinterOnboarding.configuredPrinters ?? 0, configuredPrinters.length);

  const refreshConfiguredPrinters = useCallback(async () => {
    try {
      const printers = await fetchRealPrinters();
      setConfiguredPrinters(printers);
    } finally {
      setConfiguredLoaded(true);
    }
  }, []);

  const discover = useCallback(async () => {
    setDiscoveryState("searching");
    try {
      const discovery = await fetchRealPrinterCandidates();
      setCandidates(discovery.candidates);
      setDiscoveryNote(discovery.note);
      setDiscoveryState(discovery.status);
    } catch {
      setCandidates([]);
      setDiscoveryNote("Server-side discovery failed; manual host fallback remains available.");
      setDiscoveryState("failed");
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("saving");
    try {
      const printer =
        formMode === "edit" && editingPrinter
          ? await reconfigureRealPrinter(editingPrinter.id, buildReconfigurationRequest())
          : await connectRealPrinter(buildConnectionRequest());
      setLastConnection(printer);
      resetFormFields();
      setFormMode("create");
      setEditingPrinter(undefined);
      setSubmitState("saved");
      await refreshConfiguredPrinters();
      await onRefresh();
    } catch {
      setSubmitState("error");
      setAccessCode("");
    }
  };

  const buildConnectionRequest = (): RealPrinterConnectionRequest => {
    const request: RealPrinterConnectionRequest = {
      displayName,
      modelHint,
      serialNumber,
      accessCode,
      tlsTrustProfile: tlsTrustProfile || "local-printer-chain"
    };
    if (selectedCandidateId) {
      request.candidateId = selectedCandidateId;
    } else {
      request.host = host;
      request.port = Number.parseInt(port, 10) || 8883;
    }
    return request;
  };

  const buildReconfigurationRequest = (): RealPrinterReconfigurationRequest => {
    const request: RealPrinterReconfigurationRequest = {
      displayName,
      modelHint
    };
    if (selectedCandidateId) {
      request.candidateId = selectedCandidateId;
    } else {
      const parsedPort = Number.parseInt(port, 10);
      if (host.trim()) {
        request.host = host;
      }
      if (Number.isFinite(parsedPort)) {
        request.port = parsedPort;
      }
    }
    if (serialNumber.trim()) {
      request.serialNumber = serialNumber;
    }
    if (accessCode.trim()) {
      request.accessCode = accessCode;
    }
    if (tlsTrustProfile) {
      request.tlsTrustProfile = tlsTrustProfile;
    }
    return request;
  };

  const selectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate) {
      return;
    }
    setDisplayName(candidate.displayName);
    setModelHint(candidate.modelHint);
    setHost("");
  };

  const startEdit = (printer: RealPrinterConnectionDto) => {
    setFormMode("edit");
    setEditingPrinter(printer);
    setDisplayName(printer.displayName);
    setModelHint(printer.modelHint);
    setHost("");
    setSerialNumber("");
    setAccessCode("");
    setPort("");
    setTlsTrustProfile("");
    setSelectedCandidateId("");
    setSubmitState("idle");
  };

  const cancelEdit = () => {
    setFormMode("create");
    setEditingPrinter(undefined);
    resetFormFields();
    setSubmitState("idle");
  };

  const resetFormFields = () => {
    setDisplayName("");
    setModelHint("A1 Mini");
    setHost("");
    setSerialNumber("");
    setAccessCode("");
    setPort("8883");
    setTlsTrustProfile("local-printer-chain");
    setSelectedCandidateId("");
  };

  const removePrinter = async (printer: RealPrinterConnectionDto) => {
    if (pendingRemovalId !== printer.id) {
      setPendingRemovalId(printer.id);
      return;
    }
    setSubmitState("saving");
    try {
      await removeRealPrinter(printer.id);
      if (editingPrinter?.id === printer.id) {
        setFormMode("create");
        setEditingPrinter(undefined);
        resetFormFields();
      }
      setPendingRemovalId("");
      setLastConnection(undefined);
      setSubmitState("saved");
      await refreshConfiguredPrinters();
      await onRefresh();
    } catch {
      setSubmitState("error");
    }
  };

  useEffect(() => {
    void refreshConfiguredPrinters().catch(() => undefined);
  }, [health?.realPrinterOnboarding.configuredPrinters, refreshConfiguredPrinters]);

  useEffect(() => {
    if (configuredLoaded && !autoDiscoveryStarted && configuredCount === 0) {
      setAutoDiscoveryStarted(true);
      void discover();
    }
  }, [autoDiscoveryStarted, configuredCount, configuredLoaded, discover]);

  const onboardingMessage =
    submitState === "saved" && lastConnection
      ? `${lastConnection.displayName} configured with memory-only credentials.`
      : submitState === "saved"
        ? "Real printer removed; memory-only credential material was cleared."
      : discoveryNote ??
        "Use this form only from localhost/loopback on the server machine or an HTTPS dashboard; use CLI validation for remote LAN HTTP.";
  const discoveryLabel =
    discoveryState === "searching"
      ? "Searching"
      : discoveryState === "found"
        ? `${candidates.length} found`
        : discoveryState === "none"
          ? "None found"
          : discoveryState === "failed"
            ? "Discovery failed"
            : "Ready";
  const onboardingTone =
    submitState === "idle" ? (discoveryState === "failed" ? "error" : discoveryState === "found" ? "saved" : "degraded") : submitState;
  const requiresFullConnectionFields = formMode === "create";

  return (
    <section className="real-printer-panel" aria-label="Real printer onboarding">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">M2 real read-only adapter</p>
          <h2>{formMode === "edit" ? "Reconfigure real printer" : "Connect a real printer"}</h2>
        </div>
        <StatusPill label={`${configuredCount} configured`} tone={configuredCount > 0 ? "live" : "degraded"} />
      </div>
      {configuredPrinters.length > 0 ? (
        <div className="configured-printer-list" aria-label="Configured real printers">
          {configuredPrinters.map((printer) => (
            <div key={printer.id} className="configured-printer-row">
              <div>
                <strong>{printer.displayName}</strong>
                <span>
                  {printer.modelHint} / {printer.connectionState}
                </span>
              </div>
              <div className="configured-printer-actions">
                <button type="button" onClick={() => startEdit(printer)}>
                  <Pencil size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => void removePrinter(printer)}
                  disabled={submitState === "saving"}
                >
                  <Trash2 size={16} /> {pendingRemovalId === printer.id ? "Confirm remove" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="candidate-actions">
        <button type="button" onClick={() => void discover()} disabled={discoveryState === "searching"}>
          {discoveryState === "searching" ? <Search size={16} /> : <RefreshCw size={16} />}
          {discoveryState === "idle" ? "Search" : "Rescan"}
        </button>
        <label>
          <span>Candidate</span>
          <select value={selectedCandidateId} onChange={(event) => selectCandidate(event.target.value)}>
            <option value="">Manual host fallback</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.displayName} / {candidate.modelHint}
              </option>
            ))}
          </select>
        </label>
        <StatusPill label={discoveryLabel} tone={discoveryState === "found" ? "live" : discoveryState === "failed" ? "unavailable" : "degraded"} />
      </div>
      <form className="real-printer-form" onSubmit={(event) => void submit(event)}>
        <label className="field-wide">
          <span>Name</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required autoComplete="off" />
        </label>
        <label>
          <span>Model</span>
          <select value={modelHint} onChange={(event) => setModelHint(event.target.value)}>
            <option>A1 Mini</option>
            <option>X2D</option>
            <option>Bambu-compatible</option>
          </select>
        </label>
        <label className="field-wide">
          <span>Host</span>
          <input
            value={selectedCandidateId ? "Resolved server-side" : host}
            onChange={(event) => setHost(event.target.value)}
            required={requiresFullConnectionFields && !selectedCandidateId}
            disabled={Boolean(selectedCandidateId)}
            autoComplete="off"
            placeholder={formMode === "edit" ? "Leave blank to keep current" : undefined}
          />
        </label>
        <label>
          <span>Port</span>
          <input
            value={selectedCandidateId ? "" : port}
            onChange={(event) => setPort(event.target.value)}
            inputMode="numeric"
            required={requiresFullConnectionFields && !selectedCandidateId}
            disabled={Boolean(selectedCandidateId)}
            placeholder={formMode === "edit" ? "Keep current" : "8883"}
          />
        </label>
        <label>
          <span>TLS</span>
          <select
            value={tlsTrustProfile}
            onChange={(event) => setTlsTrustProfile(event.target.value as TlsTrustProfile | "")}
          >
            {formMode === "edit" ? <option value="">Keep current</option> : null}
            <option value="local-printer-chain">Local chain</option>
            <option value="system">System trust</option>
          </select>
        </label>
        <label className="field-wide">
          <span>Serial</span>
          <input
            value={serialNumber}
            onChange={(event) => setSerialNumber(event.target.value)}
            required={requiresFullConnectionFields}
            autoComplete="off"
            placeholder={formMode === "edit" ? "Leave blank to keep current" : undefined}
          />
        </label>
        <label className="field-wide">
          <span>LAN Access Code</span>
          <input
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            type="password"
            required={requiresFullConnectionFields}
            autoComplete="new-password"
            placeholder={formMode === "edit" ? "Enter only to replace" : undefined}
          />
        </label>
        <button type="submit" disabled={submitState === "saving"}>
          <PlugZap size={16} /> {submitState === "saving" ? "Saving" : formMode === "edit" ? "Save" : "Connect"}
        </button>
        {formMode === "edit" ? (
          <button type="button" className="secondary-button" onClick={cancelEdit}>
            <X size={16} /> Cancel
          </button>
        ) : null}
      </form>
      <p className={`onboarding-status tone-${onboardingTone}`}>{onboardingMessage}</p>
    </section>
  );
}

function DeviceDetail(): ReactElement {
  const { deviceId } = useParams();
  const [device, setDevice] = useState<DeviceDetailDto | undefined>();

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    void fetchDevice(deviceId).then(setDevice);
    const unsubscribe = subscribeToDeviceEvents((event) => {
      if (event.type === "device.state.changed" && event.device.id === deviceId) {
        setDevice((current) => (current ? { ...current, ...event.device, state: event.state } : current));
      }
    }, () => undefined);
    return unsubscribe;
  }, [deviceId]);

  if (!device) {
    return <p className="loading">Loading device...</p>;
  }

  const temperatures = device.state.telemetry.temperatures;
  return (
    <section className="detail-layout">
      <div className={`detail-header quality-${device.quality}`}>
        <div>
          <p className="eyebrow">{device.location ?? (device.source === "synthetic" ? "Synthetic lab" : "Real printer")}</p>
          <h2>{device.displayName}</h2>
          <p>{device.statusMessage}</p>
        </div>
        <StatusPill label={device.lifecycle} tone={device.quality} />
      </div>
      <div className="telemetry-grid">
        <Metric label="Nozzle" value={formatTemperature(temperatures?.nozzleC)} />
        <Metric label="Bed" value={formatTemperature(temperatures?.bedC)} />
        <Metric label="Chamber" value={formatTemperature(temperatures?.chamberC)} />
        <Metric label="Quality" value={device.quality} tone={device.quality} />
      </div>
      <section className="capability-table" aria-label="Capability details">
        {device.capabilities.map((capability) => (
          <div key={capability.key} className="capability-line">
            <span>{capability.label}</span>
            <strong>{capability.support}</strong>
            <small>{capability.notes ?? capability.key}</small>
          </div>
        ))}
      </section>
    </section>
  );
}

function DiagnosticsView({ health }: { health: HealthDto | undefined }): ReactElement {
  if (!health) {
    return <p className="loading">Loading diagnostics...</p>;
  }

  return (
    <section className="diagnostics-page">
      <HealthTile icon={<HardDrive size={18} />} label="Database" value={`${health.database.status} / ${health.database.journalMode}`} />
      <HealthTile icon={<Gauge size={18} />} label="Raw event pipeline" value={`${health.events.status} / ${health.events.subscribers} clients`} />
      <HealthTile icon={<Activity size={18} />} label="Synthetic adapter" value={`${health.simulator.devices} devices / step ${health.simulator.currentStep}`} />
      <HealthTile
        icon={<PlugZap size={18} />}
        label="Real adapter"
        value={`${health.realPrinterOnboarding.configuredPrinters} configured / ${health.realPrinterOnboarding.credentialMode}`}
      />
      <HealthTile
        icon={<Router size={18} />}
        label="Discovery"
        value={`${health.discovery.targetHost} / ${health.discovery.manualUrl}`}
      />
      <p className="diagnostic-note">{health.discovery.note}</p>
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: string }): ReactElement {
  return (
    <div className={`metric tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HealthTile({ icon, label, value }: { icon: ReactElement; label: string; value: string }): ReactElement {
  return (
    <div className="health-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }): ReactElement {
  return <span className={`status-pill tone-${tone}`}>{label}</span>;
}

function formatTemperature(value: number | undefined): string {
  return typeof value === "number" ? `${value} C` : "Unavailable";
}

function upsertDevice(current: DeviceSummaryDto[], event: SseEventDto): DeviceSummaryDto[] {
  if (event.type !== "device.state.changed") {
    return current;
  }
  const next = current.filter((device) => device.id !== event.device.id);
  next.push(event.device);
  return next.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
