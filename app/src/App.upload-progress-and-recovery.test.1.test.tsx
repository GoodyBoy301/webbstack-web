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

  it("exposes accessible progress and cancels without a stale transition", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "progress.webb")] },
    });

    const card = screen.getByRole("article");
    const progress = within(card).getByRole("progressbar", {
      name: "Uploading progress",
    });
    expect(progress).toHaveAttribute("aria-valuenow", "20");
    fireEvent.click(
      within(card).getByRole("button", { name: "Cancel upload" }),
    );
    expect(within(card).getByText("Upload cancelled")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3000));
    expect(within(card).getByText("Upload cancelled")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
