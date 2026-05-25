import { AnimatePresence, motion } from 'framer-motion';
import { BrandPanel } from './components/BrandPanel';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { CheckIcon, ErrorIcon, Eye, EyeOff, Spinner } from './components/icons';
import { useLoginForm } from './hooks/useLoginForm';
import { greeting } from './utils';
import { G, O, D, M, W, B, STRENGTH_COLORS } from './constants';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const shakeVariants = {
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
  idle: { x: 0 },
};

function StrengthBar({ strength }) {
  return (
    <div className="flex gap-1 mt-1">
      {STRENGTH_COLORS.slice(1).map((color, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < strength ? color : '#E0E0E0',
            transition: 'background 0.25s',
          }}
        />
      ))}
    </div>
  );
}

function FieldWrapper({ label, error, ok, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: 12, fontWeight: 600, color: M, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      <div style={{ minHeight: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
        {error && (
          <span style={{ color: '#EF5350', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
            <ErrorIcon /> {error}
          </span>
        )}
        {ok && !error && (
          <span style={{ color: G, fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
            <CheckIcon /> ok
          </span>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    passwordValue,
    strength,
    showPassword, setShowPassword,
    capsOn,
    shaking,
    serverError,
    showForgotPwd, setShowForgotPwd,
    usernameOk, usernameErr,
    passwordOk, passwordErr,
    handleCapsLock,
  } = useLoginForm();

  const inputBase = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1.5px solid ${B}`,
    fontSize: 14,
    color: D,
    outline: 'none',
    background: W,
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #F9FBE7 100%)' }}
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="flex rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.12)', maxWidth: 820, width: '100%', margin: '0 16px' }}
      >
        <BrandPanel />

        <motion.div
          variants={shakeVariants}
          animate={shaking ? 'shake' : 'idle'}
          className="flex flex-col justify-center flex-1 bg-white px-8 py-10 lg:px-10 lg:py-12"
          style={{ minWidth: 0 }}
        >
          {/* Logo — only visible when brand panel is hidden (< lg) */}
          <div className="flex lg:hidden items-center justify-center mb-6">
            <div style={{ textAlign: 'center' }}>
              <img
                src="/logo.jpeg"
                alt="ServeFlow"
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${G}`, boxShadow: '0 4px 16px rgba(46,125,50,0.2)', margin: '0 auto 10px' }}
              />
              <p style={{ fontSize: 15, fontWeight: 800, color: G, letterSpacing: '-0.01em' }}>ServeFlow</p>
            </div>
          </div>

          <div className="mb-8">
            <p style={{ fontSize: 13, color: M, marginBottom: 4 }}>{greeting()}</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: D, letterSpacing: '-0.02em', marginBottom: 0 }}>
              Entrar na conta
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
            <FieldWrapper label="Usuário" error={usernameErr && errors.username?.message} ok={usernameOk}>
              <input
                {...register('username')}
                autoComplete="username"
                autoFocus
                placeholder="seu.usuario"
                style={{
                  ...inputBase,
                  borderColor: usernameErr ? '#EF5350' : usernameOk ? G : B,
                }}
              />
            </FieldWrapper>

            <FieldWrapper label="Senha" error={passwordErr && errors.password?.message} ok={passwordOk}>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onKeyUp={handleCapsLock}
                  style={{
                    ...inputBase,
                    borderColor: passwordErr ? '#EF5350' : passwordOk ? G : B,
                    paddingRight: 40,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: M,
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {passwordValue && <StrengthBar strength={strength} />}

              {capsOn && (
                <p style={{ fontSize: 11, color: O, marginTop: 2 }}>
                  Caps Lock ativo
                </p>
              )}
            </FieldWrapper>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#FFEBEE',
                  border: '1px solid #EF9A9A',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  color: '#C62828',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ErrorIcon /> {serverError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              style={{
                marginTop: 8,
                padding: '11px 0',
                borderRadius: 10,
                border: 'none',
                background: !isValid || isSubmitting
                  ? B
                  : `linear-gradient(135deg, ${G} 0%, #1B5E20 100%)`,
                color: !isValid || isSubmitting ? M : W,
                fontWeight: 700,
                fontSize: 15,
                cursor: !isValid || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {isSubmitting ? <><Spinner /> Entrando...</> : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPwd(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: G,
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Esqueci minha senha
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showForgotPwd && (
          <ForgotPasswordModal onClose={() => setShowForgotPwd(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
