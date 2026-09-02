import type { PackageReport } from "../packageValidation";

type Props = { report: PackageReport; onRevalidate: () => void };

export function PackageInspection({ report, onRevalidate }: Props) {
  return <section className="package-panel" aria-labelledby="package-title"><div className="panel-title"><div><div className="eyebrow">Package inspection</div><h2 id="package-title">Validation & security</h2></div><button className="small" onClick={onRevalidate}>Revalidate</button></div><p className="subtle package-summary">{report.errors === 0 ? "Package is safe to boot in preview." : `${report.errors} blocking issue${report.errors === 1 ? "" : "s"} must be fixed before boot.`}</p><div className="package-counts" aria-label="Package validation summary"><span className="check-count check-pass">{report.passed} passed</span><span className="check-count check-warning">{report.warnings} warnings</span><span className="check-count check-error">{report.errors} errors</span></div><ul className="package-checks">{report.checks.map((check) => <li key={check.id}><span className={`check-dot check-${check.status}`} aria-label={check.status} /><div><strong>{check.label}</strong><small>{check.detail}</small></div></li>)}</ul><p className="package-note">Preview packages may be unsigned. Publishing adds the canonical digest and webbstack Ed25519 signature.</p></section>;
}
