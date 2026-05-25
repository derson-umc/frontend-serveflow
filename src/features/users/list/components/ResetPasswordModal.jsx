import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';

function useResetPassword(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newPassword) => usersApi.resetPassword(userId, { newPassword }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export default function ResetPasswordModal({ user, onClose, onSuccess }) {
  const reset = useResetPassword(user.id);
  const [newPassword,   setNewPassword]   = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState('');

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setError('');
    try {
      await reset.mutateAsync(newPassword);
      onSuccess(`Senha de "${user.username}" redefinida com sucesso.`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Erro ao redefinir senha.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-6"
        style={{ background: 'rgba(10,2,4,0.97)', border: '1px solid rgba(228,96,51,0.25)' }}>
        <h2 className="text-lg font-bold mb-1" style={{ color: '#fff1f2' }}>Redefinir senha</h2>
        <p className="text-sm mb-5" style={{ color: '#7a3518' }}>
          Usuário: <span style={{ color: '#f07040' }}>{user.username}</span>
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(228,96,51,0.08)', border: '1px solid rgba(228,96,51,0.28)' }}>
            <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#7a3518' }}>Nova senha</label>
        <div className="relative mb-5">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full px-4 py-3 rounded-xl text-sm pr-10"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(228,96,51,0.18)', color: '#fff1f2' }}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#7a3518' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" />
                </>
              )}
            </svg>
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#7a3518', border: '1px solid rgba(228,96,51,0.12)' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={reset.isPending || newPassword.length < 8}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: newPassword.length >= 8 ? 'linear-gradient(135deg, #e46033, #b84020)' : 'rgba(228,96,51,0.15)',
              color: '#fff',
              opacity: newPassword.length >= 8 ? 1 : 0.5,
              cursor: newPassword.length >= 8 ? 'pointer' : 'not-allowed',
            }}>
            {reset.isPending ? 'Salvando...' : 'Redefinir'}
          </button>
        </div>
      </div>
    </div>
  );
}
