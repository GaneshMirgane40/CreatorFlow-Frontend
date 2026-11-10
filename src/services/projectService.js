import axios from '@/api/axios';

export async function getMyProjects() {
  const response = await axios.get('/projects/my-projects');
  return response.data;
}

export async function getProjectById(projectId) {
  const response = await axios.get(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(projectData) {
  const response = await axios.post('/projects', projectData);
  return response.data;
}

export async function updateProject(id, projectData) {
  const response = await axios.put(`/projects/${id}`, projectData);
  return response.data;
}

export async function deleteProject(id) {
  const response = await axios.delete(`/projects/${id}`);
  return response.data;
}

export async function assignEditor(projectId, editorId) {
  const response = await axios.put(`/projects/${projectId}/assign-editor/${editorId}`);
  return response.data;
}

export async function uploadSourceVideo(projectId, video, onProgress) {
  const formData = new FormData();
  formData.append("video", video);
  const response = await axios.post(`/projects/${projectId}/source-video`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return response.data;
}

export async function fetchSourceVideo(projectId, { signal, onProgress } = {}) {
  const response = await axios.get(`/projects/${projectId}/source-video`, {
    responseType: "blob",
    timeout: 0,
    signal,
    onDownloadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return response.data;
}

export async function getEditorProjects() {
  const response = await axios.get('/projects/editor');
  return response.data;
}

export async function updateProjectStatus(projectId, status) {
  const response = await axios.put(`/projects/${projectId}/status`, { status });
  return response.data;
}

export async function publishProject(projectId) {
  // Uploading to YouTube can take a while for large files.
  const response = await axios.post(`/projects/${projectId}/publish`, null, { timeout: 0 });
  return response.data;
}

export async function submitReviewFeedback(projectId, feedback, approved) {
  const response = await axios.post(`/projects/${projectId}/feedback`, { feedback, approved });
  return response.data;
}

export async function getReviewFeedbacks(projectId) {
  const response = await axios.get(`/projects/${projectId}/feedbacks`);
  return response.data;
}

export async function getProjectActivities(projectId) {
  const response = await axios.get(`/projects/${projectId}/activities`);
  return response.data;
}

export async function submitProjectVideo(projectId, video, onProgress) {
  const formData = new FormData();
  formData.append('video', video);

  // The instance defaults to application/json, which makes axios serialise
  // FormData as JSON. Declaring multipart lets the browser add the boundary.
  const response = await axios.post(`/projects/${projectId}/submissions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
}

/** Latest submission, or null when the editor hasn't uploaded anything (204). */
export async function getLatestSubmission(projectId) {
  const response = await axios.get(`/projects/${projectId}/submission`);
  return response.status === 204 || !response.data ? null : response.data;
}

/**
 * Downloads a submission's video through the authenticated API and returns a Blob.
 * `videoUrl` is the API-relative path returned in the submission response.
 */
export async function fetchSubmissionVideo(videoUrl, { signal, onProgress } = {}) {
  // Keep API-relative paths such as /projects/:id/submissions/:id/video
  // relative to axios.baseURL (/api). Converting them with URL() would drop
  // that prefix and incorrectly request /projects/... from the server root.
  const response = await axios.get(videoUrl, {
    responseType: 'blob',
    timeout: 0,
    signal,
    onDownloadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
}
