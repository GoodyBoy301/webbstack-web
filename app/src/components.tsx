import type { ReactNode } from "react";

type StatusBadgeProps = {
  label: string;
  status: string;
  archived?: boolean;
};

export function StatusBadge({ label, status, archived = false }: StatusBadgeProps) {
  const icon = archived ? "—" : status === "ready" ? "✓" : status === "failed" ? "!" : "•";
  return (
    <span className={`project-status status-${archived ? "archived" : status}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

type BuildProgressProps = {
  label: string;
  value: number;
};

export function BuildProgress({ label, value }: BuildProgressProps) {
  return (
    <div className="project-progress">
      <div className="project-progress-label">
        <span>Build progress</span>
        <span>{value}%</span>
      </div>
      <progress
        value={value}
        max="100"
        aria-label={`${label} progress`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  children: ReactNode;
  action: ReactNode;
};

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <section className="dashboard-empty" aria-labelledby="empty-title">
      <div className="empty-mark" aria-hidden="true">
        ✦
      </div>
      <span className="section-index">Your workspace is ready</span>
      <h2 id="empty-title">{title}</h2>
      <p>{children}</p>
      {action}
    </section>
  );
}
