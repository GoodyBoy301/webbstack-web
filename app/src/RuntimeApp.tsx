import { useEffect, useMemo, useState } from "react";
import { markPerformance, measurePerformance, trackEvent } from "./telemetry";
import {
  previewManifest,
  previewPackageFiles,
  validatePackage,
} from "./packageValidation";

type Status = "available" | "restricted" | "unavailable";
type RuntimeMode = "preview" | "public" | "embed";
type Viewport = "desktop" | "tablet" | "mobile";
type ViewportDetails = {
  label: string;
  width: number;
  height: number;
};
type Lifecycle = "loading" | "ready" | "paused" | "error" | "stopped";
type RuntimeError = "runtime" | "unsupported";
export type RuntimeProject = {
  name: string;
  filename: string;
  version: number;
  accent: string;
};
type Capability = {
  name: string;
  status: Status;
  permission: string;
  detail: string;
};

const capabilities: Capability[] = [
  [
    "runtime.identity",
    "available",
    "not required",
    "Runtime metadata is exposed",
  ],
  [
    "runtime.capabilities",
    "available",
    "not required",
    "Capability discovery is exposed",
  ],
  ["lifecycle.app", "available", "not required", "App lifecycle events"],
  ["navigation.app", "available", "not required", "App-owned navigation stack"],
  ["navigation.system", "available", "not required", "System back handling"],
  ["device.orientation", "available", "not required", "Orientation controls"],
  [
    "device.display",
    "available",
    "not required",
    "Viewport and display metrics",
  ],
  ["storage.app", "available", "not required", "Persistent app storage"],
  ["debug.logs", "available", "not required", "Structured runtime logs"],
  ["device.motion", "restricted", "not requested", "Needs preview permission"],
  [
    "device.location",
    "restricted",
    "not requested",
    "Needs preview permission",
  ],
  [
    "device.vibration",
    "restricted",
    "not requested",
    "Needs preview permission",
  ],
  [
    "device.battery",
    "unavailable",
    "not supported",
    "Not available in this browser",
  ],
  [
    "device.connectivity",
    "available",
    "not required",
    "Network state controls",
  ],
  ["media.camera", "restricted", "not requested", "Uses a safe media fixture"],
  [
    "media.microphone",
    "restricted",
    "not requested",
    "Uses a safe media fixture",
  ],
  ["notifications", "restricted", "not requested", "Uses in-app notifications"],
  [
    "network.control",
    "available",
    "not required",
    "Latency and offline controls",
  ],
  [
    "debug.network",
    "restricted",
    "not requested",
    "Redacted request diagnostics",
  ],
  ["debug.inspector", "restricted", "not requested", "App inspection tools"],
].map(([name, status, permission, detail]): Capability => ({
  name,
  status: status as Status,
  permission,
  detail,
}));

const groupFor = (name: string) => name.split(".")[0];

const viewportDetails: Record<Viewport, ViewportDetails> = {
  desktop: { label: "Desktop", width: 1280, height: 800 },
  tablet: { label: "Tablet", width: 834, height: 1112 },
  mobile: { label: "Mobile", width: 390, height: 844 },
};

const modeDetails: Record<
  RuntimeMode,
  { label: string; title: string; detail: string; checks: string[] }
> = {
  preview: {
    label: "Creator preview",
    title: "Fixture runtime",
    detail:
      "Deterministic controls and diagnostics are enabled for local testing.",
    checks: [
      "Creator controls enabled",
      "Fixture state is resettable",
      "No physical hardware access",
    ],
  },
  public: {
    label: "Public runtime",
    title: "Published app surface",
    detail:
      "Runs with real browser, permission, storage, network, and notification behavior.",
    checks: [
      "Creator controls hidden",
      "Runtime identity is public-safe",
      "Capability state follows browser policy",
    ],
  },
  embed: {
    label: "Embed runtime",
    title: "Sandboxed app surface",
    detail:
      "Runs cross-origin in a sandboxed iframe with a restricted capability profile.",
    checks: [
      "Creator controls hidden",
      "Parent origin is validated",
      "Host capabilities require explicit opt-in",
    ],
  },
};

function RuntimeModePanel({ mode }: { mode: RuntimeMode }) {
  const details = modeDetails[mode];
  return (
    <div className="mode-panel">
      <div className="eyebrow">{details.label}</div>
      <h2>{details.title}</h2>
      <p className="subtle">{details.detail}</p>
      <ul className="mode-checks">
        {details.checks.map((check) => (
          <li key={check}>
            <span className="check-dot check-pass" />
            {check}
          </li>
        ))}
      </ul>
      {mode === "embed" && (
        <div className="embed-policy">
          <strong>Embed security baseline</strong>
          <small>
            sandboxed iframe · separate runtime origin · Permissions-Policy ·
            message schema validation
          </small>
        </div>
      )}
      <p className="package-note">
        Creator-only fixture controls are unavailable outside preview mode.
      </p>
    </div>
  );
}

function App({
  project,
  initialMode = "preview",
}: {
  project?: RuntimeProject;
  initialMode?: RuntimeMode;
}) {
  const [mode, setMode] = useState<RuntimeMode>(initialMode);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [lifecycle, setLifecycle] = useState<Lifecycle>("ready");
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [viewport, setViewport] = useState<Viewport>("mobile");
  const [chrome, setChrome] = useState(true);
  const [logs, setLogs] = useState(["Runtime created", "App ready · 342ms"]);
  const [requested, setRequested] = useState<string[]>([]);
  const [validationRun, setValidationRun] = useState(0);

  useEffect(() => {
    markPerformance("runtime_ready");
    measurePerformance("runtime_readiness", "webbstack_navigation_start");
    trackEvent("runtime_started", { mode });
  }, [mode]);

  const packageReport = useMemo(
    () => validatePackage(previewManifest, previewPackageFiles),
    [validationRun],
  );

  const filtered = useMemo(
    () =>
      capabilities.filter((capability) => {
        return (
          capability.name.includes(query.toLowerCase()) &&
          (statusFilter === "all" || capability.status === statusFilter)
        );
      }),
    [query, statusFilter],
  );
  const groups = [...new Set(filtered.map(({ name }) => groupFor(name)))];

  const addLog = (message: string) =>
    setLogs((current) => [`${message} · now`, ...current].slice(0, 5));
  const testCapability = (capability: Capability) => {
    if (capability.status === "restricted")
      setRequested((current) =>
        current.includes(capability.name)
          ? current
          : [...current, capability.name],
      );
    addLog(
      `${capability.name} ${capability.status === "restricted" ? "permission requested" : "tested"}`,
    );
  };
  const resetPreview = () => {
    setLifecycle("ready");
    setRuntimeError(null);
    setViewport("mobile");
    setOrientation("portrait");
    setChrome(true);
    setRequested([]);
    addLog("Preview reset");
    trackEvent("runtime_reset");
  };
  const stopRuntime = () => {
    setRuntimeError(null);
    setLifecycle("stopped");
    addLog("Runtime stopped");
  };
  const restartRuntime = () => {
    setRuntimeError(null);
    setLifecycle("ready");
    addLog("Runtime restarted");
  };
  const reloadApp = () => {
    setRuntimeError(null);
    setLifecycle("ready");
    addLog("App reloaded");
  };
  const reinstallPackage = () => {
    setRuntimeError(null);
    setLifecycle("ready");
    setRequested([]);
    setValidationRun((run) => run + 1);
    addLog("Package reinstalled");
  };
  const simulateLoading = () => {
    setRuntimeError(null);
    setLifecycle("loading");
    addLog("Runtime loading");
  };
  const finishLoading = () => {
    setLifecycle("ready");
    addLog("Runtime ready");
  };
  const simulateRuntimeError = (error: RuntimeError) => {
    setRuntimeError(error);
    setLifecycle("error");
    addLog(error === "unsupported" ? "Unsupported browser" : "Runtime error");
    trackEvent("runtime_failed", { reason: error });
  };

  return (
    <div
      className="app-shell"
      data-runtime-mode={mode}
      style={
        project
          ? ({ "--runtime-accent": project.accent } as React.CSSProperties)
          : undefined
      }
    >
      <header className="topbar">
        <div className="brand">
          <span className="mark" aria-hidden="true" />
          webbstack
        </div>
        <div className="top-actions">
          <label className="mode-picker">
            <span>Mode</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as RuntimeMode)}
              aria-label="Runtime mode"
            >
              <option value="preview">Preview</option>
              <option value="public">Public</option>
              <option value="embed">Embed</option>
            </select>
          </label>
          {mode === "preview" && (
            <button className="quiet" onClick={resetPreview}>
              Reset preview
            </button>
          )}
          {mode === "preview" && (
            <span className="avatar" aria-label="Creator account">
              GS
            </span>
          )}
        </div>
      </header>
      <main className="content">
        <section className="preview-column" aria-labelledby="page-title">
          <div className="breadcrumb">
            Projects / <strong>{project?.name ?? "Capability Lab"}</strong> /{" "}
            {modeDetails[mode].label}
          </div>
          <div className="preview-heading">
            <div>
              <div className="eyebrow">{modeDetails[mode].label}</div>
              <h1 id="page-title">{project?.name ?? "Capability Lab"}</h1>
              <p className="subtle">
                {project
                  ? `${project.filename} · Build v${project.version} · Validate this .webb app before you publish it.`
                  : "Validate your .webb app before you publish it."}
              </p>
            </div>
            <div className="live">{modeDetails[mode].label}</div>
          </div>
          <div
            className="device-frame"
            data-orientation={orientation}
            data-viewport={viewport}
          >
            {chrome && (
              <div className="device-bar">
                <span>9:41</span>
                <span>webbstack {mode}&nbsp; · &nbsp;● ● ●</span>
              </div>
            )}
            <div className="device-screen">
              <div className={`app-card lifecycle-${lifecycle}`}>
                <div className="app-icon" aria-hidden="true" />
                {lifecycle === "loading" && (
                  <div
                    className="runtime-state-message runtime-state-loading"
                    role="status"
                  >
                    <strong>Loading runtime</strong>
                    <span>
                      Preparing the app sandbox and restoring its package.
                    </span>
                  </div>
                )}
                {lifecycle === "stopped" && (
                  <div className="runtime-state-message" role="status">
                    <strong>Runtime stopped</strong>
                    <span>
                      Restart the runtime to continue previewing this app.
                    </span>
                  </div>
                )}
                {lifecycle === "error" && (
                  <div
                    className="runtime-state-message runtime-state-error"
                    role="alert"
                  >
                    <strong>
                      {runtimeError === "unsupported"
                        ? "Browser not supported"
                        : "Runtime failed to start"}
                    </strong>
                    <span>
                      {runtimeError === "unsupported"
                        ? "Use a current browser with WebAssembly and cross-origin isolation enabled."
                        : "The app sandbox stopped unexpectedly. Reload the app or reinstall the package, then try again."}
                    </span>
                    <button className="small" onClick={reloadApp}>
                      Reload app
                    </button>
                  </div>
                )}
                <div className="eyebrow">{modeDetails[mode].label}</div>
                <h2>
                  {mode === "embed"
                    ? "Contained by design."
                    : "Everything connected."}
                </h2>
                <p>{modeDetails[mode].detail}</p>
                {lifecycle === "ready" && (
                  <span className="mock-button">Explore the app</span>
                )}
              </div>
            </div>
          </div>
          {mode === "preview" && (
            <div className="shell-controls">
              <div className="control-group">
                <label className="control-label" htmlFor="viewport-select">
                  Viewport
                </label>
                <select
                  id="viewport-select"
                  value={viewport}
                  onChange={(event) => {
                    const nextViewport = event.target.value as Viewport;
                    setViewport(nextViewport);
                    addLog(
                      `${viewportDetails[nextViewport].label} viewport selected`,
                    );
                  }}
                  aria-label="Preview viewport"
                >
                  {Object.entries(viewportDetails).map(([value, details]) => (
                    <option value={value} key={value}>
                      {details.label} · {details.width} × {details.height}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-group">
                <span className="control-label">Orientation</span>
                <button
                  className="small"
                  aria-pressed={orientation === "portrait"}
                  onClick={() => setOrientation("portrait")}
                >
                  Portrait
                </button>
                <button
                  className="small"
                  aria-pressed={orientation === "landscape"}
                  onClick={() => setOrientation("landscape")}
                >
                  Landscape
                </button>
              </div>
              <button
                className="small"
                aria-pressed={chrome}
                onClick={() => setChrome((value) => !value)}
              >
                Device chrome {chrome ? "on" : "off"}
              </button>
            </div>
          )}
          {mode === "preview" && (
            <div className="lifecycle">
              <div>
                <div className="eyebrow">App lifecycle</div>
                <strong>{lifecycle}</strong>
              </div>
              <div className="control-group">
                <button className="small" onClick={reloadApp}>
                  Reload app
                </button>
                <button className="small" onClick={reinstallPackage}>
                  Reinstall package
                </button>
                {lifecycle === "stopped" ? (
                  <button className="small" onClick={restartRuntime}>
                    Restart runtime
                  </button>
                ) : lifecycle === "error" ? (
                  <button className="small" onClick={reloadApp}>
                    Recover runtime
                  </button>
                ) : lifecycle === "loading" ? (
                  <button className="small" onClick={finishLoading}>
                    Finish loading
                  </button>
                ) : (
                  <>
                    <button className="small" onClick={simulateLoading}>
                      Simulate loading
                    </button>
                    <button
                      className="small"
                      onClick={() => {
                        setLifecycle("paused");
                        addLog("App background");
                      }}
                    >
                      Pause
                    </button>
                    <button
                      className="small"
                      onClick={() => {
                        setLifecycle("ready");
                        addLog("App foreground");
                      }}
                    >
                      Resume
                    </button>
                    <button className="small" onClick={stopRuntime}>
                      Stop runtime
                    </button>
                  </>
                )}
                {lifecycle !== "error" && lifecycle !== "loading" && (
                  <>
                    <button
                      className="small"
                      onClick={() => simulateRuntimeError("runtime")}
                    >
                      Simulate runtime failure
                    </button>
                    <button
                      className="small"
                      onClick={() => simulateRuntimeError("unsupported")}
                    >
                      Simulate unsupported browser
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
        <aside className="panel" aria-labelledby="controls-title">
          {mode !== "preview" ? (
            <RuntimeModePanel mode={mode} />
          ) : (
            <>
              <div className="panel-header">
                <div className="eyebrow">Runtime diagnostics</div>
                <div className="panel-title">
                  <h2 id="controls-title">Capability controls</h2>
                  <span>
                    {filtered.length}/{capabilities.length}
                  </span>
                </div>
                <p className="subtle">
                  Test the capabilities your app declares in the creator
                  environment.
                </p>
              </div>
              <div className="filters">
                <label className="search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search capabilities"
                    aria-label="Search capabilities"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as Status | "all")
                  }
                  aria-label="Filter capability status"
                >
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="restricted">Restricted</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div className="capability-list">
                {groups.map((group) => (
                  <section className="capability-group" key={group}>
                    <div className="group-heading">
                      <span>{group}</span>
                      <span>
                        {
                          filtered.filter(
                            ({ name }) => groupFor(name) === group,
                          ).length
                        }
                      </span>
                    </div>
                    {filtered
                      .filter(({ name }) => groupFor(name) === group)
                      .map((capability) => (
                        <div className="capability-row" key={capability.name}>
                          <div className="capability-copy">
                            <code>{capability.name}</code>
                            <span
                              className={`status status-${capability.status}`}
                            >
                              {capability.status}
                            </span>
                            <small>
                              {requested.includes(capability.name)
                                ? "Permission requested"
                                : capability.detail}
                            </small>
                          </div>
                          <button
                            className="small"
                            disabled={capability.status === "unavailable"}
                            onClick={() => testCapability(capability)}
                          >
                            {capability.status === "restricted"
                              ? "Request"
                              : "Test"}
                          </button>
                        </div>
                      ))}
                  </section>
                ))}
                {groups.length === 0 && (
                  <div className="empty">
                    No capabilities match your search.
                  </div>
                )}
              </div>
              <section
                className="package-panel"
                aria-labelledby="package-title"
              >
                <div className="panel-title">
                  <div>
                    <div className="eyebrow">Package inspection</div>
                    <h2 id="package-title">Validation & security</h2>
                  </div>
                  <button
                    className="small"
                    onClick={() => {
                      setValidationRun((run) => run + 1);
                      addLog("Package validation rerun");
                    }}
                  >
                    Revalidate
                  </button>
                </div>
                <p className="subtle package-summary">
                  {packageReport.errors === 0
                    ? "Package is safe to boot in preview."
                    : `${packageReport.errors} blocking issue${packageReport.errors === 1 ? "" : "s"} must be fixed before boot.`}
                </p>
                <div
                  className="package-counts"
                  aria-label="Package validation summary"
                >
                  <span className="check-count check-pass">
                    {packageReport.passed} passed
                  </span>
                  <span className="check-count check-warning">
                    {packageReport.warnings} warnings
                  </span>
                  <span className="check-count check-error">
                    {packageReport.errors} errors
                  </span>
                </div>
                <ul className="package-checks">
                  {packageReport.checks.map((check) => (
                    <li key={check.id}>
                      <span
                        className={`check-dot check-${check.status}`}
                        aria-label={check.status}
                      />
                      <div>
                        <strong>{check.label}</strong>
                        <small>{check.detail}</small>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="package-note">
                  Preview packages may be unsigned. Publishing adds the
                  canonical digest and webbstack Ed25519 signature.
                </p>
              </section>
              <section
                className="diagnostics-summary"
                aria-labelledby="diagnostics-title"
              >
                <div className="panel-title">
                  <div>
                    <div className="eyebrow">Runtime status</div>
                    <h2 id="diagnostics-title">Preview diagnostics</h2>
                  </div>
                  <span
                    className={`status ${lifecycle === "error" ? "status-unavailable" : lifecycle === "loading" ? "status-restricted" : "status-available"}`}
                  >
                    {lifecycle === "error"
                      ? "Error"
                      : lifecycle === "loading"
                        ? "Loading"
                        : "Healthy"}
                  </span>
                </div>
                <dl className="diagnostics-grid">
                  <div>
                    <dt>Lifecycle</dt>
                    <dd>
                      {lifecycle === "error" && runtimeError === "unsupported"
                        ? "unsupported"
                        : lifecycle}
                    </dd>
                  </div>
                  <div>
                    <dt>Viewport</dt>
                    <dd>{viewportDetails[viewport].label}</dd>
                  </div>
                  <div>
                    <dt>Display</dt>
                    <dd>{orientation}</dd>
                  </div>
                  <div>
                    <dt>Package</dt>
                    <dd>
                      {packageReport.errors === 0 ? "validated" : "blocked"}
                    </dd>
                  </div>
                </dl>
              </section>
              <div className="logs">
                <div className="panel-title">
                  <h2>Recent events</h2>
                  <button className="text-button" onClick={() => setLogs([])}>
                    Clear
                  </button>
                </div>
                {logs.length ? (
                  <ul>
                    {logs.map((log, index) => (
                      <li key={`${log}-${index}`}>{log}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="subtle">No recent events.</p>
                )}
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
