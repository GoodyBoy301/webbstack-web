import type { PackageReport } from "../packageValidation";
import { CapabilityControls } from "./CapabilityControls";
import { DiagnosticsSummary } from "./DiagnosticsSummary";
import { EventLog } from "./EventLog";
import { PackageInspection } from "./PackageInspection";
import { RuntimeModePanel } from "./RuntimeModePanel";
import type { RuntimeState } from "./useRuntimeState";

type Props = {
  runtime: RuntimeState;
  report: PackageReport;
  onRevalidate: () => void;
};

export function RuntimeDiagnostics({ runtime, report, onRevalidate }: Props) {
  return (
    <aside className="panel" aria-labelledby="controls-title">
      {runtime.mode !== "preview" ? (
        <RuntimeModePanel mode={runtime.mode} />
      ) : (
        <>
          <CapabilityControls
            query={runtime.query}
            statusFilter={runtime.statusFilter}
            filtered={runtime.filtered}
            groups={runtime.groups}
            requested={runtime.requested}
            onQuery={runtime.setQuery}
            onStatus={runtime.setStatusFilter}
            onTest={runtime.testCapability}
          />
          <PackageInspection report={report} onRevalidate={onRevalidate} />
          <DiagnosticsSummary
            lifecycle={runtime.lifecycle}
            runtimeError={runtime.runtimeError}
            viewport={runtime.viewport}
            orientation={runtime.orientation}
            packageValid={report.errors === 0}
          />
          <EventLog logs={runtime.logs} onClear={() => runtime.setLogs([])} />
        </>
      )}
    </aside>
  );
}
