import { modeDetails } from "./data";
import type { Lifecycle, RuntimeError, RuntimeMode, RuntimeProject, Viewport } from "./types";

type Props = { project?: RuntimeProject; mode: RuntimeMode; lifecycle: Lifecycle; runtimeError: RuntimeError | null; orientation: "portrait" | "landscape"; viewport: Viewport; chrome: boolean; onReload: () => void };

export function PreviewSurface({ project, mode, lifecycle, runtimeError, orientation, viewport, chrome, onReload }: Props) {
  const details = modeDetails[mode];
  return <>
    <div className="breadcrumb">Projects / <strong>{project?.name ?? "Capability Lab"}</strong> / {details.label}</div>
    <div className="preview-heading"><div><div className="eyebrow">{details.label}</div><h1 id="page-title">{project?.name ?? "Capability Lab"}</h1><p className="subtle">{project ? `${project.filename} · Build v${project.version} · Validate this .webb app before you publish it.` : "Validate your .webb app before you publish it."}</p></div><div className="live">{details.label}</div></div>
    <div className="device-frame" data-orientation={orientation} data-viewport={viewport}>
      {chrome && <div className="device-bar"><span>9:41</span><span>webbstack {mode}&nbsp; · &nbsp;● ● ●</span></div>}
      <div className="device-screen"><div className={`app-card lifecycle-${lifecycle}`}><div className="app-icon" aria-hidden="true" />
        <StateMessage lifecycle={lifecycle} runtimeError={runtimeError} onReload={onReload} />
        <div className="eyebrow">{details.label}</div><h2>{mode === "embed" ? "Contained by design." : "Everything connected."}</h2><p>{details.detail}</p>{lifecycle === "ready" && <span className="mock-button">Explore the app</span>}
      </div></div>
    </div>
  </>;
}

function StateMessage({ lifecycle, runtimeError, onReload }: Pick<Props, "lifecycle" | "runtimeError" | "onReload">) {
  if (lifecycle === "loading") return <div className="runtime-state-message runtime-state-loading" role="status"><strong>Loading runtime</strong><span>Preparing the app sandbox and restoring its package.</span></div>;
  if (lifecycle === "stopped") return <div className="runtime-state-message" role="status"><strong>Runtime stopped</strong><span>Restart the runtime to continue previewing this app.</span></div>;
  if (lifecycle !== "error") return null;
  return <div className="runtime-state-message runtime-state-error" role="alert"><strong>{runtimeError === "unsupported" ? "Browser not supported" : "Runtime failed to start"}</strong><span>{runtimeError === "unsupported" ? "Use a current browser with WebAssembly and cross-origin isolation enabled." : "The app sandbox stopped unexpectedly. Reload the app or reinstall the package, then try again."}</span><button className="small" onClick={onReload}>Reload app</button></div>;
}
