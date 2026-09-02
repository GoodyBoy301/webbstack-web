import type { FormEvent } from "react";
import { projectStatusDetails } from "./constants";
import type { Project } from "./types";
import type { useProjectDraft } from "./useProjectDraft";

type DraftState = ReturnType<typeof useProjectDraft>;

type Props = { project: Project; state: DraftState; publishBlocked: boolean; onPublish: () => void };

export function ProjectCustomizationForm({ project, state, publishBlocked, onPublish }: Props) {
  const { draft, update, isDirty, saveMessage, saveDraft } = state;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); saveDraft(); };
  return <form className="customization-form" onSubmit={submit}><div className="form-heading"><div><span className="section-index">Public experience</span><h2>Customize your showcase</h2></div><span className={`overview-status status-${project.archived ? "archived" : project.status}`}>{projectStatusDetails(project).label}</span>{isDirty && <span className="overview-dirty">Unsaved changes</span>}</div>
    <label>Project title <span aria-hidden="true">*</span><input required name="project-title" autoComplete="off" value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
    <label>Short description<textarea name="project-description" autoComplete="off" value={draft.description} onChange={(event) => update("description", event.target.value)} rows={3} /></label>
    <label>Creator or organization <span aria-hidden="true">*</span><input required name="creator" autoComplete="organization" value={draft.creator} onChange={(event) => update("creator", event.target.value)} /></label>
    <div className="publish-fields"><label>Creator username <span aria-hidden="true">*</span><input required name="username" autoComplete="username" spellCheck={false} value={draft.username} onChange={(event) => update("username", event.target.value)} placeholder="independent-dev" /></label><label>App slug <span aria-hidden="true">*</span><input required name="slug" autoComplete="off" spellCheck={false} value={draft.slug} onChange={(event) => update("slug", event.target.value)} placeholder="my-showcase" /></label></div>
    <label className="color-field">Accent color<span><input type="color" name="accent" value={draft.accent} onChange={(event) => update("accent", event.target.value)} /><code>{draft.accent}</code></span></label><div className="form-actions"><button className="dashboard-primary" type="submit">Save changes</button><span aria-live="polite">{saveMessage}</span></div>
  </form>;
}
