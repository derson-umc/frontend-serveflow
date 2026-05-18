import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/ui/Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { usersApi } from '../services/api/users';
import { PASSWORD_MIN, PASSWORD_MAX } from '../utils/validators';

const G = '#2E7D32';
const O = '#F57C00';
const D = '#424242';
const M = '#757575';
const B = '#E0E0E0';
const W = '#FFFFFF';

const STRENGTH_COLORS = ['#E0E0E0', '#EF9A9A', '#EF5350', '#43A047', '#2E7D32', '#1B5E20'];

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres`)
      .max(PASSWORD_MAX, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

function passwordStrength(value = '') {
  if (!value) return 0;
  let s = 0;
  if (value.length >= PASSWORD_MIN) s++;
  if (value.length >= 10) s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
  if (/[0-9]/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  return Math.min(s, 5);
}

export default function ChangePassword() {
  const user = useAuthStore((s) => s.user);
  const [showFields, setShowFields] = useState({ current: false, next: false, confirm: false });
  const [capsOn, setCapsOn] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const newPasswordValue = watch('newPassword', '');
  const confirmValue = watch('confirmPassword', '');
  const strength = passwordStrength(newPasswordValue);
  const matches = newPasswordValue.length > 0 && newPasswordValue === confirmValue;

  const handleCapsLock = (e) => {
    if (typeof e.getModifierState === 'function') setCapsOn(e.getModifierState('CapsLock'));
  };

  const toggleShow = (field) =>
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    if (!user?.id) { setServerError('Sessão inválida. Faça login novamente.'); return; }
    try {
      await usersApi.changePassword(user.id, { currentPassword: data.currentPassword, newPassword: data.newPassword });
      setSuccess('Senha alterada com sucesso. Use a nova senha no próximo login.');
      reset();
    } catch (err) {
      const s = err?.response?.status;
      const m = err?.response?.data?.error || err?.response?.data?.message;
      setServerError(m || (s === 401 ? 'Sessão expirada.' : s === 422 ? 'Senha atual incorreta.' : 'Não foi possível alterar a senha.'));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col min-h-screen" style={{ background: '#F5F5F5' }}>
      <Sidebar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
              <h1 className="text-2xl font-bold" style={{ color: D }}>Alterar Senha</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: M }}>Atualize sua senha de acesso</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: W, boxShadow: '0 4px 20px rgba(0,0,0,0.09)', border: `1px solid ${B}` }}>

              <AnimatePresence>
                {serverError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828' }}>
                    {serverError}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: G }}>
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
                        style={{ background: i < strength ? STRENGTH_COLORS[strength] : '#E0E0E0' }} />
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
                  <p className="text-xs mt-1.5" style={{ color: G }}>As senhas coincidem</p>
                )}
              </div>

              <AnimatePresence>
                {capsOn && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs" style={{ color: O }}>
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
                  background: isValid && !isSubmitting ? G : '#E0E0E0',
                  color: isValid && !isSubmitting ? W : M,
                  border: 'none',
                  cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
                  boxShadow: isValid && !isSubmitting ? '0 4px 16px rgba(46,125,50,0.3)' : 'none',
                }}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Salvando...
                  </span>
                ) : 'Salvar Nova Senha'}
              </motion.button>

              <p className="text-xs text-center" style={{ color: '#BDBDBD' }}>
                Mínimo {PASSWORD_MIN} caracteres · use letras, números e símbolos para uma senha forte
              </p>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

function PwField({ label, registration, error, show, onToggleShow, autoComplete, onKeyDown, onKeyUp }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: M }}>{label}</label>
      <div className="relative">
        <input
          {...registration}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-10"
          style={{
            background: '#FAFAFA', color: '#424242',
            border: `1.5px solid ${error ? '#EF5350' : '#E0E0E0'}`,
          }}
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
          style={{ background: 'none', border: 'none', color: '#757575', cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#2E7D32')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#757575')}>
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs mt-1.5" style={{ color: '#EF5350' }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Eye() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" /></svg>;
}
function EyeOff() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" /></svg>;
}
function Spinner() {
  return <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>;
}
