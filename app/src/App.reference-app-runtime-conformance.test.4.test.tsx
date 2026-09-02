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

  it("supports viewport, orientation, and runtime recovery controls", () => {
    const { container } = renderRuntime();
    const deviceFrame = () => container.querySelector(".device-frame");

    expect(
      screen.getByRole("combobox", { name: "Preview viewport" }),
    ).toHaveValue("mobile");
    expect(deviceFrame()).toHaveAttribute("data-viewport", "mobile");
    expect(screen.getByText("Preview diagnostics")).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("combobox", { name: "Preview viewport" }),
      {
        target: { value: "tablet" },
      },
    );
    expect(deviceFrame()).toHaveAttribute("data-viewport", "tablet");
    expect(screen.getByText("Tablet")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Landscape" }));
    expect(deviceFrame()).toHaveAttribute("data-orientation", "landscape");
    fireEvent.click(screen.getByRole("button", { name: "Reload app" }));
    expect(screen.getByText("App reloaded · now")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reinstall package" }));
    expect(screen.getByText("Package reinstalled · now")).toBeInTheDocument();
  });
});
