import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@core/api/products';

export const PRODUCTS_KEY = ['products'];
export const ALL_PRODUCTS_KEY = ['products', 'all'];

function invalidateProducts(qc) {
  qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
  qc.invalidateQueries({ queryKey: ALL_PRODUCTS_KEY });
}

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: productsApi.list,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: ALL_PRODUCTS_KEY,
    queryFn: productsApi.listAll,
    staleTime: 1000 * 60 * 2,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => invalidateProducts(qc),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productsApi.update(id, data),
    onSuccess: () => invalidateProducts(qc),
  });
}

export function useToggleProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productsApi.toggleStatus(id),
    onSuccess: () => invalidateProducts(qc),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productsApi.deactivate(id),
    onSuccess: () => invalidateProducts(qc),
  });
}
