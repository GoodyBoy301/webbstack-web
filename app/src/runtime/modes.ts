import type { RuntimeMode } from "./types";

export const modeDetails: Record<
  RuntimeMode,
  { label: string; title: string; detail: string; checks: string[] }
> = {
  preview: {
    label: "Creator preview",
    title: "Fixture runtime",
    detail: "Deterministic controls and diagnostics are enabled for local testing.",
    checks: ["Creator controls enabled", "Fixture state is resettable", "No physical hardware access"],
  },
  public: {
    label: "Public runtime",
    title: "Published app surface",
    detail: "Runs with real browser, permission, storage, network, and notification behavior.",
    checks: ["Creator controls hidden", "Runtime identity is public-safe", "Capability state follows browser policy"],
  },
  embed: {
    label: "Embed runtime",
    title: "Sandboxed app surface",
    detail: "Runs cross-origin in a sandboxed iframe with a restricted capability profile.",
    checks: ["Creator controls hidden", "Parent origin is validated", "Host capabilities require explicit opt-in"],
  },
};
