import type { Capability, Status } from "./types";
import { capabilities, groupFor } from "./data";

type Props = { query: string; statusFilter: Status | "all"; filtered: Capability[]; groups: string[]; requested: string[]; onQuery: (query: string) => void; onStatus: (status: Status | "all") => void; onTest: (capability: Capability) => void };

export function CapabilityControls({ query, statusFilter, filtered, groups, requested, onQuery, onStatus, onTest }: Props) {
  return <><div className="panel-header"><div className="eyebrow">Runtime diagnostics</div><div className="panel-title"><h2 id="controls-title">Capability controls</h2><span>{filtered.length}/{capabilities.length}</span></div><p className="subtle">Test the capabilities your app declares in the creator environment.</p></div>
    <div className="filters"><label className="search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search capabilities" aria-label="Search capabilities" /></label><select value={statusFilter} onChange={(event) => onStatus(event.target.value as Status | "all")} aria-label="Filter capability status"><option value="all">All statuses</option><option value="available">Available</option><option value="restricted">Restricted</option><option value="unavailable">Unavailable</option></select></div>
    <div className="capability-list">{groups.map((group) => <section className="capability-group" key={group}><div className="group-heading"><span>{group}</span><span>{filtered.filter(({ name }) => groupFor(name) === group).length}</span></div>{filtered.filter(({ name }) => groupFor(name) === group).map((capability) => <CapabilityRow key={capability.name} capability={capability} requested={requested.includes(capability.name)} onTest={onTest} />)}</section>)}{groups.length === 0 && <div className="empty">No capabilities match your search.</div>}</div>
  </>;
}

function CapabilityRow({ capability, requested, onTest }: { capability: Capability; requested: boolean; onTest: (capability: Capability) => void }) {
  return <div className="capability-row"><div className="capability-copy"><code>{capability.name}</code><span className={`status status-${capability.status}`}>{capability.status}</span><small>{requested ? "Permission requested" : capability.detail}</small></div><button className="small" disabled={capability.status === "unavailable"} onClick={() => onTest(capability)}>{capability.status === "restricted" ? "Request" : "Test"}</button></div>;
}
