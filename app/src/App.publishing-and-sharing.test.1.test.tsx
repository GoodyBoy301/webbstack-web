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


describe("publishing and sharing", () => {

  it("keeps publishing unavailable until the project is ready and metadata is complete", async () => {
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "demo.webb")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(
      screen.getByRole("button", { name: "Publish showcase" }),
    ).toBeDisabled();
  });
});
