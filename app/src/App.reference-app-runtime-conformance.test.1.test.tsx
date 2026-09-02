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


describe("reference app runtime conformance", () => {

  it.each([
    ["preview", "Creator preview"],
    ["public", "Public runtime"],
    ["embed", "Embed runtime"],
  ] as const)("runs in %s mode", (mode, label) => {
    renderRuntime();
    selectMode(mode);

    expect(
      document.querySelector(`[data-runtime-mode="${mode}"]`),
    ).toBeInTheDocument();
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  });
});
