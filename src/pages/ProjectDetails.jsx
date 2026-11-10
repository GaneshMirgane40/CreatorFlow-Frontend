import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, MessageSquareWarning, Play, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import useAsync from "@/hooks/useAsync";
import StatusBadge from "@/components/StatusBadge";
import SubmissionVideo from "@/components/SubmissionVideo";
import SourceVideo from "@/components/SourceVideo";
import VideoUploadForm from "@/components/VideoUploadForm";
import {
  getLatestSubmission,
  getProjectActivities,
  getProjectById,
  getReviewFeedbacks,
  publishProject,
  submitReviewFeedback,
  updateProjectStatus,
} from "@/services/projectService";
import { getYouTubeAuthorizationUrl, getYouTubeConnectionStatus } from "@/services/youtubeOAuthService";
import { formatDate, getErrorMessage } from "@/lib/workflow";

function Section({ title, children, action }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

async function loadProjectBundle(projectId, isCreator) {
  const [project, submission, feedbacks, activities] = await Promise.all([
    getProjectById(projectId),
    getLatestSubmission(projectId),
    getReviewFeedbacks(projectId),
    getProjectActivities(projectId),
  ]);

  // Only needed to decide how the publish panel looks.
  const youtube =
    isCreator && project.status === "APPROVED"
      ? await getYouTubeConnectionStatus().catch(() => null)
      : null;

  return { project, submission, feedbacks, activities, youtube };
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { role } = useAuth();
  const isCreator = role === "CREATOR";
  const isEditor = role === "EDITOR";

  const { data, error, initialLoading, reload } = useAsync(
    () => loadProjectBundle(projectId, isCreator),
    `${projectId}:${role}`
  );

  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(null); // "approve" | "changes" | "publish" | "start"

  if (initialLoading) return <div className="p-8 text-gray-600">Loading project…</div>;
  if (error) return <div className="p-8 text-red-600">{getErrorMessage(error, "Failed to load project")}</div>;

  const { project, submission, feedbacks, activities, youtube } = data;
  const backTo = isEditor ? "/editor/projects" : "/projects";

  const runAction = async (name, action, successMessage) => {
    try {
      setBusy(name);
      const result = await action();
      toast.success(typeof successMessage === "function" ? successMessage(result) : successMessage);
      reload();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handleReview = async (approved) => {
    const text = feedback.trim();
    if (!approved && !text) {
      toast.error("Describe the changes you want before sending them to the editor.");
      return;
    }
    const ok = await runAction(
      approved ? "approve" : "changes",
      () => submitReviewFeedback(project.id, text || "Approved.", approved),
      approved ? "Submission approved" : "Changes requested"
    );
    if (ok) setFeedback("");
  };

  const handlePublish = () => {
    if (!youtube?.connected) {
      toast.error("Connect your YouTube account before publishing.");
      return;
    }
    return runAction("publish", () => publishProject(project.id), "Published to YouTube");
  };

  const handleConnectYouTube = async () => {
    try {
      window.location.assign(await getYouTubeAuthorizationUrl());
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start YouTube connection"));
    }
  };

  const handleStartWork = () =>
    runAction("start", () => updateProjectStatus(project.id, "IN_PROGRESS"), "Work started");

  const canReview = isCreator && project.status === "UNDER_REVIEW" && submission;
  const canStartWork = isEditor && ["PENDING", "REVIEW_REQUESTED"].includes(project.status);
  const canUpload = isEditor && ["IN_PROGRESS", "REVIEW_REQUESTED"].includes(project.status);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      {/* Project information */}
      <Section title="Project information" action={<StatusBadge status={project.status} />}>
        <h1 className="mb-2 text-2xl font-bold">{project.title}</h1>
        <p className="mb-6 whitespace-pre-line text-gray-700">{project.description || "No description."}</p>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Creator</dt>
            <dd className="font-medium">{project.creatorName || project.creatorEmail}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Editor</dt>
            <dd className="font-medium">
              {project.assignedEditorName || project.assignedEditorEmail || "Not assigned"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="font-medium">{formatDate(project.createdAt)}</dd>
          </div>
        </dl>
      </Section>

      {project.sourceVideoAvailable && (
        <Section title="Source video from creator">
          <SourceVideo projectId={project.id} />
        </Section>
      )}

      {/* Editor actions */}
      {(canStartWork || canUpload) && (
        <Section title="Your next step">
          {/* Keep the latest change request in view while the editor works on it. */}
          {feedbacks[0] && !feedbacks[0].approved && (
            <div className="mb-4 rounded border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
              <p className="mb-1 font-medium">Creator requested changes:</p>
              <p className="whitespace-pre-line">{feedbacks[0].feedback}</p>
            </div>
          )}
          {canStartWork && (
            <button
              type="button"
              onClick={handleStartWork}
              disabled={busy !== null}
              className="mb-4 inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> {busy === "start" ? "Starting…" : "Start Work"}
            </button>
          )}
          {canUpload && <VideoUploadForm projectId={project.id} onUploaded={reload} />}
        </Section>
      )}

      {/* Latest submission */}
      <Section title={submission ? `Latest submission · v${submission.version}` : "Submission"}>
        <SubmissionVideo submission={submission} projectId={project.id} />
      </Section>

      {/* Creator review */}
      {canReview && (
        <Section title="Review">
          <label htmlFor="feedback" className="mb-2 block text-sm text-gray-600">
            Feedback for the editor (required when requesting changes)
          </label>
          <textarea
            id="feedback"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={busy !== null}
            placeholder="e.g. Tighten the intro and fix the transition at 1:24."
            className="mb-4 w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => handleReview(false)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50"
            >
              <MessageSquareWarning className="h-4 w-4" />
              {busy === "changes" ? "Sending…" : "Request Changes"}
            </button>
            <button
              type="button"
              onClick={() => handleReview(true)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy === "approve" ? "Approving…" : "Approve"}
            </button>
          </div>
        </Section>
      )}

      {/* Publishing */}
      {isCreator && project.status === "APPROVED" && (
        <Section title="Publish to YouTube">
          {youtube?.connected === false ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">Connect your YouTube channel before publishing.</p>
              <button
                type="button"
                onClick={handleConnectYouTube}
                className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <MonitorPlay className="h-4 w-4" /> Connect YouTube Account
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                The latest approved version will be uploaded
                {youtube?.channelTitle ? ` to ${youtube.channelTitle}` : ""}.
              </p>
              <button
                type="button"
                onClick={handlePublish}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <MonitorPlay className="h-4 w-4" /> {busy === "publish" ? "Publishing… this can take a while" : "Publish"}
              </button>
            </div>
          )}
        </Section>
      )}

      {project.status === "PUBLISHED" && (
        <Section title="Published on YouTube">
          {project.youtubeUrl ? (
            <div className="space-y-2 text-sm">
              <a
                href={project.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-red-600 hover:underline"
              >
                {project.youtubeUrl} <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-gray-600">
                {project.channelTitle && <>Channel: {project.channelTitle} · </>}
                Published {formatDate(project.publishedAt, true)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">This project is published but no YouTube link is stored.</p>
          )}
        </Section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Review feedback">
          {feedbacks.length === 0 ? (
            <p className="text-sm text-gray-500">No feedback yet.</p>
          ) : (
            <ul className="space-y-3">
              {feedbacks.map((item) => (
                <li key={item.id} className="rounded border border-gray-200 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className={item.approved ? "font-medium text-green-700" : "font-medium text-orange-700"}>
                      {item.approved ? "Approved" : "Changes requested"}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(item.reviewedAt, true)}</span>
                  </div>
                  <p className="whitespace-pre-line text-gray-700">{item.feedback}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Activity">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet.</p>
          ) : (
            <ol className="space-y-3 border-l border-gray-200 pl-4">
              {activities.map((activity) => (
                <li key={activity.id} className="text-sm">
                  <p className="text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.userName} · {formatDate(activity.createdAt, true)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>
    </div>
  );
}
