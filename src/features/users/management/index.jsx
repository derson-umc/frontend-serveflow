import { motion, AnimatePresence } from 'framer-motion';
import { useUserManagement } from './hooks/useUserManagement';
import { UserTable } from './components/UserTable';
import { CreateModal } from './components/CreateModal';
import { EditModal } from './components/EditModal';
import { ResetModal } from './components/ResetModal';
import { DeleteModal } from './components/DeleteModal';
import { PageToast } from './shared';
import Sidebar from '@shared/components/layout/Sidebar';
import { palette } from '@styles/ds';


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
      <main className="relative flex-1 px-4 py-5 sm:px-8" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <UserTable
          users={gu.users}
          filtered={gu.filtered}
          loading={gu.loading}
          search={gu.search}
          setSearch={gu.setSearch}
          roleFilter={gu.roleFilter}
          setRoleFilter={gu.setRoleFilter}
          onRefresh={gu.load}
          onCreate={gu.isAdmin || gu.isGerente ? () => gu.setModal({ type: 'create' }) : null}
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
