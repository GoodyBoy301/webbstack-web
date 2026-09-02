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

  it("duplicates and archives an individual project", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("demo");
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    const original = screen.getByRole("article");
    fireEvent.click(
      within(original).getByRole("button", { name: "Duplicate" }),
    );
    expect(
      screen.getByRole("heading", { name: "demo copy" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getAllByRole("article")[1]).getByText("Draft"),
    ).toBeInTheDocument();
    fireEvent.click(within(original).getByRole("button", { name: "Archive" }));
    expect(within(original).getByText("Archived")).toBeInTheDocument();
    expect(
      within(original).getByRole("button", { name: "Restore" }),
    ).toBeInTheDocument();
    fireEvent.click(within(original).getByRole("button", { name: "Restore" }));
    expect(within(original).getByText("Draft")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
