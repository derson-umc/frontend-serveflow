import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/ui/Sidebar';
import { usersApi } from '../services/api/users';
import { useAuthStore } from '../store/useAuthStore';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const ROLE_OPTIONS_GERENTE = [
  { value: 'GERENTE',    label: 'Gerente'    },
  { value: 'CAIXA',      label: 'Caixa'      },
  { value: 'GARCON',     label: 'Garçom'     },
  { value: 'COZINHEIRO', label: 'Cozinheiro' },
];

const ROLE_OPTIONS_ADMIN = [
  { value: 'ADMIN', label: 'Admin' },
  ...ROLE_OPTIONS_GERENTE,
];

const ROLE_META = {
  ADMIN:      { label: 'Admin',      dot: '#f43f5e' },
  GERENTE:    { label: 'Gerente',    dot: '#f97316' },
  CAIXA:      { label: 'Caixa',      dot: '#60a5fa' },
  GARCON:     { label: 'Garçom',     dot: '#34d399' },
  COZINHEIRO: { label: 'Cozinheiro', dot: '#a78bfa' },
  USER:       { label: 'User',       dot: '#94a3b8' },
};

const FILTER_TABS = [
  { value: 'ALL',        label: 'Todos'      },
  { value: 'ADMIN',      label: 'Admin'      },
  { value: 'GERENTE',    label: 'Gerente'    },
  { value: 'CAIXA',      label: 'Caixa'      },
  { value: 'GARCON',     label: 'Garçom'     },
  { value: 'COZINHEIRO', label: 'Cozinheiro' },
];

const editSchema = z.object({
  username:    z.string().min(3, 'Mínimo 3 caracteres').max(64, 'Máximo 64 caracteres'),
  email:       z.string().email('E-mail inválido').max(120, 'E-mail muito longo').optional().or(z.literal('')),
  phone:       z.string().regex(/^[0-9()\-\s+]{0,20}$/, 'Telefone inválido').optional().or(z.literal('')),
  role:        z.enum(['ADMIN', 'GERENTE', 'CAIXA', 'GARCON', 'COZINHEIRO']),
  jobposition: z.string().min(2, 'Cargo é obrigatório'),
});

const resetSchema = z
  .object({
    newPassword:     z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

const createSchema = z
  .object({
    username:        z.string().min(3, 'Mínimo 3 caracteres').max(64, 'Máximo 64 caracteres'),
    email:           z.string().email('E-mail inválido').max(120, 'E-mail muito longo').optional().or(z.literal('')),
    phone:           z.string().regex(/^[0-9()\-\s+]{0,20}$/, 'Telefone inválido').optional().or(z.literal('')),
    password:        z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    role:            z.enum(['ADMIN', 'GERENTE', 'CAIXA', 'GARCON', 'COZINHEIRO']),
    jobposition:     z.string().min(2, 'Cargo é obrigatório'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

function RoleDot({ role }) {
  const meta = ROLE_META[role?.toUpperCase()] ?? ROLE_META.USER;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      <span style={{ color: '#757575' }}>{meta.label}</span>
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', letterSpacing: '-0.01em' }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#757575' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function FormInput({ registration, error, placeholder, type = 'text', disabled = false }) {
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
          border: error ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0',
          color: disabled ? '#BDBDBD' : '#424242',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={(e) => { if (!disabled) e.target.style.border = '1px solid #2E7D32'; }}
        onBlur={(e) => { if (!disabled) e.target.style.border = error ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{error}</p>}
    </>
  );
}

function FormSelect({ registration, options, disabled = false }) {
  return (
    <select {...registration} disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm"
      style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', color: '#424242', outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: '#FFFFFF' }}>{o.label}</option>
      ))}
    </select>
  );
}

function Btn({ onClick, disabled, loading, children, variant = 'primary', type = 'button' }) {
  const styles = {
    primary: { bg: '#2E7D32', bgDisabled: '#A5D6A7', shadow: '0 4px 18px rgba(46,125,50,0.28)', color: '#fff' },
    danger:  { bg: '#C62828', bgDisabled: '#EF9A9A', shadow: '0 4px 18px rgba(198,40,40,0.25)', color: '#fff' },
    ghost:   { bg: '#F5F5F5', bgDisabled: '#F5F5F5', shadow: 'none', color: '#757575' },
  };
  const s = styles[variant];
  const off = disabled || loading;
  return (
    <button type={type} onClick={onClick} disabled={off}
      className="flex-1 py-2.5 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-2"
      style={{
        background: off && variant !== 'ghost' ? s.bgDisabled : s.bg,
        color: off && variant !== 'ghost' ? '#FFFFFF' : s.color,
        boxShadow: off ? 'none' : s.shadow,
        border: variant === 'ghost' ? '1px solid #E0E0E0' : 'none',
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.7 : 1,
      }}>
      {loading ? <Spinner /> : children}
    </button>
  );
}

function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconBtn({ onClick, title, icon, hoverColor = '#2E7D32' }) {
  return (
    <button onClick={onClick} title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', color: '#757575' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = hoverColor + '66'; e.currentTarget.style.background = hoverColor + '12'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#757575'; e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.background = '#F5F5F5'; }}>
      {icon}
    </button>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const ok = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold"
      style={{ background: ok ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${ok ? '#A5D6A7' : '#EF9A9A'}`, color: ok ? '#2E7D32' : '#C62828' }}>
      {ok
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      }
      {msg}
    </motion.div>
  );
}

function ModalOverlay({ onClose, children, width = 'max-w-md' }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${width} rounded-2xl shadow-2xl overflow-hidden`}
        style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHead({ icon, title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #E0E0E0' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#E8F5E9', border: '1px solid #A5D6A7' }}>
          <span style={{ color: '#2E7D32' }}>{icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#424242' }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: '#757575' }}>{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} className="p-1 rounded-lg transition-colors mt-0.5" style={{ color: '#BDBDBD' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#C62828')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#BDBDBD')}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function InlineAlert({ msg, type = 'error' }) {
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
      style={{ background: ok ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${ok ? '#A5D6A7' : '#EF9A9A'}`, color: ok ? '#2E7D32' : '#C62828' }}>
      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {msg}
    </div>
  );
}

function CreateUserModal({ isAdmin, onClose, onCreated }) {
  const roleOptions = isAdmin ? ROLE_OPTIONS_ADMIN : ROLE_OPTIONS_GERENTE;
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { username: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CAIXA', jobposition: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const created = await usersApi.create({
        username:    data.username.trim(),
        email:       data.email?.trim() || null,
        phone:       data.phone || null,
        password:    data.password,
        role:        data.role,
        jobposition: data.jobposition.trim(),
      });
      onCreated(created);
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Erro ao criar usuário.');
    }
  };

  return (
    <ModalOverlay onClose={onClose} width="max-w-lg">
      <ModalHead
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
        title="Novo Usuário"
        subtitle="Preencha os dados do novo usuário"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="px-6 py-5 flex flex-col gap-4">
          {serverError && <InlineAlert msg={serverError} />}

          <FieldGroup label="Username *">
            <FormInput registration={register('username')} error={errors.username?.message} placeholder="ex: joaosilva" />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="E-mail">
              <FormInput registration={register('email')} error={errors.email?.message} placeholder="ex: joao@email.com" type="email" />
            </FieldGroup>

            <FieldGroup label="Telefone">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="tel"
                      inputMode="numeric"
                      placeholder="(XX) XXXXX-XXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                      style={{ background: '#FFFFFF', border: errors.phone ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0', color: '#424242', outline: 'none' }}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      onFocus={(e) => (e.target.style.border = '1px solid #2E7D32')}
                      onBlur={(e) => { field.onBlur(); e.target.style.border = errors.phone ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
                    />
                    {errors.phone && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{errors.phone.message}</p>}
                  </>
                )}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Perfil *">
            <FormSelect registration={register('role')} options={roleOptions} />
          </FieldGroup>

          <FieldGroup label="Cargo *">
            <FormInput registration={register('jobposition')} error={errors.jobposition?.message} placeholder="Ex: Caixa de turno" />
          </FieldGroup>

          <FieldGroup label="Senha *">
            <FormInput registration={register('password')} error={errors.password?.message} placeholder="Mínimo 8 caracteres" type="password" />
          </FieldGroup>

          <FieldGroup label="Confirmar Senha *">
            <FormInput registration={register('confirmPassword')} error={errors.confirmPassword?.message} placeholder="Repita a senha" type="password" />
          </FieldGroup>

          <div className="flex gap-3 pt-1">
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" loading={isSubmitting}>Criar Usuário</Btn>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

function EditModal({ user, isAdmin, isGerente, meUsername, onClose, onSaved }) {
  const targetRole = user.role?.toUpperCase();
  const isSelf = meUsername === user.username;
  const blocked = isAdmin ? false
    : isGerente ? (targetRole === 'ADMIN' || (targetRole === 'GERENTE' && !isSelf))
    : true;
  const roleOptions = isAdmin ? ROLE_OPTIONS_ADMIN : ROLE_OPTIONS_GERENTE;

  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      username:    user.username,
      email:       user.email ?? '',
      phone:       user.phone ?? '',
      role:        user.role?.toUpperCase() ?? 'GERENTE',
      jobposition: user.jobposition ?? '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const updated = await usersApi.update(user.id, {
        username:    data.username.trim(),
        email:       data.email?.trim() || null,
        phone:       data.phone || null,
        password:    null,
        role:        data.role,
        jobposition: data.jobposition.trim(),
      });
      onSaved(updated);
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Erro ao atualizar usuário.');
    }
  };

  return (
    <ModalOverlay onClose={onClose} width="max-w-lg">
      <ModalHead
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
        title="Editar Usuário"
        subtitle={`Editando: @${user.username}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="px-6 py-5 flex flex-col gap-4">
          {blocked && <InlineAlert msg={
            targetRole === 'ADMIN' ? 'Você não tem permissão para editar usuários Admin.'
            : targetRole === 'GERENTE' ? 'Gerente só pode editar o próprio perfil.'
            : 'Sem permissão para editar este usuário.'
          } />}
          {serverError && <InlineAlert msg={serverError} />}

          <FieldGroup label="Username *">
            <FormInput registration={register('username')} error={errors.username?.message} placeholder="username" disabled={blocked} />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="E-mail">
              <FormInput registration={register('email')} error={errors.email?.message} placeholder="ex: joao@email.com" type="email" disabled={blocked} />
            </FieldGroup>

            <FieldGroup label="Telefone">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="tel"
                      inputMode="numeric"
                      placeholder="(XX) XXXXX-XXXX"
                      disabled={blocked}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                      style={{ background: blocked ? '#F5F5F5' : '#FFFFFF', border: errors.phone ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0', color: blocked ? '#BDBDBD' : '#424242', outline: 'none', cursor: blocked ? 'not-allowed' : 'text' }}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      onFocus={(e) => { if (!blocked) e.target.style.border = '1px solid #2E7D32'; }}
                      onBlur={(e) => { field.onBlur(); if (!blocked) e.target.style.border = errors.phone ? '1px solid rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
                    />
                    {errors.phone && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{errors.phone.message}</p>}
                  </>
                )}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Perfil *">
            <FormSelect registration={register('role')} options={roleOptions} disabled={blocked} />
          </FieldGroup>

          <FieldGroup label="Cargo *">
            <FormInput registration={register('jobposition')} error={errors.jobposition?.message} placeholder="Ex: Gerente de turno" disabled={blocked} />
          </FieldGroup>

          <div className="flex gap-3 pt-1">
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" loading={isSubmitting} disabled={blocked}>Salvar</Btn>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

function ResetModal({ user, isAdmin, isGerente, meUsername, onClose, onSaved }) {
  const targetRole = user.role?.toUpperCase();
  const isSelf = meUsername === user.username;
  const blocked = isAdmin ? false
    : isGerente ? (targetRole === 'ADMIN' || (targetRole === 'GERENTE' && !isSelf))
    : true;

  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPwValue = watch('newPassword', '');
  const confirmValue = watch('confirmPassword', '');
  const matches = newPwValue.length > 0 && newPwValue === confirmValue;

  function strengthOf(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }
  const strength = strengthOf(newPwValue);
  const strengthColors = ['#FFCDD2', '#EF9A9A', '#F57C00', '#FFA726', '#2E7D32', '#2E7D32'];

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await usersApi.resetPassword(user.id, { newPassword: data.newPassword });
      onSaved();
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Erro ao redefinir senha.');
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHead
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
        title="Redefinir Senha"
        subtitle={`Usuário: @${user.username}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="px-6 py-5 flex flex-col gap-4">
          {blocked && <InlineAlert msg={
            targetRole === 'ADMIN' ? 'Você não tem permissão para redefinir senha de usuários Admin.'
            : targetRole === 'GERENTE' ? 'Gerente só pode redefinir a própria senha.'
            : 'Sem permissão para redefinir senha deste usuário.'
          } />}
          {serverError && <InlineAlert msg={serverError} />}

          <FieldGroup label="Nova Senha">
            <input {...register('newPassword')} type="password" placeholder="Mínimo 8 caracteres" disabled={blocked}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: blocked ? '#F5F5F5' : '#FFFFFF', border: `1px solid ${errors.newPassword ? 'rgba(198,40,40,0.55)' : '#E0E0E0'}`, color: blocked ? '#BDBDBD' : '#424242', outline: 'none' }}
              onFocus={(e) => { if (!blocked) e.target.style.border = '1px solid #2E7D32'; }}
              onBlur={(e) => { if (!blocked) e.target.style.border = errors.newPassword ? 'rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
            />
            {errors.newPassword && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{errors.newPassword.message}</p>}
            {newPwValue && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: i < strength ? strengthColors[strength] : '#E0E0E0' }} />
                ))}
              </div>
            )}
          </FieldGroup>

          <FieldGroup label="Confirmar Nova Senha">
            <input {...register('confirmPassword')} type="password" placeholder="Repita a senha" disabled={blocked}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: blocked ? '#F5F5F5' : '#FFFFFF', border: `1px solid ${errors.confirmPassword ? 'rgba(198,40,40,0.55)' : '#E0E0E0'}`, color: blocked ? '#BDBDBD' : '#424242', outline: 'none' }}
              onFocus={(e) => { if (!blocked) e.target.style.border = '1px solid #2E7D32'; }}
              onBlur={(e) => { if (!blocked) e.target.style.border = errors.confirmPassword ? 'rgba(198,40,40,0.55)' : '1px solid #E0E0E0'; }}
            />
            {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#C62828' }}>{errors.confirmPassword.message}</p>}
            {confirmValue && !errors.confirmPassword && (
              <p className="text-xs mt-1.5" style={{ color: matches ? '#2E7D32' : '#C62828' }}>
                {matches ? '✓ Senhas coincidem' : 'Senhas não coincidem'}
              </p>
            )}
          </FieldGroup>

          <div className="flex gap-3 pt-1">
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" loading={isSubmitting} disabled={blocked}>Redefinir</Btn>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

function DeleteModal({ user, isAdmin, isGerente, onClose, onDeleted }) {
  const protected_ = ['ADMIN', 'GERENTE'].includes(user.role?.toUpperCase());
  const canDelete = (isAdmin || isGerente) && !protected_;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    try {
      setLoading(true);
      await usersApi.delete(user.id);
      onDeleted(user.id);
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Erro ao excluir usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHead
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
        title="Excluir Usuário"
        onClose={onClose}
      />
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: '#FFEBEE', border: '1px solid #EF9A9A' }}>
          <Avatar name={user.username} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#424242' }}>@{user.username}</p>
            <p className="text-xs mt-0.5" style={{ color: '#757575' }}>{user.jobposition || 'Sem cargo'}</p>
          </div>
          <div className="ml-auto"><RoleDot role={user.role} /></div>
        </div>

        <p className="text-sm text-center" style={{ color: '#757575' }}>
          Esta ação é <span style={{ color: '#C62828', fontWeight: 600 }}>irreversível</span>. O usuário será removido permanentemente.
        </p>

        {!canDelete && <InlineAlert msg={protected_ ? 'Usuários Admin e Gerente não podem ser excluídos.' : 'Sem permissão para excluir este usuário.'} />}
        {error && <InlineAlert msg={error} />}

        <div className="flex gap-3 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="danger" onClick={handleDelete} loading={loading} disabled={!canDelete}>Excluir</Btn>
        </div>
      </div>
    </ModalOverlay>
  );
}

export default function GestaoUsuarios() {
  const me = useAuthStore((s) => s.user);
  const isAdmin   = me?.role === 'admin';
  const isGerente = me?.role === 'gerente';

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modal,      setModal]      = useState(null);
  const [toastState, setToastState] = useState(null);

  const notify = useCallback((msg, type = 'success') => setToastState({ msg, type }), []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setUsers(await usersApi.list());
    } catch {
      notify('Erro ao carregar usuários.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(q) ||
      (u.jobposition ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q);
    const matchRole = roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total:   users.length,
    admin:   users.filter((u) => u.role?.toUpperCase() === 'ADMIN').length,
    gerente: users.filter((u) => u.role?.toUpperCase() === 'GERENTE').length,
    outros:  users.filter((u) => !['ADMIN', 'GERENTE'].includes(u.role?.toUpperCase())).length,
  };

  const handleCreated = (created) => {
    setUsers((p) => [...p, created]);
    setModal(null);
    notify('Usuário criado com sucesso.');
  };
  const handleSaved = (updated) => {
    setUsers((p) => p.map((u) => (u.id === updated.id ? updated : u)));
    setModal(null);
    notify('Usuário atualizado com sucesso.');
  };
  const handleDeleted = (id) => {
    setUsers((p) => p.filter((u) => u.id !== id));
    setModal(null);
    notify('Usuário excluído com sucesso.');
  };
  const handleReset = () => { setModal(null); notify('Senha redefinida com sucesso.'); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col min-h-screen"
      style={{ background: '#F5F5F5' }}>
      <Sidebar />

      <main className="relative flex-1 px-4 py-8 sm:px-8" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: '#2E7D32' }} />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#424242' }}>
                Gestão de Usuários
              </h1>
            </div>
            {(isAdmin || isGerente) && (
              <button
                onClick={() => setModal({ type: 'create' })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
                style={{ background: '#2E7D32', color: '#fff', border: 'none', boxShadow: '0 4px 18px rgba(46,125,50,0.28)', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1B5E20')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2E7D32')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Novo Usuário
              </button>
            )}
          </div>
          <p className="ml-4 text-sm" style={{ color: '#757575' }}>
            Consulte, edite e gerencie todos os usuários do sistema
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',       value: stats.total,   color: '#F57C00' },
            { label: 'Admin',       value: stats.admin,   color: '#C62828' },
            { label: 'Gerente',     value: stats.gerente, color: '#F57C00' },
            { label: 'Operacional', value: stats.outros,  color: '#2E7D32' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} whileHover={{ y: -2 }} className="rounded-2xl p-5"
              style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#757575' }}>{label}</p>
              <p className="text-3xl font-bold" style={{ color: loading ? '#BDBDBD' : color }}>
                {loading ? '—' : value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="#BDBDBD">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuário ou cargo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', color: '#424242', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              onFocus={(e) => (e.target.style.border = '1px solid #2E7D32')}
              onBlur={(e) => (e.target.style.border = '1px solid #E0E0E0')}
            />
          </div>
          <button onClick={load}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
            style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#C8E6C9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#E8F5E9')}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {FILTER_TABS.map(({ value, label }) => {
            const active = roleFilter === value;
            return (
              <button key={value} onClick={() => setRoleFilter(value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: active ? '#E8F5E9' : '#FFFFFF', border: active ? '1px solid #A5D6A7' : '1px solid #E0E0E0', color: active ? '#2E7D32' : '#757575' }}>
                {label}
                {value !== 'ALL' && !loading && (
                  <span className="ml-1.5 text-xs" style={{ color: active ? '#2E7D32' : '#BDBDBD' }}>
                    {users.filter((u) => u.role?.toUpperCase() === value).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

          <div className="hidden sm:grid px-5 py-3 text-xs font-bold uppercase tracking-widest"
            style={{ gridTemplateColumns: '2.5fr 1fr 2fr auto', color: '#BDBDBD', borderBottom: '1px solid #F5F5F5', background: '#F5F5F5' }}>
            <span>Usuário</span><span>Perfil</span><span>Cargo</span><span className="text-right">Ações</span>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#A5D6A7', borderTopColor: '#2E7D32' }} />
              <p className="text-xs" style={{ color: '#BDBDBD' }}>Carregando usuários...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#BDBDBD">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm" style={{ color: '#BDBDBD' }}>
                {search || roleFilter !== 'ALL' ? 'Nenhum resultado para este filtro.' : 'Nenhum usuário cadastrado.'}
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && filtered.map((u, i) => (
            <motion.div key={u.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              className="flex flex-col sm:grid px-5 py-4 gap-2 sm:gap-0 transition-colors"
              style={{ gridTemplateColumns: '2.5fr 1fr 2fr auto', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F5' : 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>

              <div className="flex items-center gap-3">
                <Avatar name={u.username} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#424242' }}>{u.username}</p>
                  {u.email && (
                    <p className="text-xs truncate" style={{ color: '#9E9E9E' }}>{u.email}</p>
                  )}
                  {u.phone && (
                    <p className="text-xs" style={{ color: '#9E9E9E' }}>{u.phone}</p>
                  )}
                  {!u.email && !u.phone && (
                    <p className="text-xs" style={{ color: '#BDBDBD' }}>ID #{u.id}</p>
                  )}
                </div>
              </div>

              <div className="sm:block"><RoleDot role={u.role} /></div>

              <p className="text-sm truncate" style={{ color: '#757575' }}>
                {u.jobposition || <span style={{ color: '#BDBDBD' }}>—</span>}
              </p>

              <div className="flex items-center justify-end gap-1.5">
                <IconBtn title="Editar usuário" hoverColor="#1565C0"
                  onClick={() => setModal({ type: 'edit', user: u })}
                  icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                />
                <IconBtn title="Redefinir senha" hoverColor="#6A1B9A"
                  onClick={() => setModal({ type: 'reset', user: u })}
                  icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                />
                {(isAdmin || isGerente) && (
                  <IconBtn title="Excluir usuário" hoverColor="#C62828"
                    onClick={() => setModal({ type: 'delete', user: u })}
                    icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && (
          <p className="text-xs mt-3 text-right" style={{ color: '#BDBDBD' }}>
            {filtered.length} de {users.length} usuário{users.length !== 1 ? 's' : ''}
          </p>
        )}
      </main>

      <AnimatePresence>
        {modal?.type === 'create' && <CreateUserModal key="create" isAdmin={isAdmin} onClose={() => setModal(null)} onCreated={handleCreated} />}
        {modal?.type === 'edit'   && <EditModal   key="edit"   user={modal.user} isAdmin={isAdmin} isGerente={isGerente} meUsername={me?.sub} onClose={() => setModal(null)} onSaved={handleSaved} />}
        {modal?.type === 'reset'  && <ResetModal  key="reset"  user={modal.user} isAdmin={isAdmin} isGerente={isGerente} meUsername={me?.sub} onClose={() => setModal(null)} onSaved={handleReset} />}
        {modal?.type === 'delete' && <DeleteModal key="delete" user={modal.user} isAdmin={isAdmin} isGerente={isGerente} onClose={() => setModal(null)} onDeleted={handleDeleted} />}
      </AnimatePresence>

      <AnimatePresence>
        {toastState && <Toast key="toast" msg={toastState.msg} type={toastState.type} onClose={() => setToastState(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
