import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menusApi } from '../services/api/menus';

export const MENUS_KEY = ['menus'];

export function useMenus() {
  return useQuery({
    queryKey: MENUS_KEY,
    queryFn: menusApi.list,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMenu(id) {
  return useQuery({
    queryKey: [...MENUS_KEY, id],
    queryFn: () => menusApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateItemAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, menuItemId, data }) =>
      menusApi.updateItemAvailability(menuId, menuItemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MENUS_KEY }),
  });
}

export function usePlaceMenuOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, data }) => menusApi.placeOrder(menuId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MENUS_KEY }),
  });
}
