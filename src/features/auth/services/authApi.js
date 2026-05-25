import apiClient from '@core/api/client';

export const authApi = {
  login: (data) =>
    apiClient.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),
  identify: (identifier) =>
    apiClient.post('/auth/identify', { identifier }).then((r) => r.data),
  forgotPassword: (identifier) =>
    apiClient.post('/auth/forgot-password', { identifier }).then((r) => r.data),
  verifyResetToken: (username, token) =>
    apiClient.post('/auth/verify-reset-token', { username, token }).then((r) => r.data),
  resetPassword: (username, token, newPassword) =>
    apiClient.post('/auth/reset-password', { username, token, newPassword }).then((r) => r.data),
};
