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

  it("tracks edits and lets the creator stay or discard them", () => {
    openProject();
    fireEvent.change(screen.getByLabelText(/Project title/), {
      target: { value: "Updated draft" },
    });
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back to projects" }));
    const dialog = screen.getByRole("dialog", { name: "Leave this project?" });
    expect(dialog).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Stay" }));
    expect(screen.getByDisplayValue("Updated draft")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back to projects" }));
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Leave this project?" }),
      ).getByRole("button", { name: "Discard changes" }),
    );
    expect(
      screen.getByRole("heading", { name: "Your showcases" }),
    ).toBeInTheDocument();
  });
});
