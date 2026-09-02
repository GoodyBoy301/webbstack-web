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

  it("exposes deterministic loading recovery only in creator preview", () => {
    render(<App initialView="runtime" />);
    fireEvent.click(screen.getByRole("button", { name: "Simulate loading" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading runtime");
    expect(screen.getByText("Loading")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish loading" }));
    expect(screen.getByText("Healthy")).toBeInTheDocument();

    selectMode("public");
    expect(
      screen.queryByRole("button", { name: "Simulate loading" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Simulate runtime failure" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Simulate unsupported browser" }),
    ).not.toBeInTheDocument();
  });
});
