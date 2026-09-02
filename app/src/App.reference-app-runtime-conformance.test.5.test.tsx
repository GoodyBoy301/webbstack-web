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

  it("requests restricted capabilities and resets fixture state", () => {
    renderRuntime();
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search capabilities" }),
      { target: { value: "device.motion" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Request" }));
    expect(screen.getByText("Permission requested")).toBeInTheDocument();
    expect(
      screen.getByText(/device.motion permission requested/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(screen.queryByText("Permission requested")).not.toBeInTheDocument();
    expect(screen.getByText("device.motion")).toBeInTheDocument();
  });
});
