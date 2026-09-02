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

  it("keeps unavailable capability actions disabled and reports package checks", () => {
    renderRuntime();
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search capabilities" }),
      { target: { value: "device.battery" } },
    );
    expect(screen.getByRole("button", { name: "Test" })).toBeDisabled();

    const packagePanel = screen.getByRole("region", {
      name: "Validation & security",
    });
    expect(
      within(packagePanel).getByText(/Package is safe to boot in preview/),
    ).toBeInTheDocument();
    expect(within(packagePanel).getByText(/warnings/)).toBeInTheDocument();
    expect(
      within(packagePanel).getByRole("button", { name: "Revalidate" }),
    ).toBeInTheDocument();
  });
});
