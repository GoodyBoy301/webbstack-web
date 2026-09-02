import { BuildProgress, StatusBadge } from "../components";
import { formatBytes, projectStatusDetails, statusProgress } from "./constants";
import type { Project } from "./types";

type ProjectCardProps = {
  project: Project;
  onOpenRuntime: (project: Project) => void;
  onOpen: (project: Project, publish?: boolean) => void;
  onDuplicate: (project: Project) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onRetry: (project: Project) => void;
  onStop: (project: Project) => void;
  onCancel: (project: Project) => void;
  onInterrupt: (project: Project) => void;
};

export function ProjectCard({ project, onOpenRuntime, onOpen, onDuplicate, onUpdate, onRetry, onStop, onCancel, onInterrupt }: ProjectCardProps) {
  const details = projectStatusDetails(project);
  const canPreview = !project.archived && project.status === "ready";
  const isBuilding = ["uploading", "preparing", "validating"].includes(project.status);
  return <article className={`project-card${project.archived ? " is-archived" : ""}`}>
    <div className="project-thumbnail" aria-hidden="true" style={{ background: project.accent }}>✦</div>
    <div className="project-card-content">
      <div className="project-card-title"><div><h3>{project.name}</h3><p>{project.filename} · {formatBytes(project.size)}</p></div><StatusBadge label={details.label} status={project.status} archived={project.archived} /></div>
      <p className="project-status-detail">{details.detail}</p>
      {!project.archived && project.status !== "ready" && <BuildProgress label={details.label} value={project.progress} />}
      <div className="project-card-footer"><span>Created {project.createdAt} · Build v{project.version}</span><div className="project-actions">
        <button className="project-action" disabled={!canPreview} onClick={() => onOpenRuntime(project)}>Preview</button>
        {project.status === "uploading" && <button className="project-action" onClick={() => onCancel(project)}>Cancel upload</button>}
        {isBuilding && <><button className="project-action" onClick={() => onStop(project)}>Stop build</button><button className="project-action" onClick={() => onInterrupt(project)}>Simulate network interruption</button></>}
        {["failed", "stopped", "interrupted", "cancelled"].includes(project.status) && <button className="project-action" disabled={project.archived} onClick={() => onRetry(project)}>{project.status === "cancelled" ? "Retry upload" : project.status === "interrupted" ? "Retry connection" : "Retry build"}</button>}
        <button className="project-action" disabled={project.archived} onClick={() => onOpen(project)}>Open</button>
        <button className="project-action" disabled={!canPreview} onClick={() => onOpen(project, true)}>Share</button>
        <button className="project-action" onClick={() => onDuplicate(project)}>Duplicate</button>
        <button className="project-action" onClick={() => onUpdate(project.id, { archived: !project.archived, status: project.archived ? "draft" : "archived", progress: project.archived ? statusProgress("draft") : statusProgress("archived") })}>{project.archived ? "Restore" : "Archive"}</button>
      </div></div>
    </div>
  </article>;
}
