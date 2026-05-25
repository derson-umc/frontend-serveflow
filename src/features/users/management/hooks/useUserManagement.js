import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { usersApi } from '@core/api/users';

export function useUserManagement() {
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
      (u.email ?? '').toLowerCase().includes(q);
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

  const handleReset = () => {
    setModal(null);
    notify('Senha redefinida com sucesso.');
  };

  return {
    me,
    isAdmin, isGerente,
    users,
    filtered,
    loading,
    search, setSearch,
    roleFilter, setRoleFilter,
    modal, setModal,
    toastState, setToastState,
    stats,
    load,
    handleCreated,
    handleSaved,
    handleDeleted,
    handleReset,
  };
}
