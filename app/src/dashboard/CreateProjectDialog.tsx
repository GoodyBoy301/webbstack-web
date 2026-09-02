import { useRef } from "react";
import { useDialogFocus } from "./useDialogFocus";

type CreateProjectDialogProps = { message: string; onClose: () => void; onFile: (file?: File) => void };

export function CreateProjectDialog({ message, onClose, onFile }: CreateProjectDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(true, onClose, dialogRef);
  return <div className="create-overlay" role="presentation" onClick={onClose}><section className="create-panel" role="dialog" aria-modal="true" aria-labelledby="create-title" aria-describedby="create-description" ref={dialogRef} onClick={(event) => event.stopPropagation()}>
    <button className="create-close" onClick={onClose} aria-label="Close new project dialog">×</button>
    <span className="section-index">New project</span><h2 id="create-title">Start with a .webb package.</h2>
    <p id="create-description">Choose a package to upload. We’ll check it before preparing the runtime.</p>
    <label className="upload-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onFile(event.dataTransfer.files[0]); }}>
      <span className="upload-icon" aria-hidden="true">↑</span><strong>Drop your .webb file here</strong><span>or choose a file from your computer</span>
      <input type="file" name="webb-package" aria-label="Choose a .webb package" accept=".webb" onChange={(event) => onFile(event.target.files?.[0])} />
    </label>
    <p className={`upload-message${message.includes("ready") ? " success" : ""}`} aria-live="polite">{message}</p>
    <div className="create-next"><strong>What happens next</strong><span>Validate package <i>→</i> Preview your app <i>→</i> Publish when ready</span></div>
  </section></div>;
}
