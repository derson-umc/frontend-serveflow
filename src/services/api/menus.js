import apiClient from './client';

export const menusApi = {
  list: () => apiClient.get('/menus').then((r) => r.data),
  get: (id) => apiClient.get(`/menus/${id}`).then((r) => r.data),
  active: () => apiClient.get('/menus/active').then((r) => r.data),
  create: (data) => apiClient.post('/menus', data).then((r) => r.data),
  unlock: (id) => apiClient.patch(`/menus/${id}/unlock`).then((r) => r.data),
  placeOrder: (menuId, data) =>
    apiClient.post(`/menus/${menuId}/orders`, data).then((r) => r.data),
  updateItemAvailability: (menuId, menuItemId, data) =>
    apiClient
      .patch(`/menus/${menuId}/items/${menuItemId}/availability`, data)
      .then((r) => r.data),
  removeItem: (menuId, menuItemId) =>
    apiClient.delete(`/menus/${menuId}/items/${menuItemId}`).then((r) => r.data),
};
