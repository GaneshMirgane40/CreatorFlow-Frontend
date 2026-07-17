import axios from '@/api/axios';

export async function getMyProjects() {
  const response = await axios.get('/projects/my-projects');
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
