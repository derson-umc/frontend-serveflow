import { useState } from 'react';
import { Modal } from '@shared/components/ui/Modal';
import { palette } from '@styles/ds';

export function CategoryModal({ open, onClose, allCategories, isCustom, onAdd, onRename, onDelete }) {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');

  function handleAdd() {
    if (!newName.trim()) return;
    const ok = onAdd(newName);
    if (ok === false) {
      setError('Categoria já existe.');
      return;
    }
    setNewName('');
    setError('');
  }

  function startEdit(cat) {
    setEditingName(cat);
    setEditValue(cat);
    setError('');
  }

  function handleRename() {
    if (!editValue.trim()) return;
    const ok = onRename(editingName, editValue);
    if (ok === false) {
      setError('Já existe uma categoria com esse nome.');
      return;
    }
    setEditingName(null);
    setEditValue('');
    setError('');
  }

  function handleDelete(cat) {
    onDelete(cat);
    setConfirmDelete(null);
  }

  return (
    <Modal open={open} onClose={onClose} title="Gerenciar Categorias" size="sm">
      {/* Adicionar nova */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-2" style={{ color: palette.textMuted }}>
          NOVA CATEGORIA
        </p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nome da categoria..."
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              border: `1.5px solid ${error ? palette.red : palette.border}`,
              background: '#FAFAFA',
              color: palette.textSecondary,
            }}
            onFocus={(e) => (e.target.style.border = `1.5px solid ${palette.green}`)}
            onBlur={(e) => (e.target.style.border = `1.5px solid ${error ? palette.red : palette.border}`)}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0"
            style={{ background: palette.green, color: palette.white, border: 'none', cursor: 'pointer' }}
          >
            Adicionar
          </button>
        </div>
        {error && <p className="text-xs mt-1" style={{ color: palette.red }}>{error}</p>}
      </div>

      {/* Lista */}
      <p className="text-xs font-semibold mb-2" style={{ color: palette.textMuted }}>
        CATEGORIAS ({allCategories.length})
      </p>
      <div className="flex flex-col gap-1.5" style={{ maxHeight: 340, overflowY: 'auto' }}>
        {allCategories.map((cat) => {
          const custom = isCustom(cat);

          if (confirmDelete === cat) {
            return (
              <div key={cat} className="flex items-center justify-between px-3 py-2.5 rounded-xl gap-2"
                style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}` }}>
                <p className="text-sm flex-1" style={{ color: palette.red }}>
                  Excluir <strong>{cat}</strong>?
                </p>
                <button onClick={() => handleDelete(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: palette.red, color: palette.white, border: 'none', cursor: 'pointer' }}>
                  Confirmar
                </button>
                <button onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: '#F0F0F0', color: palette.textMuted, border: 'none', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            );
          }

          if (editingName === cat) {
            return (
              <div key={cat} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ border: `1.5px solid ${palette.green}`, background: '#FAFAFA' }}>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => { setEditValue(e.target.value); setError(''); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') { setEditingName(null); setError(''); }
                  }}
                  className="flex-1 text-sm outline-none"
                  style={{ background: 'transparent', border: 'none', color: palette.textSecondary }}
                />
                <button onClick={handleRename}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: palette.green, color: palette.white, border: 'none', cursor: 'pointer' }}>
                  OK
                </button>
                <button onClick={() => { setEditingName(null); setError(''); }}
                  className="px-2.5 py-1 rounded-lg text-xs"
                  style={{ background: '#F0F0F0', color: palette.textMuted, border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            );
          }

          return (
            <div key={cat} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: custom ? '#FAFAFA' : '#F5F5F5', border: `1px solid ${palette.border}` }}>
              <span className="text-sm flex-1" style={{ color: palette.textSecondary }}>{cat}</span>
              {!custom && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#E8F5E9', color: palette.green, fontWeight: 600 }}>
                  padrão
                </span>
              )}
              {custom && (
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(cat)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted }}
                    title="Renomear">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536M9 13l6.768-6.768a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                    </svg>
                  </button>
                  <button onClick={() => setConfirmDelete(cat)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.red }}
                    title="Excluir">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
