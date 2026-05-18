import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '../services/api/stock';

export const STOCK_ITEMS_KEY = ['stock', 'items'];
export const STOCK_MOVEMENTS_KEY = ['stock', 'movements'];
export const STOCK_RECIPES_KEY = ['stock', 'recipes'];
export const STOCK_ALERTS_KEY = ['stock', 'alerts'];

export function useStockItems() {
  return useQuery({
    queryKey: STOCK_ITEMS_KEY,
    queryFn: stockApi.items.list,
    staleTime: 1000 * 60 * 2,
  });
}

export function useStockItem(id) {
  return useQuery({
    queryKey: [...STOCK_ITEMS_KEY, id],
    queryFn: () => stockApi.items.get(id),
    enabled: !!id,
  });
}

export function useCreateStockItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockApi.items.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: STOCK_ITEMS_KEY }),
  });
}

export function useUpdateStockItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => stockApi.items.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STOCK_ITEMS_KEY }),
  });
}

export function useStockEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => stockApi.items.entry(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOCK_ITEMS_KEY });
      qc.invalidateQueries({ queryKey: STOCK_MOVEMENTS_KEY });
    },
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: STOCK_MOVEMENTS_KEY,
    queryFn: stockApi.movements.list,
    staleTime: 1000 * 60,
  });
}

export function useStockItemMovements(id) {
  return useQuery({
    queryKey: [...STOCK_MOVEMENTS_KEY, id],
    queryFn: () => stockApi.movements.listByItem(id),
    enabled: !!id,
  });
}

export function useRecipes() {
  return useQuery({
    queryKey: STOCK_RECIPES_KEY,
    queryFn: stockApi.recipes.list,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockApi.recipes.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: STOCK_RECIPES_KEY }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => stockApi.recipes.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STOCK_RECIPES_KEY }),
  });
}

export function useStockAlerts() {
  return useQuery({
    queryKey: STOCK_ALERTS_KEY,
    queryFn: stockApi.alerts.list,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => stockApi.alerts.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STOCK_ALERTS_KEY }),
  });
}
