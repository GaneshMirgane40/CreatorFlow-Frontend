import axios from "@/api/axios";

export async function getNotifications() {
  const response = await axios.get("/notifications");
  return response.data;
}

export async function getUnreadCount() {
  const response = await axios.get("/notifications/unread-count");
  return response.data;
}

export async function markNotificationRead(id) {
  await axios.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await axios.patch("/notifications/read-all");
}
