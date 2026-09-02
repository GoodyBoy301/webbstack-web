import type { RuntimeMode } from "./types";
import { modeDetails } from "./data";

type Props = {
  mode: RuntimeMode;
  onModeChange: (mode: RuntimeMode) => void;
  onReset: () => void;
};

export function RuntimeHeader({ mode, onModeChange, onReset }: Props) {
  return (
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
            onChange={(event) =>
              onModeChange(event.target.value as RuntimeMode)
            }
            aria-label="Runtime mode"
          >
            {(Object.keys(modeDetails) as RuntimeMode[]).map((value) => (
              <option value={value} key={value}>
                {value === "preview"
                  ? "Preview"
                  : value === "public"
                    ? "Public"
                    : "Embed"}
              </option>
            ))}
          </select>
        </label>
        {mode === "preview" && (
          <button className="quiet" onClick={onReset}>
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
  );
}
