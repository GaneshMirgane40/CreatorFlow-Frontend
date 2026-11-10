import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import useAsync from "@/hooks/useAsync";
import StatusBadge from "@/components/StatusBadge";
import { getEditorProjects, updateProjectStatus } from "@/services/projectService";
import { formatDate, getErrorMessage } from "@/lib/workflow";

export default function EditorProjects() {
  const { data: projects, error, initialLoading, reload } = useAsync(getEditorProjects);
  const [startingId, setStartingId] = useState(null);

  const handleStart = async (projectId) => {
    try {
      setStartingId(projectId);
      await updateProjectStatus(projectId, "IN_PROGRESS");
      toast.success("Work started");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start work"));
    } finally {
      setStartingId(null);
    }
  };

  if (initialLoading) return <div className="p-8 text-gray-600">Loading projects…</div>;
  if (error) return <div className="p-8 text-red-600">{getErrorMessage(error, "Failed to load projects")}</div>;

  return (
    <div className="p-4 sm:p-8">
      <h1 className="mb-8 text-3xl font-bold">My Assigned Projects</h1>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects have been assigned to you yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const canStart = ["PENDING", "REVIEW_REQUESTED"].includes(project.status);
            const canUpload = ["IN_PROGRESS", "REVIEW_REQUESTED"].includes(project.status);

            return (
              <div key={project.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mb-4 line-clamp-3 text-gray-600">{project.description}</p>
                <div className="mb-6 space-y-1 text-sm text-gray-600">
                  <p>Creator: {project.creatorName || project.creatorEmail}</p>
                  <p>Created: {formatDate(project.createdAt)}</p>
                </div>

                <div className="mt-auto flex flex-wrap justify-end gap-2">
                  {canStart && (
                    <button
                      type="button"
                      onClick={() => handleStart(project.id)}
                      disabled={startingId !== null}
                      className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" /> {startingId === project.id ? "Starting…" : "Start Work"}
                    </button>
                  )}
                  <Link
                    to={`/editor/projects/${project.id}`}
                    className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {canUpload ? (
                      <>
                        <UploadCloud className="h-4 w-4" /> Open & Upload
                      </>
                    ) : (
                      "Open"
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
