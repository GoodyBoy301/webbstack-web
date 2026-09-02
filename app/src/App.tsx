import { useEffect, useState } from "react";
import RuntimeApp, { type RuntimeProject } from "./RuntimeApp";
import { Dashboard } from "./dashboard/Dashboard";
import type { Project } from "./dashboard/types";
import { ProductSummary } from "./summary";
import { PublicViewer } from "./publicViewer";
import { markPerformance } from "./telemetry";
import { parsePublicRoute } from "./projectPublishing";

type View = "summary" | "dashboard" | "runtime" | "public";

export default function App({ initialView }: { initialView?: View }) {
  useEffect(() => {
    markPerformance("webbstack_navigation_start");
  }, []);

  const [publicProject, setPublicProject] = useState<Project | null>(null);
  const [runtimeProject, setRuntimeProject] = useState<
    RuntimeProject | undefined
  >();
  const [publicRoute, setPublicRoute] = useState(() =>
    parsePublicRoute(window.location.hash),
  );
  const [view, setView] = useState<View>(() => {
    if (initialView) return initialView;
    if (window.location.hash === "#runtime") return "runtime";
    if (window.location.hash === "#dashboard") return "dashboard";
    if (window.location.hash.startsWith("#public")) return "public";
    return "summary";
  });

  useEffect(() => {
    const onHashChange = () => {
      const route = parsePublicRoute(window.location.hash);
      setPublicRoute(route);
      if (window.location.hash === "#runtime") setView("runtime");
      else if (window.location.hash === "#dashboard") setView("dashboard");
      else if (route || window.location.hash.startsWith("#public"))
        setView("public");
      else setView("summary");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const openRuntime = (project?: Project) => {
    if (project && (project.archived || project.status !== "ready")) return;
    setRuntimeProject(
      project
        ? {
            name: project.name,
            filename: project.filename,
            version: project.version,
            accent: project.accent,
          }
        : undefined,
    );
    window.location.hash = "runtime";
    setView("runtime");
  };

  const openDashboard = () => {
    window.location.hash = "dashboard";
    setView("dashboard");
  };

  const openPublic = (project: Project) => {
    setPublicProject(project);
    window.location.hash = `public/${project.username}/${project.slug}`;
    setPublicRoute({
      username: project.username.toLowerCase(),
      slug: project.slug.toLowerCase(),
    });
    setView("public");
  };

  if (view === "runtime") return <RuntimeApp project={runtimeProject} />;
  if (view === "public")
    return (
      <PublicViewer
        project={publicProject}
        route={publicRoute}
        onBack={openDashboard}
      />
    );
  if (view === "dashboard")
    return <Dashboard onOpenRuntime={openRuntime} onOpenPublic={openPublic} />;
  return (
    <ProductSummary
      onOpenDashboard={openDashboard}
      onOpenRuntime={openRuntime}
    />
  );
}
