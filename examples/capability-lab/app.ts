import {
  createLifecycleApi,
  type WebbLifecycleEvent,
} from "../../docs/reference/lifecycle";
import {
  createNavigationApi,
  type NavigationState,
} from "../../docs/reference/navigation";
import { createPermissionsApi } from "../../docs/reference/permissions";
import {
  createRuntimeApi,
  type WebbCapabilityStatus,
} from "../../docs/reference/runtime-identity";
import { createStorageApi } from "../../docs/reference/storage";

const capabilityNames = [
  "runtime.identity",
  "runtime.capabilities",
  "lifecycle.app",
  "navigation.app",
  "navigation.system",
  "device.orientation",
  "device.display",
  "storage.app",
  "debug.logs",
  "device.motion",
  "device.location",
  "device.vibration",
  "device.battery",
  "device.connectivity",
  "media.camera",
  "media.microphone",
  "notifications",
  "network.control",
  "debug.network",
  "debug.inspector",
] as const;

const privilegedCapabilities = new Set(capabilityNames.slice(9));
const capabilityStatus: WebbCapabilityStatus[] = capabilityNames.map(
  (name) => ({
    name,
    supported: true,
    enabled: true,
    availability: privilegedCapabilities.has(name) ? "restricted" : "available",
    requiresPermission: privilegedCapabilities.has(name),
    permission: privilegedCapabilities.has(name)
      ? "not-requested"
      : "not-requested",
    version: "1.0",
  }),
);

const runtime = createRuntimeApi({
  formatVersion: "1.0",
  runtimeVersion: "1.0.0-reference",
  mode: "development",
  appId: "dev.webbstack.capability-lab",
  appVersion: "1.0.0",
  buildId: "reference-capability-lab",
  sessionId: crypto.randomUUID(),
  capabilities: capabilityStatus,
});

const lifecycle = createLifecycleApi();
const navigation = createNavigationApi({
  initialView: "overview",
  fallbackView: "overview",
  destinations: ["overview", "storage", "permissions", "diagnostics"],
});
const permissions = createPermissionsApi(
  Object.fromEntries(
    capabilityNames.slice(9).map((name) => [
      name,
      {
        required: false,
        reason: `Demonstrate ${name} fallback behavior`,
      },
    ]),
  ),
  async () => "dismissed",
);
const storage = createStorageApi();
const logs: Array<Record<string, unknown>> = [];

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Reference app root is missing");

const log = (message: string, data: Record<string, unknown> = {}): void => {
  logs.push({
    timestamp: Date.now(),
    level: "info",
    scope: "capability-lab",
    message,
    data,
  });
  render();
};

const handleLifecycle = (event: WebbLifecycleEvent): void => {
  log(event.type, event);
};

const handleNavigation = (state: NavigationState): void => {
  log("navigation.changed", state);
};

lifecycle.on(handleLifecycle);
navigation.onChange(handleNavigation);

const exercise = async (name: string): Promise<void> => {
  if (name === "lifecycle.app") {
    if (lifecycle.state() === "created") lifecycle.boot();
    if (lifecycle.state() === "booting")
      lifecycle.ready({ view: navigation.state().current });
    return;
  }
  if (name === "navigation.app") {
    navigation.push("diagnostics");
    return;
  }
  if (name === "navigation.system") {
    navigation.back();
    return;
  }
  if (name === "storage.app") {
    await storage.set("lastCapabilityCheck", name);
    log("storage.write", { usage: storage.usage("app") });
    return;
  }
  if (name === "debug.logs") {
    log("Structured diagnostic log emitted");
    return;
  }
  if (runtime.canUse(name)) {
    log("core capability available", { capability: name });
    return;
  }
  const result = await permissions.request(name);
  log("privileged capability fallback", {
    capability: name,
    status: result.status,
  });
};

const render = (): void => {
  const state = navigation.state();
  const rows = runtime
    .capabilities()
    .map(
      (capability) => `
    <tr>
      <td><code>${capability.name}</code></td>
      <td>${runtime.canUse(capability.name) ? "available" : capability.availability}</td>
      <td>${capability.requiresPermission ? capability.permission : "not required"}</td>
      <td><button data-capability="${capability.name}">Exercise</button></td>
    </tr>`,
    )
    .join("");

  app.innerHTML = `
    <h1>Capability Lab</h1>
    <p class="status">Lifecycle: <strong>${lifecycle.state()}</strong> · View: <strong>${state.current}</strong></p>
    <p class="muted">Stack: ${state.stack.join(" → ")}</p>
    <p>
      <button data-action="boot">Boot and ready</button>
      <button data-action="background">Background</button>
      <button data-action="foreground">Foreground</button>
      <button data-action="back">System back</button>
      <button data-action="clear">Clear data</button>
    </p>
    <h2>V1 capabilities</h2>
    <table><thead><tr><th>Capability</th><th>Availability</th><th>Permission</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    <h2>Structured logs</h2>
    <pre>${JSON.stringify(logs.slice(-8), null, 2)}</pre>`;

  app
    .querySelectorAll<HTMLButtonElement>("[data-capability]")
    .forEach((button) => {
      button.onclick = () => void exercise(button.dataset.capability ?? "");
    });
  app.querySelector<HTMLButtonElement>('[data-action="boot"]')!.onclick = () =>
    void exercise("lifecycle.app");
  app.querySelector<HTMLButtonElement>('[data-action="background"]')!.onclick =
    () => lifecycle.background("reference control");
  app.querySelector<HTMLButtonElement>('[data-action="foreground"]')!.onclick =
    () => lifecycle.foreground();
  app.querySelector<HTMLButtonElement>('[data-action="back"]')!.onclick =
    () => {
      if (!navigation.back()) log("navigation.system.back-at-root");
    };
  app.querySelector<HTMLButtonElement>('[data-action="clear"]')!.onclick = () =>
    void storage.clear().then(() => lifecycle.clearData());
};

render();
