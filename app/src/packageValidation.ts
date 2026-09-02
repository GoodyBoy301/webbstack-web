import { packageChecks } from "./packageValidationChecks";
export type {
  PackageCheck,
  PackageCheckStatus,
  PackageManifest,
  PackageReport,
} from "./packageValidationTypes";
import type { PackageManifest, PackageReport } from "./packageValidationTypes";

export function validatePackage(
  manifest: PackageManifest,
  files: readonly string[],
  options: { signed?: boolean } = {},
): PackageReport {
  const checks = packageChecks(manifest, files, options.signed === true);
  return {
    checks,
    errors: checks.filter(({ status }) => status === "error").length,
    warnings: checks.filter(({ status }) => status === "warning").length,
    passed: checks.filter(({ status }) => status === "pass").length,
  };
}

export const previewManifest: PackageManifest = {
  format: "webb",
  formatVersion: "1.0",
  appId: "com.example.capability-lab",
  name: "Capability Lab",
  version: "1.0.0",
  entrypoint: "runtime/index.html",
  wasm: { module: "runtime/app.wasm", glue: "runtime/app.js" },
};
export const previewPackageFiles = [
  "webb.manifest.json",
  "runtime/index.html",
  "runtime/app.wasm",
  "runtime/app.js",
  "assets/app.css",
];
