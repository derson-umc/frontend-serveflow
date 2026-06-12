import apiClient from './client';

export const dashboardApi = {
  metrics: () => apiClient.get('/dashboard/metrics').then((r) => r.data),
  salesByDay: (days = 7) => apiClient.get('/dashboard/sales-by-day', { params: { days } }).then((r) => r.data),
  topProducts: (days = 30) => apiClient.get('/dashboard/top-products', { params: { days } }).then((r) => r.data),
  cashierReport: (startDate, endDate) =>
    apiClient.get('/dashboard/cashier-report', { params: { startDate, endDate } }).then((r) => r.data),
};
