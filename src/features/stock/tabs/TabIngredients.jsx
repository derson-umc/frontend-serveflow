import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { Spinner } from '@shared/components/feedback/Spinner';
import { PlainInput } from '@shared/components/ui/PlainInput';
import { Btn } from '@shared/components/ui/Btn';
import { MotionModal } from '@shared/components/ui/MotionModal';
import { ModalHeader } from '@shared/components/ui/ModalHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { QuantityBadge } from '../components/QuantityBadge';
import { EntryModal } from '../components/EntryModal';
import { LossModal } from '../components/LossModal';
import { AdjustModal } from '../components/AdjustModal';
import { IngredientForm } from '../components/IngredientForm';
import { dsCard, dsFormFooter, palette } from '@styles/ds';
import { Paginator } from '../components/Paginator';
import { PU } from '../constants';

const PAGE_SIZE = 10;

const IconEntry  = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
  </svg>
);
const IconLoss   = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);
const IconAdjust = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);
const IconEdit   = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconDeact  = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const IconActivate = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function ActionMenu({ item, onAction, onEdit, onToggle, toggling }) {
  const [open, setOpen]  = useState(false);
  const [pos,  setPos]   = useState({ top: 0, right: 0 });
  const triggerRef       = useRef(null);
  const menuRef          = useRef(null);
  const isActive         = item.status === 'ACTIVE';
  const isToggling       = toggling === item.id;

  const openMenu = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        menuRef.current    && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const MENU_ACTIONS = [
    { key: 'entry',  label: 'Entrada',  color: palette.green,  bg: palette.greenSurface,  Icon: IconEntry  },
    { key: 'loss',   label: 'Perda',    color: palette.orange, bg: palette.orangeSurface, Icon: IconLoss   },
    { key: 'adjust', label: 'Ajuste',   color: PU,             bg: '#F3E8FF',             Icon: IconAdjust },
    { key: 'edit',   label: 'Editar',   color: palette.textSecondary, bg: palette.surface, Icon: IconEdit  },
  ];

  const handleAction = (key) => {
    setOpen(false);
    if (key === 'edit') { onEdit(item); return; }
    onAction(key, item);
  };

  const handleToggle = () => {
    setOpen(false);
    onToggle(item);
  };

  const dropdown = open && createPortal(
    <div
      ref={menuRef}
      style={{
        position:     'fixed',
        top:           pos.top,
        right:         pos.right,
        zIndex:        9999,
        background:    palette.white,
        border:       `1px solid ${palette.border}`,
        borderRadius:  12,
        boxShadow:    '0 12px 32px rgba(0,0,0,0.15)',
        minWidth:      170,
        padding:      '6px',
        display:      'flex',
        flexDirection: 'column',
        gap:           2,
      }}
    >
      {MENU_ACTIONS.map(({ key, label, color, bg, Icon }) => (
        <button
          key={key}
          onClick={() => handleAction(key)}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:          8,
            width:       '100%',
            textAlign:   'left',
            padding:     '8px 10px',
            border:      'none',
            background:  'none',
            borderRadius: 8,
            cursor:      'pointer',
            fontSize:    13,
            fontWeight:  600,
            color,
            transition:  'background 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = bg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}><Icon /></span>
          {label}
        </button>
      ))}

      <div style={{ height: 1, background: palette.border, margin: '4px 0' }} />

      <button
        onClick={handleToggle}
        disabled={isToggling}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:          8,
          width:       '100%',
          textAlign:   'left',
          padding:     '8px 10px',
          border:      'none',
          background:  'none',
          borderRadius: 8,
          cursor:      isToggling ? 'not-allowed' : 'pointer',
          fontSize:    13,
          fontWeight:  600,
          color:       isToggling ? palette.textDisabled : (isActive ? palette.red : palette.green),
          transition:  'background 0.12s',
        }}
        onMouseEnter={(e) => {
          if (!isToggling) e.currentTarget.style.background = isActive ? palette.redSurface : palette.greenSurface;
        }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        {isToggling
          ? <><Spinner size={13} /> Aguarde...</>
          : isActive
            ? <><span style={{ display: 'flex' }}><IconDeact /></span>Desativar</>
            : <><span style={{ display: 'flex' }}><IconActivate /></span>Reativar</>
        }
      </button>
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openMenu}
        title="Ações"
        style={{
          padding:      '6px 12px',
          borderRadius:  8,
          border:       `1px solid ${open ? palette.green : palette.border}`,
          background:    open ? palette.greenSurface : palette.white,
          cursor:        'pointer',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          fontSize:      16,
          color:         open ? palette.green : palette.textMuted,
          fontWeight:    700,
          letterSpacing: 1,
          transition:    'border-color 0.15s, background 0.15s, color 0.15s',
          lineHeight:    1,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = palette.green;
            e.currentTarget.style.color       = palette.green;
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = palette.border;
            e.currentTarget.style.color       = palette.textMuted;
          }
        }}
      >
        ···
      </button>
      {dropdown}
    </>
  );
}


const STATUS_OPTIONS = [
  { value: 'ALL',      label: 'Todos'   },
  { value: 'ACTIVE',   label: 'Ativos'  },
  { value: 'INACTIVE', label: 'Inativos'},
];

export function TabIngredients({
  items, loading,
  filtered,
  search, setSearch,
  filterStatus, setFilterStatus,
  belowMin,
  openCreate, openEdit,
  modalCreate, setModalCreate,
  modalEdit, setModalEdit,
  action, handleInventoryAction, closeAction,
  toggling,
  createForm, editForm,
  onCreateSubmit, onEditSubmit,
  handleToggle,
  onRefresh,
}) {
  const activeCount = items.filter((i) => i.status === 'ACTIVE').length;
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        <StatCard label="Total de insumos"  value={items.length}  accent={palette.green}  />
        <StatCard label="Insumos ativos"    value={activeCount}   accent={palette.blue}   />
        <StatCard label="Abaixo do mínimo"  value={belowMin}      accent={palette.orange} />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <PlainInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, categoria ou fornecedor..."
          style={{ flex: 1, minWidth: 200 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              style={{
                padding:    '7px 14px',
                borderRadius: 20,
                border:     `1.5px solid ${filterStatus === opt.value ? palette.green : palette.border}`,
                background:  filterStatus === opt.value ? palette.greenSurface : palette.white,
                color:       filterStatus === opt.value ? palette.green : palette.textMuted,
                fontSize:   12,
                fontWeight: 600,
                cursor:     'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Btn variant="primary" onClick={openCreate}>+ Novo Insumo</Btn>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={20} />
        </div>
      ) : (
        <div style={{ ...dsCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Nome', 'Unidade', 'Categoria', 'Estoque', 'Mínimo', 'Fornecedor', 'Status', 'Ações'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontWeight: 700, color: palette.textMuted,
                      fontSize: 11, textTransform: 'uppercase',
                      letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: palette.textMuted }}>
                      Nenhum insumo encontrado.
                    </td>
                  </tr>
                ) : (
                  paged.map((item) => (
                    <tr key={item.id} style={{ borderTop: `1px solid ${palette.border}` }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: palette.textPrimary }}>{item.name}</td>
                      <td style={{ padding: '10px 16px', color: palette.textMuted }}>{item.unit}</td>
                      <td style={{ padding: '10px 16px', color: palette.textMuted }}>{item.category ?? '-'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <QuantityBadge current={item.currentQuantity} minimum={item.minimumQuantity} unit={item.unit} />
                      </td>
                      <td style={{ padding: '10px 16px', color: palette.textMuted }}>{item.minimumQuantity}</td>
                      <td style={{ padding: '10px 16px', color: palette.textMuted }}>{item.supplier ?? '-'}</td>
                      <td style={{ padding: '10px 16px' }}><StatusBadge status={item.status} /></td>
                      <td style={{ padding: '10px 16px' }}>
                        <ActionMenu
                          item={item}
                          toggling={toggling}
                          onAction={handleInventoryAction}
                          onEdit={openEdit}
                          onToggle={handleToggle}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Paginator
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            label="insumos"
            onChange={setPage}
          />
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {modalCreate && (
          <MotionModal onClose={() => setModalCreate(false)}>
            <ModalHeader title="Novo Insumo" accentColor={palette.green} onClose={() => setModalCreate(false)} />
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <IngredientForm form={createForm} showQuantity />
              <div style={dsFormFooter}>
                <Btn type="button" variant="ghost" onClick={() => setModalCreate(false)}>Cancelar</Btn>
                <Btn type="submit" variant="primary" disabled={createForm.formState.isSubmitting}>
                  {createForm.formState.isSubmitting ? 'Salvando...' : 'Cadastrar'}
                </Btn>
              </div>
            </form>
          </MotionModal>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {modalEdit && (
          <MotionModal onClose={() => setModalEdit(null)}>
            <ModalHeader title="Editar Insumo" subtitle={modalEdit.name} accentColor={palette.green} onClose={() => setModalEdit(null)} />
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <IngredientForm form={editForm} />
              <div style={dsFormFooter}>
                <Btn type="button" variant="ghost" onClick={() => setModalEdit(null)}>Cancelar</Btn>
                <Btn type="submit" variant="primary" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </Btn>
              </div>
            </form>
          </MotionModal>
        )}
      </AnimatePresence>

      {/* Action modals — rendered directly to avoid nested AnimatePresence conflicts */}
      {action?.type === 'entry'  && <EntryModal  item={action.item} onClose={closeAction} onSuccess={() => { closeAction(); onRefresh(); }} />}
      {action?.type === 'loss'   && <LossModal   item={action.item} onClose={closeAction} onSuccess={() => { closeAction(); onRefresh(); }} />}
      {action?.type === 'adjust' && <AdjustModal item={action.item} onClose={closeAction} onSuccess={() => { closeAction(); onRefresh(); }} />}
    </div>
  );
}
