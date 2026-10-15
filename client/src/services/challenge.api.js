import api from './api';

export const challengeApi = {
  getCategories: () => api.get('/challenges/categories'),
  getChallenges: (params) => api.get('/challenges', { params }),
  getChallengeById: (id) => api.get(`/challenges/${id}`),
  createChallenge: (data) => api.post('/challenges', data),
  updateChallenge: (id, data) => api.put(`/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/challenges/${id}`),
};
