import axios from "@/api/axios";

export async function getCreatorDashboard() {
  const response = await axios.get("/dashboard/creator");
  return response.data;
}

export async function getEditorDashboard() {
  const response = await axios.get("/dashboard/editor");
  return response.data;
}
