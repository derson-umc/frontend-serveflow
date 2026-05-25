import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '@shared/components/layout/Sidebar';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { SkeletonRow } from '@shared/components/feedback/Skeleton';
import { useDocumentTitle } from '@shared/hooks/use-document-title';
import { ROLE_LABELS, ROLE_COLORS } from './constants';
import UserFormModal from './components/UserFormModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import { useUsers } from './hooks/useUsers';
import { palette } from '@styles/ds';

function UserSectionNav({ canManage }) {
  const location = useLocation();

  const tabs = [
    { to: '/gestao-usuarios', label: 'Gerenciar Usuários', adminOnly: true  },
    { to: '/usuarios',        label: 'Lista de Usuários',  adminOnly: false },
    ...(canManage ? [{ to: '/cadastro', label: 'Cadastrar Usuário', adminOnly: true }] : []),
  ].filter((t) => !t.adminOnly || canManage);

  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${palette.border}` }}>
      {tabs.map(({ to, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            style={{
              padding:        '9px 16px',
              fontSize:       13,
              fontWeight:     active ? 700 : 500,
              color:          active ? palette.green : palette.textMuted,
              borderBottom:   active ? `2px solid ${palette.green}` : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace:     'nowrap',
              transition:     'color 0.15s',
              marginBottom:   -1,
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function Users() {
  useDocumentTitle('Usuarios');
  const currentUser = useAuthStore((s) => s.user);
  const [notice,     setNotice]     = useState({ type: '', msg: '' });
  const [resetModal, setResetModal] = useState(null);
  const [formModal,  setFormModal]  = useState(null);

  const { users, isLoading, deleteUser } = useUsers();

  const currentRole = currentUser?.role?.toUpperCase();
  const isAdmin     = currentRole === 'ADMIN';
  const isGerente   = currentRole === 'GERENTE';
  const canManage   = isAdmin || isGerente;

  const canEditUser   = (u) => isAdmin || (isGerente && u.role !== 'ADMIN' && u.role !== 'GERENTE');
  const canDeleteUser = (u) => isAdmin && u.role !== 'ADMIN';

  const handleDelete = async (u) => {
    if (!window.confirm(`Deseja excluir o usuário "${u.username}"?`)) return;
    try {
      await deleteUser.mutateAsync(u.id);
      setNotice({ type: 'ok', msg: `Usuário "${u.username}" excluído.` });
    } catch (err) {
      setNotice({ type: 'err', msg: err?.response?.data?.error || 'Erro ao excluir.' });
    }
  };

  const clearNotice = () => setNotice({ type: '', msg: '' });

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: palette.background }}>
      <Sidebar />
      <div className="relative flex-1 px-4 py-8 sm:px-8" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <UserSectionNav canManage={canManage} />

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: palette.green }} />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: palette.textSecondary }}>
                Lista de Usuários
              </h1>
            </div>
            <p className="text-sm ml-4" style={{ color: palette.textMuted }}>Gerenciar usuários e redefinir senhas</p>
          </div>

          {canManage && (
            <button
              onClick={() => { setFormModal({ mode: 'create' }); clearNotice(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ background: palette.green, color: palette.white, border: 'none', boxShadow: '0 4px 18px rgba(46,125,50,0.28)', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = palette.greenDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = palette.green)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Novo Usuário
            </button>
          )}
        </div>

        {notice.msg && (
          <div className="mb-4 px-3 py-2.5 rounded-lg" style={{
            background: notice.type === 'err' ? palette.redSurface : palette.greenSurface,
            border:     notice.type === 'err' ? `1px solid ${palette.redBorder}` : `1px solid ${palette.greenBorder}`,
          }}>
            <p className="text-sm" style={{ color: notice.type === 'err' ? palette.red : palette.green }}>{notice.msg}</p>
          </div>
        )}

        {isLoading ? (
          <SkeletonRow count={4} />
        ) : users.length === 0 ? (
          <div className="rounded-2xl p-10 text-center"
            style={{ background: palette.white, border: `1px solid ${palette.border}` }}>
            <p style={{ color: palette.textMuted }}>Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.USER;
              return (
                <div key={u.id}
                  className="flex items-center justify-between px-5 py-4 rounded-xl"
                  style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ background: palette.greenSurface, color: palette.green, border: `1px solid ${palette.greenBorder}` }}>
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: palette.textPrimary }}>{u.username}</p>
                      <p className="text-xs truncate" style={{ color: palette.textMuted }}>{u.jobposition || '—'}</p>
                      {u.email && <span className="text-xs truncate" style={{ color: palette.textMuted }}>{u.email}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>

                    {canEditUser(u) && (
                      <button onClick={() => { setFormModal({ mode: 'edit', user: u }); clearNotice(); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: palette.surface, color: palette.textMuted, border: `1px solid ${palette.border}`, cursor: 'pointer' }}>
                        Editar
                      </button>
                    )}

                    {canEditUser(u) && (
                      <button onClick={() => { setResetModal(u); clearNotice(); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: palette.orangeSurface, color: palette.orange, border: `1px solid ${palette.orangeBorder}`, cursor: 'pointer' }}>
                        Redefinir senha
                      </button>
                    )}

                    {canDeleteUser(u) && (
                      <button onClick={() => handleDelete(u)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: palette.redSurface, color: palette.red, border: `1px solid ${palette.redBorder}`, cursor: 'pointer' }}>
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {resetModal && (
        <ResetPasswordModal
          user={resetModal}
          onClose={() => { setResetModal(null); clearNotice(); }}
          onSuccess={(msg) => { setNotice({ type: 'ok', msg }); setResetModal(null); }}
        />
      )}

      {formModal && (
        <UserFormModal
          mode={formModal.mode}
          user={formModal.user}
          currentUserRole={currentRole}
          onClose={() => setFormModal(null)}
          onSaved={() => {
            setFormModal(null);
            setNotice({ type: 'ok', msg: formModal.mode === 'create' ? 'Usuário criado com sucesso.' : 'Usuário atualizado com sucesso.' });
          }}
        />
      )}
    </div>
  );
}
