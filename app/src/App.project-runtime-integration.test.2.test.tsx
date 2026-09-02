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

  it("recovers from simulated runtime failures and reset clears the error", () => {
    render(<App initialView="runtime" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Simulate runtime failure" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Runtime failed to start",
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getAllByText("error")).toHaveLength(2);

    fireEvent.click(
      within(screen.getByRole("alert")).getByRole("button", {
        name: "Reload app",
      }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Simulate unsupported browser" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Browser not supported",
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });
});
