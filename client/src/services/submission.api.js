import api from './api';

export const submissionApi = {
  submitChallenge: (data) => api.post('/submissions', data),
  getMySubmissions: (params) => api.get('/submissions/my', { params }),
  getSubmissionsForReview: (params) => api.get('/submissions/review', { params }),
  reviewSubmission: (id, data) => api.put(`/submissions/${id}/review`, data),
};
