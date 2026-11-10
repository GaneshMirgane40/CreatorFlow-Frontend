// Shared helpers for project statuses, dates and API error messages.

export const STATUS_META = {
  PENDING: { label: "Pending", className: "border-[#f1d7d5] bg-[#fff7f5] text-[#8b4a57]" },
  IN_PROGRESS: { label: "In Progress", className: "border-[#d9eafc] bg-[#edf5ff] text-[#1f5bb8]" },
  // Legacy value still present in the backend enum
  REVIEW: { label: "In Review", className: "border-[#f8e8c7] bg-[#fff6df] text-[#9a6a00]" },
  UNDER_REVIEW: { label: "Under Review", className: "border-[#f8e8c7] bg-[#fff6df] text-[#9a6a00]" },
  REVIEW_REQUESTED: { label: "Changes Requested", className: "border-[#f7d9c9] bg-[#fff2ea] text-[#b85627]" },
  APPROVED: { label: "Approved", className: "border-[#d9efdd] bg-[#eefaf1] text-[#227a4d]" },
  PUBLISHED: { label: "Published", className: "border-[#e8dcff] bg-[#f4efff] text-[#6a4ec9]" },
};

export function statusLabel(status) {
  return STATUS_META[status]?.label ?? status ?? "Unknown";
}

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return withTime
    ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function getErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || error?.message || fallback;
}

export function projectPath(role, projectId) {
  return role === "EDITOR" ? `/editor/projects/${projectId}` : `/projects/${projectId}`;
}
