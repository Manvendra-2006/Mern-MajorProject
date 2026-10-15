import api from './api';

export const resourceApi = {
  getResources: (params) => api.get('/resources', { params }),
  getResourceById: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

export const analyticsApi = {
  getStudentDashboard: () => api.get('/analytics/student/dashboard'),
  getTeacherDashboard: () => api.get('/analytics/teacher/dashboard'),
  getAdminDashboard: () => api.get('/analytics/admin/dashboard'),
};

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  moderateChallenge: (id, isApproved) => api.patch(`/admin/challenges/${id}/moderate`, { isApproved }),
};
