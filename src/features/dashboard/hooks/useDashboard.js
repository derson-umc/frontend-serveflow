import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@core/api/dashboard';

const DK = {
  metrics:       ['dashboard', 'metrics'],
  salesByDay:    ['dashboard', 'sales'],
  topProducts:   (days) => ['dashboard', 'top', days],
  cashierReport: (start, end) => ['dashboard', 'cashierReport', start, end],
};

export function useDashboard() {
  const metrics = useQuery({
    queryKey: DK.metrics,
    queryFn:  dashboardApi.metrics,
    staleTime: 30_000,
    placeholderData: {
      revenueToday: 0, ordersToday: 0, customersToday: 0, ticketMedio: 0,
      revenueYesterday: 0, ordersYesterday: 0, customersYesterday: 0, ticketMedioYesterday: 0,
    },
    /** Normaliza todos os campos numéricos — BigDecimal pode chegar como string do Jackson. */
    select: (d) => ({
      revenueToday:          parseFloat(d.revenueToday          ?? 0) || 0,
      ordersToday:           Number(d.ordersToday               ?? 0),
      customersToday:        Number(d.customersToday            ?? 0),
      ticketMedio:           parseFloat(d.ticketMedio           ?? 0) || 0,
      revenueYesterday:      parseFloat(d.revenueYesterday      ?? 0) || 0,
      ordersYesterday:       Number(d.ordersYesterday           ?? 0),
      customersYesterday:    Number(d.customersYesterday        ?? 0),
      ticketMedioYesterday:  parseFloat(d.ticketMedioYesterday  ?? 0) || 0,
    }),
  });

  const salesByDay = useQuery({
    queryKey: DK.salesByDay,
    queryFn:  dashboardApi.salesByDay,
    staleTime: 30_000,
    placeholderData: [],
    select: (data) =>
      data.map((d) => ({
        day:   new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        date:  d.date,
        total: Number(d.total),
      })),
  });

  return { metrics, salesByDay };
}

export function useTopProducts(days = 30) {
  return useQuery({
    queryKey: DK.topProducts(days),
    queryFn:  () => dashboardApi.topProducts(days),
    staleTime: 30_000,
    placeholderData: [],
    select: (data) =>
      data.map((p) => ({
        ...p,
        quantity: Number(p.quantity ?? 0),
        revenue:  parseFloat(p.revenue  ?? 0) || 0,
      })),
  });
}

export function useCashierReport(startDate, endDate) {
  return useQuery({
    queryKey: DK.cashierReport(startDate, endDate),
    queryFn:  () => dashboardApi.cashierReport(startDate, endDate),
    staleTime: 60_000,
    enabled: !!startDate && !!endDate,
  });
}
