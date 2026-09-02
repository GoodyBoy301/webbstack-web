import { workflow } from "./dashboard/constants";

type Props = { onOpenRuntime: () => void };

export function SummarySections({ onOpenRuntime }: Props) {
  return <><section className="workflow-section" id="how-it-works" aria-labelledby="workflow-title"><div className="section-intro"><span className="section-index">01</span><h2 id="workflow-title">From project build<br />to <em>public proof.</em></h2></div><div className="workflow-grid">{workflow.map((item) => <article className="workflow-card" key={item.number}><span className="workflow-number">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p><span className="workflow-arrow" aria-hidden="true">↘</span></article>)}</div></section><section className="principles-section" id="principles" aria-labelledby="principles-title"><div><span className="section-index">02</span><h2 id="principles-title">Not an app store.<br /><em>Not a mockup.</em></h2></div><div className="principles-copy"><p>The defining experience is the bridge between a .webb app and a polished, device-oriented web container.</p><button className="text-link" onClick={onOpenRuntime}>Explore the runtime <span aria-hidden="true">→</span></button></div></section></>;
}
