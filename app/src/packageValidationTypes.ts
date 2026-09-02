export type PackageCheckStatus = "pass" | "warning" | "error";
export type PackageCheck = { id: string; label: string; detail: string; status: PackageCheckStatus };
export type PackageManifest = { format?: unknown; formatVersion?: unknown; appId?: unknown; name?: unknown; version?: unknown; entrypoint?: unknown; wasm?: { module?: unknown; glue?: unknown } };
export type PackageReport = { checks: PackageCheck[]; errors: number; warnings: number; passed: number };
