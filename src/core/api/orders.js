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
  requestPayment: (id) =>
    apiClient.patch(`/orders/${id}/request-payment`).then((r) => r.data),
  cancel: ({ id, reason }) =>
    apiClient.patch(`/orders/${id}/cancel`, reason != null ? { reason } : undefined).then((r) => r.data),
  updateItems: (id, items) =>
    apiClient.patch(`/orders/${id}/items`, items).then((r) => r.data),
  cancelItem: (orderId, itemId, reason) =>
    apiClient.patch(`/orders/${orderId}/items/${itemId}/cancel`, reason ? { reason } : undefined).then((r) => r.data),
  addItems: (id, items) =>
    apiClient.post(`/orders/${id}/items/add`, items).then((r) => r.data),
};
