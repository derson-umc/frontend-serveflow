import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@core/api/dashboard';

const DK = {
  metrics:     ['dashboard', 'metrics'],
  salesByDay:  ['dashboard', 'sales'],
  topProducts: ['dashboard', 'top'],
  cashierReport: (start, end) => ['dashboard', 'cashierReport', start, end],
};

export function useDashboard() {
  const metrics = useQuery({
    queryKey: DK.metrics,
    queryFn:  dashboardApi.metrics,
    staleTime: 30_000,
    placeholderData: {
      revenueToday: 0,
      ordersToday: 0,
      customersToday: 0,
      netProfit: 0,
    },
  });

  const salesByDay = useQuery({
    queryKey: DK.salesByDay,
    queryFn:  dashboardApi.salesByDay,
    staleTime: 30_000,
    placeholderData: [],
    select: (data) =>
      data.map((d) => ({
        day: new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
        }),
        total: Number(d.total),
      })),
  });

  const topProducts = useQuery({
    queryKey: DK.topProducts,
    queryFn:  dashboardApi.topProducts,
    staleTime: 30_000,
    placeholderData: [],
  });

  return { metrics, salesByDay, topProducts };
}

export function useCashierReport(startDate, endDate) {
  return useQuery({
    queryKey: DK.cashierReport(startDate, endDate),
    queryFn:  () => dashboardApi.cashierReport(startDate, endDate),
    staleTime: 60_000,
    enabled: !!startDate && !!endDate,
  });
}
