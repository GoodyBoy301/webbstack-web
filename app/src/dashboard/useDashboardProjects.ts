import { useEffect, useState } from "react";
import { slugifyProjectName } from "../projectPublishing";
import { trackEvent } from "../telemetry";
import { statusProgress } from "./constants";
import { buildProjectFromFile, duplicateProject, nextBuildStatus, updateProjectList } from "./dashboardProjectActions";
import type { Project } from "./types";

export function useDashboardProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const selectedProject = projects.find(({ id }) => id === selectedProjectId);

  useEffect(() => {
    const pending = projects.find(({ archived, status }) =>
      !archived && ["uploading", "preparing", "validating"].includes(status));
    if (!pending) return;
    const timer = window.setTimeout(() => {
      const status = nextBuildStatus(pending);
      setProjects((current) => updateProjectList(current, pending.id, {
        status, progress: statusProgress(status),
      }));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [projects]);

  const updateProject = (id: string, updates: Partial<Project>) =>
    setProjects((current) => updateProjectList(current, id, updates));
  const retryBuild = (project: Project) => updateProject(project.id, {
    status: "uploading", progress: 20, version: project.version + 1,
  });
  const stopBuild = (project: Project) => updateProject(project.id, { status: "stopped", progress: 0 });
  const cancelUpload = (project: Project) => updateProject(project.id, { status: "cancelled", progress: 0 });
  const interruptConnection = (project: Project) => updateProject(project.id, { status: "interrupted" });
  const duplicate = (project: Project) => setProjects((current) => [...current, duplicateProject(project)]);

  const handleFile = (file?: File) => {
    if (!file) return;
    trackEvent("project_upload_started", { size: file.size });
    if (!file.name.toLowerCase().endsWith(".webb")) {
      setUploadMessage("Choose a .webb package to continue.");
      trackEvent("project_upload_failed", { reason: "extension" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setUploadMessage("This package is larger than the 100 MB limit.");
      trackEvent("project_upload_failed", { reason: "size" });
      return;
    }
    const project = buildProjectFromFile(file);
    setUploadMessage(`${file.name} is ready to upload.`);
    setProjects((current) => [...current, project]);
    trackEvent("project_upload_completed", { size: file.size });
    setSelectedProjectId(project.id);
  };

  return {
    projects, selectedProject, selectedProjectId, uploadMessage, setUploadMessage,
    setSelectedProjectId, updateProject, retryBuild, stopBuild, cancelUpload,
    interruptConnection, duplicate, handleFile, slugifyProjectName,
  };
}
