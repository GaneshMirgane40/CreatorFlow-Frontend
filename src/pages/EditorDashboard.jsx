import { Link } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import StatCard from "@/components/StatCard";
import ProjectList from "@/components/ProjectList";
import { getEditorDashboard } from "@/services/dashboardService";
import { getEditorProjects } from "@/services/projectService";
import { getErrorMessage } from "@/lib/workflow";

const NEEDS_ACTION = ["PENDING", "IN_PROGRESS", "REVIEW_REQUESTED"];

async function loadDashboard() {
  const [stats, projects] = await Promise.all([getEditorDashboard(), getEditorProjects()]);
  return { stats, projects };
}

export default function EditorDashboard() {
  const { data, error, initialLoading } = useAsync(loadDashboard);

  if (initialLoading) return <div className="p-8 text-gray-600">Loading dashboard…</div>;
  if (error) return <div className="p-8 text-red-600">{getErrorMessage(error, "Failed to load dashboard")}</div>;

  const { stats, projects } = data;
  const todo = projects.filter((p) => NEEDS_ACTION.includes(p.status));

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#c81e3f]">Overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Editor Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Assigned" value={stats.assignedProjects} />
        <StatCard label="In progress" value={stats.inProgress} accent="text-blue-600" />
        <StatCard label="Under review" value={stats.underReview} accent="text-amber-600" />
        <StatCard label="Changes requested" value={stats.reviewRequested} accent="text-orange-600" />
        <StatCard label="Approved" value={stats.approved} accent="text-green-600" />
      </div>

      <section className="rounded-3xl border border-[#f2e3dd] bg-white/85 p-6 shadow-[0_18px_40px_rgba(148,108,92,0.08)] backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Needs your attention</h2>
          <Link to="/editor/projects" className="text-sm font-medium text-[#c81e3f] hover:text-[#a31833]">All projects</Link>
        </div>
        <ProjectList
          projects={todo}
          linkFor={(p) => `/editor/projects/${p.id}`}
          emptyText="You're all caught up."
          subtitle={(p) => `From ${p.creatorName || p.creatorEmail}`}
        />
      </section>
    </div>
  );
}
