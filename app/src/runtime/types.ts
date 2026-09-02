export type Status = "available" | "restricted" | "unavailable";
export type RuntimeMode = "preview" | "public" | "embed";
export type Viewport = "desktop" | "tablet" | "mobile";
export type Lifecycle = "loading" | "ready" | "paused" | "error" | "stopped";
export type RuntimeError = "runtime" | "unsupported";
export type ViewportDetails = { label: string; width: number; height: number };
export type RuntimeProject = { name: string; filename: string; version: number; accent: string };
export type Capability = { name: string; status: Status; permission: string; detail: string };
