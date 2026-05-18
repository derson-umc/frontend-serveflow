import apiClient from './client';

export const financialApi = {
  cashFlow: () => apiClient.get('/financial/cash-flow').then((r) => r.data),

  receivables: {
    list: () => apiClient.get('/financial/receivables').then((r) => r.data),
    get: (id) => apiClient.get(`/financial/receivables/${id}`).then((r) => r.data),
    create: (data) => apiClient.post('/financial/receivables', data).then((r) => r.data),
    settle: (id, data) => apiClient.patch(`/financial/receivables/${id}/settle`, data).then((r) => r.data),
    cancel: (id, performedBy) =>
      apiClient.patch(`/financial/receivables/${id}/cancel`, null, { params: { performedBy } }).then((r) => r.data),
  },

  payables: {
    list: () => apiClient.get('/financial/payables').then((r) => r.data),
    get: (id) => apiClient.get(`/financial/payables/${id}`).then((r) => r.data),
    create: (data) => apiClient.post('/financial/payables', data).then((r) => r.data),
    settle: (id, data) => apiClient.patch(`/financial/payables/${id}/settle`, data).then((r) => r.data),
    cancel: (id, performedBy) =>
      apiClient.patch(`/financial/payables/${id}/cancel`, null, { params: { performedBy } }).then((r) => r.data),
  },

  audit: {
    list: () => apiClient.get('/financial/audit').then((r) => r.data),
    byEntity: (id) => apiClient.get(`/financial/audit/entity/${id}`).then((r) => r.data),
  },
};
