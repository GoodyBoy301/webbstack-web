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

  it("keeps creator controls host-only while switching through every mode", () => {
    renderRuntime();

    expect(
      screen.getByRole("heading", { name: "Capability controls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset preview" }),
    ).toBeInTheDocument();

    selectMode("public");
    expect(
      screen.queryByRole("heading", { name: "Capability controls" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset preview" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Published app surface")).toBeInTheDocument();
    expect(
      screen.getByText("Runtime identity is public-safe"),
    ).toBeInTheDocument();

    selectMode("embed");
    expect(screen.getByText("Sandboxed app surface")).toBeInTheDocument();
    expect(screen.getByText("Embed security baseline")).toBeInTheDocument();
    expect(
      screen.getByText(
        "sandboxed iframe · separate runtime origin · Permissions-Policy · message schema validation",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset preview" }),
    ).not.toBeInTheDocument();

    selectMode("preview");
    expect(
      screen.getByRole("heading", { name: "Capability controls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset preview" }),
    ).toBeInTheDocument();
  });
});
