import api from './api';

export const leaderboardApi = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
};

export const badgeApi = {
  getBadges: () => api.get('/badges'),
  getMyBadges: () => api.get('/badges/my'),
};
