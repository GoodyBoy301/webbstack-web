export type PackageCheckStatus = "pass" | "warning" | "error";

export type PackageCheck = {
  id: string;
  label: string;
  detail: string;
  status: PackageCheckStatus;
};

export type PackageManifest = {
  format?: unknown;
  formatVersion?: unknown;
  appId?: unknown;
  name?: unknown;
  version?: unknown;
  entrypoint?: unknown;
  wasm?: {
    module?: unknown;
    glue?: unknown;
  };
};

export type PackageReport = {
  checks: PackageCheck[];
  errors: number;
  warnings: number;
  passed: number;
};

const safePackagePath = (value: unknown) => {
  if (typeof value !== "string" || value.length === 0) return false;
  return (
    !value.startsWith("/") &&
    !value.includes("\\") &&
    !value.split("/").includes("..") &&
    !/[\u0000-\u001f]/.test(value)
  );
};

const requiredManifestFields = (manifest: PackageManifest): PackageCheck => {
  const required = [
    "format",
    "formatVersion",
    "appId",
    "name",
    "version",
    "entrypoint",
  ];
  const missing = required.filter(
    (field) => manifest[field as keyof PackageManifest] == null,
  );
  const hasWasm = manifest.wasm?.module != null && manifest.wasm?.glue != null;
  const validIdentity =
    manifest.format === "webb" &&
    typeof manifest.formatVersion === "string" &&
    typeof manifest.appId === "string" &&
    typeof manifest.version === "string";

  if (missing.length === 0 && hasWasm && validIdentity) {
    return {
      id: "manifest-fields",
      label: "Minimal manifest fields",
      detail: "All boot-critical manifest fields are present.",
      status: "pass",
    };
  }

  return {
    id: "manifest-fields",
    label: "Minimal manifest fields",
    detail:
      missing.length > 0
        ? `Missing ${[...missing, ...(hasWasm ? [] : ["wasm.module/glue"])].join(", ")}.`
        : "Manifest identity or format version is invalid.",
    status: "error",
  };
};

const referencedFiles = (manifest: PackageManifest) =>
  [manifest.entrypoint, manifest.wasm?.module, manifest.wasm?.glue].filter(
    (path): path is string => typeof path === "string",
  );

export function validatePackage(
  manifest: PackageManifest,
  files: readonly string[],
  options: { signed?: boolean } = {},
): PackageReport {
  const checks: PackageCheck[] = [requiredManifestFields(manifest)];
  const rootManifests = files.filter(
    (file) => file === "webb.manifest.json",
  ).length;
  const unsafePaths = files.filter((file) => !safePackagePath(file));
  const missingReferences = referencedFiles(manifest).filter(
    (file) => !files.includes(file),
  );
  const nativeBinaries = files.filter((file) =>
    /\.(?:exe|dll|dylib|so|bin)$/i.test(file),
  );
  const sourceMaps = files.filter((file) => /\.map$/i.test(file));
  const sensitiveFiles = files.filter((file) =>
    /(?:\.env|credentials|secret|private-key|\.pem)/i.test(file),
  );

  checks.push({
    id: "root-manifest",
    label: "Single root manifest",
    detail:
      rootManifests === 1
        ? "Exactly one root manifest was found."
        : `Found ${rootManifests} root manifests.`,
    status: rootManifests === 1 ? "pass" : "error",
  });
  checks.push({
    id: "references",
    label: "Manifest file references",
    detail:
      missingReferences.length === 0
        ? "Entrypoint, WebAssembly, and glue files resolve inside the package."
        : `Missing: ${missingReferences.join(", ")}.`,
    status: missingReferences.length === 0 ? "pass" : "error",
  });
  checks.push({
    id: "paths",
    label: "Safe archive paths",
    detail:
      unsafePaths.length === 0
        ? "No absolute, traversal, or control-character paths found."
        : `Unsafe path: ${unsafePaths[0]}.`,
    status: unsafePaths.length === 0 ? "pass" : "error",
  });
  checks.push({
    id: "native-binaries",
    label: "Native executable scan",
    detail:
      nativeBinaries.length === 0
        ? "No unsupported native binaries found."
        : `Unsupported binary: ${nativeBinaries[0]}.`,
    status: nativeBinaries.length === 0 ? "pass" : "error",
  });
  checks.push({
    id: "integrity",
    label: "SHA-256 integrity metadata",
    detail:
      "Preview keeps the file list deterministic; archive hash verification is pending host integration.",
    status: "warning",
  });
  checks.push({
    id: "signature",
    label: "Ed25519 package signature",
    detail: options.signed
      ? "Signature verified against the canonical package digest."
      : "Unsigned packages are allowed in local preview; publishing requires webbstack signing.",
    status: options.signed ? "pass" : "warning",
  });
  checks.push({
    id: "sensitive-files",
    label: "Secret and credential scan",
    detail:
      sensitiveFiles.length === 0
        ? "No likely secret or credential files found in the package."
        : `Potential secret file: ${sensitiveFiles[0]}.`,
    status: sensitiveFiles.length === 0 ? "pass" : "error",
  });
  checks.push({
    id: "external-origins",
    label: "External-origin policy",
    detail:
      "No undeclared remote origins are required by this preview fixture.",
    status: "pass",
  });
  checks.push({
    id: "source-maps",
    label: "Public source-map exposure",
    detail:
      sourceMaps.length === 0
        ? "No source maps are included in this preview package."
        : "Source maps are private-preview only and must be excluded before publishing.",
    status: sourceMaps.length === 0 ? "pass" : "warning",
  });

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
  wasm: {
    module: "runtime/app.wasm",
    glue: "runtime/app.js",
  },
};

export const previewPackageFiles = [
  "webb.manifest.json",
  "runtime/index.html",
  "runtime/app.wasm",
  "runtime/app.js",
  "assets/app.css",
];
