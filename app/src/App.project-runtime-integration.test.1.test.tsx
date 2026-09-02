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


describe("project runtime integration", () => {

  it("opens a ready project in its creator runtime context", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "orbit.webb")] },
    });
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Preview",
      }),
    );

    expect(screen.getByRole("heading", { name: "orbit" })).toBeInTheDocument();
    expect(screen.getByText(/orbit\.webb · Build v1/)).toBeInTheDocument();
    expect(
      document.querySelector('[data-runtime-mode="preview"]'),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});
