import { viewportDetails } from "./data";
import type { Viewport } from "./types";

type Props = { viewport: Viewport; orientation: "portrait" | "landscape"; chrome: boolean; onViewport: (viewport: Viewport) => void; onOrientation: (orientation: "portrait" | "landscape") => void; onChrome: () => void; onLog: (message: string) => void };

export function PreviewControls({ viewport, orientation, chrome, onViewport, onOrientation, onChrome, onLog }: Props) {
  return <div className="shell-controls">
    <div className="control-group"><label className="control-label" htmlFor="viewport-select">Viewport</label><select id="viewport-select" value={viewport} onChange={(event) => { const next = event.target.value as Viewport; onViewport(next); onLog(`${viewportDetails[next].label} viewport selected`); }} aria-label="Preview viewport">
      {Object.entries(viewportDetails).map(([value, details]) => <option value={value} key={value}>{details.label} · {details.width} × {details.height}</option>)}
    </select></div>
    <div className="control-group"><span className="control-label">Orientation</span><button className="small" aria-pressed={orientation === "portrait"} onClick={() => onOrientation("portrait")}>Portrait</button><button className="small" aria-pressed={orientation === "landscape"} onClick={() => onOrientation("landscape")}>Landscape</button></div>
    <button className="small" aria-pressed={chrome} onClick={onChrome}>Device chrome {chrome ? "on" : "off"}</button>
  </div>;
}
