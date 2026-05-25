import apiClient from './client';

export const kdsApi = {
  getOrders: () => apiClient.get('/kds/orders').then((r) => r.data),
  prepare: (id) => apiClient.patch(`/kds/orders/${id}/prepare`).then((r) => r.data),
  ready: (id) => apiClient.patch(`/kds/orders/${id}/ready`).then((r) => r.data),
  complete: (id) => apiClient.patch(`/kds/orders/${id}/complete`).then((r) => r.data),
};
