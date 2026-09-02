import { modeDetails } from "./data";
import type { RuntimeMode } from "./types";

export function RuntimeModePanel({ mode }: { mode: RuntimeMode }) {
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
