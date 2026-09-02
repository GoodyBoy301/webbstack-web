import { useEffect, useState } from "react";
import { trackEvent } from "../telemetry";
import type { Project } from "./types";

type Draft = Pick<Project, "name" | "description" | "creator" | "username" | "slug" | "accent">;

export function useProjectDraft(project: Project, onSave: (updates: Draft) => void) {
  const initial: Draft = { name: project.name, description: project.description, creator: project.creator, username: project.username, slug: project.slug, accent: project.accent };
  const [draft, setDraft] = useState(initial);
  const [savedDraft, setSavedDraft] = useState(initial);
  const [saveMessage, setSaveMessage] = useState("");
  const isDirty = Object.keys(draft).some((key) => draft[key as keyof Draft] !== savedDraft[key as keyof Draft]);
  useEffect(() => {
    if (!isDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const saveDraft = () => {
    if (!draft.name.trim()) return false;
    const saved: Draft = { ...draft, name: draft.name.trim(), description: draft.description.trim(), creator: draft.creator.trim(), username: draft.username.trim().toLowerCase(), slug: draft.slug.trim().toLowerCase() };
    onSave(saved); setSavedDraft(saved); setDraft(saved); setSaveMessage("Changes saved"); trackEvent("customization_saved"); return true;
  };
  return { draft, update, isDirty, saveMessage, saveDraft };
}
