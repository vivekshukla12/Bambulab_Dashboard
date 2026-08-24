// SPDX-License-Identifier: MPL-2.0

import type { DeviceDetailDto, DeviceSummaryDto, HealthDto, RealPrinterConnectionDto, SseEventDto } from "@bpd/contracts";
import { Activity, Gauge, HardDrive, PlugZap, Router, WifiOff } from "lucide-react";
import type { FormEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, BrowserRouter as RouterProvider, Routes, useParams } from "react-router-dom";
import { connectRealPrinter, fetchDevice, fetchDevices, fetchHealth, subscribeToDeviceEvents } from "./api.js";

type ConnectionState = "connecting" | "live" | "interrupted";

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
            <p className="eyebrow">M1 synthetic fleet</p>
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
  const summary = useMemo(
    () => ({
      total: devices.length,
      live: devices.filter((device) => device.quality === "live").length,
      stale: devices.filter((device) => device.quality === "stale").length,
      unavailable: devices.filter((device) => device.quality === "unavailable").length
    }),
    [devices]
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
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
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
  const [displayName, setDisplayName] = useState("");
  const [modelHint, setModelHint] = useState("A1 Mini");
  const [host, setHost] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [port, setPort] = useState("8883");
  const [lastConnection, setLastConnection] = useState<RealPrinterConnectionDto | undefined>();
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("saving");
    try {
      const printer = await connectRealPrinter({
        displayName,
        modelHint,
        host,
        serialNumber,
        accessCode,
        port: Number.parseInt(port, 10) || 8883
      });
      setLastConnection(printer);
      setSerialNumber("");
      setAccessCode("");
      setSubmitState("saved");
      await onRefresh();
    } catch {
      setSubmitState("error");
      setAccessCode("");
    }
  };

  return (
    <section className="real-printer-panel" aria-label="Real printer onboarding">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">M2 real read-only adapter</p>
          <h2>Connect a real printer</h2>
        </div>
        <StatusPill
          label={`${health?.realPrinterOnboarding.configuredPrinters ?? 0} configured`}
          tone={(health?.realPrinterOnboarding.configuredPrinters ?? 0) > 0 ? "live" : "degraded"}
        />
      </div>
      <form className="real-printer-form" onSubmit={(event) => void submit(event)}>
        <label>
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
        <label>
          <span>Host</span>
          <input value={host} onChange={(event) => setHost(event.target.value)} required autoComplete="off" />
        </label>
        <label>
          <span>Port</span>
          <input value={port} onChange={(event) => setPort(event.target.value)} inputMode="numeric" required />
        </label>
        <label>
          <span>Serial</span>
          <input value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} required autoComplete="off" />
        </label>
        <label>
          <span>LAN Access Code</span>
          <input
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            type="password"
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={submitState === "saving"}>
          <PlugZap size={16} /> {submitState === "saving" ? "Connecting" : "Connect"}
        </button>
      </form>
      <p className={`onboarding-status tone-${submitState}`}>
        {submitState === "saved" && lastConnection
          ? `${lastConnection.displayName} configured with memory-only credentials.`
          : "Use this form only from localhost/loopback on the server machine or an HTTPS dashboard; use CLI validation for remote LAN HTTP."}
      </p>
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
          <p className="eyebrow">{device.location ?? "Synthetic lab"}</p>
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
