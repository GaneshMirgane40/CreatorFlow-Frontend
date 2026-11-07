import { Link } from "react-router-dom";
import { ClipboardCheck, FolderPlus, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import useAsync from "@/hooks/useAsync";
import StatCard from "@/components/StatCard";
import ProjectList from "@/components/ProjectList";
import { getCreatorDashboard } from "@/services/dashboardService";
import { getMyProjects } from "@/services/projectService";
import { getYouTubeAuthorizationUrl, getYouTubeConnectionStatus } from "@/services/youtubeOAuthService";
import { getErrorMessage } from "@/lib/workflow";

async function loadDashboard() {
  const [stats, projects, youtube] = await Promise.all([
    getCreatorDashboard(),
    getMyProjects(),
    getYouTubeConnectionStatus().catch(() => null),
  ]);
  return { stats, projects, youtube };
}

export default function CreatorDashboard() {
  const { data, error, initialLoading } = useAsync(loadDashboard);

  const handleConnectYouTube = async () => {
    try {
      window.location.assign(await getYouTubeAuthorizationUrl());
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start YouTube connection"));
    }
  };

  if (initialLoading) return <div className="p-8 text-gray-600">Loading dashboard…</div>;
  if (error) return <div className="p-8 text-red-600">{getErrorMessage(error, "Failed to load dashboard")}</div>;

  const { stats, projects, youtube } = data;
  const recent = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const awaitingReview = projects.filter((p) => p.status === "UNDER_REVIEW");

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h1 className="text-3xl font-bold">Creator Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total projects" value={stats.totalProjects} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="In review" value={stats.underReview} accent="text-amber-600" />
        <StatCard label="Approved" value={stats.approved} accent="text-green-600" />
        <StatCard label="Published" value={stats.published} accent="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent projects</h2>
            <Link to="/projects" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <ProjectList
            projects={recent}
            linkFor={(p) => `/projects/${p.id}`}
            emptyText="No projects yet. Create your first one."
          />
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
            <div className="flex flex-col gap-2">
              <Link to="/projects" className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-50">
                <FolderPlus className="h-4 w-4 text-indigo-600" /> Create or manage projects
              </Link>
              <Link to="/review" className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-50">
                <ClipboardCheck className="h-4 w-4 text-amber-600" />
                Review queue
                {awaitingReview.length > 0 && (
                  <span className="ml-auto rounded-full bg-amber-100 px-2 text-xs font-medium text-amber-800">
                    {awaitingReview.length}
                  </span>
                )}
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">YouTube</h2>
            {youtube?.connected ? (
              <p className="text-sm text-gray-700">
                Connected to <span className="font-medium">{youtube.channelTitle}</span>.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  Connect your channel to publish approved videos directly.
                </p>
                <button
                  type="button"
                  onClick={handleConnectYouTube}
                  className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <MonitorPlay className="h-4 w-4" /> Connect YouTube Account
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
