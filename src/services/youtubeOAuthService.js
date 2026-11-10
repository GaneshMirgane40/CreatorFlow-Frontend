import axios from "@/api/axios";

export async function getYouTubeAuthorizationUrl() {
  const response = await axios.get("/youtube/oauth/connect");
  return response.data;
}

export async function connectYouTubeAccount(code) {
  // The backend exchanges the code with Google and fetches the channel.
  const response = await axios.post("/youtube/oauth/connect", { code }, { timeout: 30000 });
  return response.data;
}

/** { connected: boolean, channelTitle?: string, channelId?: string } */
export async function getYouTubeConnectionStatus() {
  const response = await axios.get("/youtube/oauth/status");
  return response.data;
}
