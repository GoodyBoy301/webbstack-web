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

  it("shows search once the workspace has more than five projects", () => {
    render(<App initialView="dashboard" />);
    ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"].forEach(
      uploadProject,
    );

    expect(
      screen.getByRole("searchbox", { name: "Search projects" }),
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search projects" }),
      {
        target: { value: "foxtrot" },
      },
    );
    expect(
      screen.getByRole("heading", { name: "foxtrot" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "alpha" }),
    ).not.toBeInTheDocument();
  });
});
