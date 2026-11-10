import { useState } from "react";
import { Link } from "react-router-dom";
import CreateProjectModal from "@/components/CreateProjectModal";
import EditProjectModal from "@/components/EditProjectModal";
import AssignEditorModal from "@/components/AssignEditorModal";
import StatusBadge from "@/components/StatusBadge";
import useAsync from "@/hooks/useAsync";
import { getMyProjects, deleteProject } from "@/services/projectService";
import { formatDate, getErrorMessage } from "@/lib/workflow";

export default function Projects() {
  const { data: projects, error, initialLoading, reload } = useAsync(getMyProjects);

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await deleteProject(projectId);
      reload();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete project"));
    }
  };

  if (initialLoading) {
    return <div className="p-8">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{getErrorMessage(error, "Failed to fetch projects")}</div>;
  }

  return (
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>

          <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + New Project
          </button>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                // Changing the editor after work has been submitted would break the review history.
                const canAssign = ["PENDING", "IN_PROGRESS"].includes(project.status);

                return (
                  <div
                      key={project.id}
                      className="flex flex-col rounded-lg bg-white shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Link to={`/projects/${project.id}`} className="text-xl font-bold hover:underline">
                        {project.title}
                      </Link>
                      <StatusBadge status={project.status} />
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Assigned Editor:</span>{" "}
                        {project.assignedEditorName || project.assignedEditorEmail || "Not Assigned"}
                      </div>

                      <div>
                        <span className="font-semibold">Created Date:</span>{" "}
                        {formatDate(project.createdAt)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-6 flex flex-wrap gap-2 justify-end">
                      <Link
                          to={`/projects/${project.id}`}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                      >
                        {project.status === "UNDER_REVIEW" ? "Review" : "View"}
                      </Link>

                      <button
                          onClick={() => {
                            setSelectedProject(project);
                            setOpenEditModal(true);
                          }}
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>

                      {canAssign && (
                        <button
                            onClick={() => {
                              setSelectedProject(project);
                              setOpenAssignModal(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        >
                          {project.assignedEditorEmail ? "Reassign" : "Assign Editor"}
                        </button>
                      )}

                      <button
                          onClick={() => handleDelete(project.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            onProjectCreated={reload}
        />

        {/* Edit Project Modal (keyed so its form re-initialises per project) */}
        <EditProjectModal
            key={selectedProject?.id ?? "none"}
            open={openEditModal}
            project={selectedProject}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedProject(null);
            }}
            onProjectUpdated={reload}
        />

        {/* Assign Editor Modal */}
        <AssignEditorModal
            open={openAssignModal}
            project={selectedProject}
            onClose={() => {
              setOpenAssignModal(false);
              setSelectedProject(null);
            }}
            onEditorAssigned={reload}
        />
      </div>
  );
}
