import { viewportDetails } from "./data";
import type { Lifecycle, RuntimeError, Viewport } from "./types";

type Props = { lifecycle: Lifecycle; runtimeError: RuntimeError | null; viewport: Viewport; orientation: "portrait" | "landscape"; packageValid: boolean };

export function DiagnosticsSummary({ lifecycle, runtimeError, viewport, orientation, packageValid }: Props) {
  const status = lifecycle === "error" ? "Error" : lifecycle === "loading" ? "Loading" : "Healthy";
  const statusClass = lifecycle === "error" ? "status-unavailable" : lifecycle === "loading" ? "status-restricted" : "status-available";
  return <section className="diagnostics-summary" aria-labelledby="diagnostics-title"><div className="panel-title"><div><div className="eyebrow">Runtime status</div><h2 id="diagnostics-title">Preview diagnostics</h2></div><span className={`status ${statusClass}`}>{status}</span></div><dl className="diagnostics-grid"><div><dt>Lifecycle</dt><dd>{lifecycle === "error" && runtimeError === "unsupported" ? "unsupported" : lifecycle}</dd></div><div><dt>Viewport</dt><dd>{viewportDetails[viewport].label}</dd></div><div><dt>Display</dt><dd>{orientation}</dd></div><div><dt>Package</dt><dd>{packageValid ? "validated" : "blocked"}</dd></div></dl></section>;
}
