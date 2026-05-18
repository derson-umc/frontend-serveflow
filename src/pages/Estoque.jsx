import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { stockApi } from '../services/api/stock';
import { toast } from '../components/ui/Toast';
import Sidebar from '../components/ui/Sidebar';

const G  = '#2E7D32'; const GD = '#1B5E20'; const GF = '#E8F5E9';
const O  = '#F57C00'; const OF = '#FFF3E0';
const D  = '#424242'; const M  = '#757575'; const B  = '#E0E0E0'; const W = '#FFFFFF';
const R  = '#C62828'; const RF = '#FFEBEE';
const BL = '#1565C0'; const BLF = '#E3F2FD';
const PU = '#6A1B9A'; const PUF = '#F3E5F5';

const UNITS = [
  { value: 'kg',  label: 'kg — quilograma'  },
  { value: 'g',   label: 'g — grama'        },
  { value: 'L',   label: 'L — litro'        },
  { value: 'ml',  label: 'ml — mililitro'   },
  { value: 'UN',  label: 'UN — unidade'     },
  { value: 'cx',  label: 'cx — caixa'       },
  { value: 'pct', label: 'pct — pacote'     },
  { value: 'dz',  label: 'dz — dúzia'       },
];

const CATEGORIES = ['Carnes', 'Laticínios', 'Grãos e Cereais', 'Bebidas', 'Embalagens', 'Temperos', 'Frutas e Verduras', 'Outros'];

const MOVEMENT_LABELS = {
  ENTRY:             { label: 'Entrada', color: G,  bg: GF  },
  EXIT:              { label: 'Saída - Manual',   color: R,  bg: RF  },
  ORDER_CONSUMPTION: { label: 'Saída - Venda',   color: R,  bg: RF  },
  LOSS:              { label: 'Perda',   color: O,  bg: OF  },
  ADJUSTMENT:        { label: 'Ajuste',  color: PU, bg: PUF },
};

const ENTRY_SUGGESTIONS  = ['Compra semanal', 'Compra mensal', 'Reposição urgente', 'Entrada de fornecedor', 'Inventário inicial'];
const LOSS_SUGGESTIONS   = ['Produto vencido', 'Embalagem danificada', 'Perda operacional', 'Quebra acidental', 'Contaminação'];
const ADJUST_SUGGESTIONS = ['Contagem física mensal', 'Auditoria de inventário', 'Correção de lançamento', 'Divergência encontrada', 'Inventário semestral'];

const insumoSchema = z.object({
  name:            z.string().min(2, 'Nome é obrigatório'),
  unit:            z.string().min(1, 'Unidade é obrigatória'),
  category:        z.string().optional(),
  currentQuantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0, 'Deve ser ≥ 0').optional(),
  minimumQuantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0, 'Deve ser ≥ 0'),
  supplier:        z.string().optional(),
  averageCost:     z.union([z.coerce.number().min(0), z.literal('')]).optional(),
});

function Spinner({ size = 5, color = G }) {
  return (
    <div className={`w-${size} h-${size} rounded-full border-2 animate-spin flex-shrink-0`}
      style={{ borderColor: `${color}30`, borderTopColor: color }} />
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: M }}>
        {label} {required && <span style={{ color: R }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: R }}>{error}</p>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D, ...props.style }} />
  );
}

function Select({ children, ...props }) {
  return (
    <select {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
      style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D, ...props.style }}>
      {children}
    </select>
  );
}

function Btn({ children, variant = 'primary', type = 'button', ...props }) {
  const styles = {
    primary:   { background: G,            color: W, border: 'none',                 boxShadow: '0 4px 12px rgba(46,125,50,0.3)' },
    secondary: { background: '#F5F5F5',    color: M, border: `1px solid ${B}`,       boxShadow: 'none' },
    danger:    { background: R,            color: W, border: 'none',                 boxShadow: '0 4px 12px rgba(198,40,40,0.2)' },
    ghost:     { background: 'transparent', color: M, border: `1px solid ${B}`,      boxShadow: 'none' },
  };
  return (
    <button type={type} {...props}
      className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      style={{ ...styles[variant], ...props.style }}>
      {children}
    </button>
  );
}

function MovementBadge({ type }) {
  const cfg = MOVEMENT_LABELS[type] || { label: type, color: M, bg: '#F5F5F5' };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: active ? GF : RF, color: active ? G : R, border: `1px solid ${active ? '#A5D6A7' : '#EF9A9A'}` }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function QuantityBadge({ qty, belowMinimum }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: belowMinimum ? RF : GF, color: belowMinimum ? R : G, border: `1px solid ${belowMinimum ? '#EF9A9A' : '#A5D6A7'}` }}>
      {Number(qty).toFixed(3)}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
      className="flex-1 rounded-2xl p-4 text-center"
      style={{ background: W, border: `1px solid ${B}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <p className="text-2xl font-bold" style={{ color: accent || D }}>{value}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: M }}>{label}</p>
    </motion.div>
  );
}

function Modal({ open, onClose, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div className={`w-full ${maxWidth} rounded-2xl p-6 shadow-2xl`}
            style={{ background: W, border: `1px solid ${B}`, maxHeight: '90vh', overflowY: 'auto' }}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold" style={{ color: D }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: M }}>{subtitle}</p>}
      </div>
      <button onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
        style={{ background: '#F5F5F5', color: M, border: 'none' }}>✕</button>
    </div>
  );
}

function SuggestionChips({ suggestions, value, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
      {suggestions.map((s) => {
        const active = value === s;
        return (
          <button key={s} type="button" onClick={() => onSelect(active ? '' : s)}
            className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{ background: active ? '#E8F5E9' : '#F5F5F5', color: active ? '#2E7D32' : '#757575', border: `1px solid ${active ? '#A5D6A7' : '#E0E0E0'}`, cursor: 'pointer' }}>
            {s}
          </button>
        );
      })}
    </div>
  );
}

function InsumoForm({ register, control, errors, isEditing }) {
  return (
    <div className="space-y-4">
      <Field label="Nome do Insumo" required error={errors.name?.message}>
        <Input {...register('name')} placeholder="Ex: Arroz branco tipo 4"
          style={{ border: `1.5px solid ${errors.name ? R : B}` }} />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Unidade" required error={errors.unit?.message}>
            <select {...register('unit')}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D }}>
              {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Categoria">
            <select {...register('category')}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D }}>
              <option value="">Sem categoria</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="flex gap-3">
        {!isEditing && (
          <div className="flex-1">
            <Field label="Qtd. Atual" required error={errors.currentQuantity?.message}>
              <Input {...register('currentQuantity')} type="number" min="0" step="0.001" placeholder="0.000"
                style={{ border: `1.5px solid ${errors.currentQuantity ? R : B}` }} />
            </Field>
          </div>
        )}
        <div className="flex-1">
          <Field label="Qtd. Mínima" required error={errors.minimumQuantity?.message}>
            <Input {...register('minimumQuantity')} type="number" min="0" step="0.001" placeholder="0.000"
              style={{ border: `1.5px solid ${errors.minimumQuantity ? R : B}` }} />
          </Field>
        </div>
      </div>
      <Field label="Fornecedor">
        <Input {...register('supplier')} placeholder="Nome do fornecedor (opcional)" />
      </Field>
      <Field label="Custo Médio (R$)">
        <Input {...register('averageCost')} type="number" min="0" step="0.01" placeholder="0.00" />
      </Field>
      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: OF, border: '1px solid #FFCC80', color: O }}>
        Quando o estoque cair abaixo da quantidade mínima, o sistema bloqueará novos pedidos que usam este insumo.
      </div>
    </div>
  );
}

function TabInsumos({ items, loading, onRefresh }) {
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit]     = useState(null);
  const [modalEntry, setModalEntry]   = useState(null);
  const [toggling, setToggling]       = useState(null);

  const createForm = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues: { name: '', unit: 'kg', category: '', currentQuantity: '', minimumQuantity: '', supplier: '', averageCost: '' },
  });

  const editForm = useForm({
    resolver: zodResolver(insumoSchema.omit({ currentQuantity: true })),
    defaultValues: { name: '', unit: 'kg', category: '', minimumQuantity: '', supplier: '', averageCost: '' },
  });

  const openCreate = () => {
    createForm.reset({ name: '', unit: 'kg', category: '', currentQuantity: '', minimumQuantity: '', supplier: '', averageCost: '' });
    setModalCreate(true);
  };

  const openEdit = (item) => {
    editForm.reset({
      name: item.name, unit: item.unit, category: item.category || '',
      minimumQuantity: item.minimumQuantity,
      supplier: item.supplier || '', averageCost: item.averageCost ?? '',
    });
    setModalEdit(item);
  };

  const onCreateSubmit = async (data) => {
    try {
      await stockApi.items.create({
        name: data.name.trim(), unit: data.unit,
        currentQuantity: data.currentQuantity ?? 0,
        minimumQuantity: data.minimumQuantity,
        category: data.category || null,
        supplier: data.supplier || null,
        averageCost: data.averageCost !== '' ? Number(data.averageCost) : null,
      });
      toast.success(`Insumo "${data.name.trim()}" cadastrado!`);
      setModalCreate(false);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao cadastrar insumo.');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await stockApi.items.update(modalEdit.id, {
        name: data.name.trim(), unit: data.unit,
        currentQuantity: Number(modalEdit.currentQuantity),
        minimumQuantity: data.minimumQuantity,
        category: data.category || null,
        supplier: data.supplier || null,
        averageCost: data.averageCost !== '' ? Number(data.averageCost) : null,
      });
      toast.success('Insumo atualizado!');
      setModalEdit(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao atualizar.');
    }
  };

  const handleToggle = async (item) => {
    setToggling(item.id);
    try {
      await stockApi.items.toggleStatus(item.id);
      toast.success(item.status === 'ACTIVE' ? 'Insumo desativado.' : 'Insumo reativado.');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao alterar status.');
    } finally {
      setToggling(null);
    }
  };

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase())
      || (i.category || '').toLowerCase().includes(search.toLowerCase())
      || (i.supplier || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="text" placeholder="Buscar por nome, categoria ou fornecedor..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: W, border: `1.5px solid ${B}`, color: D }} />
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="INACTIVE">Inativos</option>
        </Select>
        <Btn onClick={openCreate}>+ Novo Insumo</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center" style={{ color: M }}>
          {items.length === 0 ? (
            <div>
              <p className="font-semibold mb-1" style={{ color: D }}>Nenhum insumo cadastrado</p>
              <p className="text-xs">Clique em <strong>+ Novo Insumo</strong> para começar.</p>
              <p className="text-xs mt-1" style={{ color: O }}>Sem insumos não é possível criar fichas técnicas ou confirmar pedidos.</p>
            </div>
          ) : (
            <p>Nenhum insumo encontrado para os filtros aplicados.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${B}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F5F5' }}>
                {['Insumo', 'Categoria', 'Fornecedor', 'Unidade', 'Qtd. Atual', 'Mín.', 'Custo Médio', 'Status', 'Ações'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${i >= 3 ? 'text-center' : 'text-left'}`}
                    style={{ color: M }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <motion.tr key={item.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  style={{ borderBottom: `1px solid ${B}`, opacity: item.status === 'INACTIVE' ? 0.6 : 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3"><span className="font-medium" style={{ color: D }}>{item.name}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: M }}>{item.category || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: M }}>{item.supplier || '—'}</td>
                  <td className="px-4 py-3 text-center text-xs font-medium" style={{ color: M }}>{item.unit}</td>
                  <td className="px-4 py-3 text-center"><QuantityBadge qty={item.currentQuantity} belowMinimum={item.belowMinimum} /></td>
                  <td className="px-4 py-3 text-center text-xs" style={{ color: M }}>{Number(item.minimumQuantity).toFixed(3)}</td>
                  <td className="px-4 py-3 text-center text-xs" style={{ color: M }}>
                    {item.averageCost != null ? `R$ ${Number(item.averageCost).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge active={item.status === 'ACTIVE'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => setModalEntry(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: GF, color: G, border: '1px solid #A5D6A7' }}>+ Entrada</button>
                      <button onClick={() => openEdit(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: BLF, color: BL, border: '1px solid #90CAF9' }}>Editar</button>
                      <button onClick={() => handleToggle(item)} disabled={toggling === item.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: item.status === 'ACTIVE' ? RF : GF, color: item.status === 'ACTIVE' ? R : G, border: `1px solid ${item.status === 'ACTIVE' ? '#EF9A9A' : '#A5D6A7'}` }}>
                        {toggling === item.id ? <Spinner size={3} /> : item.status === 'ACTIVE' ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Criar */}
      <Modal open={modalCreate} onClose={() => setModalCreate(false)}>
        <ModalHeader title="Novo Insumo" subtitle="Cadastre um item de estoque" onClose={() => setModalCreate(false)} />
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} noValidate>
          <InsumoForm register={createForm.register} control={createForm.control} errors={createForm.formState.errors} isEditing={false} />
          <div className="flex gap-3 mt-5">
            <Btn variant="secondary" onClick={() => setModalCreate(false)} style={{ flex: 1 }}>Cancelar</Btn>
            <Btn type="submit" disabled={createForm.formState.isSubmitting} style={{ flex: 1 }}>
              {createForm.formState.isSubmitting ? <Spinner size={4} color={W} /> : 'Cadastrar'}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar */}
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)}>
        <ModalHeader title="Editar Insumo" subtitle={modalEdit?.name} onClose={() => setModalEdit(null)} />
        <div className="rounded-xl px-3 py-2 mb-4 text-xs" style={{ background: BLF, border: '1px solid #90CAF9', color: BL }}>
          Para alterar a quantidade atual, registre uma entrada pelo botão na linha do insumo, ou registre um ajuste.
        </div>
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} noValidate>
          <InsumoForm register={editForm.register} control={editForm.control} errors={editForm.formState.errors} isEditing={true} />
          <div className="flex gap-3 mt-5">
            <Btn variant="secondary" onClick={() => setModalEdit(null)} style={{ flex: 1 }}>Cancelar</Btn>
            <Btn type="submit" disabled={editForm.formState.isSubmitting} style={{ flex: 1 }}>
              {editForm.formState.isSubmitting ? <Spinner size={4} color={W} /> : 'Salvar'}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Modal: Entrada rápida */}
      {modalEntry && (
        <EntryModal item={modalEntry} onClose={() => setModalEntry(null)} onSuccess={() => { setModalEntry(null); onRefresh(); }} />
      )}
    </div>
  );
}

function EntryModal({ item, onClose, onSuccess }) {
  const [form, setForm]     = useState({ quantity: '', supplier: '', unitCost: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    const qty = parseFloat(form.quantity);
    if (isNaN(qty) || qty <= 0) { toast.error('Informe uma quantidade válida.'); return; }
    setSaving(true);
    try {
      await stockApi.items.entry(item.id, {
        quantity: qty,
        reason: form.reason || null,
        supplier: form.supplier || null,
        unitCost: form.unitCost !== '' ? parseFloat(form.unitCost) : null,
      });
      toast.success(`Entrada registrada para "${item.name}".`);
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao registrar entrada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      {/* Header */}
      <div style={{ margin: '-24px -24px 20px', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${G}, ${GD})` }} />
        <div style={{ padding: '16px 24px', background: GF, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid #C8E6C9` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: W, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(46,125,50,0.15)' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: D, margin: 0 }}>Entrada de Estoque</p>
              <p style={{ fontSize: 11, color: G, margin: '2px 0 0', fontWeight: 600 }}>{item.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: W, border: `1px solid #C8E6C9`, color: M, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>

      {/* Current stock chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAFA', border: `1px solid ${B}`, borderRadius: 10, padding: '8px 12px', marginBottom: 20 }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={M} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        <span style={{ fontSize: 12, color: M }}>Estoque atual:</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: item.belowMinimum ? R : D }}>
          {Number(item.currentQuantity).toFixed(3)} {item.unit}
        </span>
        {item.belowMinimum && (
          <span style={{ fontSize: 10, fontWeight: 700, color: R, background: RF, border: '1px solid #EF9A9A', borderRadius: 20, padding: '1px 7px' }}>Abaixo do mínimo</span>
        )}
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Qty + Supplier side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label={`Quantidade (${item.unit})`} required>
            <Input type="number" min="0.001" step="0.001" value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="0.000" autoFocus
              style={{ border: `1.5px solid ${form.quantity && parseFloat(form.quantity) > 0 ? G : B}` }} />
          </Field>
          <Field label="Custo Unitário (R$)">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: M, fontWeight: 600 }}>R$</span>
              <Input type="number" min="0" step="0.01" value={form.unitCost}
                onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                placeholder="0,00" style={{ paddingLeft: 32 }} />
            </div>
          </Field>
        </div>

        <Field label="Fornecedor">
          <Input value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
            placeholder="Nome do fornecedor (opcional)" />
        </Field>

        <Field label="Observação">
          <SuggestionChips suggestions={ENTRY_SUGGESTIONS} value={form.reason} onSelect={(s) => setForm((f) => ({ ...f, reason: s }))} />
          <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="NF, lote, observação..." />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn onClick={handle} disabled={saving} style={{ flex: 1 }}>
          {saving ? <Spinner size={4} color={W} /> : 'Confirmar Entrada'}
        </Btn>
      </div>
    </Modal>
  );
}

function TabMovimentacoes({ items }) {
  const EMPTY_FILTERS = { type: '', itemId: '', startDate: '', endDate: '' };

  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [appliedFilters, setApplied]  = useState(null); // null = never searched
  const [page, setPage]               = useState(0);
  const [result, setResult]           = useState(null); // StockMovementsPageOutput
  const [loading, setLoading]         = useState(false);
  const [modalLoss, setModalLoss]     = useState(false);
  const [modalAdjust, setModalAdjust] = useState(false);
  const debounceRef                   = useRef(null);

  const hasFilter = (f) =>
    (f.type && f.type !== '') || (f.itemId && f.itemId !== '') || f.startDate || f.endDate;

  const buildParams = useCallback((f, p) => {
    const params = { page: p, size: 50 };
    if (f.itemId)    params.stockItemId = f.itemId;
    if (f.type)      params.type        = f.type;
    if (f.startDate) params.startDate   = f.startDate;
    if (f.endDate)   params.endDate     = f.endDate;
    return params;
  }, []);

  const doSearch = useCallback((f, p) => {
    if (!hasFilter(f)) return;
    setLoading(true);
    stockApi.movements.filter(buildParams(f, p))
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [buildParams]);

  const handleApply = () => {
    if (!hasFilter(filters)) {
      toast.error('Informe pelo menos um filtro antes de buscar.');
      return;
    }
    setPage(0);
    setApplied({ ...filters });
    doSearch(filters, 0);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(null);
    setResult(null);
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (appliedFilters && hasFilter(next)) {
        setPage(0);
        setApplied({ ...next });
        doSearch(next, 0);
      }
    }, 400);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (appliedFilters) doSearch(appliedFilters, newPage);
  };

  const fmt    = (dt) => dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtQty = (n)  => n != null ? Number(n).toFixed(3) : '—';

  return (
    <div>
      {/* Actions row */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => setModalLoss(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: OF, color: O, border: '1px solid #FFCC80' }}>
          Registrar Perda
        </button>
        <button onClick={() => setModalAdjust(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: PUF, color: PU, border: '1px solid #CE93D8' }}>
          Ajuste de Inventário
        </button>
      </div>

      {/* Filter panel */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#FAFAFA', border: `1.5px solid ${B}` }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: M }}>
          Filtros — informe pelo menos um campo para buscar
        </p>
        <div className="flex gap-3 flex-wrap mb-3">
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{ width: 'auto', minWidth: 190 }}
          >
            <option value="">Todos os tipos</option>
            {Object.entries(MOVEMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({k})</option>
            ))}
          </Select>
          <Select
            value={filters.itemId}
            onChange={(e) => handleFilterChange('itemId', e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          >
            <option value="">Todos os insumos</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{ width: 'auto' }}
            placeholder="Data inicial"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{ width: 'auto' }}
            placeholder="Data final"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: G, color: W, border: 'none', boxShadow: '0 4px 12px rgba(46,125,50,0.25)' }}
          >
            Buscar Movimentações
          </button>
          {appliedFilters && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#F5F5F5', color: M, border: `1px solid ${B}` }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {!appliedFilters && !loading ? (
        <div className="py-16 text-center rounded-2xl" style={{ border: `1.5px dashed ${B}` }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p className="font-semibold mb-1" style={{ color: D }}>Nenhum filtro aplicado</p>
          <p className="text-sm" style={{ color: M }}>Informe os filtros acima para visualizar as movimentações</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : !result || result.content.length === 0 ? (
        <div className="py-14 text-center rounded-2xl" style={{ border: `1.5px dashed ${B}` }}>
          <p className="text-sm" style={{ color: M }}>Nenhuma movimentação encontrada para os filtros informados.</p>
        </div>
      ) : (
        <>
          {/* Result meta */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-xs" style={{ color: M }}>
              {result.totalElements} movimentação{result.totalElements !== 1 ? 'ões' : ''} encontrada{result.totalElements !== 1 ? 's' : ''}
              {result.totalPages > 1 && ` · Página ${result.page + 1} de ${result.totalPages}`}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${B}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Data', 'Item', 'Tipo', 'Qtd', 'Antes', 'Depois', 'Observação'].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${i >= 3 && i <= 5 ? 'text-center' : 'text-left'}`}
                      style={{ color: M }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.content.map((m, idx) => (
                  <motion.tr key={m.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.012 }}
                    style={{ borderBottom: `1px solid ${B}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: M }}>{fmt(m.createdAt)}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: D }}>{m.stockItemName || '—'}</td>
                    <td className="px-4 py-3"><MovementBadge type={m.type} /></td>
                    <td className="px-4 py-3 text-center font-mono text-xs" style={{ color: D }}>{fmtQty(m.quantity)}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs" style={{ color: M }}>{fmtQty(m.balanceBefore)}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs font-semibold" style={{ color: D }}>{fmtQty(m.balanceAfter)}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: M }} title={m.reason}>{m.reason || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(page - 1)} disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: '#F5F5F5', color: M, border: `1px solid ${B}` }}>
                ← Anterior
              </button>
              {Array.from({ length: Math.min(result.totalPages, 7) }, (_, i) => {
                const p = result.totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, result.totalPages - 7)) + i;
                return (
                  <button key={p} onClick={() => handlePageChange(p)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold"
                    style={{ background: page === p ? G : '#F5F5F5', color: page === p ? W : M, border: `1px solid ${page === p ? G : B}` }}>
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)} disabled={page >= result.totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: '#F5F5F5', color: M, border: `1px solid ${B}` }}>
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {modalLoss && (
        <LossModal items={items} onClose={() => setModalLoss(false)}
          onSuccess={() => { setModalLoss(false); if (appliedFilters) doSearch(appliedFilters, page); }} />
      )}
      {modalAdjust && (
        <AdjustModal items={items} onClose={() => setModalAdjust(false)}
          onSuccess={() => { setModalAdjust(false); if (appliedFilters) doSearch(appliedFilters, page); }} />
      )}
    </div>
  );
}

function LossModal({ items, onClose, onSuccess }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const [form, setForm]             = useState({ quantity: '', reason: '' });
  const [saving, setSaving]         = useState(false);
  const selected = items.find((i) => i.id === selectedId);

  const handle = async () => {
    const qty = parseFloat(form.quantity);
    if (!selectedId) { toast.error('Selecione um insumo.'); return; }
    if (isNaN(qty) || qty <= 0) { toast.error('Informe uma quantidade válida.'); return; }
    if (!form.reason.trim()) { toast.error('Motivo é obrigatório.'); return; }
    setSaving(true);
    try {
      await stockApi.items.loss(selectedId, { quantity: qty, reason: form.reason.trim() });
      toast.success('Perda registrada.');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao registrar perda.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <ModalHeader title="Registrar Perda" subtitle="Dedução por vencimento, quebra ou descarte" onClose={onClose} />
      <div className="space-y-4">
        <Field label="Insumo" required>
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {items.filter((i) => i.status === 'ACTIVE').map((i) => (
              <option key={i.id} value={i.id}>{i.name} — {Number(i.currentQuantity).toFixed(3)} {i.unit}</option>
            ))}
          </Select>
        </Field>
        {selected && (
          <div className="rounded-xl px-3 py-2 text-sm" style={{ background: '#F5F5F5', border: `1px solid ${B}` }}>
            <span style={{ color: M }}>Disponível: </span>
            <span className="font-bold" style={{ color: D }}>{Number(selected.currentQuantity).toFixed(3)} {selected.unit}</span>
          </div>
        )}
        <Field label="Quantidade Perdida" required>
          <Input type="number" min="0.001" step="0.001" value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="0.000" />
        </Field>
        <Field label="Motivo" required>
          <SuggestionChips suggestions={LOSS_SUGGESTIONS} value={form.reason} onSelect={(s) => setForm((f) => ({ ...f, reason: s }))} />
          <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="Ex: Produto vencido, embalagem danificada..." />
        </Field>
      </div>
      <div className="flex gap-3 mt-5">
        <Btn variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn variant="danger" onClick={handle} disabled={saving} style={{ flex: 1 }}>
          {saving ? <Spinner size={4} color={W} /> : 'Registrar Perda'}
        </Btn>
      </div>
    </Modal>
  );
}

function AdjustModal({ items, onClose, onSuccess }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const [form, setForm]             = useState({ newQuantity: '', reason: '' });
  const [saving, setSaving]         = useState(false);
  const selected = items.find((i) => i.id === selectedId);

  const diff = selected && form.newQuantity !== ''
    ? (parseFloat(form.newQuantity) - Number(selected.currentQuantity)).toFixed(3)
    : null;

  const handle = async () => {
    const qty = parseFloat(form.newQuantity);
    if (!selectedId) { toast.error('Selecione um insumo.'); return; }
    if (isNaN(qty) || qty < 0) { toast.error('Informe a quantidade real apurada.'); return; }
    if (!form.reason.trim()) { toast.error('Motivo é obrigatório.'); return; }
    setSaving(true);
    try {
      await stockApi.items.adjust(selectedId, { newQuantity: qty, reason: form.reason.trim() });
      toast.success('Ajuste registrado.');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao registrar ajuste.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <ModalHeader title="Ajuste de Inventário" subtitle="Corrija o estoque após contagem física" onClose={onClose} />
      <div className="space-y-4">
        <Field label="Insumo" required>
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {items.map((i) => (
              <option key={i.id} value={i.id}>{i.name} — {Number(i.currentQuantity).toFixed(3)} {i.unit}</option>
            ))}
          </Select>
        </Field>
        {selected && (
          <div className="rounded-xl px-3 py-2 text-sm" style={{ background: '#F5F5F5', border: `1px solid ${B}` }}>
            <span style={{ color: M }}>Estoque atual no sistema: </span>
            <span className="font-bold" style={{ color: D }}>{Number(selected.currentQuantity).toFixed(3)} {selected.unit}</span>
          </div>
        )}
        <Field label="Quantidade Real Apurada" required>
          <Input type="number" min="0" step="0.001" value={form.newQuantity}
            onChange={(e) => setForm((f) => ({ ...f, newQuantity: e.target.value }))}
            placeholder="Digite a quantidade física contada" />
        </Field>
        {diff !== null && (
          <div className="rounded-xl px-3 py-2 text-sm"
            style={{ background: parseFloat(diff) < 0 ? RF : GF, border: `1px solid ${parseFloat(diff) < 0 ? '#EF9A9A' : '#A5D6A7'}` }}>
            <span style={{ color: M }}>Diferença: </span>
            <span className="font-bold" style={{ color: parseFloat(diff) < 0 ? R : G }}>
              {parseFloat(diff) > 0 ? '+' : ''}{diff} {selected?.unit}
            </span>
          </div>
        )}
        <Field label="Motivo" required>
          <SuggestionChips suggestions={ADJUST_SUGGESTIONS} value={form.reason} onSelect={(s) => setForm((f) => ({ ...f, reason: s }))} />
          <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="Ex: Contagem física mensal, inventário semestral..." />
        </Field>
      </div>
      <div className="flex gap-3 mt-5">
        <Btn variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn onClick={handle} disabled={saving} style={{ flex: 1 }}>
          {saving ? <Spinner size={4} color={W} /> : 'Confirmar Ajuste'}
        </Btn>
      </div>
    </Modal>
  );
}

function TabAlertas() {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [resolving, setResolving] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    stockApi.alerts.list()
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (alertId) => {
    setResolving(alertId);
    try {
      await stockApi.alerts.resolve(alertId);
      toast.success('Alerta resolvido.');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao resolver alerta.');
    } finally {
      setResolving(null);
    }
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : alerts.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-lg font-semibold" style={{ color: G }}>Nenhum alerta ativo</p>
          <p className="text-sm mt-1" style={{ color: M }}>Todos os insumos estão acima do nível mínimo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, idx) => (
            <motion.div key={a.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              className="rounded-2xl p-4 flex items-center justify-between gap-4"
              style={{ background: RF, border: '1px solid #EF9A9A' }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: R }} />
                  <span className="font-semibold text-sm" style={{ color: R }}>{a.stockItemName}</span>
                </div>
                <div className="flex gap-4 text-xs" style={{ color: M }}>
                  <span>Atual: <strong style={{ color: R }}>{Number(a.currentQuantity).toFixed(3)}</strong></span>
                  <span>Mínimo: <strong style={{ color: D }}>{Number(a.minimumQuantity).toFixed(3)}</strong></span>
                  <span>Desde: {fmt(a.createdAt)}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: O }}>
                  Produtos que usam este insumo foram bloqueados automaticamente até que o estoque seja reposto.
                </p>
              </div>
              <button onClick={() => handleResolve(a.id)} disabled={resolving === a.id}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 flex-shrink-0"
                style={{ background: G, color: W, border: 'none' }}>
                {resolving === a.id ? <Spinner size={4} color={W} /> : 'Resolver'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabRelatorio() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    stockApi.report.consolidated()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const fmtNum = (n) => Number(n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const filtered = rows.filter(r =>
    r.insumo?.toLowerCase().includes(search.toLowerCase())
  );

  const totalEntradas = rows.reduce((s, r) => s + (parseFloat(r.totalEntradas) || 0), 0);
  const totalSaidas   = rows.reduce((s, r) => s + (parseFloat(r.totalSaidas)   || 0), 0);

  return (
    <div>
      {/* Header com busca e totais */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar insumo..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#FAFAFA', border: `1.5px solid ${B}`, color: D, minWidth: 180 }}
        />
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: GF, color: G, border: `1px solid #A5D6A7` }}>
            ↑ Entradas: {fmtNum(totalEntradas)}
          </div>
          <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: RF, color: R, border: `1px solid #EF9A9A` }}>
            ↓ Saídas: {fmtNum(totalSaidas)}
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); stockApi.report.consolidated().then(setRows).catch(() => {}).finally(() => setLoading(false)); }}
          className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          style={{ background: '#F5F5F5', color: M, border: `1px solid ${B}` }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: M, fontSize: 14 }}>Carregando relatório...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: M, fontSize: 14 }}>
          {search ? 'Nenhum insumo encontrado.' : 'Sem movimentações registradas.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${B}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: `1px solid ${B}` }}>
                {['Insumo', 'Unidade', 'Total Entradas', 'Total Saídas', 'Saldo Atual', 'Giro'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: M }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((row, idx) => {
                  const entradas = parseFloat(row.totalEntradas) || 0;
                  const saidas   = parseFloat(row.totalSaidas)   || 0;
                  const saldo    = parseFloat(row.saldoAtual)     || 0;
                  const giro     = entradas > 0 ? ((saidas / entradas) * 100).toFixed(1) : '—';
                  const belowZero = saldo <= 0;
                  const giroNum  = parseFloat(giro);
                  const giroColor = isNaN(giroNum) ? M : giroNum > 70 ? R : giroNum > 40 ? O : G;

                  return (
                    <motion.tr key={row.insumo}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      style={{ borderBottom: `1px solid ${B}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: D }}>{row.insumo}</td>
                      <td className="px-4 py-3" style={{ color: M }}>
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{ background: '#F5F5F5', color: M }}>{row.unidade}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: G }}>
                        <span className="flex items-center gap-1">
                          <span className="text-xs">↑</span>{fmtNum(entradas)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: R }}>
                        <span className="flex items-center gap-1">
                          <span className="text-xs">↓</span>{fmtNum(saidas)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: belowZero ? RF : GF, color: belowZero ? R : G, border: `1px solid ${belowZero ? '#EF9A9A' : '#A5D6A7'}` }}>
                          {fmtNum(saldo)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {giro !== '—' ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F0F0F0', maxWidth: 60 }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(giroNum, 100)}%`, background: giroColor }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: giroColor }}>{giro}%</span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: M }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs mt-3" style={{ color: M }}>
        {filtered.length} insumo{filtered.length !== 1 ? 's' : ''} · Giro = saídas / entradas
      </p>
    </div>
  );
}

const TABS = [
  { key: 'insumos',       label: 'Insumos'        },
  { key: 'movimentacoes', label: 'Movimentações'  },
  { key: 'alertas',       label: 'Alertas'        },
  { key: 'relatorio',     label: 'Relatório'      },
];

export default function Estoque() {
  const [tab, setTab]     = useState('insumos');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    setLoading(true);
    stockApi.items.list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const activeItems = items.filter((i) => i.status === 'ACTIVE');
  const belowMin = items.filter((i) => i.belowMinimum && i.status === 'ACTIVE').length;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F5F5' }}>
      <Sidebar />

      <motion.div className="flex-1 p-6 pt-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
              <h1 className="text-2xl font-bold" style={{ color: D }}>Estoque</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: M }}>Controle de insumos, entradas e movimentações</p>
          </div>
        </div>

        <div className="flex gap-4 mb-5 flex-wrap">
          <StatCard label="Total de Insumos" value={items.length} />
          <StatCard label="Insumos Ativos" value={activeItems.length} accent={G} />
          <StatCard label="Abaixo do Mínimo" value={belowMin} accent={belowMin > 0 ? R : G} />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: W, border: `1px solid ${B}`, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div className="flex" style={{ borderBottom: `1px solid ${B}` }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="relative px-5 py-3.5 text-sm font-semibold transition-all"
                style={{ color: tab === t.key ? G : M, background: 'transparent', border: 'none' }}>
                {t.label}
                {t.key === 'alertas' && belowMin > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: R, color: W }}>
                    {belowMin}
                  </span>
                )}
                {tab === t.key && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: G }} />
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {tab === 'insumos'       && <TabInsumos items={items} loading={loading} onRefresh={loadItems} />}
                {tab === 'movimentacoes' && <TabMovimentacoes items={items} />}
                {tab === 'alertas'       && <TabAlertas />}
                {tab === 'relatorio'     && <TabRelatorio />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
