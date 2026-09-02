import { useEffect, useMemo, useState } from "react";
import { markPerformance, measurePerformance, trackEvent } from "../telemetry";
import { capabilities, groupFor } from "./data";
import { useRuntimeLifecycle } from "./useRuntimeLifecycle";
import type { RuntimeMode, Status } from "./types";

export function useRuntimeState(initialMode: RuntimeMode) {
  const lifecycle = useRuntimeLifecycle();
  const [mode, setMode] = useState(initialMode);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "mobile",
  );
  const [chrome, setChrome] = useState(true);

  useEffect(() => {
    markPerformance("runtime_ready");
    measurePerformance("runtime_readiness", "webbstack_navigation_start");
    trackEvent("runtime_started", { mode });
  }, [mode]);

  const filtered = useMemo(
    () =>
      capabilities.filter(
        ({ name, status }) =>
          name.includes(query.toLowerCase()) &&
          (statusFilter === "all" || status === statusFilter),
      ),
    [query, statusFilter],
  );
  const groups = [...new Set(filtered.map(({ name }) => groupFor(name)))];
  return {
    mode,
    setMode,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    orientation,
    setOrientation,
    viewport,
    setViewport,
    chrome,
    setChrome,
    filtered,
    groups,
    ...lifecycle,
  };
}
export type RuntimeState = ReturnType<typeof useRuntimeState>;
