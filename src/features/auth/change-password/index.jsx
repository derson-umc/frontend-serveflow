import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@shared/components/layout/Sidebar';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { palette } from '@styles/ds';
import { schema, STRENGTH_COLORS, passwordStrength, PASSWORD_MIN } from './constants';
import PwField from './components/PwField';
import { useChangePassword } from './hooks/useChangePassword';

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ChangePassword() {
  const user              = useAuthStore((s) => s.user);
  const changePassword    = useChangePassword();
  const [showFields,  setShowFields]  = useState({ current: false, next: false, confirm: false });
  const [capsOn,      setCapsOn]      = useState(false);
  const [serverError, setServerError] = useState('');
  const [success,     setSuccess]     = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: 'onChange' });

  const newPasswordValue = watch('newPassword', '');
  const confirmValue     = watch('confirmPassword', '');
  const strength         = passwordStrength(newPasswordValue);
  const matches          = newPasswordValue.length > 0 && newPasswordValue === confirmValue;

  const handleCapsLock = (e) => {
    if (typeof e.getModifierState === 'function') setCapsOn(e.getModifierState('CapsLock'));
  };

  const toggleShow = (field) => setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    if (!user?.id) { setServerError('Sessão inválida. Faça login novamente.'); return; }
    try {
      await changePassword.mutateAsync({
        userId:          user.id,
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      setSuccess('Senha alterada com sucesso. Use a nova senha no próximo login.');
      reset();
    } catch (err) {
      const s = err?.response?.status;
      const m = err?.response?.data?.error || err?.response?.data?.message;
      setServerError(
        m || (s === 401 ? 'Sessão expirada.' : s === 422 ? 'Senha atual incorreta.' : 'Não foi possível alterar a senha.')
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col min-h-screen" style={{ background: palette.background }}>
      <Sidebar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full"
                style={{ background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})` }} />
              <h1 className="text-2xl font-bold" style={{ color: palette.textSecondary }}>Alterar Senha</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: palette.textMuted }}>Atualize sua senha de acesso</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: palette.white, boxShadow: '0 4px 20px rgba(0,0,0,0.09)', border: `1px solid ${palette.border}` }}>

              <AnimatePresence>
                {serverError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red }}>
                    {serverError}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: palette.greenSurface, border: `1px solid ${palette.greenBorder}`, color: palette.green }}>
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <PwField
                label="Senha atual"
                registration={register('currentPassword')}
                error={errors.currentPassword?.message}
                show={showFields.current}
                onToggleShow={() => toggleShow('current')}
                autoComplete="current-password"
                onKeyDown={handleCapsLock}
                onKeyUp={handleCapsLock}
              />

              <div>
                <PwField
                  label="Nova senha"
                  registration={register('newPassword')}
                  error={errors.newPassword?.message}
                  show={showFields.next}
                  onToggleShow={() => toggleShow('next')}
                  autoComplete="new-password"
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                />
                {newPasswordValue && (
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i < strength ? STRENGTH_COLORS[strength] : palette.border }} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <PwField
                  label="Confirmar nova senha"
                  registration={register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  show={showFields.confirm}
                  onToggleShow={() => toggleShow('confirm')}
                  autoComplete="new-password"
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                />
                {confirmValue && !errors.confirmPassword && matches && (
                  <p className="text-xs mt-1.5" style={{ color: palette.green }}>As senhas coincidem</p>
                )}
              </div>

              <AnimatePresence>
                {capsOn && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs" style={{ color: palette.orange }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19h14" />
                    </svg>
                    Caps Lock está ativo
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
                whileHover={isValid && !isSubmitting ? { y: -2, boxShadow: '0 8px 24px rgba(46,125,50,0.4)' } : {}}
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm tracking-wide"
                style={{
                  background:  isValid && !isSubmitting ? palette.green : palette.border,
                  color:       isValid && !isSubmitting ? palette.white : palette.textMuted,
                  border:      'none',
                  cursor:      isValid && !isSubmitting ? 'pointer' : 'not-allowed',
                  boxShadow:   isValid && !isSubmitting ? '0 4px 16px rgba(46,125,50,0.3)' : 'none',
                }}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Salvando...
                  </span>
                ) : 'Salvar Nova Senha'}
              </motion.button>

              <p className="text-xs text-center" style={{ color: palette.textDisabled }}>
                Mínimo {PASSWORD_MIN} caracteres · use letras, números e símbolos para uma senha forte
              </p>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
