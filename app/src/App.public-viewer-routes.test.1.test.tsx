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

  it("parses creator-owned public routes", () => {
    expect(parsePublicRoute("#public/@Goody-Labs/Demo-App")).toEqual({
      username: "goody-labs",
      slug: "demo-app",
    });
    expect(parsePublicRoute("#dashboard")).toBeNull();
  });
});
