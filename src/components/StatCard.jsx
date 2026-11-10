export default function StatCard({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-[#f2e0d9] bg-white/85 p-4 shadow-[0_10px_25px_rgba(148,108,92,0.08)] backdrop-blur-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accent}`}>{value ?? "—"}</p>
    </div>
  );
}
