import apiClient from './client';

export const productsApi = {
  list: () => apiClient.get('/products').then((r) => r.data),
  listAll: () => apiClient.get('/products/all').then((r) => r.data),
  get: (id) => apiClient.get(`/products/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/products', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/products/${id}`, data).then((r) => r.data),
  toggleStatus: (id) => apiClient.patch(`/products/${id}/toggle-status`).then((r) => r.data),
  deactivate: (id) => apiClient.delete(`/products/${id}`).then((r) => r.data),
  uploadImage: (formData) =>
    apiClient.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};
