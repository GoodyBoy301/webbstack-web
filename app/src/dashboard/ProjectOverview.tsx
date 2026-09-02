import { useState } from "react";
import { validateSlug, validateUsername } from "../projectPublishing";
import { ExitConfirmation } from "./ExitConfirmation";
import { ProjectCustomizationForm } from "./ProjectCustomizationForm";
import { ProjectOverviewHeader } from "./ProjectOverviewHeader";
import { ShowcasePreview } from "./ShowcasePreview";
import { useProjectDraft } from "./useProjectDraft";
import type { Project } from "./types";

type Props = {
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
};
type ExitAction = "back" | "runtime";

export function ProjectOverview({
  project,
  onBack,
  onOpenRuntime,
  onSave,
  onPublish,
}: Props) {
  const state = useProjectDraft(project, onSave);
  const [pendingExit, setPendingExit] = useState<ExitAction | null>(null);
  const { draft, isDirty, saveDraft } = state;
  const publishBlocked =
    project.archived ||
    project.status !== "ready" ||
    !draft.name.trim() ||
    !draft.creator.trim() ||
    Boolean(validateUsername(draft.username) || validateSlug(draft.slug));
  const continueExit = (action: ExitAction) => {
    if (!isDirty) return action === "back" ? onBack() : onOpenRuntime(project);
    setPendingExit(action);
  };
  const discard = () => {
    if (pendingExit === "back") onBack();
    else if (pendingExit === "runtime") onOpenRuntime(project);
    setPendingExit(null);
  };
  const saveAndContinue = () => {
    if (!saveDraft()) return;
    const savedProject = {
      ...project,
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      creator: draft.creator.trim(),
      username: draft.username.trim().toLowerCase(),
      slug: draft.slug.trim().toLowerCase(),
    };
    if (pendingExit === "back") onBack();
    else if (pendingExit === "runtime") onOpenRuntime(savedProject);
    setPendingExit(null);
  };
  return (
    <section className="project-overview" aria-labelledby="overview-title">
      <ProjectOverviewHeader
        project={project}
        onBack={() => continueExit("back")}
        onPreview={() => continueExit("runtime")}
      />
      <div className="overview-grid">
        <ProjectCustomizationForm
          project={project}
          state={state}
          publishBlocked={publishBlocked}
          onPublish={onPublish}
        />
        <ShowcasePreview
          project={project}
          state={state}
          publishBlocked={publishBlocked}
          onPublish={onPublish}
        />
      </div>
      {pendingExit && (
        <ExitConfirmation
          onStay={() => setPendingExit(null)}
          onDiscard={discard}
          onSave={saveAndContinue}
        />
      )}
    </section>
  );
}
