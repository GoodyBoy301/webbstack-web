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

  it("keeps preview controls out of public and embed runtime modes", () => {
    render(<App initialView="runtime" />);
    selectMode("public");
    expect(
      screen.queryByRole("button", { name: "Reset preview" }),
    ).not.toBeInTheDocument();
    selectMode("embed");
    expect(
      screen.queryByRole("button", { name: "Reset preview" }),
    ).not.toBeInTheDocument();
  });
});
