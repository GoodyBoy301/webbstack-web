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


describe("upload progress and recovery", () => {

  it("interrupts the connection without a stale transition and preserves progress", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "offline.webb")] },
    });

    const card = screen.getByRole("article");
    fireEvent.click(
      within(card).getByRole("button", {
        name: "Simulate network interruption",
      }),
    );
    expect(
      within(card).getByText("Connection interrupted"),
    ).toBeInTheDocument();
    expect(within(card).getByText(/progress is preserved/)).toBeInTheDocument();
    expect(
      within(card).getByRole("progressbar", {
        name: "Connection interrupted progress",
      }),
    ).toHaveAttribute("aria-valuenow", "20");

    act(() => vi.advanceTimersByTime(3000));
    expect(
      within(card).getByText("Connection interrupted"),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: "Retry connection" }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});
