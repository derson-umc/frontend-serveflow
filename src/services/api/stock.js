import apiClient from './client';

export const stockApi = {
  items: {
    list: () => apiClient.get('/stock/items').then((r) => r.data),
    listActive: () => apiClient.get('/stock/items/active').then((r) => r.data),
    get: (id) => apiClient.get(`/stock/items/${id}`).then((r) => r.data),
    create: (data) => apiClient.post('/stock/items', data).then((r) => r.data),
    update: (id, data) => apiClient.put(`/stock/items/${id}`, data).then((r) => r.data),
    toggleStatus: (id) =>
      apiClient.patch(`/stock/items/${id}/toggle-status`).then((r) => r.data),
    entry: (id, data) =>
      apiClient.post(`/stock/items/${id}/entry`, data).then((r) => r.data),
    loss: (id, data) =>
      apiClient.post(`/stock/items/${id}/loss`, data).then((r) => r.data),
    adjust: (id, data) =>
      apiClient.post(`/stock/items/${id}/adjust`, data).then((r) => r.data),
  },

  movements: {
    list: () => apiClient.get('/stock/movements').then((r) => r.data),
    listByItem: (id) =>
      apiClient.get(`/stock/items/${id}/movements`).then((r) => r.data),
    listByOrder: (orderId) =>
      apiClient.get(`/stock/movements/order/${orderId}`).then((r) => r.data),
    filter: (params) =>
      apiClient.get('/stock/movements/filter', { params }).then((r) => r.data),
  },

  recipes: {
    list: () => apiClient.get('/stock/recipes').then((r) => r.data),
    get: (id) => apiClient.get(`/stock/recipes/${id}`).then((r) => r.data),
    getByProduct: (productId) =>
      apiClient.get(`/stock/recipes/product/${productId}`).then((r) => r.data),
    create: (data) => apiClient.post('/stock/recipes', data).then((r) => r.data),
    update: (id, data) => apiClient.put(`/stock/recipes/${id}`, data).then((r) => r.data),
  },

  alerts: {
    list: () => apiClient.get('/stock/alerts').then((r) => r.data),
    resolve: (id) => apiClient.patch(`/stock/alerts/${id}/resolve`).then((r) => r.data),
  },

  report: {
    consolidated: () => apiClient.get('/stock/report/consolidated').then((r) => r.data),
  },
};
