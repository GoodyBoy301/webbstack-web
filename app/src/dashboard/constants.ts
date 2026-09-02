import type { Project, ProjectStatus } from "./types";

export const statusDetails: Record<ProjectStatus, { label: string; detail: string }> = {
  draft: { label: "Draft", detail: "Add a package or update the showcase details to continue." },
  uploading: { label: "Uploading", detail: "Sending your package securely." },
  queued: { label: "Queued", detail: "Your build is waiting to start." },
  preparing: { label: "Preparing runtime", detail: "Setting up the app environment." },
  running: { label: "Build running", detail: "Building the package for preview." },
  validating: { label: "Validating package", detail: "Checking the build before preview." },
  ready: { label: "Ready for preview", detail: "The runtime passed its initial checks." },
  failed: { label: "Build failed", detail: "The package could not be prepared. Retry the build to try again." },
  stopped: { label: "Build stopped", detail: "This build was stopped before the runtime was ready." },
  interrupted: { label: "Connection interrupted", detail: "The network connection was interrupted. Your progress is preserved; retry when you are ready." },
  cancelled: { label: "Upload cancelled", detail: "The upload was cancelled before the package was prepared." },
  archived: { label: "Archived", detail: "Hidden from normal workspace actions." },
};

export const workflow = [
  { number: "01", title: "Bring your app", description: "Create a showcase from a supported .webb app or import the source that produces one." },
  { number: "02", title: "Make it trustworthy", description: "webbstack prepares the runtime, validates the package, and makes its state easy to understand." },
  { number: "03", title: "Share the experience", description: "Preview in a device shell, tune the presentation, then publish a creator-owned URL." },
];

export function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function projectStatusDetails(project: Project) {
  return statusDetails[project.archived ? "archived" : project.status];
}

export function statusProgress(status: ProjectStatus) {
  return { draft: 0, uploading: 20, queued: 20, preparing: 55, running: 70, validating: 80, ready: 100, failed: 80, stopped: 0, interrupted: 0, cancelled: 0, archived: 0 }[status];
}
