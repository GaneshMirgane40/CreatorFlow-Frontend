// Shared helpers for project statuses, dates and API error messages.

export const STATUS_META = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  // Legacy value still present in the backend enum
  REVIEW: { label: "In Review", className: "bg-amber-100 text-amber-800" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-amber-100 text-amber-800" },
  REVIEW_REQUESTED: { label: "Changes Requested", className: "bg-orange-100 text-orange-800" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  PUBLISHED: { label: "Published", className: "bg-purple-100 text-purple-700" },
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
