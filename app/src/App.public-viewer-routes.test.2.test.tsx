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


describe("public viewer routes", () => {

  it("shows a clear fallback for an unavailable direct URL", () => {
    window.history.replaceState(null, "", "#public/independent-dev/demo");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Showcase unavailable" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/unavailable, private, or no longer matches/),
    ).toBeInTheDocument();
  });
});
