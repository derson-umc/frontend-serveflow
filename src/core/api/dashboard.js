import apiClient from './client';

export const dashboardApi = {
  metrics: () => apiClient.get('/dashboard/metrics').then((r) => r.data),
  salesByDay: () => apiClient.get('/dashboard/sales-by-day').then((r) => r.data),
  topProducts: () => apiClient.get('/dashboard/top-products').then((r) => r.data),
  cashierReport: (startDate, endDate) =>
    apiClient.get('/dashboard/cashier-report', { params: { startDate, endDate } }).then((r) => r.data),
};
