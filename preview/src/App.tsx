import { useMemo, useState } from "react";

type Status = "available" | "restricted" | "unavailable";
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

function App() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [lifecycle, setLifecycle] = useState("ready");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [chrome, setChrome] = useState(true);
  const [logs, setLogs] = useState(["Runtime created", "App ready · 342ms"]);
  const [requested, setRequested] = useState<string[]>([]);

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
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark" aria-hidden="true" />
          webbstack
        </div>
        <div className="top-actions">
          <button className="quiet" onClick={resetPreview}>
            Reset preview
          </button>
          <span className="avatar" aria-label="Creator account">
            GS
          </span>
        </div>
      </header>
      <main className="content">
        <section className="preview-column" aria-labelledby="page-title">
          <div className="breadcrumb">
            Projects / <strong>Capability Lab</strong> / Runtime preview
          </div>
          <div className="preview-heading">
            <div>
              <div className="eyebrow">Creator preview</div>
              <h1 id="page-title">Capability Lab</h1>
              <p className="subtle">
                Validate your .webb app before you publish it.
              </p>
            </div>
            <div className="live">Runtime ready</div>
          </div>
          <div className="device-frame" data-orientation={orientation}>
            {chrome && (
              <div className="device-bar">
                <span>9:41</span>
                <span>webbstack preview&nbsp; · &nbsp;● ● ●</span>
              </div>
            )}
            <div className="device-screen">
              <div className="app-card">
                <div className="app-icon" aria-hidden="true" />
                <div className="eyebrow">Reference app</div>
                <h2>Everything connected.</h2>
                <p>
                  Your live .webb surface is running inside the creator preview.
                </p>
                <span className="mock-button">Explore the app</span>
              </div>
            </div>
          </div>
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
        </section>
        <aside className="panel" aria-labelledby="controls-title">
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
                      filtered.filter(({ name }) => groupFor(name) === group)
                        .length
                    }
                  </span>
                </div>
                {filtered
                  .filter(({ name }) => groupFor(name) === group)
                  .map((capability) => (
                    <div className="capability-row" key={capability.name}>
                      <div className="capability-copy">
                        <code>{capability.name}</code>
                        <span className={`status status-${capability.status}`}>
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
              <div className="empty">No capabilities match your search.</div>
            )}
          </div>
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
        </aside>
      </main>
    </div>
  );
}

export default App;
