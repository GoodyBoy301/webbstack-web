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

  it("stops and restarts the creator runtime", () => {
    render(<App initialView="runtime" />);
    fireEvent.click(screen.getByRole("button", { name: "Stop runtime" }));
    expect(screen.getByText("Runtime stopped")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Restart runtime" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restart runtime" }));
    expect(screen.queryByText("Runtime stopped")).not.toBeInTheDocument();
  });
});
