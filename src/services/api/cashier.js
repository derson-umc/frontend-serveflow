import apiClient from './client';

export const cashierApi = {
  session: {
    current: () =>
      apiClient.get('/cashier/session/current').then((r) => (r.status === 204 ? null : r.data)),
    open: (data) => apiClient.post('/cashier/session/open', data).then((r) => r.data),
    close: (id, data) => apiClient.post(`/cashier/session/${id}/close`, data).then((r) => r.data),
    list: () => apiClient.get('/cashier/sessions').then((r) => r.data),
  },
  movements: {
    create: (sessionId, data) =>
      apiClient.post(`/cashier/session/${sessionId}/movement`, data).then((r) => r.data),
    list: (sessionId) =>
      apiClient.get(`/cashier/session/${sessionId}/movements`).then((r) => r.data),
  },
};
