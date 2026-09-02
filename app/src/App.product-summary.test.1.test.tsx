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
});
