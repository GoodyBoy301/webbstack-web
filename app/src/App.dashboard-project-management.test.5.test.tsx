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

  it("opens sharing from a ready project card", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("shareable");
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Share",
      }),
    );
    expect(
      screen.getByRole("dialog", { name: /Put your work somewhere real/ }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});
