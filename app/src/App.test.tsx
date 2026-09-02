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

  it("keeps the creation dialog keyboard accessible and restores focus", () => {
    render(<App initialView="dashboard" />);
    const trigger = screen.getByRole("button", { name: /New project/ });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", {
      name: "Start with a .webb package.",
    });
    expect(
      within(dialog).getByRole("button", { name: "Close new project dialog" }),
    ).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("opens the project creation dialog from the empty workspace", () => {
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));

    expect(
      screen.getByRole("dialog", { name: "Start with a .webb package." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Accepted format: .webb · Max file size: 100 MB"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close new project dialog" }),
    ).toBeInTheDocument();

    const input = screen.getByLabelText(/Drop your .webb file here/);
    fireEvent.change(input, {
      target: {
        files: [
          new File(["app"], "demo.webb", { type: "application/octet-stream" }),
        ],
      },
    });
    expect(screen.getByRole("heading", { name: "demo" })).toBeInTheDocument();
    expect(screen.getByText("Uploading")).toBeInTheDocument();
  });
});

describe("unsaved project changes", () => {
  const openProject = () => {
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "draft.webb")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
  };

  it("tracks edits and lets the creator stay or discard them", () => {
    openProject();
    fireEvent.change(screen.getByLabelText(/Project title/), {
      target: { value: "Updated draft" },
    });
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back to projects" }));
    const dialog = screen.getByRole("dialog", { name: "Leave this project?" });
    expect(dialog).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Stay" }));
    expect(screen.getByDisplayValue("Updated draft")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back to projects" }));
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Leave this project?" }),
      ).getByRole("button", { name: "Discard changes" }),
    );
    expect(
      screen.getByRole("heading", { name: "Your showcases" }),
    ).toBeInTheDocument();
  });

  it("clears the dirty state after saving and protects hard navigation only while dirty", () => {
    openProject();
    fireEvent.change(screen.getByLabelText(/Project title/), {
      target: { value: "Saved draft" },
    });
    fireEvent.change(screen.getByLabelText(/Creator or organization/), {
      target: { value: "Independent developer" },
    });
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
  });
});

describe("public viewer routes", () => {
  it("parses creator-owned public routes", () => {
    expect(parsePublicRoute("#public/@Goody-Labs/Demo-App")).toEqual({
      username: "goody-labs",
      slug: "demo-app",
    });
    expect(parsePublicRoute("#dashboard")).toBeNull();
  });

  it("shows a clear fallback for an unavailable direct URL", () => {
    window.history.replaceState(null, "", "#public/independent-dev/demo");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Showcase unavailable" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/unavailable, private, or no longer matches/),
    ).toBeInTheDocument();
  });
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

  it("duplicates and archives an individual project", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("demo");
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    const original = screen.getByRole("article");
    fireEvent.click(
      within(original).getByRole("button", { name: "Duplicate" }),
    );
    expect(
      screen.getByRole("heading", { name: "demo copy" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getAllByRole("article")[1]).getByText("Draft"),
    ).toBeInTheDocument();
    fireEvent.click(within(original).getByRole("button", { name: "Archive" }));
    expect(within(original).getByText("Archived")).toBeInTheDocument();
    expect(
      within(original).getByRole("button", { name: "Restore" }),
    ).toBeInTheDocument();
    fireEvent.click(within(original).getByRole("button", { name: "Restore" }));
    expect(within(original).getByText("Draft")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows a recoverable failed build and retries it", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("failed");
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    const card = screen.getByRole("article");
    expect(within(card).getByText("Build failed")).toBeInTheDocument();
    expect(within(card).getByText(/could not be prepared/)).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Retry build" }));
    expect(within(card).getByText("Uploading")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("stops an active build and allows it to resume", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("stoppable");
    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Stop build",
      }),
    );
    const card = screen.getByRole("article");
    expect(within(card).getByText("Build stopped")).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Retry build" }));
    expect(within(card).getByText("Uploading")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("opens sharing from a ready project card", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    uploadProject("shareable");
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Share",
      }),
    );
    expect(
      screen.getByRole("dialog", { name: /Put your work somewhere real/ }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("upload progress and recovery", () => {
  it("exposes accessible progress and cancels without a stale transition", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "progress.webb")] },
    });

    const card = screen.getByRole("article");
    const progress = within(card).getByRole("progressbar", {
      name: "Uploading progress",
    });
    expect(progress).toHaveAttribute("aria-valuenow", "20");
    fireEvent.click(
      within(card).getByRole("button", { name: "Cancel upload" }),
    );
    expect(within(card).getByText("Upload cancelled")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3000));
    expect(within(card).getByText("Upload cancelled")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("interrupts the connection without a stale transition and preserves progress", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "offline.webb")] },
    });

    const card = screen.getByRole("article");
    fireEvent.click(
      within(card).getByRole("button", {
        name: "Simulate network interruption",
      }),
    );
    expect(
      within(card).getByText("Connection interrupted"),
    ).toBeInTheDocument();
    expect(within(card).getByText(/progress is preserved/)).toBeInTheDocument();
    expect(
      within(card).getByRole("progressbar", {
        name: "Connection interrupted progress",
      }),
    ).toHaveAttribute("aria-valuenow", "20");

    act(() => vi.advanceTimersByTime(3000));
    expect(
      within(card).getByText("Connection interrupted"),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: "Retry connection" }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("retries an interrupted connection through the existing lifecycle", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "recoverable-offline.webb")] },
    });
    const card = screen.getByRole("article");
    fireEvent.click(
      within(card).getByRole("button", {
        name: "Simulate network interruption",
      }),
    );
    fireEvent.click(
      within(card).getByRole("button", { name: "Retry connection" }),
    );
    expect(within(card).getByText("Uploading")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(900));
    expect(within(card).getByText("Preparing runtime")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    expect(within(card).getByText("Ready for preview")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("retries a cancelled upload and reports each progress stage", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "recoverable.webb")] },
    });
    const card = screen.getByRole("article");
    fireEvent.click(
      within(card).getByRole("button", { name: "Cancel upload" }),
    );
    fireEvent.click(within(card).getByRole("button", { name: "Retry upload" }));
    expect(
      within(card).getByRole("progressbar", { name: "Uploading progress" }),
    ).toHaveAttribute("aria-valuenow", "20");

    act(() => vi.advanceTimersByTime(900));
    expect(
      within(card).getByRole("progressbar", {
        name: "Preparing runtime progress",
      }),
    ).toHaveAttribute("aria-valuenow", "55");
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    expect(within(card).getByText("Ready for preview")).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("project runtime integration", () => {
  it("opens a ready project in its creator runtime context", () => {
    vi.useFakeTimers();
    render(<App initialView="dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: /New project/ }));
    fireEvent.change(screen.getByLabelText(/Drop your .webb file here/), {
      target: { files: [new File(["app"], "orbit.webb")] },
    });
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(900));

    fireEvent.click(
      within(screen.getByRole("article")).getByRole("button", {
        name: "Preview",
      }),
    );

    expect(screen.getByRole("heading", { name: "orbit" })).toBeInTheDocument();
    expect(screen.getByText(/orbit\.webb · Build v1/)).toBeInTheDocument();
    expect(
      document.querySelector('[data-runtime-mode="preview"]'),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

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

  it("keeps preview controls out of public and embed runtime modes", () => {
    render(<App initialView="runtime" />);
    selectMode("public");
    expect(
      screen.queryByRole("button", { name: "Reset preview" }),
    ).not.toBeInTheDocument();
    selectMode("embed");
    expect(
      screen.queryByRole("button", { name: "Reset preview" }),
    ).not.toBeInTheDocument();
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

  it("supports viewport, orientation, and runtime recovery controls", () => {
    const { container } = renderRuntime();
    const deviceFrame = () => container.querySelector(".device-frame");

    expect(
      screen.getByRole("combobox", { name: "Preview viewport" }),
    ).toHaveValue("mobile");
    expect(deviceFrame()).toHaveAttribute("data-viewport", "mobile");
    expect(screen.getByText("Preview diagnostics")).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("combobox", { name: "Preview viewport" }),
      {
        target: { value: "tablet" },
      },
    );
    expect(deviceFrame()).toHaveAttribute("data-viewport", "tablet");
    expect(screen.getByText("Tablet")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Landscape" }));
    expect(deviceFrame()).toHaveAttribute("data-orientation", "landscape");
    fireEvent.click(screen.getByRole("button", { name: "Reload app" }));
    expect(screen.getByText("App reloaded · now")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reinstall package" }));
    expect(screen.getByText("Package reinstalled · now")).toBeInTheDocument();
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
