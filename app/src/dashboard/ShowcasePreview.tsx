import type { Project } from "./types";
import type { useProjectDraft } from "./useProjectDraft";

type Props = { project: Project; state: ReturnType<typeof useProjectDraft>; publishBlocked: boolean; onPublish: () => void };

export function ShowcasePreview({ project, state, publishBlocked, onPublish }: Props) {
  const { draft } = state;
  return <aside className="showcase-preview" aria-label="Public showcase preview"><span className="section-index">Preview</span><div className="showcase-preview-card" style={{ borderColor: draft.accent }}><div className="preview-placeholder">✦</div><span className="preview-label">webbstack showcase</span><h2>{draft.name || "Untitled project"}</h2><p>{draft.description || "A short description of this experience."}</p><small>by {draft.creator || "Your name"}</small></div><button className="publish-placeholder" disabled={publishBlocked} onClick={onPublish}>{project.publishedUrl ? "Manage sharing" : publishBlocked && project.status === "ready" ? "Complete details to publish" : "Publish showcase"}</button>{project.publishedUrl && !project.archived && <p className="published-note">Published at {project.publishedUrl}</p>}</aside>;
}
