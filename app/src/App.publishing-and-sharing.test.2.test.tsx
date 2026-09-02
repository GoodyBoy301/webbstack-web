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

  it("publishes a validated project and exposes its share URL", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "demo.webb")] },
    });
    act(() => {
      vi.advanceTimersByTime(900);
    });
    act(() => {
      vi.advanceTimersByTime(900);
    });
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.change(screen.getByLabelText(/Creator or organization/), {
      target: { value: "Goody Labs" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish showcase" }));

    const publishDialog = screen.getByRole("dialog", {
      name: /Put your work somewhere real/,
    });
    expect(publishDialog).toBeInTheDocument();
    expect(
      within(publishDialog).getByText("/@independent-dev/demo"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(publishDialog).getByRole("button", { name: "Publish showcase" }),
    );
    expect(screen.getByText("Published")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(
        within(publishDialog).getByRole("button", { name: "Copy URL" }),
      );
    });
    expect(screen.getByText("Link copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("/@independent-dev/demo");
    fireEvent.click(
      within(publishDialog).getByRole("button", { name: "Open public viewer" }),
    );
    expect(screen.getByRole("heading", { name: "demo" })).toBeInTheDocument();
    expect(screen.getByText("Public showcase")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reload app" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reload app" }));
    vi.useRealTimers();
  });
});
