import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@core/api/orders';

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data) => ordersApi.create(data),
  });
}
