import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  ExternalLink,
  FileVideo,
  FolderKanban,
  MessageSquareText,
  RefreshCw,
  Rocket,
  Send,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getLatestSubmission,
  getProjectActivities,
  getProjectById,
  getReviewFeedbacks,
  publishProject,
} from "@/services/projectService";

const statusClasses = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-200",
  UNDER_REVIEW: "bg-violet-50 text-violet-700 ring-violet-200",
  REVIEW_REQUESTED: "bg-orange-50 text-orange-700 ring-orange-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PUBLISHED: "bg-green-50 text-green-700 ring-green-200",
};

const submittedStatuses = new Set(["UNDER_REVIEW", "APPROVED", "PUBLISHED"]);

function formatDate(date, withTime = false) {
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(new Date(date));
}

function getSubmissionUrl(videoPath) {
  if (!videoPath) return null;
  return videoPath.startsWith("http") ? videoPath : `http://localhost:8080${videoPath}`;
}

function DetailSkeleton() {
  return <div className="mx-auto max-w-6xl space-y-6"><div className="h-6 w-28 animate-pulse rounded bg-slate-200" /><div className="h-40 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-6 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" /><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /></div></div>;
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(location.state?.project || null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [message, setMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      getProjectById(projectId),
      getReviewFeedbacks(projectId),
      getProjectActivities(projectId),
      getLatestSubmission(projectId).catch(() => null),
    ]).then(([loadedProject, loadedFeedbacks, loadedActivities, loadedSubmission]) => {
      if (!active) return;
      setError("");
      setProject(loadedProject);
      setFeedbacks(loadedFeedbacks || []);
      setActivities(loadedActivities || []);
      setSubmission(loadedSubmission);
    }).catch((loadError) => {
      if (active) setError(loadError.response?.data?.message || loadError.message || "Failed to load project details.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [projectId, retryKey]);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const editor = project?.assignedEditor || {};
  const youtubeUrl = project?.youtubeUrl || null;
  const submissionUrl = getSubmissionUrl(submission?.videoPath);
  const timeline = useMemo(() => activities.length ? activities : [
    { id: "created", message: "Project created", createdAt: project?.createdAt },
    project?.updatedAt && { id: "updated", message: `Project status: ${String(project.status || "PENDING").replaceAll("_", " ")}`, createdAt: project.updatedAt },
  ].filter(Boolean), [activities, project]);

  async function handlePublish() {
    setPublishing(true);
    setPublishError("");
    try {
      const published = await publishProject(project.id);
      setProject((current) => ({ ...current, status: "PUBLISHED", youtubeUrl: published.youtubeUrl, publishedAt: published.publishedAt }));
      setMessage(published.message || "Project published successfully.");
      setActivities(await getProjectActivities(project.id));
    } catch (publishRequestError) {
      setPublishError(publishRequestError.response?.data?.message || publishRequestError.message || "Unable to publish this project.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (error || !project) return <section className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
      <div>
        <h1 className="font-semibold text-slate-900">Unable to load project</h1>
        <p role="alert" className="mt-1 text-sm text-slate-600">{error || "This project could not be found."}</p>
        <button onClick={() => { setError(""); setLoading(true); setRetryKey((key) => key + 1); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><RefreshCw className="size-4" />Try again</button>
      </div>
    </div>
  </section>;

  return <main className="mx-auto max-w-6xl space-y-6">
    <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"><ArrowLeft className="size-4" />Back to projects</Link>
    {message && <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"><CheckCircle2 className="size-5 text-emerald-600" />{message}</div>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FolderKanban className="size-5" /></div><div><p className="text-sm font-medium text-indigo-600">Project information</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{project.title}</h1><p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-slate-600">{project.description || "No project description provided."}</p></div></div>
        <span className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusClasses[project.status] || "bg-slate-50 text-slate-700 ring-slate-200"}`}>{String(project.status || "PENDING").replaceAll("_", " ")}</span>
      </div>
      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3"><div><p className="text-slate-500">Created</p><p className="mt-1 font-medium text-slate-800">{formatDate(project.createdAt)}</p></div><div><p className="text-slate-500">Last updated</p><p className="mt-1 font-medium text-slate-800">{formatDate(project.updatedAt || project.createdAt)}</p></div><div><p className="text-slate-500">Project ID</p><p className="mt-1 truncate font-medium text-slate-800">#{project.id}</p></div></div>
    </section>

    <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><CircleUserRound className="size-5 text-indigo-600" /><h2 className="font-semibold text-slate-900">Assigned editor</h2></div><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="font-medium text-slate-800">{editor.name || project.assignedEditorName || "No editor assigned"}</p><p className="mt-1 text-sm text-slate-500">{editor.email || project.assignedEditorEmail || "Assign an editor from the Projects page to begin."}</p></div></section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><FileVideo className="size-5 text-indigo-600" /><h2 className="font-semibold text-slate-900">Submission information</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Submitted for review</p><p className="mt-1 text-sm font-medium text-slate-800">{submission || submittedStatuses.has(project.status) ? "Video submitted" : "Not submitted"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current status</p><p className="mt-1 text-sm font-medium text-slate-800">{String(project.status || "PENDING").replaceAll("_", " ")}</p></div></div>{submission ? <div className="mt-4 space-y-4">{submissionUrl && <video controls className="w-full rounded-xl border border-slate-200"><source src={submissionUrl} type="video/mp4" />Your browser does not support the video tag.</video>}<div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Uploaded by</p><p className="mt-1 font-semibold text-slate-800">{submission.uploadedBy || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Version</p><p className="mt-1 font-semibold text-slate-800">{submission.version || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Uploaded at</p><p className="mt-1 font-semibold text-slate-800">{formatDate(submission.uploadedAt, true)}</p></div></div>{submissionUrl && <a href={submissionUrl} download className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Download video</a>}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No submission is available yet.</p>}</section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><MessageSquareText className="size-5 text-indigo-600" /><h2 className="font-semibold text-slate-900">Review feedback</h2></div><div className="mt-4 space-y-3">{feedbacks.length ? feedbacks.map((feedback) => <article key={feedback.id || `${feedback.reviewedAt}-${feedback.feedback}`} className="rounded-xl bg-slate-50 p-4"><p className="text-sm leading-6 text-slate-700">{feedback.feedback}</p><p className="mt-2 text-xs text-slate-500">{feedback.creatorEmail || "Creator"} · {formatDate(feedback.reviewedAt, true)}</p></article>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No review feedback has been added yet.</p>}</div></section>
    </div><aside className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Rocket className="size-5 text-indigo-600" /><h2 className="font-semibold text-slate-900">Publishing</h2></div>{project.status === "PUBLISHED" ? <div className="mt-4"><p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">This project has been published to YouTube.</p>{youtubeUrl ? <a href={youtubeUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"><ExternalLink className="size-4" />Watch on YouTube</a> : <p className="mt-3 text-sm text-slate-500">The YouTube URL will appear when it is available.</p>}</div> : project.status === "APPROVED" ? <div className="mt-4"><p className="text-sm leading-6 text-slate-600">This approved video is ready to publish directly through CreatorFlow.</p><button onClick={handlePublish} disabled={publishing} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Send className="size-4" />{publishing ? "Publishing…" : "Publish to YouTube"}</button>{publishError && <p role="alert" className="mt-3 text-sm text-red-600">{publishError}</p>}</div> : <p className="mt-4 text-sm leading-6 text-slate-500">Publishing becomes available after the project is approved.</p>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Clock3 className="size-5 text-indigo-600" /><h2 className="font-semibold text-slate-900">Activity timeline</h2></div><ol className="mt-5 space-y-5">{timeline.map((activity) => <li key={activity.id || `${activity.description}-${activity.createdAt}`} className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:size-2 before:rounded-full before:bg-indigo-500"><p className="text-sm text-slate-700">{activity.description || activity.message || activity.activityType || "Project updated"}</p><p className="mt-1 text-xs text-slate-400">{activity.userName ? `${activity.userName} · ` : ""}{formatDate(activity.createdAt, true)}</p></li>)}</ol></section>
    </aside></div>
  </main>;
}
