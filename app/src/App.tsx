import { useEffect, useState } from "react";
import RuntimeApp from "./RuntimeApp";

type View = "summary" | "runtime";

const workflow = [
  {
    number: "01",
    title: "Bring your app",
    description:
      "Create a showcase from a supported .webb app or import the source that produces one.",
  },
  {
    number: "02",
    title: "Make it trustworthy",
    description:
      "webbstack prepares the runtime, validates the package, and makes its state easy to understand.",
  },
  {
    number: "03",
    title: "Share the experience",
    description:
      "Preview in a device shell, tune the presentation, then publish a creator-owned URL.",
  },
];

function Brand() {
  return (
    <a className="summary-brand" href="#top" aria-label="webbstack home">
      <span className="summary-mark" aria-hidden="true" />
      webbstack
    </a>
  );
}

function ProductSummary({ onOpenRuntime }: { onOpenRuntime: () => void }) {
  return (
    <div className="summary-page" id="top">
      <header className="summary-nav">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Why webbstack</a>
        </nav>
        <button className="summary-nav-cta" onClick={onOpenRuntime}>
          Open preview <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main>
        <section className="summary-hero" aria-labelledby="summary-title">
          <div className="hero-copy">
            <div className="summary-kicker">
              <span /> .webb apps, ready to show
            </div>
            <h1 id="summary-title">
              Turn your app into a <em>credible</em> experience.
            </h1>
            <p className="hero-description">
              webbstack is the browser-based runtime and presentation layer for
              .webb apps. Build confidence with a live, interactive showcase—not
              a screen recording or a repository link.
            </p>
            <div className="hero-actions">
              <button className="summary-primary" onClick={onOpenRuntime}>
                Create a showcase <span aria-hidden="true">→</span>
              </button>
              <a className="summary-secondary" href="#how-it-works">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-note">
              <span className="status-pulse" /> Live runtime, clear status, one
              shareable URL.
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Interactive app preview illustration"
          >
            <div className="visual-glow" />
            <div className="hero-device">
              <div className="device-speaker" />
              <div className="hero-device-screen">
                <div className="hero-status">
                  <span>9:41</span>
                  <span>⌁ ◒</span>
                </div>
                <div className="hero-app-content">
                  <div className="hero-app-topline">
                    <span className="hero-app-icon">✦</span>
                    <span className="hero-app-dots">•••</span>
                  </div>
                  <p className="hero-app-label">YOUR DAILY SPACE</p>
                  <h2>
                    Make room
                    <br />
                    for good work.
                  </h2>
                  <div className="hero-app-card">
                    <span>Today</span>
                    <strong>Focus session</strong>
                    <small>28 minutes remaining</small>
                    <i>
                      <b />
                    </i>
                  </div>
                  <button className="hero-app-button">
                    Start session <span>→</span>
                  </button>
                </div>
                <div className="hero-tabbar">
                  <span>⌂</span>
                  <span className="active">◈</span>
                  <span>◌</span>
                  <span>○</span>
                </div>
              </div>
            </div>
            <div className="runtime-badge">
              <span className="status-pulse" /> Runtime ready
            </div>
            <div className="visual-caption">
              <span>Live preview</span>
              <span>Creator-owned</span>
            </div>
          </div>
        </section>

        <section
          className="workflow-section"
          id="how-it-works"
          aria-labelledby="workflow-title"
        >
          <div className="section-intro">
            <span className="section-index">01</span>
            <h2 id="workflow-title">
              From project build
              <br />
              to <em>public proof.</em>
            </h2>
          </div>
          <div className="workflow-grid">
            {workflow.map((item) => (
              <article className="workflow-card" key={item.number}>
                <span className="workflow-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="workflow-arrow" aria-hidden="true">
                  ↘
                </span>
              </article>
            ))}
          </div>
        </section>

        <section
          className="principles-section"
          id="principles"
          aria-labelledby="principles-title"
        >
          <div>
            <span className="section-index">02</span>
            <h2 id="principles-title">
              Not an app store.
              <br />
              <em>Not a mockup.</em>
            </h2>
          </div>
          <div className="principles-copy">
            <p>
              The defining experience is the bridge between a .webb app and a
              polished, device-oriented web container.
            </p>
            <button className="text-link" onClick={onOpenRuntime}>
              Explore the runtime <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="summary-footer">
        <Brand />
        <span>Infrastructure for apps worth experiencing.</span>
        <span>© 2026 webbstack</span>
      </footer>
    </div>
  );
}

export default function App({ initialView }: { initialView?: View }) {
  const [view, setView] = useState<View>(
    () =>
      initialView ??
      (window.location.hash === "#runtime" ? "runtime" : "summary"),
  );

  useEffect(() => {
    const onHashChange = () =>
      setView(window.location.hash === "#runtime" ? "runtime" : "summary");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const openRuntime = () => {
    window.location.hash = "runtime";
    setView("runtime");
  };

  if (view === "runtime") return <RuntimeApp />;
  return <ProductSummary onOpenRuntime={openRuntime} />;
}
