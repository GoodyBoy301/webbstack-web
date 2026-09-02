import type { Capability, Status } from "./types";

const capabilityRows: [string, Status, string, string][] = [
  ["runtime.identity", "available", "not required", "Runtime metadata is exposed"],
  ["runtime.capabilities", "available", "not required", "Capability discovery is exposed"],
  ["lifecycle.app", "available", "not required", "App lifecycle events"],
  ["navigation.app", "available", "not required", "App-owned navigation stack"],
  ["navigation.system", "available", "not required", "System back handling"],
  ["device.orientation", "available", "not required", "Orientation controls"],
  ["device.display", "available", "not required", "Viewport and display metrics"],
  ["storage.app", "available", "not required", "Persistent app storage"],
  ["debug.logs", "available", "not required", "Structured runtime logs"],
  ["device.motion", "restricted", "not requested", "Needs preview permission"],
  ["device.location", "restricted", "not requested", "Needs preview permission"],
  ["device.vibration", "restricted", "not requested", "Needs preview permission"],
  ["device.battery", "unavailable", "not supported", "Not available in this browser"],
  ["device.connectivity", "available", "not required", "Network state controls"],
  ["media.camera", "restricted", "not requested", "Uses a safe media fixture"],
  ["media.microphone", "restricted", "not requested", "Uses a safe media fixture"],
  ["notifications", "restricted", "not requested", "Uses in-app notifications"],
  ["network.control", "available", "not required", "Latency and offline controls"],
  ["debug.network", "restricted", "not requested", "Redacted request diagnostics"],
  ["debug.inspector", "restricted", "not requested", "App inspection tools"],
];

export const capabilities: Capability[] = capabilityRows.map(
  ([name, status, permission, detail]) => ({ name, status, permission, detail }),
);

export const groupFor = (name: string) => name.split(".")[0];
