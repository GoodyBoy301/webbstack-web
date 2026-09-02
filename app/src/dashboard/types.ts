import type { Visibility } from "../projectPublishing";

export type ProjectStatus =
  | "draft"
  | "uploading"
  | "queued"
  | "preparing"
  | "running"
  | "validating"
  | "ready"
  | "failed"
  | "stopped"
  | "interrupted"
  | "cancelled"
  | "archived";

export type Project = {
  id: string;
  name: string;
  filename: string;
  size: number;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  description: string;
  creator: string;
  username: string;
  slug: string;
  visibility: Visibility;
  publishedUrl: string;
  accent: string;
  version: number;
  archived: boolean;
};
