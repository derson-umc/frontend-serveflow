import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '@shared/components/layout/Sidebar';
import { palette } from '@styles/ds';
import { ROLES, schema } from './constants';
import { useRegisterUser } from './hooks/useRegisterUser';

function UserSectionNav() {
  const location = useLocation();
  const tabs = [
    { to: '/gestao-usuarios', label: 'Gerenciar Usuários' },
    { to: '/usuarios',        label: 'Lista de Usuários'  },
    { to: '/cadastro',        label: 'Cadastrar Usuário'  },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${palette.border}` }}>
      {tabs.map(({ to, label }) => {
        const active = location.pathname === to;
        return (
          <Link key={to} to={to} style={{
            padding:        '9px 16px',
            fontSize:       13,
            fontWeight:     active ? 700 : 500,
            color:          active ? palette.green : palette.textMuted,
            borderBottom:   active ? `2px solid ${palette.green}` : '2px solid transparent',
            textDecoration: 'none',
            whiteSpace:     'nowrap',
            transition:     'color 0.15s',
            marginBottom:   -1,
          }}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function Register() {
  const registerUser          = useRegisterUser();
  const [serverError, setServerError] = useState('');
  const [success,     setSuccess]     = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      zodResolver(schema),
    defaultValues: { username: '', password: '', role: 'gerente', jobposition: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    try {
      await registerUser.mutateAsync(data);
      setSuccess(`Usuário "${data.username}" cadastrado com sucesso!`);
      reset();
    } catch (err) {
      setServerError(err?.response?.data?.error || err?.response?.data?.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: palette.background }}>
      <Sidebar />
      <div className="flex-1 py-8 px-4 sm:px-8" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <UserSectionNav />
        <div className="flex items-center justify-center">
        <div className="w-full max-w-md">

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full"
                style={{ background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})` }} />
              <h1 className="text-2xl font-bold" style={{ color: palette.textSecondary }}>Cadastrar Usuário</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: palette.textMuted }}>Criar e gerenciar usuários do sistema</p>
          </div>

          <div className="rounded-2xl p-7 shadow-sm"
            style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>

            <AnimatePresence>
              {serverError && (
                <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red }}>
                  {serverError}
                </motion.div>
              )}
              {success && (
                <motion.div key="ok" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: palette.greenSurface, border: `1px solid ${palette.greenBorder}`, color: palette.green }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: palette.textMuted }}>Usuário</label>
                <input
                  {...register('username')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Digite o nome de usuário"
                  style={{ background: palette.surface, border: `1.5px solid ${errors.username ? palette.red : palette.border}`, color: palette.textSecondary }}
                />
                {errors.username && <p className="text-xs mt-1" style={{ color: palette.red }}>{errors.username.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: palette.textMuted }}>Senha</label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Mínimo 8 caracteres"
                  style={{ background: palette.surface, border: `1.5px solid ${errors.password ? palette.red : palette.border}`, color: palette.textSecondary }}
                />
                {errors.password && <p className="text-xs mt-1" style={{ color: palette.red }}>{errors.password.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: palette.textMuted }}>Perfil</label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2.5">
                      {ROLES.map(({ value, label, desc, icon }) => (
                        <button key={value} type="button" onClick={() => field.onChange(value)}
                          className="text-left p-3 rounded-xl transition-all"
                          style={{
                            background: field.value === value ? palette.greenSurface : palette.surface,
                            border: `1.5px solid ${field.value === value ? palette.green : palette.border}`,
                          }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontSize: 16 }}>{icon}</span>
                            <span className="font-semibold text-sm"
                              style={{ color: field.value === value ? palette.green : palette.textSecondary }}>
                              {label}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: palette.textMuted }}>{desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: palette.textMuted }}>Cargo</label>
                <input
                  {...register('jobposition')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Ex: Garçom noturno"
                  style={{ background: palette.surface, border: `1.5px solid ${errors.jobposition ? palette.red : palette.border}`, color: palette.textSecondary }}
                />
                {errors.jobposition && <p className="text-xs mt-1" style={{ color: palette.red }}>{errors.jobposition.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: palette.green,
                  color:      palette.white,
                  border:     'none',
                  boxShadow:  '0 4px 16px rgba(46,125,50,0.3)',
                  opacity:    isSubmitting ? 0.7 : 1,
                  cursor:     isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = palette.greenDark; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = palette.green; }}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
