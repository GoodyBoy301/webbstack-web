import { useEffect, useState } from "react";
import { markPerformance, measurePerformance, trackEvent } from "./telemetry";
import { parsePublicRoute } from "./projectPublishing";
import { Brand } from "./dashboard/Brand";
import { PublicRuntimeCard } from "./publicRuntimeCard";
import { PublicUnavailable } from "./publicUnavailable";
import type { Project } from "./dashboard/types";

type Props = {
  project: Project | null;
  route: ReturnType<typeof parsePublicRoute>;
  onBack: () => void;
};
export function PublicViewer({ project, route, onBack }: Props) {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");
  const isAvailable = Boolean(
    project &&
    route &&
    project.visibility !== "private" &&
    project.username.toLowerCase() === route.username &&
    project.slug.toLowerCase() === route.slug,
  );
  useEffect(() => {
    if (!isAvailable) return;
    markPerformance("public_shell_ready");
    measurePerformance("public_shell_render", "webbstack_navigation_start");
    trackEvent("public_view_started", { project: project?.name ?? "unknown" });
  }, [isAvailable, project]);
  if (!isAvailable || !project) return <PublicUnavailable onBack={onBack} />;
  const copyLink = async () => {
    if (!project.publishedUrl) return;
    try {
      await navigator.clipboard.writeText(project.publishedUrl);
      setCopyMessage("Link copied");
      trackEvent("share_link_copied");
    } catch {
      setCopyMessage("Copy is unavailable in this browser");
    }
  };
  return (
    <main
      className="public-viewer"
      style={{ "--viewer-accent": project.accent } as React.CSSProperties}
    >
      <header className="public-viewer-nav">
        <Brand />
        <button className="project-action" onClick={onBack}>
          Open workspace
        </button>
      </header>
      <section className="public-viewer-heading">
        <span className="section-index">Public showcase</span>
        <h1>{project.name}</h1>
        <p>
          by {project.creator} · {project.publishedUrl}
        </p>
      </section>
      <PublicRuntimeCard
        project={project}
        reloadKey={reloadKey}
        onReload={() => setReloadKey((key) => key + 1)}
      />
      <div className="public-viewer-details">
        <p>
          {project.description ||
            "Explore this creator-owned experience running on webbstack."}
        </p>
        <div className="public-viewer-share">
          <button className="project-action" onClick={copyLink}>
            Copy link
          </button>
          <span aria-live="polite">{copyMessage}</span>
        </div>
      </div>
    </main>
  );
}
