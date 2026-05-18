import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api/users';
import { USERNAME_MIN, USERNAME_MAX, PASSWORD_MIN, PASSWORD_MAX } from '../utils/validators';

const G  = '#2E7D32';
const GD = '#1B5E20';
const O  = '#F57C00';
const D  = '#424242';
const M  = '#757575';
const W  = '#FFFFFF';
const B  = '#E0E0E0';

const STRENGTH_COLORS = ['#E0E0E0', '#EF9A9A', '#EF5350', '#43A047', '#2E7D32', '#1B5E20'];

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Usuário é obrigatório')
    .min(USERNAME_MIN, `Mínimo ${USERNAME_MIN} caracteres`)
    .max(USERNAME_MAX, 'Usuário muito longo')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, . _ -'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres`)
    .max(PASSWORD_MAX, 'Senha muito longa'),
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

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

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);

  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields, isValid, dirtyFields },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const usernameValue = watch('username', '');
  const strength = passwordStrength(passwordValue);

  useEffect(() => {
    if (!isAuthenticated) return;
    const role = user?.role?.toLowerCase() ?? '';
    const dest = role === 'cozinheiro' ? '/kds' : role === 'garcon' ? '/menu' : '/dashboard';
    navigate(dest, { replace: true });
  }, [isAuthenticated, user, navigate]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleCapsLock = (e) => {
    if (typeof e.getModifierState === 'function') setCapsOn(e.getModifierState('CapsLock'));
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await authApi.login({ username: data.username.trim(), password: data.password });
      signIn(res.token ?? res, res.refreshToken ?? null);
      const role = res.role?.toLowerCase() ?? '';
      const dest = role === 'cozinheiro' ? '/kds' : role === 'garcon' ? '/menu' : '/dashboard';
      navigate(dest);
    } catch (err) {
      const s = err?.response?.status;
      const msg =
        !s
          ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
          : s === 401 || s === 404 || s === 422
          ? 'Usuário ou senha inválidos.'
          : `Erro no servidor (${s}). Tente novamente.`;
      setServerError(msg);
      triggerShake();
    }
  };

  const usernameField = register('username');
  const passwordField = register('password');

  const usernameOk = dirtyFields.username && !errors.username;
  const usernameErr = (touchedFields.username || dirtyFields.username) && !!errors.username;
  const passwordOk = dirtyFields.password && !errors.password;
  const passwordErr = (touchedFields.password || dirtyFields.password) && !!errors.password;

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F5F5', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-[420px] relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${G} 0%, ${GD} 100%)` }}>
        <div className="absolute rounded-full opacity-10" style={{ width: 420, height: 420, top: '-20%', left: '-20%', background: W }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 280, height: 280, bottom: '-10%', right: '-15%', background: O }} />

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-10">
          <img src="/logo.jpeg" alt="ServeFlow"
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', marginBottom: 24 }} />
          <h2 className="text-3xl font-black mb-3" style={{ color: W, letterSpacing: '-0.02em' }}>BEM-VINDO!</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.75, maxWidth: 260 }}>
            Gerencie seu restaurante com agilidade e eficiência.
          </p>
          <div className="mt-8 flex items-center gap-2">
            <div className="w-8 h-1 rounded-full" style={{ background: O }} />
            <div className="w-3 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="w-3 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img src="/logo.jpeg" alt="ServeFlow"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${G}` }} />
          </div>

          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: O, letterSpacing: '0.12em' }}>Acesso ao Sistema</p>
            <h1 className="font-extrabold mb-2" style={{ color: '#1a1a1a', fontSize: 40, lineHeight: 1.15, marginBottom: 12 }}>{greeting()}</h1>
            <p className="mb-6" style={{ color: '#555555', fontSize: 16, fontWeight: 500 }}>Faça seu login para continuar</p>
          </motion.div>

          <motion.div
            animate={shaking ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8"
            style={{ background: W, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: `1px solid ${B}` }}
          >
            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-sm"
                  style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: '#555555', letterSpacing: '0.08em', fontSize: 13 }}>Usuário</label>
                <div className="relative">
                  <input
                    {...usernameField}
                    type="text"
                    placeholder="Digite seu usuário"
                    autoComplete="username"
                    maxLength={USERNAME_MAX}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: '#FAFAFA', color: D,
                      border: `1.5px solid ${usernameErr ? '#EF5350' : usernameOk ? G : B}`,
                      paddingRight: 38,
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {(dirtyFields.username || usernameValue.length > 0) && (
                      usernameOk ? <CheckIcon color={G} /> : usernameErr ? <ErrorIcon /> : null
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {usernameErr && errors.username?.message && (
                    <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1 text-xs" style={{ color: '#EF5350' }}>
                      {errors.username.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: '#555555', letterSpacing: '0.08em', fontSize: 13 }}>Senha</label>
                <div className="relative">
                  <input
                    {...passwordField}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    maxLength={PASSWORD_MAX}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: '#FAFAFA', color: D,
                      border: `1.5px solid ${passwordErr ? '#EF5350' : passwordOk ? G : B}`,
                      paddingRight: 68,
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      style={{ background: 'none', border: 'none', color: M, cursor: 'pointer', padding: 2 }}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {(dirtyFields.password || passwordValue.length > 0) && (
                      passwordOk ? <CheckIcon color={G} /> : passwordErr ? <ErrorIcon /> : null
                    )}
                  </div>
                </div>

                {passwordValue && (
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i < strength ? STRENGTH_COLORS[strength] : '#E0E0E0' }} />
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {passwordErr && errors.password?.message && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-1 text-xs" style={{ color: '#EF5350' }}>
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {capsOn && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs" style={{ color: O }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19h14" />
                      </svg>
                      Caps Lock ativo
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between mb-5 -mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="rounded" style={{ accentColor: G }} />
                  <span style={{ fontSize: 13, color: '#666666' }}>Lembrar-me</span>
                </label>
                <button type="button" onClick={() => setShowForgotPwd(true)}
                  style={{ background: 'none', border: 'none', color: O, cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0, textDecoration: 'none' }}>
                  Esqueci minha senha
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={!isValid || isSubmitting}
                whileHover={isValid && !isSubmitting ? { y: -2, boxShadow: '0 8px 24px rgba(46,125,50,0.45)' } : {}}
                whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
                className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all"
                style={{
                  background: isValid && !isSubmitting ? G : '#E0E0E0',
                  color: isValid && !isSubmitting ? W : M,
                  border: 'none',
                  cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
                  boxShadow: isValid && !isSubmitting ? '0 4px 16px rgba(46,125,50,0.3)' : 'none',
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Acessando...
                  </span>
                ) : 'Entrar no Sistema'}
              </motion.button>
            </form>
          </motion.div>

          <p className="text-center mt-5 text-xs" style={{ color: '#BDBDBD' }}>
            © 2026 ServeFlow v1.0
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showForgotPwd && <ForgotPasswordModal onClose={() => setShowForgotPwd(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ── Forgot Password Modal (4 steps) ──────────────────────────────────────────
// Step 1: identifier → Step 2: pick channel → Step 3: code → Step 4: new password

function ForgotPasswordModal({ onClose }) {
  const [step,             setStep]            = useState(1);
  const [identifier,       setIdentifier]       = useState('');
  const [resolvedUsername, setResolvedUsername] = useState('');
  const [maskedEmail,      setMaskedEmail]      = useState(null);
  const [maskedPhone,      setMaskedPhone]      = useState(null);
  const [channel,          setChannel]          = useState('');
  const [code,             setCode]             = useState(['', '', '', '', '', '']);
  const [newPwd,           setNewPwd]           = useState('');
  const [confPwd,          setConfPwd]          = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState(false);
  const inputRefs = useRef([]);

  const TOTAL_STEPS = 4;
  const STEP_LABELS = ['Identificação', 'Canal de Envio', 'Verificação', 'Nova Senha'];
  const fullCode = code.join('');

  const handleCodeInput = (idx, val) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleCodeKey = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleCodePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) { setCode(paste.split('')); inputRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  // Step 1 — identify user
  const handleStep1 = async () => {
    if (!identifier.trim()) { setError('Informe seu nome de usuário.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authApi.identify(identifier.trim());
      if (!res?.username) {
        setError('Usuário não encontrado. Verifique e tente novamente.');
        return;
      }
      setResolvedUsername(res.username);
      setMaskedEmail(res.maskedEmail ?? null);
      setMaskedPhone(res.maskedPhone ?? null);
      setChannel(res.maskedEmail ? 'email' : res.maskedPhone ? 'sms' : '');
      setStep(2);
    } catch {
      setError('Erro ao verificar usuário. Tente novamente.');
    } finally { setLoading(false); }
  };

  // Step 2 — send code via chosen channel
  const handleStep2 = async () => {
    if (!channel) { setError('Selecione um canal de envio.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(resolvedUsername, channel);
      setStep(3);
    } catch {
      setError('Não foi possível enviar o código. Tente novamente.');
    } finally { setLoading(false); }
  };

  // Step 3 — verify code
  const handleStep3 = async () => {
    if (fullCode.length < 6) { setError('Digite os 6 dígitos do código.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.verifyResetToken(resolvedUsername, fullCode);
      setStep(4);
    } catch {
      setError('Código inválido ou expirado. Solicite um novo.');
    } finally { setLoading(false); }
  };

  // Step 4 — new password
  const handleStep4 = async () => {
    if (newPwd.length < 8)  { setError('A senha deve ter ao menos 8 caracteres.'); return; }
    if (newPwd !== confPwd) { setError('As senhas não coincidem.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(resolvedUsername, fullCode, newPwd);
      setSuccess(true);
    } catch {
      setError('Erro ao redefinir senha. O código pode ter expirado.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #E0E0E0', background: '#FAFAFA',
    fontSize: 13, color: '#212121', outline: 'none', boxSizing: 'border-box',
  };
  const btnPrimary = (disabled) => ({
    width: '100%', padding: '11px', borderRadius: 10, border: 'none', fontWeight: 700,
    fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#A5D6A7' : G, color: '#fff',
  });

  const displayStep = success ? TOTAL_STEPS : step;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', maxWidth: 420 }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#424242', margin: 0 }}>Redefinir Senha</h3>
            {!success && <p style={{ fontSize: 11, color: '#757575', margin: '2px 0 0' }}>Passo {step} de {TOTAL_STEPS} — {STEP_LABELS[step - 1]}</p>}
          </div>
          <button onClick={() => !loading && onClose()} style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', border: 'none', color: '#757575', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 20px 0' }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: (i + 1) <= displayStep ? G : '#E0E0E0', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#424242', marginBottom: 6 }}>Senha redefinida!</p>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 20 }}>Você já pode fazer login com a nova senha.</p>
                <button onClick={onClose} style={btnPrimary(false)}>Ir para o Login</button>
              </motion.div>

            ) : step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Informe seu nome de usuário para iniciar a recuperação de senha.
                </p>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Usuário
                </label>
                <input
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleStep1()}
                  placeholder="Digite seu nome de usuário"
                  style={{ ...inputStyle, marginBottom: 12 }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                  onBlur={(e)  => (e.target.style.border = '1.5px solid #E0E0E0')}
                  autoFocus
                />
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleStep1} disabled={loading} style={btnPrimary(loading)}>
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </motion.div>

            ) : step === 2 ? (
              <motion.div key="step2" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Conta encontrada: <strong style={{ color: '#424242' }}>{resolvedUsername}</strong>.
                  Escolha como deseja receber o código de verificação.
                </p>

                {(maskedEmail || maskedPhone) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {maskedEmail && (
                      <button
                        type="button"
                        onClick={() => setChannel('email')}
                        style={{
                          padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                          border: `2px solid ${channel === 'email' ? G : '#E0E0E0'}`,
                          background: channel === 'email' ? '#E8F5E9' : '#FAFAFA',
                          transition: 'all 0.15s',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: channel === 'email' ? G : '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: channel === 'email' ? G : '#424242', margin: 0 }}>E-mail</p>
                            <p style={{ fontSize: 11, color: '#757575', margin: '2px 0 0' }}>{maskedEmail}</p>
                          </div>
                          {channel === 'email' && (
                            <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )}

                    {maskedPhone && (
                      <button
                        type="button"
                        onClick={() => setChannel('sms')}
                        style={{
                          padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                          border: `2px solid ${channel === 'sms' ? O : '#E0E0E0'}`,
                          background: channel === 'sms' ? '#FFF3E0' : '#FAFAFA',
                          transition: 'all 0.15s',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: channel === 'sms' ? O : '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: channel === 'sms' ? O : '#424242', margin: 0 }}>SMS</p>
                            <p style={{ fontSize: 11, color: '#757575', margin: '2px 0 0' }}>{maskedPhone}</p>
                          </div>
                          {channel === 'sms' && (
                            <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={O} strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ background: '#FFF3E0', border: '1px solid #FFB74D', color: '#E65100' }}>
                    Nenhum contato cadastrado para esta conta. Solicite ao administrador que cadastre um e-mail ou telefone.
                  </div>
                )}

                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleStep2} disabled={loading || !channel} style={btnPrimary(loading || !channel)}>
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
                <button onClick={() => { setStep(1); setError(''); }} style={{ width: '100%', padding: '9px', borderRadius: 10, background: 'none', color: '#757575', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                  ← Voltar
                </button>
              </motion.div>

            ) : step === 3 ? (
              <motion.div key="step3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Código enviado para{' '}
                  <strong style={{ color: '#424242' }}>
                    {channel === 'sms' ? maskedPhone : maskedEmail}
                  </strong>{' '}
                  via {channel === 'sms' ? 'SMS' : 'e-mail'}. Válido por 15 minutos.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }} onPaste={handleCodePaste}>
                  {code.map((d, i) => (
                    <input key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      value={d} maxLength={1} inputMode="numeric"
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKey(i, e)}
                      style={{
                        width: 44, height: 52, borderRadius: 10, textAlign: 'center',
                        fontSize: 20, fontWeight: 700, color: '#212121',
                        border: `2px solid ${d ? G : '#E0E0E0'}`,
                        background: d ? '#E8F5E9' : '#FAFAFA',
                        outline: 'none', transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onFocus={(e) => (e.target.style.border = `2px solid ${G}`)}
                    />
                  ))}
                </div>
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10, textAlign: 'center' }}>{error}</p>}
                <button onClick={handleStep3} disabled={loading || fullCode.length < 6} style={btnPrimary(loading || fullCode.length < 6)}>
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
                <button onClick={() => { setStep(2); setCode(['', '', '', '', '', '']); setError(''); }}
                  style={{ width: '100%', padding: '9px', borderRadius: 10, background: 'none', color: '#757575', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                  ← Reenviar código
                </button>
              </motion.div>

            ) : (
              <motion.div key="step4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Código verificado. Crie uma nova senha para <strong style={{ color: '#424242' }}>{resolvedUsername}</strong>.
                </p>
                {[
                  { label: 'Nova Senha',      val: newPwd,  set: setNewPwd,  ph: 'Mínimo 8 caracteres', id: 'np' },
                  { label: 'Confirmar Senha', val: confPwd, set: setConfPwd, ph: 'Repita a nova senha',   id: 'cp' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
                    <input type="password" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                      onBlur={(e)  => (e.target.style.border = '1.5px solid #E0E0E0')}
                    />
                  </div>
                ))}
                {newPwd && confPwd && (
                  <p style={{ fontSize: 11, color: newPwd === confPwd ? G : '#C62828', marginBottom: 8, fontWeight: 600 }}>
                    {newPwd === confPwd ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                  </p>
                )}
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleStep4} disabled={loading} style={btnPrimary(loading)}>
                  {loading ? 'Salvando...' : 'Redefinir Senha'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckIcon({ color }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color || G} strokeWidth={2.4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
}
function ErrorIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF5350" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function Eye() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" /></svg>;
}
function EyeOff() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" /></svg>;
}
function Spinner() {
  return <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>;
}
