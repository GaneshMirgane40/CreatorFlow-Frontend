import { useEffect, useState } from "react";
import { getEditorProjects, updateProjectStatus, getReviewFeedbacks, submitProjectVideo } from "@/services/projectService";

// Helper: badge color by status
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "REVIEW":
    case "UNDER_REVIEW":
      return "bg-purple-100 text-purple-800";
    case "REVIEW_REQUESTED":
      return "bg-orange-100 text-orange-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Editors can start work and resume work after changes are requested.
const getEditorAction = (status) => {
  switch (status) {
    case "PENDING":
      return { label: "▶ Start Work", nextStatus: "IN_PROGRESS" };
    case "REVIEW_REQUESTED":
      return { label: "Resume Work", nextStatus: "IN_PROGRESS" };
    default:
      return null;
  }
};

// Skeleton card used while loading
const SkeletonCard = () => (
  <div className="border rounded-lg shadow p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-6" />
    <div className="h-10 bg-gray-200 rounded w-full" />
  </div>
);

export default function EditorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // per-project UI state
  const [statusLoading, setStatusLoading] = useState({});
  const [statusError, setStatusError] = useState({});
  const [statusSuccess, setStatusSuccess] = useState({});

  // feedbacks per project (creator feedback entries)
  const [feedbacks, setFeedbacks] = useState({});
  const [submissionFiles, setSubmissionFiles] = useState({});

  // Fetch projects (full load - shows skeletons)
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEditorProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch assigned projects");
    } finally {
      setLoading(false);
    }
  };

  // Silent fetch that does not toggle global loading (used to sync in background)
  const fetchProjectsSilent = async () => {
    try {
      const data = await getEditorProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to refresh assigned projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch feedbacks for all projects when the project list changes
  useEffect(() => {
    const fetchAllFeedbacks = async () => {
      if (!projects || projects.length === 0) {
        setFeedbacks({});
        return;
      }

      try {
        const ids = projects.map(p => p.id);
        const promises = ids.map((id) => getReviewFeedbacks(id).then((data) => ({ id, data })));
        const results = await Promise.all(promises);
        const map = {};
        results.forEach(r => { map[r.id] = r.data || []; });
        setFeedbacks(map);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load creator feedback");
      }
    };

    fetchAllFeedbacks();
  }, [projects]);

  const handleEditorAction = async (projectId, nextStatus) => {
    try {
      setStatusError(prev => ({ ...prev, [projectId]: null }));
      setStatusLoading(prev => ({ ...prev, [projectId]: true }));

      // Call backend
      await updateProjectStatus(projectId, nextStatus);

      // Immediate optimistic UI update
      setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, status: nextStatus } : p)));

      // Show success message
      setStatusSuccess(prev => ({ ...prev, [projectId]: "✓ Status updated successfully" }));
      setTimeout(() => {
        setStatusSuccess(prev => ({ ...prev, [projectId]: null }));
      }, 3000);

      // Background sync to keep UI accurate
      fetchProjectsSilent();
    } catch (err) {
      setStatusError(prev => ({
        ...prev,
        [projectId]: err.response?.data?.message || err.message || "Failed to update status"
      }));
    } finally {
      setStatusLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleSubmission = async (projectId) => {
    const video = submissionFiles[projectId];
    if (!video) {
      setStatusError((prev) => ({ ...prev, [projectId]: "Choose the edited video before submitting it for review." }));
      return;
    }

    try {
      setStatusError((prev) => ({ ...prev, [projectId]: null }));
      setStatusLoading((prev) => ({ ...prev, [projectId]: true }));
      const submission = await submitProjectVideo(projectId, video);
      setProjects((prev) => prev.map((project) => project.id === projectId ? { ...project, status: "UNDER_REVIEW" } : project));
      setSubmissionFiles((prev) => ({ ...prev, [projectId]: null }));
      setStatusSuccess((prev) => ({ ...prev, [projectId]: submission.message || "Video submitted for review." }));
    } catch (err) {
      setStatusError((prev) => ({ ...prev, [projectId]: err.response?.data?.message || err.message || "Failed to upload the video submission" }));
    } finally {
      setStatusLoading((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // Render empty state when no projects
  if (!loading && projects.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-2xl font-semibold mb-2">No Assigned Projects</h2>
          <p className="text-gray-600">Projects assigned by creators will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8">Assigned Projects</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const action = getEditorAction(project.status);
            const isProcessing = !!statusLoading[project.id];
            const cardOpacity = isProcessing ? 'opacity-70' : 'opacity-100';

            return (
              <div
                key={project.id}
                className={`border rounded-lg shadow-md p-6 transition-transform hover:-translate-y-1 ${cardOpacity}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-gray-600 mt-2 mb-4">{project.description}</p>

                <div className="mt-2 text-sm text-gray-700 mb-4">
                  <strong>Creator:</strong> {project.creatorEmail}
                </div>

                {feedbacks[project.id] && feedbacks[project.id].length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 rounded">
                    <div className="font-semibold mb-2">Creator Feedback</div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {feedbacks[project.id]
                        .slice()
                        .sort((a,b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
                        .map(f => (
                          <li key={f.id}>{f.feedback}</li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  {action ? (
                    <button
                      onClick={() => !isProcessing && handleEditorAction(project.id, action.nextStatus)}
                      disabled={isProcessing}
                      className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? 'Processing...' : action.label}
                    </button>
                  ) : project.status === 'IN_PROGRESS' ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700" htmlFor={`video-${project.id}`}>Edited video</label>
                      <input id={`video-${project.id}`} type="file" accept="video/*" onChange={(event) => setSubmissionFiles((prev) => ({ ...prev, [project.id]: event.target.files?.[0] || null }))} disabled={isProcessing} className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
                      <button onClick={() => handleSubmission(project.id)} disabled={isProcessing} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">{isProcessing ? "Uploading..." : "Upload & Submit for Review"}</button>
                    </div>
                  ) : project.status === 'UNDER_REVIEW' || project.status === 'REVIEW' ? (
                    <div className="p-4 rounded-md bg-purple-50 text-purple-800 font-semibold">
                      <div className="text-lg">🟣 Submitted for Review</div>
                      <div className="text-sm mt-1 text-gray-700">Waiting for Creator Response</div>
                    </div>
                  ) : project.status === 'APPROVED' ? (
                    <div className="p-4 rounded-md bg-green-50 text-green-800 font-semibold">
                      <div className="text-lg">✅ Approved by Creator</div>
                    </div>
                  ) : project.status === 'PUBLISHED' ? (
                    <div className="p-4 rounded-md bg-emerald-50 text-emerald-800 font-semibold">
                      <div className="text-lg">🌍 Published</div>
                    </div>
                  ) : null}
                </div>

                {statusError[project.id] && (
                  <div className="mt-3 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {statusError[project.id]}
                  </div>
                )}

                {statusSuccess[project.id] && (
                  <div className="mt-3 p-3 bg-green-100 text-green-700 rounded text-sm">
                    {statusSuccess[project.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
