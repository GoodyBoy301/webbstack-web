export type TelemetryEventName =
  | "project_create_started"
  | "project_upload_started"
  | "project_upload_completed"
  | "project_upload_failed"
  | "build_preparation_completed"
  | "build_preparation_failed"
  | "runtime_started"
  | "runtime_failed"
  | "runtime_reset"
  | "customization_saved"
  | "project_published"
  | "share_link_copied"
  | "public_view_started"
  | "public_runtime_interacted"
  | "public_runtime_failed";

type TelemetryDetail = {
  name: TelemetryEventName;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
};

export function trackEvent(
  name: TelemetryEventName,
  properties?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  const detail: TelemetryDetail = { name, properties, timestamp: Date.now() };
  window.dispatchEvent(new CustomEvent("webbstack:analytics", { detail }));
}

export function markPerformance(name: string) {
  if (typeof window === "undefined" || !window.performance?.mark) return;
  window.performance.mark(name);
}

export function measurePerformance(name: string, startMark: string) {
  if (typeof window === "undefined" || !window.performance?.measure) return;
  try {
    window.performance.measure(name, startMark);
  } catch {
    return;
  }
}
