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


describe("product summary", () => {

  it("opens the creator workspace from the primary CTA", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Create a showcase/ }));

    expect(
      screen.getByRole("heading", { name: "Your showcases" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bring your first app to life."),
    ).toBeInTheDocument();
  });
});
