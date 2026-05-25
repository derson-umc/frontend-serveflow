import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ userId, currentPassword, newPassword }) =>
      usersApi.changePassword(userId, { currentPassword, newPassword }),
  });
}
