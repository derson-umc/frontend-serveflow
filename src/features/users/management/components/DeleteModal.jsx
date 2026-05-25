import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';
import { ModalOverlay, ModalHead, Avatar, RoleDot, ActionBtn, InlineAlert } from '../shared';

function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function DeleteModal({ user, isAdmin, isGerente, onClose, onDeleted }) {
  const del        = useDeleteUser();
  const protected_ = ['ADMIN', 'GERENTE'].includes(user.role?.toUpperCase());
  const canDelete  = (isAdmin || isGerente) && !protected_;

  const handleDelete = async () => {
    try {
      await del.mutateAsync(user.id);
      onDeleted(user.id);
    } catch (err) {
      console.error(err?.response?.data?.error ?? 'Erro ao excluir usuário.');
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHead
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        title="Excluir Usuário"
        onClose={onClose}
      />
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#FFEBEE', border: '1px solid #EF9A9A' }}>
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

        {!canDelete && (
          <InlineAlert msg={protected_ ? 'Usuários Admin e Gerente não podem ser excluídos.' : 'Sem permissão para excluir este usuário.'} />
        )}
        {del.isError && (
          <InlineAlert msg={del.error?.response?.data?.error ?? 'Erro ao excluir usuário.'} />
        )}

        <div className="flex gap-3 pt-1">
          <ActionBtn variant="ghost" onClick={onClose}>Cancelar</ActionBtn>
          <ActionBtn variant="danger" onClick={handleDelete} loading={del.isPending} disabled={!canDelete}>Excluir</ActionBtn>
        </div>
      </div>
    </ModalOverlay>
  );
}
