import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { parsePublicRoute } from "./projectPublishing";

const selectMode = (mode: "preview" | "public" | "embed") => {
  fireEvent.change(screen.getByRole("combobox", { name: "Runtime mode" }), {
    target: { value: mode },
  });
};

const renderRuntime = () => render(<App initialView="runtime" />);

beforeEach(() => {
  window.history.replaceState(null, "", "#");
});


describe("unsaved project changes", () => {
  const openProject = () => {
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "draft.webb")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
  };

  it("clears the dirty state after saving and protects hard navigation only while dirty", () => {
    openProject();
    fireEvent.change(screen.getByLabelText(/Project title/), {
      target: { value: "Saved draft" },
    });
    fireEvent.change(screen.getByLabelText(/Creator or organization/), {
      target: { value: "Independent developer" },
    });
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
  });
});
