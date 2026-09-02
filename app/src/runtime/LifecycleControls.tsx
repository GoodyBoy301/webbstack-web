import type { Lifecycle, RuntimeError } from "./types";

type Props = { lifecycle: Lifecycle; onReload: () => void; onReinstall: () => void; onRestart: () => void; onLoading: () => void; onFinishLoading: () => void; onStop: () => void; onError: (error: RuntimeError) => void; onPause: () => void; onResume: () => void };

export function LifecycleControls({ lifecycle, onReload, onReinstall, onRestart, onLoading, onFinishLoading, onStop, onError, onPause, onResume }: Props) {
  return <div className="lifecycle"><div><div className="eyebrow">App lifecycle</div><strong>{lifecycle}</strong></div><div className="control-group">
    <button className="small" onClick={onReload}>Reload app</button><button className="small" onClick={onReinstall}>Reinstall package</button>
    {lifecycle === "stopped" ? <button className="small" onClick={onRestart}>Restart runtime</button> : lifecycle === "error" ? <button className="small" onClick={onReload}>Recover runtime</button> : lifecycle === "loading" ? <button className="small" onClick={onFinishLoading}>Finish loading</button> : <>
      <button className="small" onClick={onLoading}>Simulate loading</button><button className="small" onClick={onPause}>Pause</button><button className="small" onClick={onResume}>Resume</button><button className="small" onClick={onStop}>Stop runtime</button>
    </>}
    {lifecycle !== "error" && lifecycle !== "loading" && <><button className="small" onClick={() => onError("runtime")}>Simulate runtime failure</button><button className="small" onClick={() => onError("unsupported")}>Simulate unsupported browser</button></>}
  </div></div>;
}
