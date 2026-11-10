import { Link } from "react-router-dom";
import { ChevronRight, FolderKanban } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/workflow";

/** Compact list of projects linking to their detail pages. */
export default function ProjectList({ projects, linkFor, emptyText = "No projects.", subtitle }) {
  if (!projects.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            to={linkFor(project)}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[#f0e3de] bg-[#fffdfb] p-3.5 transition-all hover:-translate-y-0.5 hover:border-[#f3c9d2] hover:bg-[#fff8f6] hover:shadow-[0_10px_25px_rgba(148,108,92,0.08)]"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ee] text-[#c81e3f]">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#c81e3f]">{project.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {subtitle ? subtitle(project) : `Created ${formatDate(project.createdAt)}`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={project.status} />
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#c81e3f]" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
