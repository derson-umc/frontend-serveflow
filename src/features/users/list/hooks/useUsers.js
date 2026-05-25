import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';

const USERS_KEY = ['users'];

export function useUsers() {
  const qc = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: USERS_KEY,
    queryFn:  usersApi.list,
    staleTime: 30_000,
  });

  const deleteUser = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const createUser = useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const resetUserPassword = useMutation({
    mutationFn: ({ id, newPassword }) =>
      usersApi.resetPassword(id, { newPassword }),
  });

  return {
    users,
    isLoading,
    isError,
    deleteUser,
    createUser,
    updateUser,
    resetUserPassword,
  };
}
