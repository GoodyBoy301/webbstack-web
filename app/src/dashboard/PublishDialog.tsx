import { useRef, useState } from "react";
import { publicProjectUrl, type Visibility } from "../projectPublishing";
import { PublishControls } from "./PublishControls";
import { useDialogFocus } from "./useDialogFocus";
import type { Project } from "./types";

type Props = {
  project: Project;
  onClose: () => void;
  onPublish: (visibility: Visibility) => void;
  onOpenPublic: () => void;
};

export function PublishDialog({
  project,
  onClose,
  onPublish,
  onOpenPublic,
}: Props) {
  const [visibility, setVisibility] = useState<Visibility>(
    project.visibility === "private" ? "public" : project.visibility,
  );
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(true, onClose, dialogRef);
  const url = publicProjectUrl(project.username, project.slug);
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Copy is unavailable in this browser");
    }
  };
  const confirmPublish = () => {
    onPublish(visibility);
    setMessage("Published");
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
        <PublishControls
          visibility={visibility}
          setVisibility={setVisibility}
          onPublish={confirmPublish}
          onCopy={copyUrl}
          hasPublishedUrl={Boolean(project.publishedUrl)}
          onOpenPublic={onOpenPublic}
        />
        <p className="publish-message" aria-live="polite">
          {message}
        </p>
      </section>
    </div>
  );
}
