import { useState } from "react";
import { publicProjectUrl } from "../projectPublishing";
import { trackEvent } from "../telemetry";
import { DashboardHeader } from "./DashboardHeader";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { DashboardContent } from "./DashboardContent";
import { PublishDialog } from "./PublishDialog";
import { useDashboardProjects } from "./useDashboardProjects";
import type { Project } from "./types";

type DashboardProps = {
  onOpenRuntime: (project?: Project) => void;
  onOpenPublic: (project: Project) => void;
};

export function Dashboard({ onOpenRuntime, onOpenPublic }: DashboardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false),
    [isProjectOpen, setIsProjectOpen] = useState(false),
    [isPublishOpen, setIsPublishOpen] = useState(false),
    [search, setSearch] = useState("");
  const dashboard = useDashboardProjects();
  const { selectedProject } = dashboard;
  const openProject = (project: Project, publish = false) => {
    dashboard.setSelectedProjectId(project.id);
    setIsProjectOpen(!publish);
    setIsPublishOpen(publish);
  };
  const publish = (visibility: Project["visibility"]) => {
    if (!selectedProject) return;
    trackEvent("project_published", { visibility });
    dashboard.updateProject(selectedProject.id, {
      visibility,
      publishedUrl:
        visibility === "private"
          ? ""
          : publicProjectUrl(selectedProject.username, selectedProject.slug),
    });
  };
  const closeCreate = (file?: File) => {
    dashboard.handleFile(file);
    if (
      file?.name.toLowerCase().endsWith(".webb") &&
      file.size <= 100 * 1024 * 1024
    )
      setIsCreateOpen(false);
  };
  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <DashboardContent
        project={selectedProject}
        isOpen={isProjectOpen}
        projects={dashboard.projects}
        search={search}
        onSearch={setSearch}
        onBack={() => setIsProjectOpen(false)}
        onOpenRuntime={onOpenRuntime}
        onSave={(updates) =>
          dashboard.updateProject(selectedProject!.id, updates)
        }
        onPublish={() => setIsPublishOpen(true)}
        onOpen={openProject}
        onDuplicate={dashboard.duplicate}
        onUpdate={dashboard.updateProject}
        onRetry={dashboard.retryBuild}
        onStop={dashboard.stopBuild}
        onCancel={dashboard.cancelUpload}
        onInterrupt={dashboard.interruptConnection}
        onCreate={() => setIsCreateOpen(true)}
      />
      {isPublishOpen && selectedProject && (
        <PublishDialog
          project={selectedProject}
          onClose={() => setIsPublishOpen(false)}
          onPublish={publish}
          onOpenPublic={() => {
            setIsPublishOpen(false);
            onOpenPublic(selectedProject);
          }}
        />
      )}
      {isCreateOpen && (
        <CreateProjectDialog
          message={dashboard.uploadMessage}
          onClose={() => setIsCreateOpen(false)}
          onFile={closeCreate}
        />
      )}
    </div>
  );
}
