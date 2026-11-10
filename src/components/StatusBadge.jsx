import { STATUS_META, statusLabel } from "@/lib/workflow";

export default function StatusBadge({ status }) {
  const className = STATUS_META[status]?.className ?? "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {statusLabel(status)}
    </span>
  );
}
