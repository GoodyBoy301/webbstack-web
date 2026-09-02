import { slugifyProjectName } from "../projectPublishing";
import type { Project, ProjectStatus } from "./types";

export const buildProjectFromFile = (file: File): Project => {
  const name = file.name.replace(/\.webb$/i, "");
  return {
    id: crypto.randomUUID(), name, filename: file.name, size: file.size,
    status: "uploading", progress: 20, createdAt: "Just now", description: "",
    creator: "", username: "independent-dev", slug: slugifyProjectName(name),
    visibility: "private", publishedUrl: "", accent: "#8ebd4f", version: 1,
    archived: false,
  };
};

export const duplicateProject = (project: Project): Project => {
  const name = `${project.name} copy`;
  return {
    ...project, id: crypto.randomUUID(), name, filename: `${name}.webb`,
    slug: slugifyProjectName(name), publishedUrl: "", visibility: "private",
    createdAt: "Just now", version: project.version + 1, status: "draft",
    progress: 0, archived: false,
  };
};

export const nextBuildStatus = (project: Project): ProjectStatus => {
  if (project.status === "uploading") return "preparing";
  if (project.status === "preparing") return "validating";
  return project.name.toLowerCase().includes("failed") ? "failed" : "ready";
};

export const updateProjectList = (
  projects: Project[], id: string, updates: Partial<Project>,
) => projects.map((project) => project.id === id ? { ...project, ...updates } : project);
