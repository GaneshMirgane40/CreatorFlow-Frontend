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
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#c81e3f]">Overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Creator Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total projects" value={stats.totalProjects} />
        <StatCard label="Pending" value={stats.pending} accent="text-[#eb6a6a]" />
        <StatCard label="In review" value={stats.underReview} accent="text-amber-600" />
        <StatCard label="Approved" value={stats.approved} accent="text-green-600" />
        <StatCard label="Published" value={stats.published} accent="text-violet-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-[#f2e3dd] bg-white/85 p-6 shadow-[0_18px_40px_rgba(148,108,92,0.08)] backdrop-blur-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent projects</h2>
            <Link to="/projects" className="text-sm font-medium text-[#c81e3f] hover:text-[#a31833]">View all</Link>
          </div>
          <ProjectList
            projects={recent}
            linkFor={(p) => `/projects/${p.id}`}
            emptyText="No projects yet. Create your first one."
          />
        </section>

        <div className="space-y-6">
          <section id="youtube" className="rounded-3xl border border-[#f2e3dd] bg-white/85 p-6 shadow-[0_18px_40px_rgba(148,108,92,0.08)] backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick actions</h2>
            <div className="flex flex-col gap-2">
              <Link to="/projects" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#fff7f5]">
                <FolderPlus className="h-4 w-4 text-[#c81e3f]" /> Create or manage projects
              </Link>
              <Link to="/review" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#fff7f5]">
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

          <section className="rounded-3xl border border-[#f2e3dd] bg-white/85 p-6 shadow-[0_18px_40px_rgba(148,108,92,0.08)] backdrop-blur-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">YouTube</h2>
            {youtube?.connected ? (
              <p className="text-sm text-slate-700">
                Connected to <span className="font-medium text-slate-900">{youtube.channelTitle}</span>.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-600">
                  Connect your channel to publish approved videos directly.
                </p>
                <button
                  type="button"
                  onClick={handleConnectYouTube}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff5a64] to-[#d50a2f] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#f2c3cb] hover:brightness-105"
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
