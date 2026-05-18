import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/api/orders';

export const ORDERS_KEY = ['orders'];

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: ordersApi.list,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useOrdersByStatus(status) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'status', status],
    queryFn: () => ordersApi.listByStatus(status),
    staleTime: 1000 * 30,
    enabled: !!status,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: [...ORDERS_KEY, id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

function makeStatusMutation(fn) {
  return () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: fn,
      onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
    });
  };
}

export const useConfirmOrder = makeStatusMutation(ordersApi.confirm);
export const usePrepareOrder = makeStatusMutation(ordersApi.prepare);
export const useReadyOrder = makeStatusMutation(ordersApi.ready);
export const useSendOrder = makeStatusMutation(ordersApi.send);
export const useCompleteOrder = makeStatusMutation(ordersApi.complete);
export const useCancelOrder = makeStatusMutation(ordersApi.cancel);
