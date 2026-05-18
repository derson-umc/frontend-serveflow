import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Sidebar from '../components/ui/Sidebar';
import { usersApi } from '../services/api/users';

const G  = '#2E7D32';
const GD = '#1B5E20';
const GF = '#E8F5E9';
const O  = '#F57C00';
const D  = '#424242';
const M  = '#757575';
const B  = '#E0E0E0';
const W  = '#FFFFFF';

const ROLES = [
  { value: 'gerente',    label: 'Gerente',   desc: 'Acesso administrativo', icon: '🏢' },
  { value: 'caixa',      label: 'Caixa',     desc: 'Pagamentos e vendas',   icon: '💳' },
  { value: 'garcon',     label: 'Garçom',    desc: 'Atendimento e pedidos', icon: '🍽️' },
  { value: 'cozinheiro', label: 'Cozinheiro',desc: 'Preparo e produção',    icon: '👨‍🍳' },
];

const schema = z.object({
  username:    z.string().min(3, 'Mínimo 3 caracteres').max(64, 'Máximo 64 caracteres').regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, . _ -'),
  password:    z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Senha muito longa'),
  role:        z.enum(['gerente', 'caixa', 'garcon', 'cozinheiro']),
  jobposition: z.string().min(2, 'Informe o cargo').max(100, 'Cargo muito longo'),
});

export default function Cadastro() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '', role: 'gerente', jobposition: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    try {
      await usersApi.create({ ...data, role: data.role.toUpperCase() });
      setSuccess(`Usuário "${data.username}" cadastrado com sucesso!`);
      reset();
    } catch (err) {
      setServerError(err?.response?.data?.error || err?.response?.data?.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F5F5' }}>
      <Sidebar />
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
              <h1 className="text-2xl font-bold" style={{ color: D }}>Cadastrar Usuário</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: M }}>Criar e gerenciar usuários do sistema</p>
          </div>

          <div className="rounded-2xl p-7 shadow-sm"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>

            {serverError && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828' }}>
                {serverError}
              </div>
            )}
            {success && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: GF, border: '1px solid #A5D6A7', color: G }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>Usuário</label>
                <input
                  {...register('username')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Digite o nome de usuário"
                  style={{ background: '#FAFAFA', border: `1.5px solid ${errors.username ? '#EF5350' : B}`, color: D }}
                />
                {errors.username && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.username.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>Senha</label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Mínimo 8 caracteres"
                  style={{ background: '#FAFAFA', border: `1.5px solid ${errors.password ? '#EF5350' : B}`, color: D }}
                />
                {errors.password && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.password.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: M }}>Perfil</label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2.5">
                      {ROLES.map(({ value, label, desc, icon }) => (
                        <button key={value} type="button" onClick={() => field.onChange(value)}
                          className="text-left p-3 rounded-xl transition-all"
                          style={{
                            background: field.value === value ? GF : '#FAFAFA',
                            border: `1.5px solid ${field.value === value ? G : B}`,
                          }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontSize: 16 }}>{icon}</span>
                            <span className="font-semibold text-sm" style={{ color: field.value === value ? G : D }}>{label}</span>
                          </div>
                          <p className="text-xs" style={{ color: M }}>{desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>Cargo</label>
                <input
                  {...register('jobposition')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Ex: Garçom noturno"
                  style={{ background: '#FAFAFA', border: `1.5px solid ${errors.jobposition ? '#EF5350' : B}`, color: D }}
                />
                {errors.jobposition && <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{errors.jobposition.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: G, color: W, border: 'none',
                  boxShadow: '0 4px 16px rgba(46,125,50,0.3)',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = GD; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = G; }}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
