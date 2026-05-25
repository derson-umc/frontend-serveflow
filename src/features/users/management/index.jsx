import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useUserManagement } from './hooks/useUserManagement';
import { UserTable } from './components/UserTable';
import { CreateModal } from './components/CreateModal';
import { EditModal } from './components/EditModal';
import { ResetModal } from './components/ResetModal';
import { DeleteModal } from './components/DeleteModal';
import { PageToast } from './shared';
import Sidebar from '@shared/components/layout/Sidebar';
import { palette } from '@styles/ds';

const STAT_ITEMS = (stats, loading) => [
  { label: 'Total',       value: stats.total,   color: '#F57C00' },
  { label: 'Admin',       value: stats.admin,   color: '#C62828' },
  { label: 'Gerente',     value: stats.gerente, color: '#F57C00' },
  { label: 'Operacional', value: stats.outros,  color: '#2E7D32' },
].map((s) => ({ ...s, display: loading ? '—' : s.value }));

function UserSectionNav({ isAdmin, isGerente }) {
  const location = useLocation();
  const canRegister = isAdmin || isGerente;

  const tabs = [
    { to: '/gestao-usuarios', label: 'Gerenciar Usuários' },
    { to: '/usuarios',        label: 'Lista de Usuários'  },
    ...(canRegister ? [{ to: '/cadastro', label: 'Cadastrar Usuário' }] : []),
  ];

  return (
    <div style={{
      display:      'flex',
      gap:          4,
      marginBottom: 24,
      borderBottom: `1px solid ${palette.border}`,
      paddingBottom: 0,
    }}>
      {tabs.map(({ to, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            style={{
              padding:       '9px 16px',
              fontSize:      13,
              fontWeight:    active ? 700 : 500,
              color:         active ? palette.green : palette.textMuted,
              borderBottom:  active ? `2px solid ${palette.green}` : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace:    'nowrap',
              transition:    'color 0.15s',
              marginBottom:  -1,
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function UserManagement() {
  const gu = useUserManagement();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col min-h-screen"
      style={{ background: palette.background }}
    >
      <Sidebar />
      <main className="relative flex-1 px-4 py-8 sm:px-8" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <UserSectionNav isAdmin={gu.isAdmin} isGerente={gu.isGerente} />

        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: palette.green }} />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: palette.textSecondary }}>
                Gestão de Usuários
              </h1>
            </div>
            {(gu.isAdmin || gu.isGerente) && (
              <button
                onClick={() => gu.setModal({ type: 'create' })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
                style={{ background: palette.green, color: palette.white, border: 'none', boxShadow: '0 4px 18px rgba(46,125,50,0.28)', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = palette.greenDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = palette.green)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Novo Usuário
              </button>
            )}
          </div>
          <p className="ml-4 text-sm" style={{ color: palette.textMuted }}>
            Consulte, edite e gerencie todos os usuários do sistema
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_ITEMS(gu.stats, gu.loading).map(({ label, display, color }) => (
            <motion.div
              key={label}
              whileHover={{ y: -2 }}
              className="rounded-2xl p-5"
              style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#757575' }}>{label}</p>
              <p className="text-3xl font-bold" style={{ color: gu.loading ? '#BDBDBD' : color }}>{display}</p>
            </motion.div>
          ))}
        </div>

        <UserTable
          users={gu.users}
          filtered={gu.filtered}
          loading={gu.loading}
          search={gu.search}
          setSearch={gu.setSearch}
          roleFilter={gu.roleFilter}
          setRoleFilter={gu.setRoleFilter}
          onRefresh={gu.load}
          isAdmin={gu.isAdmin}
          isGerente={gu.isGerente}
          onEdit={(u)   => gu.setModal({ type: 'edit',   user: u })}
          onReset={(u)  => gu.setModal({ type: 'reset',  user: u })}
          onDelete={(u) => gu.setModal({ type: 'delete', user: u })}
        />
      </main>

      <AnimatePresence>
        {gu.modal?.type === 'create' && (
          <CreateModal
            key="create"
            isAdmin={gu.isAdmin}
            onClose={() => gu.setModal(null)}
            onCreated={gu.handleCreated}
          />
        )}
        {gu.modal?.type === 'edit' && (
          <EditModal
            key="edit"
            user={gu.modal.user}
            isAdmin={gu.isAdmin}
            isGerente={gu.isGerente}
            meUsername={gu.me?.sub}
            onClose={() => gu.setModal(null)}
            onSaved={gu.handleSaved}
          />
        )}
        {gu.modal?.type === 'reset' && (
          <ResetModal
            key="reset"
            user={gu.modal.user}
            isAdmin={gu.isAdmin}
            isGerente={gu.isGerente}
            meUsername={gu.me?.sub}
            onClose={() => gu.setModal(null)}
            onSaved={gu.handleReset}
          />
        )}
        {gu.modal?.type === 'delete' && (
          <DeleteModal
            key="delete"
            user={gu.modal.user}
            isAdmin={gu.isAdmin}
            isGerente={gu.isGerente}
            onClose={() => gu.setModal(null)}
            onDeleted={gu.handleDeleted}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gu.toastState && (
          <PageToast
            key="toast"
            msg={gu.toastState.msg}
            type={gu.toastState.type}
            onClose={() => gu.setToastState(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
