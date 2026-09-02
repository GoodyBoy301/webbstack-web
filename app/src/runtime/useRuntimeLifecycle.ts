import { useState } from "react";
import { trackEvent } from "../telemetry";
import type { Capability, Lifecycle, RuntimeError } from "./types";

export function useRuntimeLifecycle() {
  const [lifecycle, setLifecycle] = useState<Lifecycle>("ready");
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null);
  const [logs, setLogs] = useState(["Runtime created", "App ready · 342ms"]);
  const [requested, setRequested] = useState<string[]>([]);
  const [validationRun, setValidationRun] = useState(0);
  const addLog = (message: string) =>
    setLogs((current) => [`${message} · now`, ...current].slice(0, 5));
  const testCapability = (capability: Capability) => {
    if (capability.status === "restricted")
      setRequested((current) =>
        current.includes(capability.name)
          ? current
          : [...current, capability.name],
      );
    addLog(
      `${capability.name} ${capability.status === "restricted" ? "permission requested" : "tested"}`,
    );
  };
  const resetPreview = () => {
    setLifecycle("ready");
    setRuntimeError(null);
    setRequested([]);
    addLog("Preview reset");
    trackEvent("runtime_reset");
  };
  const reloadApp = () => {
    setRuntimeError(null);
    setLifecycle("ready");
    addLog("App reloaded");
  };
  const restartRuntime = () => {
    setRuntimeError(null);
    setLifecycle("ready");
    addLog("Runtime restarted");
  };
  const reinstallPackage = () => {
    setRuntimeError(null);
    setLifecycle("ready");
    setRequested([]);
    setValidationRun((run) => run + 1);
    addLog("Package reinstalled");
  };
  const simulateLoading = () => {
    setRuntimeError(null);
    setLifecycle("loading");
    addLog("Runtime loading");
  };
  const finishLoading = () => {
    setLifecycle("ready");
    addLog("Runtime ready");
  };
  const simulateRuntimeError = (error: RuntimeError) => {
    setRuntimeError(error);
    setLifecycle("error");
    addLog(error === "unsupported" ? "Unsupported browser" : "Runtime error");
    trackEvent("runtime_failed", { reason: error });
  };
  return {
    lifecycle,
    setLifecycle,
    runtimeError,
    setRuntimeError,
    logs,
    setLogs,
    requested,
    validationRun,
    setValidationRun,
    addLog,
    testCapability,
    resetPreview,
    reloadApp,
    restartRuntime,
    reinstallPackage,
    simulateLoading,
    finishLoading,
    simulateRuntimeError,
  };
}
