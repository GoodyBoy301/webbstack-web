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

  it("retries an interrupted connection through the existing lifecycle", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "recoverable-offline.webb")] },
    });
    const card = screen.getByRole("article");
    fireEvent.click(
      within(card).getByRole("button", {
        name: "Simulate network interruption",
      }),
    );
    fireEvent.click(
      within(card).getByRole("button", { name: "Retry connection" }),
    );
    expect(within(card).getByText("Uploading")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(900));
    expect(within(card).getByText("Preparing runtime")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    expect(within(card).getByText("Ready for preview")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
