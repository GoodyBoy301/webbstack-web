import { useRef } from "react";
import { useDialogFocus } from "./useDialogFocus";

type Props = { onStay: () => void; onDiscard: () => void; onSave: () => void };

export function ExitConfirmation({ onStay, onDiscard, onSave }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(true, onStay, dialogRef);
  return <div className="create-overlay" role="presentation"><section className="create-panel exit-confirmation" role="dialog" aria-modal="true" aria-labelledby="unsaved-title" aria-describedby="unsaved-description" ref={dialogRef}><span className="section-index">Unsaved changes</span><h2 id="unsaved-title">Leave this project?</h2><p id="unsaved-description">You have edits that have not been saved. Choose whether to keep, discard, or save them before continuing.</p><div className="confirm-actions"><button onClick={onStay}>Stay</button><button onClick={onDiscard}>Discard changes</button><button className="dashboard-primary" onClick={onSave}>Save and continue</button></div></section></div>;
}
