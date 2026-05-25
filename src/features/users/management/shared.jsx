import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ROLE_META } from './constants';

export function RoleDot({ role }) {
  const meta = ROLE_META[role?.toUpperCase()] ?? ROLE_META.USER;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      <span style={{ color: '#757575' }}>{meta.label}</span>
    </span>
  );
}

export function Avatar({ name }) {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', letterSpacing: '-0.01em' }}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#757575' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function FormInput({ registration, error, placeholder, type = 'text', disabled = false }) {
  return (
    <>
      <input
        {...registration}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
        style={{
          background: disabled ? '#F5F5F5' : '#FFFFFF',
          border:     error ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0',
          color:      disabled ? '#BDBDBD' : '#424242',
          outline:    'none',
          cursor:     disabled ? 'not-allowed' : 'text',
        }}
        onFocus={(e) => { if (!disabled) e.target.style.border = '1px solid #2E7D32'; }}
        onBlur={(e)  => { if (!disabled) e.target.style.border = error ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{error}</p>}
    </>
  );
}

export function FormSelect({ registration, options, disabled = false }) {
  return (
    <select
      {...registration}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm"
      style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', color: '#424242', outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: '#FFFFFF' }}>{o.label}</option>
      ))}
    </select>
  );
}

export function ActionBtn({ onClick, disabled, loading, children, variant = 'primary', type = 'button' }) {
  const styles = {
    primary: { bg: '#2E7D32', bgDisabled: '#A5D6A7', shadow: '0 4px 18px rgba(46,125,50,0.28)', color: '#fff' },
    danger:  { bg: '#C62828', bgDisabled: '#EF9A9A', shadow: '0 4px 18px rgba(198,40,40,0.25)', color: '#fff' },
    ghost:   { bg: '#F5F5F5', bgDisabled: '#F5F5F5', shadow: 'none', color: '#757575' },
  };
  const s = styles[variant];
  const off = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={off}
      className="flex-1 py-2.5 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-2"
      style={{
        background: off && variant !== 'ghost' ? s.bgDisabled : s.bg,
        color:      off && variant !== 'ghost' ? '#FFFFFF' : s.color,
        boxShadow:  off ? 'none' : s.shadow,
        border:     variant === 'ghost' ? '1px solid #E0E0E0' : 'none',
        cursor:     off ? 'not-allowed' : 'pointer',
        opacity:    off ? 0.7 : 1,
      }}
    >
      {loading ? <BtnSpinner /> : children}
    </button>
  );
}

function BtnSpinner() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconBtn({ onClick, title, icon, hoverColor = '#2E7D32' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', color: '#757575' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = hoverColor + '66'; e.currentTarget.style.background = hoverColor + '12'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#757575'; e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.background = '#F5F5F5'; }}
    >
      {icon}
    </button>
  );
}

export function ModalOverlay({ onClose, children, width = 'max-w-md' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${width} rounded-2xl shadow-2xl overflow-hidden`}
        style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ModalHead({ icon, title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #E0E0E0' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E8F5E9', border: '1px solid #A5D6A7' }}>
          <span style={{ color: '#2E7D32' }}>{icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#424242' }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: '#757575' }}>{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg transition-colors mt-0.5"
        style={{ color: '#BDBDBD' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#C62828')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#BDBDBD')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function InlineAlert({ msg, type = 'error' }) {
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
      style={{ background: ok ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${ok ? '#A5D6A7' : '#EF9A9A'}`, color: ok ? '#2E7D32' : '#C62828' }}
    >
      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {msg}
    </div>
  );
}

export function PageToast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const ok = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold"
      style={{ background: ok ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${ok ? '#A5D6A7' : '#EF9A9A'}`, color: ok ? '#2E7D32' : '#C62828' }}
    >
      {ok
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      }
      {msg}
    </motion.div>
  );
}
