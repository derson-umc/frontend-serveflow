import apiClient from './client';

export const ordersApi = {
  list: () => apiClient.get('/orders').then((r) => r.data),
  listByStatus: (status) => apiClient.get(`/orders/status/${status}`).then((r) => r.data),
  get: (id) => apiClient.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/orders', data).then((r) => r.data),
  confirm: (id) => apiClient.patch(`/orders/${id}/confirm`).then((r) => r.data),
  prepare: (id) => apiClient.patch(`/orders/${id}/prepare`).then((r) => r.data),
  ready: (id) => apiClient.patch(`/orders/${id}/ready`).then((r) => r.data),
  send: (id) => apiClient.patch(`/orders/${id}/send`).then((r) => r.data),
  complete: (id) => apiClient.patch(`/orders/${id}/complete`).then((r) => r.data),
  cancel: (id) => apiClient.patch(`/orders/${id}/cancel`).then((r) => r.data),
};
