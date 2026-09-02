import { LifecycleControls } from "./LifecycleControls";
import { PreviewControls } from "./PreviewControls";
import { PreviewSurface } from "./PreviewSurface";
import type { RuntimeState } from "./useRuntimeState";
import type { RuntimeError, RuntimeProject } from "./types";

type Props = {
  project?: RuntimeProject;
  runtime: RuntimeState;
  onStop: () => void;
  onError: (error: RuntimeError) => void;
  onPause: () => void;
  onResume: () => void;
};

export function RuntimePreview({
  project,
  runtime,
  onStop,
  onError,
  onPause,
  onResume,
}: Props) {
  return (
    <section className="preview-column" aria-labelledby="page-title">
      <PreviewSurface
        project={project}
        mode={runtime.mode}
        lifecycle={runtime.lifecycle}
        runtimeError={runtime.runtimeError}
        orientation={runtime.orientation}
        viewport={runtime.viewport}
        chrome={runtime.chrome}
        onReload={runtime.reloadApp}
      />
      {runtime.mode === "preview" && (
        <>
          <PreviewControls
            viewport={runtime.viewport}
            orientation={runtime.orientation}
            chrome={runtime.chrome}
            onViewport={runtime.setViewport}
            onOrientation={runtime.setOrientation}
            onChrome={() => runtime.setChrome((value) => !value)}
            onLog={runtime.addLog}
          />
          <LifecycleControls
            lifecycle={runtime.lifecycle}
            onReload={runtime.reloadApp}
            onReinstall={runtime.reinstallPackage}
            onRestart={runtime.restartRuntime}
            onLoading={runtime.simulateLoading}
            onFinishLoading={runtime.finishLoading}
            onStop={onStop}
            onError={onError}
            onPause={onPause}
            onResume={onResume}
          />
        </>
      )}
    </section>
  );
}
