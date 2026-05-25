import { motion } from 'framer-motion';
import { Avatar, RoleDot, IconBtn } from '../shared';
import { FILTER_TABS } from '../constants';

function UserRow({ user, index, total, isAdmin, isGerente, onEdit, onReset, onDelete }) {
  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      className="flex flex-col sm:grid px-5 py-4 gap-2 sm:gap-0 transition-colors"
      style={{
        gridTemplateColumns: '2.5fr 1fr 2fr auto',
        alignItems:          'center',
        borderBottom:        index < total - 1 ? '1px solid #F5F5F5' : 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div className="flex items-center gap-3">
        <Avatar name={user.username} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#424242' }}>{user.username}</p>
          {user.email ? (
            <p className="text-xs truncate" style={{ color: '#9E9E9E' }}>{user.email}</p>
          ) : (
            <p className="text-xs" style={{ color: '#BDBDBD' }}>ID #{user.id}</p>
          )}
        </div>
      </div>

      <div className="sm:block"><RoleDot role={user.role} /></div>

      <p className="text-sm truncate" style={{ color: '#757575' }}>
        {user.jobposition || <span style={{ color: '#BDBDBD' }}>—</span>}
      </p>

      <div className="flex items-center justify-end gap-1.5">
        <IconBtn
          title="Editar usuário"
          hoverColor="#1565C0"
          onClick={() => onEdit(user)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <IconBtn
          title="Redefinir senha"
          hoverColor="#6A1B9A"
          onClick={() => onReset(user)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
        />
        {(isAdmin || isGerente) && (
          <IconBtn
            title="Excluir usuário"
            hoverColor="#C62828"
            onClick={() => onDelete(user)}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          />
        )}
      </div>
    </motion.div>
  );
}

export function UserTable({
  users,
  filtered,
  loading,
  search, setSearch,
  roleFilter, setRoleFilter,
  onRefresh,
  isAdmin, isGerente,
  onEdit, onReset, onDelete,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="#BDBDBD">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuário ou cargo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', color: '#424242', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            onFocus={(e) => (e.target.style.border = '1px solid #2E7D32')}
            onBlur={(e)  => (e.target.style.border = '1px solid #E0E0E0')}
          />
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
          style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#C8E6C9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#E8F5E9')}
        >
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
            <button
              key={value}
              onClick={() => setRoleFilter(value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: active ? '#E8F5E9' : '#FFFFFF', border: active ? '1px solid #A5D6A7' : '1px solid #E0E0E0', color: active ? '#2E7D32' : '#757575' }}
            >
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

      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div
          className="hidden sm:grid px-5 py-3 text-xs font-bold uppercase tracking-widest"
          style={{ gridTemplateColumns: '2.5fr 1fr 2fr auto', color: '#BDBDBD', borderBottom: '1px solid #F5F5F5', background: '#F5F5F5' }}
        >
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

        {!loading && filtered.map((u, i) => (
          <UserRow
            key={u.id}
            user={u}
            index={i}
            total={filtered.length}
            isAdmin={isAdmin}
            isGerente={isGerente}
            onEdit={onEdit}
            onReset={onReset}
            onDelete={onDelete}
          />
        ))}
      </div>

      {!loading && (
        <p className="text-xs mt-3 text-right" style={{ color: '#BDBDBD' }}>
          {filtered.length} de {users.length} usuário{users.length !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}
