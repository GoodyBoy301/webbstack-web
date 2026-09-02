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

  it("exposes and filters the complete v1 capability fixture", () => {
    renderRuntime();
    expect(screen.getByText("20/20")).toBeInTheDocument();
    expect(screen.getByText("runtime.identity")).toBeInTheDocument();
    expect(screen.getByText("device.motion")).toBeInTheDocument();
    expect(screen.getByText("media.camera")).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search capabilities" }),
      { target: { value: "device.motion" } },
    );
    expect(screen.getByText("1/20")).toBeInTheDocument();
    expect(screen.getByText("device.motion")).toBeInTheDocument();
    expect(screen.queryByText("runtime.identity")).not.toBeInTheDocument();
  });
});
