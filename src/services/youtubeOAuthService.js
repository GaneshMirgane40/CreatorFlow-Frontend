import axios from "@/api/axios";

export async function getYouTubeAuthorizationUrl() {
  const response = await axios.get("/youtube/oauth/connect");
  return response.data;
}

export async function connectYouTubeAccount(code) {
  const response = await axios.post("/youtube/oauth/connect", { code });
  return response.data;
}
