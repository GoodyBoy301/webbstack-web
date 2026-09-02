import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

const selectMode = (mode: "preview" | "public" | "embed") => {
  fireEvent.change(screen.getByRole("combobox", { name: "Runtime mode" }), {
    target: { value: mode },
  });
};

const renderRuntime = () => render(<App initialView="runtime" />);

beforeEach(() => {
  window.location.hash = "";
});

describe("product summary", () => {
  it("explains the product and offers a path to the runtime", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /Turn your app into a credible experience/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /From project build/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create a showcase/ }),
    ).toBeInTheDocument();
  });

  it("opens the existing runtime preview from the primary CTA", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Create a showcase/ }));

    expect(
      screen.getByRole("heading", { name: "Capability controls" }),
    ).toBeInTheDocument();
  });
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
