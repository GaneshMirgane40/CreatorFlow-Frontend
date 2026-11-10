import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/workflow";

/** Compact list of projects linking to their detail pages. */
export default function ProjectList({ projects, linkFor, emptyText = "No projects.", subtitle }) {
  if (!projects.length) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            to={linkFor(project)}
            className="flex items-center justify-between gap-4 rounded px-2 py-3 hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{project.title}</p>
              <p className="truncate text-xs text-gray-500">
                {subtitle ? subtitle(project) : `Created ${formatDate(project.createdAt)}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={project.status} />
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
