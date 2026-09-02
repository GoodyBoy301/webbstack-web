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


describe("dashboard project management", () => {
  const uploadProject = (name: string) => {
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], `${name}.webb`)] },
    });
  };

  it("stops an active build and allows it to resume", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("stoppable");
    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Stop build",
      }),
    );
    const card = screen.getByRole("article");
    expect(within(card).getByText("Build stopped")).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Retry build" }));
    expect(within(card).getByText("Uploading")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
