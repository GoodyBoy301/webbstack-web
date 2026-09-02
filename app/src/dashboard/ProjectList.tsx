import { EmptyState } from "../components";
import { projectStatusDetails } from "./constants";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "./types";

type ProjectListProps = { projects: Project[]; search: string; onSearch: (value: string) => void; onOpenRuntime: (project: Project) => void; onOpen: (project: Project, publish?: boolean) => void; onDuplicate: (project: Project) => void; onUpdate: (id: string, updates: Partial<Project>) => void; onRetry: (project: Project) => void; onStop: (project: Project) => void; onCancel: (project: Project) => void; onInterrupt: (project: Project) => void; onCreate: () => void };

export function ProjectList({ projects, search, onSearch, onOpenRuntime, onOpen, onDuplicate, onUpdate, onRetry, onStop, onCancel, onInterrupt, onCreate }: ProjectListProps) {
  if (!projects.length) return <EmptyState title="Bring your first app to life." action={<><button className="dashboard-primary" onClick={onCreate}>Create your first project <span aria-hidden="true">→</span></button><span className="empty-note">Accepted format: .webb · Max file size: 100 MB</span></>}>Upload a .webb package and webbstack will validate the runtime before you start shaping its public experience.</EmptyState>;
  const active = projects.filter(({ archived }) => !archived).length;
  const archived = projects.length - active;
  const visible = projects.filter((project) => `${project.name} ${project.filename}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="project-list" aria-labelledby="projects-title"><div className="project-list-heading"><h2 id="projects-title">Projects</h2><span>{active === 1 ? "1 active project" : `${active} active projects`}{archived > 0 && ` · ${archived} archived`}</span></div>
    {projects.length > 5 && <label className="project-search"><span className="sr-only">Search projects</span><input type="search" aria-label="Search projects" placeholder="Search projects" name="project-search" autoComplete="off" value={search} onChange={(event) => onSearch(event.target.value)} /></label>}
    {visible.length ? visible.map((project) => <ProjectCard key={project.id} project={project} onOpenRuntime={onOpenRuntime} onOpen={onOpen} onDuplicate={onDuplicate} onUpdate={onUpdate} onRetry={onRetry} onStop={onStop} onCancel={onCancel} onInterrupt={onInterrupt} />) : <p className="project-no-results">No projects match “{search}”.</p>}
  </section>;
}
