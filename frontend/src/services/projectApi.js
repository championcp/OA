import axios from 'axios';

const API_URL = '/api/projects';

const projectApi = {
  getProjects: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  getProject: async (projectId) => {
    const response = await axios.get(`${API_URL}/${projectId}`);
    return response.data;
  },
  createProject: async (projectData) => {
    const response = await axios.post(API_URL, projectData);
    return response.data;
  },
  updateProject: async (projectId, projectData) => {
    const response = await axios.put(`${API_URL}/${projectId}`, projectData);
    return response.data;
  },
  deleteProject: async (projectId) => {
    const response = await axios.delete(`${API_URL}/${projectId}`);
    return response.data;
  },
  getProjectMembers: async (projectId) => {
    const response = await axios.get(`${API_URL}/${projectId}/members`);
    return response.data;
  },
  addProjectMember: async (projectId, memberData) => {
    const response = await axios.post(`${API_URL}/${projectId}/members`, memberData);
    return response.data;
  },
  updateProjectMember: async (projectId, memberId, memberData) => {
    const response = await axios.put(`${API_URL}/${projectId}/members/${memberId}`, memberData);
    return response.data;
  },
  removeProjectMember: async (projectId, memberId) => {
    const response = await axios.delete(`${API_URL}/${projectId}/members/${memberId}`);
    return response.data;
  }
};

export default projectApi;