import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTHENTICATION =====
export const authAPI = {
  login: (username, password, role) =>
    api.post('/auth/login', { username, password, role })
};

// ===== ASSESSMENTS =====
export const assessmentAPI = {
  getAllAssessments: () => api.get('/assessments'),
  
  getAssessment: (id) => api.get(`/assessments/${id}`),
  
  createAssessment: (data) => api.post('/assessments', data),
  
  updateAssessment: (id, data) => api.put(`/assessments/${id}`, data),
  
  compareDiagnosis: (symptoms, medicalHistory) =>
    api.post('/diagnosis/compare', { symptoms, medicalHistory })
};

export default api;
