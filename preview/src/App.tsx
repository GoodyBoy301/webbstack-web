import { useMemo, useState } from "react";
import {
  previewManifest,
  previewPackageFiles,
  validatePackage,
} from "./packageValidation";

type Status = "available" | "restricted" | "unavailable";
type RuntimeMode = "preview" | "public" | "embed";
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

function App() {
  const [mode, setMode] = useState<RuntimeMode>("preview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [lifecycle, setLifecycle] = useState("ready");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [chrome, setChrome] = useState(true);
  const [logs, setLogs] = useState(["Runtime created", "App ready · 342ms"]);
  const [requested, setRequested] = useState<string[]>([]);
  const [validationRun, setValidationRun] = useState(0);

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
    setRequested([]);
    addLog("Preview reset");
  };

  return (
    <div className="app-shell" data-runtime-mode={mode}>
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
            Projects / <strong>Capability Lab</strong> /{" "}
            {modeDetails[mode].label}
          </div>
          <div className="preview-heading">
            <div>
              <div className="eyebrow">{modeDetails[mode].label}</div>
              <h1 id="page-title">Capability Lab</h1>
              <p className="subtle">
                Validate your .webb app before you publish it.
              </p>
            </div>
            <div className="live">{modeDetails[mode].label}</div>
          </div>
          <div className="device-frame" data-orientation={orientation}>
            {chrome && (
              <div className="device-bar">
                <span>9:41</span>
                <span>webbstack {mode}&nbsp; · &nbsp;● ● ●</span>
              </div>
            )}
            <div className="device-screen">
              <div className="app-card">
                <div className="app-icon" aria-hidden="true" />
                <div className="eyebrow">{modeDetails[mode].label}</div>
                <h2>
                  {mode === "embed"
                    ? "Contained by design."
                    : "Everything connected."}
                </h2>
                <p>{modeDetails[mode].detail}</p>
                <span className="mock-button">Explore the app</span>
              </div>
            </div>
          </div>
          {mode === "preview" && (
            <div className="shell-controls">
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
