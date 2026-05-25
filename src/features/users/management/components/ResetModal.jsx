import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';
import { resetSchema } from '../constants';
import { ModalOverlay, ModalHead, FieldGroup, ActionBtn, InlineAlert } from '../shared';

function useResetUserPassword(id) {
  return useMutation({
    mutationFn: (newPassword) => usersApi.resetPassword(id, { newPassword }),
  });
}

const STRENGTH_COLORS = ['#FFCDD2', '#EF9A9A', '#F57C00', '#FFA726', '#2E7D32', '#2E7D32'];

function strengthOf(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)                          s++;
  if (pw.length >= 12)                         s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))   s++;
  if (/[0-9]/.test(pw))                        s++;
  if (/[^A-Za-z0-9]/.test(pw))                s++;
  return s;
}

function getBlockReason(targetRole, isSelf, isAdmin, isGerente) {
  if (isAdmin) return null;
  if (!isGerente) return 'Sem permissão para redefinir senha deste usuário.';
  if (targetRole === 'ADMIN') return 'Você não tem permissão para redefinir senha de usuários Admin.';
  if (targetRole === 'GERENTE' && !isSelf) return 'Gerente só pode redefinir a própria senha.';
  return null;
}

const inputStyle = (blocked, hasError) => ({
  background: blocked ? '#F5F5F5' : '#FFFFFF',
  border:     `1px solid ${hasError ? 'rgba(198,40,40,0.55)' : '#E0E0E0'}`,
  color:      blocked ? '#BDBDBD' : '#424242',
  outline:    'none',
});

export function ResetModal({ user, isAdmin, isGerente, meUsername, onClose, onSaved }) {
  const resetPw     = useResetUserPassword(user.id);
  const targetRole  = user.role?.toUpperCase();
  const isSelf      = meUsername === user.username;
  const blockReason = getBlockReason(targetRole, isSelf, isAdmin, isGerente);
  const blocked     = !!blockReason;
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPwValue   = watch('newPassword', '');
  const confirmValue = watch('confirmPassword', '');
  const matches      = newPwValue.length > 0 && newPwValue === confirmValue;
  const strength     = strengthOf(newPwValue);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await resetPw.mutateAsync(data.newPassword);
      onSaved();
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Erro ao redefinir senha.');
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHead
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        }
        title="Redefinir Senha"
        subtitle={`Usuário: @${user.username}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="px-6 py-5 flex flex-col gap-4">
          {blockReason && <InlineAlert msg={blockReason} />}
          {serverError && <InlineAlert msg={serverError} />}

          <FieldGroup label="Nova Senha">
            <input
              {...register('newPassword')}
              type="password"
              placeholder="Mínimo 8 caracteres"
              disabled={blocked}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
              style={inputStyle(blocked, !!errors.newPassword)}
              onFocus={(e) => { if (!blocked) e.target.style.border = '1px solid #2E7D32'; }}
              onBlur={(e)  => { if (!blocked) e.target.style.border = errors.newPassword ? 'rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
            />
            {errors.newPassword && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{errors.newPassword.message}</p>}
            {newPwValue && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: i < strength ? STRENGTH_COLORS[strength] : '#E0E0E0' }} />
                ))}
              </div>
            )}
          </FieldGroup>

          <FieldGroup label="Confirmar Nova Senha">
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Repita a senha"
              disabled={blocked}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
              style={inputStyle(blocked, !!errors.confirmPassword)}
              onFocus={(e) => { if (!blocked) e.target.style.border = '1px solid #2E7D32'; }}
              onBlur={(e)  => { if (!blocked) e.target.style.border = errors.confirmPassword ? 'rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
            />
            {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{errors.confirmPassword.message}</p>}
            {confirmValue && !errors.confirmPassword && (
              <p className="text-xs mt-1.5" style={{ color: matches ? '#2E7D32' : '#C62828' }}>
                {matches ? 'Senhas coincidem' : 'Senhas não coincidem'}
              </p>
            )}
          </FieldGroup>

          <div className="flex gap-3 pt-1">
            <ActionBtn variant="ghost" onClick={onClose}>Cancelar</ActionBtn>
            <ActionBtn type="submit" loading={isSubmitting} disabled={blocked}>Redefinir</ActionBtn>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}
