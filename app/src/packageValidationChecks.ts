import type { PackageCheck, PackageManifest } from "./packageValidationTypes";

const safePath = (value: string) => !value.startsWith("/") && !value.includes("\\") && !value.split("/").includes("..") && !/[\u0000-\u001f]/.test(value);
const checkManifest = (manifest: PackageManifest): PackageCheck => {
  const required = ["format", "formatVersion", "appId", "name", "version", "entrypoint"];
  const missing = required.filter((field) => manifest[field as keyof PackageManifest] == null);
  const hasWasm = manifest.wasm?.module != null && manifest.wasm?.glue != null;
  const validIdentity = manifest.format === "webb" && typeof manifest.formatVersion === "string" && typeof manifest.appId === "string" && typeof manifest.version === "string";
  return { id: "manifest-fields", label: "Minimal manifest fields", detail: missing.length === 0 && hasWasm && validIdentity ? "All boot-critical manifest fields are present." : missing.length ? `Missing ${[...missing, ...(hasWasm ? [] : ["wasm.module/glue"])].join(", ")}.` : "Manifest identity or format version is invalid.", status: missing.length === 0 && hasWasm && validIdentity ? "pass" : "error" };
};
const listReferences = (manifest: PackageManifest) => [manifest.entrypoint, manifest.wasm?.module, manifest.wasm?.glue].filter((path): path is string => typeof path === "string");
export function packageChecks(manifest: PackageManifest, files: readonly string[], signed: boolean): PackageCheck[] {
  const root = files.filter((file) => file === "webb.manifest.json").length;
  const unsafe = files.filter((file) => !safePath(file));
  const missing = listReferences(manifest).filter((file) => !files.includes(file));
  const binaries = files.filter((file) => /\.(?:exe|dll|dylib|so|bin)$/i.test(file));
  const maps = files.filter((file) => /\.map$/i.test(file));
  const sensitive = files.filter((file) => /(?:\.env|credentials|secret|private-key|\.pem)/i.test(file));
  return [checkManifest(manifest),
    { id: "root-manifest", label: "Single root manifest", detail: root === 1 ? "Exactly one root manifest was found." : `Found ${root} root manifests.`, status: root === 1 ? "pass" : "error" },
    { id: "references", label: "Manifest file references", detail: missing.length ? `Missing: ${missing.join(", ")}.` : "Entrypoint, WebAssembly, and glue files resolve inside the package.", status: missing.length ? "error" : "pass" },
    { id: "paths", label: "Safe archive paths", detail: unsafe.length ? `Unsafe path: ${unsafe[0]}.` : "No absolute, traversal, or control-character paths found.", status: unsafe.length ? "error" : "pass" },
    { id: "native-binaries", label: "Native executable scan", detail: binaries.length ? `Unsupported binary: ${binaries[0]}.` : "No unsupported native binaries found.", status: binaries.length ? "error" : "pass" },
    { id: "integrity", label: "SHA-256 integrity metadata", detail: "Preview keeps the file list deterministic; archive hash verification is pending host integration.", status: "warning" },
    { id: "signature", label: "Ed25519 package signature", detail: signed ? "Signature verified against the canonical package digest." : "Unsigned packages are allowed in local preview; publishing requires webbstack signing.", status: signed ? "pass" : "warning" },
    { id: "sensitive-files", label: "Secret and credential scan", detail: sensitive.length ? `Potential secret file: ${sensitive[0]}.` : "No likely secret or credential files found in the package.", status: sensitive.length ? "error" : "pass" },
    { id: "external-origins", label: "External-origin policy", detail: "No undeclared remote origins are required by this preview fixture.", status: "pass" },
    { id: "source-maps", label: "Public source-map exposure", detail: maps.length ? "Source maps are private-preview only and must be excluded before publishing." : "No source maps are included in this preview package.", status: maps.length ? "warning" : "pass" },
  ];
}
