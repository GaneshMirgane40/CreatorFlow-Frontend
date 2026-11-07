import useAsync from "@/hooks/useAsync";
import ProjectList from "@/components/ProjectList";
import { getMyProjects } from "@/services/projectService";
import { formatDate, getErrorMessage } from "@/lib/workflow";

const GROUPS = [
  { status: "UNDER_REVIEW", title: "Waiting for your review", empty: "Nothing to review right now." },
  { status: "APPROVED", title: "Approved — ready to publish", empty: "No approved projects waiting to be published." },
  { status: "REVIEW_REQUESTED", title: "Changes requested — waiting on editor", empty: "No projects waiting on changes." },
];

export default function CreatorReview() {
  const { data: projects, error, initialLoading } = useAsync(getMyProjects);

  if (initialLoading) return <div className="p-8 text-gray-600">Loading review queue…</div>;
  if (error) return <div className="p-8 text-red-600">{getErrorMessage(error, "Failed to load projects")}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h1 className="text-3xl font-bold">Review Queue</h1>

      {GROUPS.map((group) => (
        <section key={group.status} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">{group.title}</h2>
          <ProjectList
            projects={projects.filter((p) => p.status === group.status)}
            linkFor={(p) => `/projects/${p.id}`}
            emptyText={group.empty}
            subtitle={(p) =>
              `${p.assignedEditorName || p.assignedEditorEmail || "No editor"} · created ${formatDate(p.createdAt)}`
            }
          />
        </section>
      ))}
    </div>
  );
}
