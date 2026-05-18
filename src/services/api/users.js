import apiClient from './client';

export const usersApi = {
  list: () => apiClient.get('/users').then((r) => r.data),
  get: (id) => apiClient.get(`/users/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/users', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/users/${id}`, data).then((r) => r.data),
  delete: (id) => apiClient.delete(`/users/${id}`).then((r) => r.data),
  changePassword: (id, data) =>
    apiClient.patch(`/users/${id}/password`, data).then((r) => r.data),
  resetPassword: (id, data) =>
    apiClient.patch(`/users/${id}/reset-password`, data).then((r) => r.data),
  updateJobPosition: (id, data) =>
    apiClient.patch(`/users/${id}/job-position`, data).then((r) => r.data),
};

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  identify: (identifier) =>
    apiClient.post('/auth/identify', { identifier }).then((r) => r.data),
  forgotPassword: (identifier, channel) =>
    apiClient.post('/auth/forgot-password', { identifier, channel }).then((r) => r.data),
  verifyResetToken: (username, token) =>
    apiClient.post('/auth/verify-reset-token', { username, token }).then((r) => r.data),
  resetPassword: (username, token, newPassword) =>
    apiClient.post('/auth/reset-password', { username, token, newPassword }).then((r) => r.data),
};
