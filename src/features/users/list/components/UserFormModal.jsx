import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';
import { ROLE_OPTIONS, EMPTY_FORM } from '../constants';

function useUserForm(mode, userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      mode === 'create'
        ? usersApi.create(payload)
        : usersApi.update(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export default function UserFormModal({ mode, user, currentUserRole, onClose, onSaved }) {
  const save = useUserForm(mode, user?.id);

  const [form, setForm] = useState(() =>
    mode === 'edit'
      ? { username: user.username || '', email: user.email || '', jobposition: user.jobposition || '', role: user.role || 'GARCON', password: '', confirmPassword: '' }
      : { ...EMPTY_FORM }
  );
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [serverError,  setServerError]  = useState('');

  const isGerente = currentUserRole?.toUpperCase() === 'GERENTE';

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.username.trim() || form.username.trim().length < 3)   errs.username = 'Mínimo 3 caracteres';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'E-mail inválido';
    if (!form.jobposition.trim() || form.jobposition.trim().length < 2) errs.jobposition = 'Mínimo 2 caracteres';
    if (!form.role) errs.role = 'Selecione um perfil';
    if (mode === 'create') {
      if (!form.password || form.password.length < 8)         errs.password = 'Mínimo 8 caracteres';
      if (form.password !== form.confirmPassword)              errs.confirmPassword = 'Senhas não coincidem';
    } else if (form.password) {
      if (form.password.length < 8)                            errs.password = 'Mínimo 8 caracteres';
      if (form.password !== form.confirmPassword)              errs.confirmPassword = 'Senhas não coincidem';
    }
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    const payload = {
      username:    form.username.trim(),
      email:       form.email.trim() || null,
      jobposition: form.jobposition.trim(),
      role:        form.role,
      password:    form.password || null,
    };

    setServerError('');
    try {
      await save.mutateAsync(payload);
      onSaved();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.fields) {
        setFieldErrors(Object.fromEntries(Object.entries(data.fields)));
      } else {
        setServerError(data?.error || 'Erro ao salvar usuário.');
      }
    }
  }

  const inputStyle = (field) => ({
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${fieldErrors[field] ? 'rgba(248,113,113,0.5)' : 'rgba(228,96,51,0.18)'}`,
    color: '#fff1f2',
    outline: 'none',
  });

  const labelStyle = { color: '#7a3518', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const errStyle   = { color: '#f87171', fontSize: '0.7rem', marginTop: 4 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md mx-4 rounded-2xl"
        style={{ background: 'rgba(10,2,4,0.97)', border: '1px solid rgba(228,96,51,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: '#fff1f2' }}>
              {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
            </h2>
            <button onClick={onClose} style={{ color: '#7a3518', lineHeight: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {serverError && (
            <div className="mb-4 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(228,96,51,0.08)', border: '1px solid rgba(228,96,51,0.28)' }}>
              <p className="text-xs" style={{ color: '#f87171' }}>{serverError}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Username *</label>
              <input className="w-full px-4 py-3 rounded-xl text-sm mt-1.5" style={inputStyle('username')}
                value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="ex: joaosilva" autoFocus />
              {fieldErrors.username && <p style={errStyle}>{fieldErrors.username}</p>}
            </div>

            <div>
              <label style={labelStyle}>E-mail</label>
              <input className="w-full px-4 py-3 rounded-xl text-sm mt-1.5" style={inputStyle('email')}
                value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ex: joao@email.com" type="email" />
              {fieldErrors.email && <p style={errStyle}>{fieldErrors.email}</p>}
            </div>

            <div>
              <label style={labelStyle}>Cargo *</label>
              <input className="w-full px-4 py-3 rounded-xl text-sm mt-1.5" style={inputStyle('jobposition')}
                value={form.jobposition} onChange={(e) => set('jobposition', e.target.value)} placeholder="ex: Garçom, Cozinheiro" />
              {fieldErrors.jobposition && <p style={errStyle}>{fieldErrors.jobposition}</p>}
            </div>

            <div>
              <label style={labelStyle}>Perfil *</label>
              <select className="w-full px-4 py-3 rounded-xl text-sm mt-1.5"
                style={{ ...inputStyle('role'), appearance: 'none' }}
                value={form.role} onChange={(e) => set('role', e.target.value)}>
                {ROLE_OPTIONS.filter((o) => !(isGerente && o.value === 'ADMIN')).map((o) => (
                  <option key={o.value} value={o.value} style={{ background: '#100503' }}>{o.label}</option>
                ))}
              </select>
              {fieldErrors.role && <p style={errStyle}>{fieldErrors.role}</p>}
            </div>

            <div>
              <label style={labelStyle}>{mode === 'create' ? 'Senha *' : 'Nova Senha'}</label>
              {mode === 'edit' && <span className="ml-2 text-xs" style={{ color: '#7a3518' }}>(deixe em branco para manter)</span>}
              <div className="relative mt-1.5">
                <input className="w-full px-4 py-3 rounded-xl text-sm pr-10" style={inputStyle('password')}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={(e) => set('password', e.target.value)}
                  placeholder={mode === 'create' ? 'Mínimo 8 caracteres' : 'Nova senha (opcional)'} />
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
              {fieldErrors.password && <p style={errStyle}>{fieldErrors.password}</p>}
            </div>

            {(form.password || mode === 'create') && (
              <div>
                <label style={labelStyle}>Confirmar Senha *</label>
                <input className="w-full px-4 py-3 rounded-xl text-sm mt-1.5" style={inputStyle('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Repita a senha" />
                {fieldErrors.confirmPassword && <p style={errStyle}>{fieldErrors.confirmPassword}</p>}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#7a3518', border: '1px solid rgba(228,96,51,0.12)' }}>
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={save.isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: save.isPending ? 'rgba(228,96,51,0.15)' : 'linear-gradient(135deg, #e46033, #b84020)',
                color: '#fff',
                opacity: save.isPending ? 0.7 : 1,
                cursor: save.isPending ? 'not-allowed' : 'pointer',
              }}>
              {save.isPending ? 'Salvando...' : mode === 'create' ? 'Criar Usuário' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
