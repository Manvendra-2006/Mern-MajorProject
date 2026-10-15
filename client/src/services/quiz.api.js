import api from './api';

export const quizApi = {
  getQuizzes: (params) => api.get('/quizzes', { params }),
  getQuizForAttempt: (id) => api.get(`/quizzes/${id}/attempt`),
  submitQuizAttempt: (id, data) => api.post(`/quizzes/${id}/attempt`, data),
  getMyAttempts: (params) => api.get('/quizzes/attempts/my', { params }),
  createQuiz: (data) => api.post('/quizzes', data),
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
};
