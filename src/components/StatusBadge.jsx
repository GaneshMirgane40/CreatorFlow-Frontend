import { STATUS_META, statusLabel } from "@/lib/workflow";

export default function StatusBadge({ status }) {
  const className = STATUS_META[status]?.className ?? "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {statusLabel(status)}
    </span>
  );
}
