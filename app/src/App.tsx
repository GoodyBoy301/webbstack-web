import { useEffect, useRef, useState } from "react";
import { BuildProgress, EmptyState, StatusBadge } from "./components";
import RuntimeApp, { type RuntimeProject } from "./RuntimeApp";
import { markPerformance, measurePerformance, trackEvent } from "./telemetry";
import {
  parsePublicRoute,
  publicProjectUrl,
  slugifyProjectName,
  validateSlug,
  validateUsername,
  type Visibility,
} from "./projectPublishing";

type View = "summary" | "dashboard" | "runtime" | "public";
type ProjectStatus =
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
const focusableSelector =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function useDialogFocus(
  open: boolean,
  onClose: () => void,
  dialogRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusFirst = () => {
      const first = dialog.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    focusFirst();
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [dialogRef, open]);
}

type Project = {
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

const statusDetails: Record<ProjectStatus, { label: string; detail: string }> =
  {
    draft: {
      label: "Draft",
      detail: "Add a package or update the showcase details to continue.",
    },
    uploading: { label: "Uploading", detail: "Sending your package securely." },
    queued: {
      label: "Queued",
      detail: "Your build is waiting to start.",
    },
    preparing: {
      label: "Preparing runtime",
      detail: "Setting up the app environment.",
    },
    running: {
      label: "Build running",
      detail: "Building the package for preview.",
    },
    validating: {
      label: "Validating package",
      detail: "Checking the build before preview.",
    },
    ready: {
      label: "Ready for preview",
      detail: "The runtime passed its initial checks.",
    },
    failed: {
      label: "Build failed",
      detail:
        "The package could not be prepared. Retry the build to try again.",
    },
    stopped: {
      label: "Build stopped",
      detail: "This build was stopped before the runtime was ready.",
    },
    interrupted: {
      label: "Connection interrupted",
      detail:
        "The network connection was interrupted. Your progress is preserved; retry when you are ready.",
    },
    cancelled: {
      label: "Upload cancelled",
      detail: "The upload was cancelled before the package was prepared.",
    },
    archived: {
      label: "Archived",
      detail: "Hidden from normal workspace actions.",
    },
  };

const workflow = [
  {
    number: "01",
    title: "Bring your app",
    description:
      "Create a showcase from a supported .webb app or import the source that produces one.",
  },
  {
    number: "02",
    title: "Make it trustworthy",
    description:
      "webbstack prepares the runtime, validates the package, and makes its state easy to understand.",
  },
  {
    number: "03",
    title: "Share the experience",
    description:
      "Preview in a device shell, tune the presentation, then publish a creator-owned URL.",
  },
];

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function projectStatusDetails(project: Project) {
  return statusDetails[project.archived ? "archived" : project.status];
}

function statusProgress(status: ProjectStatus) {
  return {
    draft: 0,
    uploading: 20,
    queued: 20,
    preparing: 55,
    running: 70,
    validating: 80,
    ready: 100,
    failed: 80,
    stopped: 0,
    interrupted: 0,
    cancelled: 0,
    archived: 0,
  }[status];
}

function Brand() {
  return (
    <a className="summary-brand" href="#top" aria-label="webbstack home">
      <span className="summary-mark" aria-hidden="true" />
      webbstack
    </a>
  );
}

function ProductSummary({
  onOpenDashboard,
  onOpenRuntime,
}: {
  onOpenDashboard: () => void;
  onOpenRuntime: () => void;
}) {
  return (
    <div className="summary-page" id="top">
      <header className="summary-nav">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Why webbstack</a>
        </nav>
        <div className="summary-nav-actions">
          <button className="summary-workspace-link" onClick={onOpenDashboard}>
            Workspace
          </button>
          <button className="summary-nav-cta" onClick={onOpenRuntime}>
            Open preview <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main id="main-content">
        <section className="summary-hero" aria-labelledby="summary-title">
          <div className="hero-copy">
            <div className="summary-kicker">
              <span /> .webb apps, ready to show
            </div>
            <h1 id="summary-title">
              Turn your app into a <em>credible</em> experience.
            </h1>
            <p className="hero-description">
              webbstack is the browser-based runtime and presentation layer for
              .webb apps. Build confidence with a live, interactive showcase—not
              a screen recording or a repository link.
            </p>
            <div className="hero-actions">
              <button className="summary-primary" onClick={onOpenDashboard}>
                Create a showcase <span aria-hidden="true">→</span>
              </button>
              <a className="summary-secondary" href="#how-it-works">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-note">
              <span className="status-pulse" /> Live runtime, clear status, one
              shareable URL.
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Interactive app preview illustration"
          >
            <div className="visual-glow" />
            <div className="hero-device">
              <div className="device-speaker" />
              <div className="hero-device-screen">
                <div className="hero-status">
                  <span>9:41</span>
                  <span>⌁ ◒</span>
                </div>
                <div className="hero-app-content">
                  <div className="hero-app-topline">
                    <span className="hero-app-icon">✦</span>
                    <span className="hero-app-dots">•••</span>
                  </div>
                  <p className="hero-app-label">YOUR DAILY SPACE</p>
                  <h2>
                    Make room
                    <br />
                    for good work.
                  </h2>
                  <div className="hero-app-card">
                    <span>Today</span>
                    <strong>Focus session</strong>
                    <small>28 minutes remaining</small>
                    <i>
                      <b />
                    </i>
                  </div>
                  <button className="hero-app-button">
                    Start session <span>→</span>
                  </button>
                </div>
                <div className="hero-tabbar">
                  <span>⌂</span>
                  <span className="active">◈</span>
                  <span>◌</span>
                  <span>○</span>
                </div>
              </div>
            </div>
            <div className="runtime-badge">
              <span className="status-pulse" /> Runtime ready
            </div>
            <div className="visual-caption">
              <span>Live preview</span>
              <span>Creator-owned</span>
            </div>
          </div>
        </section>

        <section
          className="workflow-section"
          id="how-it-works"
          aria-labelledby="workflow-title"
        >
          <div className="section-intro">
            <span className="section-index">01</span>
            <h2 id="workflow-title">
              From project build
              <br />
              to <em>public proof.</em>
            </h2>
          </div>
          <div className="workflow-grid">
            {workflow.map((item) => (
              <article className="workflow-card" key={item.number}>
                <span className="workflow-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="workflow-arrow" aria-hidden="true">
                  ↘
                </span>
              </article>
            ))}
          </div>
        </section>

        <section
          className="principles-section"
          id="principles"
          aria-labelledby="principles-title"
        >
          <div>
            <span className="section-index">02</span>
            <h2 id="principles-title">
              Not an app store.
              <br />
              <em>Not a mockup.</em>
            </h2>
          </div>
          <div className="principles-copy">
            <p>
              The defining experience is the bridge between a .webb app and a
              polished, device-oriented web container.
            </p>
            <button className="text-link" onClick={onOpenRuntime}>
              Explore the runtime <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="summary-footer">
        <Brand />
        <span>Infrastructure for apps worth experiencing.</span>
        <span>© 2026 webbstack</span>
      </footer>
    </div>
  );
}

function ProjectOverview({
  project,
  onBack,
  onOpenRuntime,
  onSave,
  onPublish,
}: {
  project: Project;
  onBack: () => void;
  onOpenRuntime: (project: Project) => void;
  onSave: (
    updates: Pick<
      Project,
      "name" | "description" | "creator" | "username" | "slug" | "accent"
    >,
  ) => void;
  onPublish: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [creator, setCreator] = useState(project.creator);
  const [username, setUsername] = useState(project.username);
  const [slug, setSlug] = useState(project.slug);
  const [accent, setAccent] = useState(project.accent);
  const [saveMessage, setSaveMessage] = useState("");
  const [pendingExit, setPendingExit] = useState<"back" | "runtime" | null>(
    null,
  );
  const exitDialogRef = useRef<HTMLElement>(null);
  useDialogFocus(
    Boolean(pendingExit),
    () => setPendingExit(null),
    exitDialogRef,
  );
  const [savedDraft, setSavedDraft] = useState({
    name: project.name,
    description: project.description,
    creator: project.creator,
    username: project.username,
    slug: project.slug,
    accent: project.accent,
  });
  const isDirty =
    name !== savedDraft.name ||
    description !== savedDraft.description ||
    creator !== savedDraft.creator ||
    username !== savedDraft.username ||
    slug !== savedDraft.slug ||
    accent !== savedDraft.accent;
  const publishBlocked =
    project.archived ||
    project.status !== "ready" ||
    !name.trim() ||
    !creator.trim() ||
    Boolean(validateUsername(username) || validateSlug(slug));

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const saveDraft = () => {
    if (!name.trim()) return false;
    const savedDraft = {
      name: name.trim(),
      description: description.trim(),
      creator: creator.trim(),
      username: username.trim().toLowerCase(),
      slug: slug.trim().toLowerCase(),
      accent,
    };
    onSave(savedDraft);
    setSavedDraft(savedDraft);
    setName(savedDraft.name);
    setDescription(savedDraft.description);
    setCreator(savedDraft.creator);
    setUsername(savedDraft.username);
    setSlug(savedDraft.slug);
    setSaveMessage("Changes saved");
    trackEvent("customization_saved");
    return true;
  };

  const saveChanges = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveDraft();
  };

  const requestExit = (action: "back" | "runtime") => {
    if (!isDirty) {
      if (action === "back") onBack();
      else onOpenRuntime(project);
      return;
    }
    setPendingExit(action);
  };

  const discardAndContinue = () => {
    if (pendingExit === "back") onBack();
    else if (pendingExit === "runtime") onOpenRuntime(project);
    setPendingExit(null);
  };

  const saveAndContinue = () => {
    if (!saveDraft()) return;
    const savedProject = {
      ...project,
      name: name.trim(),
      description: description.trim(),
      creator: creator.trim(),
      username: username.trim().toLowerCase(),
      slug: slug.trim().toLowerCase(),
      accent,
    };
    if (pendingExit === "back") onBack();
    else if (pendingExit === "runtime") onOpenRuntime(savedProject);
    setPendingExit(null);
  };

  return (
    <section className="project-overview" aria-labelledby="overview-title">
      <button className="back-link" onClick={() => requestExit("back")}>
        ← Back to projects
      </button>
      <div className="overview-heading">
        <div>
          <span className="section-index">Project overview</span>
          <h1 id="overview-title">{project.name}</h1>
          <p>
            {project.filename} · Build v{project.version}
          </p>
        </div>
        <button
          className="dashboard-primary"
          disabled={project.archived || project.status !== "ready"}
          onClick={() => requestExit("runtime")}
        >
          Preview runtime <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="overview-grid">
        <form className="customization-form" onSubmit={saveChanges}>
          <div className="form-heading">
            <div>
              <span className="section-index">Public experience</span>
              <h2>Customize your showcase</h2>
            </div>
            <span
              className={`overview-status status-${project.archived ? "archived" : project.status}`}
            >
              {projectStatusDetails(project).label}
            </span>
            {isDirty && <span className="overview-dirty">Unsaved changes</span>}
          </div>
          <label>
            Project title <span aria-hidden="true">*</span>
            <input
              required
              name="project-title"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Short description
            <textarea
              name="project-description"
              autoComplete="off"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </label>
          <label>
            Creator or organization <span aria-hidden="true">*</span>
            <input
              required
              name="creator"
              autoComplete="organization"
              value={creator}
              onChange={(event) => setCreator(event.target.value)}
            />
          </label>
          <div className="publish-fields">
            <label>
              Creator username <span aria-hidden="true">*</span>
              <input
                required
                name="username"
                autoComplete="username"
                spellCheck={false}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="independent-dev"
              />
            </label>
            <label>
              App slug <span aria-hidden="true">*</span>
              <input
                required
                name="slug"
                autoComplete="off"
                spellCheck={false}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="my-showcase"
              />
            </label>
          </div>
          <label className="color-field">
            Accent color
            <span>
              <input
                type="color"
                name="accent"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
              />
              <code>{accent}</code>
            </span>
          </label>
          <div className="form-actions">
            <button className="dashboard-primary" type="submit">
              Save changes
            </button>
            <span aria-live="polite">{saveMessage}</span>
          </div>
        </form>
        <aside
          className="showcase-preview"
          aria-label="Public showcase preview"
        >
          <span className="section-index">Preview</span>
          <div
            className="showcase-preview-card"
            style={{ borderColor: accent }}
          >
            <div className="preview-placeholder">✦</div>
            <span className="preview-label">webbstack showcase</span>
            <h2>{name || "Untitled project"}</h2>
            <p>{description || "A short description of this experience."}</p>
            <small>by {creator || "Your name"}</small>
          </div>
          <button
            className="publish-placeholder"
            disabled={publishBlocked}
            onClick={onPublish}
          >
            {project.publishedUrl
              ? "Manage sharing"
              : publishBlocked && project.status === "ready"
                ? "Complete details to publish"
                : "Publish showcase"}
          </button>
          {project.publishedUrl && !project.archived && (
            <p className="published-note">
              Published at {project.publishedUrl}
            </p>
          )}
        </aside>
      </div>
      {pendingExit && (
        <div className="create-overlay" role="presentation">
          <section
            className="create-panel exit-confirmation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-title"
            aria-describedby="unsaved-description"
            ref={exitDialogRef}
          >
            <span className="section-index">Unsaved changes</span>
            <h2 id="unsaved-title">Leave this project?</h2>
            <p id="unsaved-description">
              You have edits that have not been saved. Choose whether to keep,
              discard, or save them before continuing.
            </p>
            <div className="confirm-actions">
              <button onClick={() => setPendingExit(null)}>Stay</button>
              <button onClick={discardAndContinue}>Discard changes</button>
              <button className="dashboard-primary" onClick={saveAndContinue}>
                Save and continue
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function PublishDialog({
  project,
  onClose,
  onPublish,
  onOpenPublic,
}: {
  project: Project;
  onClose: () => void;
  onPublish: (visibility: Visibility) => void;
  onOpenPublic: () => void;
}) {
  const [visibility, setVisibility] = useState<Visibility>(
    project.visibility === "private" ? "public" : project.visibility,
  );
  const [copyMessage, setCopyMessage] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(true, onClose, dialogRef);
  const url = publicProjectUrl(project.username, project.slug);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Link copied");
    } catch {
      setCopyMessage("Copy is unavailable in this browser");
    }
  };

  const confirmPublish = () => {
    onPublish(visibility);
    setCopyMessage("Published");
  };

  return (
    <div className="create-overlay" role="presentation" onClick={onClose}>
      <section
        className="publish-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        aria-describedby="publish-description"
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="create-close"
          onClick={onClose}
          aria-label="Close sharing dialog"
        >
          ×
        </button>
        <span className="section-index">Share your showcase</span>
        <h2 id="publish-title">Put your work somewhere real.</h2>
        <p id="publish-description">
          Choose who can open this experience and share the stable URL with your
          audience.
        </p>
        <div className="publish-url-card">
          <span>Public URL</span>
          <code>{url}</code>
        </div>
        <label className="visibility-field">
          Visibility
          <select
            name="visibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as Visibility)
            }
          >
            <option value="public">
              Public — discoverable by anyone with the link
            </option>
            <option value="unlisted">
              Unlisted — only people with the link
            </option>
            <option value="private">Private — keep in your workspace</option>
          </select>
        </label>
        <div className="publish-actions">
          <button className="dashboard-primary" onClick={confirmPublish}>
            {project.publishedUrl ? "Update visibility" : "Publish showcase"}
          </button>
          <button className="project-action" onClick={copyUrl}>
            Copy URL
          </button>
          {project.publishedUrl && (
            <button className="project-action" onClick={onOpenPublic}>
              Open public viewer
            </button>
          )}
        </div>
        <p className="publish-message" aria-live="polite">
          {copyMessage}
        </p>
      </section>
    </div>
  );
}

function Dashboard({
  onOpenRuntime,
  onOpenPublic,
}: {
  onOpenRuntime: (project?: Project) => void;
  onOpenPublic: (project: Project) => void;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [search, setSearch] = useState("");
  const createDialogRef = useRef<HTMLElement>(null);
  useDialogFocus(isCreateOpen, () => setIsCreateOpen(false), createDialogRef);

  useEffect(() => {
    const pending = projects.find(
      (project) =>
        !project.archived &&
        ["uploading", "preparing", "validating"].includes(project.status),
    );
    if (!pending) return;
    const nextStatus: Record<
      "uploading" | "preparing" | "validating",
      ProjectStatus
    > = {
      uploading: "preparing",
      preparing: "validating",
      validating: pending.name.toLowerCase().includes("failed")
        ? "failed"
        : "ready",
    };
    const timer = window.setTimeout(() => {
      setProjects((current) =>
        current.map((project) =>
          project.id === pending.id
            ? {
                ...project,
                status:
                  nextStatus[
                    project.status as "uploading" | "preparing" | "validating"
                  ],
                progress: statusProgress(
                  nextStatus[
                    project.status as "uploading" | "preparing" | "validating"
                  ],
                ),
              }
            : project,
        ),
      );
    }, 900);
    return () => window.clearTimeout(timer);
  }, [projects]);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const activeProjects = projects.filter((project) => !project.archived);
  const archivedProjects = projects.filter((project) => project.archived);
  const visibleProjects = projects.filter((project) =>
    `${project.name} ${project.filename}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, ...updates } : project,
      ),
    );
  };

  const retryBuild = (project: Project) => {
    updateProject(project.id, {
      status: "uploading",
      progress: 20,
      version: project.version + 1,
    });
  };

  const stopBuild = (project: Project) => {
    updateProject(project.id, { status: "stopped", progress: 0 });
  };

  const cancelUpload = (project: Project) => {
    updateProject(project.id, { status: "cancelled", progress: 0 });
  };

  const interruptConnection = (project: Project) => {
    updateProject(project.id, { status: "interrupted" });
  };

  const openProject = (project: Project, publish = false) => {
    setSelectedProjectId(project.id);
    setIsProjectOpen(!publish);
    setIsPublishOpen(publish);
  };

  const duplicateProject = (project: Project) => {
    const name = `${project.name} copy`;
    setProjects((current) => [
      ...current,
      {
        ...project,
        id: crypto.randomUUID(),
        name,
        filename: `${name}.webb`,
        slug: slugifyProjectName(name),
        publishedUrl: "",
        visibility: "private",
        createdAt: "Just now",
        version: project.version + 1,
        status: "draft",
        progress: 0,
        archived: false,
      },
    ]);
  };

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
    const name = file.name.replace(/\.webb$/i, "");
    setUploadMessage(`${file.name} is ready to upload.`);
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      filename: file.name,
      size: file.size,
      status: "uploading",
      progress: 20,
      createdAt: "Just now",
      description: "",
      creator: "",
      username: "independent-dev",
      slug: slugifyProjectName(name),
      visibility: "private",
      publishedUrl: "",
      accent: "#8ebd4f",
      version: 1,
      archived: false,
    };
    setProjects((current) => [...current, project]);
    trackEvent("project_upload_completed", { size: file.size });
    setSelectedProjectId(project.id);
    setIsCreateOpen(false);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-nav">
        <Brand />
        <div className="dashboard-nav-actions">
          <span className="dashboard-user">Independent developer</span>
          <button className="avatar" aria-label="Account menu">
            ID
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        {selectedProject && isProjectOpen ? (
          <ProjectOverview
            project={selectedProject}
            onBack={() => setIsProjectOpen(false)}
            onOpenRuntime={(project) => onOpenRuntime(project)}
            onSave={(updates) => updateProject(selectedProject.id, updates)}
            onPublish={() => setIsPublishOpen(true)}
          />
        ) : null}
        {!isProjectOpen && (
          <div className="dashboard-heading">
            <div>
              <span className="section-index">Workspace</span>
              <h1>Your showcases</h1>
              <p>Prepare, preview, and publish your .webb apps.</p>
            </div>
            <button
              className="dashboard-primary"
              onClick={() => setIsCreateOpen(true)}
            >
              <span aria-hidden="true">+</span> New project
            </button>
          </div>
        )}
        {!isProjectOpen && projects.length > 0 ? (
          <section className="project-list" aria-labelledby="projects-title">
            <div className="project-list-heading">
              <h2 id="projects-title">Projects</h2>
              <span>
                {activeProjects.length === 1
                  ? "1 active project"
                  : `${activeProjects.length} active projects`}
                {archivedProjects.length > 0 &&
                  ` · ${archivedProjects.length} archived`}
              </span>
            </div>
            {projects.length > 5 && (
              <label className="project-search">
                <span className="sr-only">Search projects</span>
                <input
                  type="search"
                  aria-label="Search projects"
                  placeholder="Search projects"
                  name="project-search"
                  autoComplete="off"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            )}
            {visibleProjects.length > 0 ? (
              visibleProjects.map((project) => {
                const details = projectStatusDetails(project);
                const canPreview =
                  !project.archived && project.status === "ready";
                const isBuilding = [
                  "uploading",
                  "preparing",
                  "validating",
                ].includes(project.status);
                return (
                  <article
                    className={`project-card${project.archived ? " is-archived" : ""}`}
                    key={project.id}
                  >
                    <div
                      className="project-thumbnail"
                      aria-hidden="true"
                      style={{ background: project.accent }}
                    >
                      ✦
                    </div>
                    <div className="project-card-content">
                      <div className="project-card-title">
                        <div>
                          <h3>{project.name}</h3>
                          <p>
                            {project.filename} · {formatBytes(project.size)}
                          </p>
                        </div>
                        <StatusBadge
                          label={details.label}
                          status={project.status}
                          archived={project.archived}
                        />
                      </div>
                      <p className="project-status-detail">{details.detail}</p>
                      {!project.archived && project.status !== "ready" && (
                        <BuildProgress
                          label={details.label}
                          value={project.progress}
                        />
                      )}
                      <div className="project-card-footer">
                        <span>
                          Created {project.createdAt} · Build v{project.version}
                        </span>
                        <div className="project-actions">
                          <button
                            className="project-action"
                            disabled={!canPreview}
                            onClick={() => onOpenRuntime(project)}
                          >
                            Preview
                          </button>
                          {project.status === "uploading" && (
                            <button
                              className="project-action"
                              onClick={() => cancelUpload(project)}
                            >
                              Cancel upload
                            </button>
                          )}
                          {isBuilding && (
                            <>
                              <button
                                className="project-action"
                                onClick={() => stopBuild(project)}
                              >
                                Stop build
                              </button>
                              <button
                                className="project-action"
                                onClick={() => interruptConnection(project)}
                              >
                                Simulate network interruption
                              </button>
                            </>
                          )}
                          {(project.status === "failed" ||
                            project.status === "stopped" ||
                            project.status === "interrupted" ||
                            project.status === "cancelled") && (
                            <button
                              className="project-action"
                              disabled={project.archived}
                              onClick={() => retryBuild(project)}
                            >
                              {project.status === "cancelled"
                                ? "Retry upload"
                                : project.status === "interrupted"
                                  ? "Retry connection"
                                  : "Retry build"}
                            </button>
                          )}
                          <button
                            className="project-action"
                            disabled={project.archived}
                            onClick={() => openProject(project)}
                          >
                            Open
                          </button>
                          <button
                            className="project-action"
                            disabled={!canPreview}
                            onClick={() => openProject(project, true)}
                          >
                            Share
                          </button>
                          <button
                            className="project-action"
                            onClick={() => duplicateProject(project)}
                          >
                            Duplicate
                          </button>
                          <button
                            className="project-action"
                            onClick={() =>
                              updateProject(project.id, {
                                archived: !project.archived,
                                status: project.archived ? "draft" : "archived",
                                progress: project.archived
                                  ? statusProgress("draft")
                                  : statusProgress("archived"),
                              })
                            }
                          >
                            {project.archived ? "Restore" : "Archive"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="project-no-results">
                No projects match “{search}”.
              </p>
            )}
          </section>
        ) : !isProjectOpen ? (
          <EmptyState
            title="Bring your first app to life."
            action={
              <>
                <button
                  className="dashboard-primary"
                  onClick={() => setIsCreateOpen(true)}
                >
                  Create your first project <span aria-hidden="true">→</span>
                </button>
                <span className="empty-note">
                  Accepted format: .webb · Max file size: 100 MB
                </span>
              </>
            }
          >
            Upload a .webb package and webbstack will validate the runtime
            before you start shaping its public experience.
          </EmptyState>
        ) : null}
        {!isProjectOpen && (
          <button
            className="dashboard-runtime-link"
            onClick={() => onOpenRuntime()}
          >
            Open runtime capability preview <span aria-hidden="true">↗</span>
          </button>
        )}
      </main>
      {isPublishOpen && selectedProject && (
        <PublishDialog
          project={selectedProject}
          onClose={() => setIsPublishOpen(false)}
          onPublish={(visibility) => {
            trackEvent("project_published", { visibility });
            updateProject(selectedProject.id, {
              visibility,
              publishedUrl:
                visibility === "private"
                  ? ""
                  : publicProjectUrl(
                      selectedProject.username,
                      selectedProject.slug,
                    ),
            });
          }}
          onOpenPublic={() => {
            setIsPublishOpen(false);
            onOpenPublic(selectedProject);
          }}
        />
      )}
      {isCreateOpen && (
        <div
          className="create-overlay"
          role="presentation"
          onClick={() => setIsCreateOpen(false)}
        >
          <section
            className="create-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
            aria-describedby="create-description"
            ref={createDialogRef}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="create-close"
              onClick={() => setIsCreateOpen(false)}
              aria-label="Close new project dialog"
            >
              ×
            </button>
            <span className="section-index">New project</span>
            <h2 id="create-title">Start with a .webb package.</h2>
            <p id="create-description">
              Choose a package to upload. We’ll check it before preparing the
              runtime.
            </p>
            <label
              className="upload-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files[0]);
              }}
            >
              <span className="upload-icon" aria-hidden="true">
                ↑
              </span>
              <strong>Drop your .webb file here</strong>
              <span>or choose a file from your computer</span>
              <input
                type="file"
                name="webb-package"
                aria-label="Choose a .webb package"
                accept=".webb"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
            <p
              className={`upload-message${uploadMessage.includes("ready") ? " success" : ""}`}
              aria-live="polite"
            >
              {uploadMessage}
            </p>
            <div className="create-next">
              <strong>What happens next</strong>
              <span>
                Validate package <i>→</i> Preview your app <i>→</i> Publish when
                ready
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function PublicViewer({
  project,
  route,
  onBack,
}: {
  project: Project | null;
  route: ReturnType<typeof parsePublicRoute>;
  onBack: () => void;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const isAvailable = Boolean(
    project &&
    route &&
    project.visibility !== "private" &&
    project.username.toLowerCase() === route.username &&
    project.slug.toLowerCase() === route.slug,
  );
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    if (!isAvailable) return;
    markPerformance("public_shell_ready");
    measurePerformance("public_shell_render", "webbstack_navigation_start");
    trackEvent("public_view_started", { project: project?.name ?? "unknown" });
  }, [isAvailable, project]);

  const copyLink = async () => {
    if (!project?.publishedUrl) return;
    try {
      await navigator.clipboard.writeText(project.publishedUrl);
      setCopyMessage("Link copied");
      trackEvent("share_link_copied");
    } catch {
      setCopyMessage("Copy is unavailable in this browser");
    }
  };

  if (!isAvailable || !project) {
    return (
      <main className="public-viewer public-viewer-empty">
        <Brand />
        <span className="section-index">Public showcase</span>
        <h1>Showcase unavailable</h1>
        <p>
          This public URL is unavailable, private, or no longer matches a
          published project.
        </p>
        <button className="dashboard-primary" onClick={onBack}>
          Back to webbstack
        </button>
      </main>
    );
  }
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
      <section
        className="public-runtime-card"
        aria-label="Interactive app preview"
      >
        <div className="public-runtime-toolbar">
          <span>
            <i /> Runtime ready
          </span>
          <button
            className="project-action"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Reload app
          </button>
        </div>
        <div className="public-runtime-viewport" key={reloadKey}>
          <div className="public-runtime-device">
            <span className="public-runtime-icon">✦</span>
            <span className="preview-label">{project.name}</span>
            <h2>{project.description || "An interactive .webb experience."}</h2>
            <button className="dashboard-primary">
              Open experience <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>
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
  const [view, setView] = useState<View>(
    () =>
      initialView ??
      (window.location.hash === "#runtime"
        ? "runtime"
        : window.location.hash === "#dashboard"
          ? "dashboard"
          : window.location.hash.startsWith("#public")
            ? "public"
            : "summary"),
  );

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
