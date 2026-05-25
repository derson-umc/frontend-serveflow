import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';

export function useRegisterUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      usersApi.create({ ...data, role: data.role.toUpperCase() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
