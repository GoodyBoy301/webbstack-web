import { Brand } from "./dashboard/Brand";
import { SummaryHero } from "./SummaryHero";
import { SummarySections } from "./SummarySections";

type Props = { onOpenDashboard: () => void; onOpenRuntime: () => void };

export function ProductSummary({ onOpenDashboard, onOpenRuntime }: Props) {
  return (
    <div className="summary-page" id="top">
      <header className="summary-nav">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Why webbstack</a>
        </nav>
        <div className="summary-nav-actions">
          <button className="summary-workspace-link" onClick={onOpenDashboard}>
            Workspace
          </button>
          <button className="summary-nav-cta" onClick={onOpenRuntime}>
            Open preview <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main id="main-content">
        <SummaryHero onOpenDashboard={onOpenDashboard} />
        <SummarySections onOpenRuntime={onOpenRuntime} />
      </main>
      <footer className="summary-footer">
        <Brand />
        <span>Infrastructure for apps worth experiencing.</span>
        <span>© 2026 webbstack</span>
      </footer>
    </div>
  );
}
