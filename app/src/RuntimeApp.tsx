import { useMemo } from "react";
import {
  previewManifest,
  previewPackageFiles,
  validatePackage,
} from "./packageValidation";
import { RuntimeHeader } from "./runtime/RuntimeHeader";
import { RuntimePreview } from "./runtime/RuntimePreview";
import { RuntimeDiagnostics } from "./runtime/RuntimeDiagnostics";
import { useRuntimeState } from "./runtime/useRuntimeState";
import type { RuntimeMode, RuntimeProject } from "./runtime/types";

export type { RuntimeProject } from "./runtime/types";
type Props = { project?: RuntimeProject; initialMode?: RuntimeMode };

export default function RuntimeApp({
  project,
  initialMode = "preview",
}: Props) {
  const runtime = useRuntimeState(initialMode);
  const report = useMemo(
    () => validatePackage(previewManifest, previewPackageFiles),
    [runtime.validationRun],
  );
  const stop = () => {
    runtime.setRuntimeError(null);
    runtime.setLifecycle("stopped");
    runtime.addLog("Runtime stopped");
  };
  const pause = () => {
    runtime.setLifecycle("paused");
    runtime.addLog("App background");
  };
  const resume = () => {
    runtime.setLifecycle("ready");
    runtime.addLog("App foreground");
  };
  const revalidate = () => {
    runtime.setValidationRun((run) => run + 1);
    runtime.addLog("Package validation rerun");
  };
  return (
    <div
      className="app-shell"
      data-runtime-mode={runtime.mode}
      style={
        project
          ? ({ "--runtime-accent": project.accent } as React.CSSProperties)
          : undefined
      }
    >
      <RuntimeHeader
        mode={runtime.mode}
        onModeChange={runtime.setMode}
        onReset={runtime.resetPreview}
      />
      <main className="content">
        <RuntimePreview
          project={project}
          runtime={runtime}
          onStop={stop}
          onError={runtime.simulateRuntimeError}
          onPause={pause}
          onResume={resume}
        />
        <RuntimeDiagnostics
          runtime={runtime}
          report={report}
          onRevalidate={revalidate}
        />
      </main>
    </div>
  );
}
