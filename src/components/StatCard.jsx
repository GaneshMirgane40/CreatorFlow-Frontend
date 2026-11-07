export default function StatCard({ label, value, accent = "text-gray-900" }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value ?? "—"}</p>
    </div>
  );
}
