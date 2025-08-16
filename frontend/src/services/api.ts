import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const airtableAPI = {
  getUser: () => api.get('/api/airtable/user'),
  getBases: () => api.get('/api/airtable/bases'),
  getTables: (baseId: string) => api.get(`/api/airtable/bases/${baseId}/tables`),
  getFields: (baseId: string, tableId: string) => 
    api.get(`/api/airtable/bases/${baseId}/tables/${tableId}/fields`),
  createRecord: (baseId: string, tableId: string, fields: any) =>
    api.post(`/api/airtable/bases/${baseId}/tables/${tableId}/records`, { fields }),
  getRecords: (baseId: string, tableId: string) =>
    api.get(`/api/airtable/bases/${baseId}/tables/${tableId}/records`),
};

export const formsAPI = {
  createForm: (formData: any) => api.post('/api/forms', formData),
  getForms: () => api.get('/api/forms'),
  getForm: (id: string) => api.get(`/api/forms/${id}`),
  updateForm: (id: string, formData: any) => api.put(`/api/forms/${id}`, formData),
  deleteForm: (id: string) => api.delete(`/api/forms/${id}`),
};

export default api;
