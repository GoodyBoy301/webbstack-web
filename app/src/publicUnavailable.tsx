import { Brand } from "./dashboard/Brand";

type Props = { onBack: () => void };
export function PublicUnavailable({ onBack }: Props) { return <main className="public-viewer public-viewer-empty"><Brand /><span className="section-index">Public showcase</span><h1>Showcase unavailable</h1><p>This public URL is unavailable, private, or no longer matches a published project.</p><button className="dashboard-primary" onClick={onBack}>Back to webbstack</button></main>; }
