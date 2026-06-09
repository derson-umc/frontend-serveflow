import { useState, useMemo, useEffect } from 'react';
import { Modal }       from './Modal';
import { Button }      from './Button';
import { useProducts } from '@features/products/hooks/useProducts';
import { ordersApi }   from '@core/api/orders';
import { toast }       from '@shared/components/feedback/Toast';

// Categorias que não passam pela cozinha (KDS) — garçom pode cancelar individualmente
const DRINK_CATEGORIES = new Set(['BEBIDA_ALCOOLICA', 'BEBIDA_NAO_ALCOOLICA']);

const ITEM_STATUS_CFG = {
  ENVIADO:                 { label: 'Pendente',   bg: '#fef9c3', color: '#a16207' },
  EM_PREPARO:              { label: 'Em preparo', bg: '#ffedd5', color: '#c2410c' },
  PRONTO:                  { label: 'Pronto',     bg: '#dcfce7', color: '#15803d' },
  CANCELADO_ANTES_PREPARO: { label: 'Cancelado',  bg: '#fee2e2', color: '#b91c1c' },
  CANCELADO_EM_PREPARO:    { label: 'Cancelado',  bg: '#fee2e2', color: '#b91c1c' },
};

function mapApiItem(i) {
  return {
    id:              i.id,
    productId:       i.productId,
    name:            i.productName,
    quantity:        i.quantity,
    price:           Number(i.unitPrice),
    total:           Number(i.total),
    observation:     i.observation ?? '',
    productCategory: i.productCategory ?? null,
    itemStatus:      i.status ?? null,
    cancelReason:    i.cancelReason ?? null,
  };
}

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function editMode(status, comandaStatus) {
  if (comandaStatus === 'FECHADA' || comandaStatus === 'EM_FECHAMENTO') return 'none';
  if (status === 'CANCELADO') return 'none';

  if (status === 'PENDENTE')                          return 'full';
  if (status === 'EM_PREPARO' || status === 'PRONTO') return 'add_drinks';
  // ENVIADO, ENTREGUE (comanda aberta) → pode adicionar tudo
  return 'add_all';
}

const STATUS_CONFIG = {
  PENDENTE:             { label: 'Pendente',          bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  ENVIADO:              { label: 'Enviado',            bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  EM_PREPARO:           { label: 'Em preparo',         bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  PRONTO:               { label: 'Pronto',             bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  AGUARDANDO_PAGAMENTO: { label: 'Aguard. pagamento',  bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  A_CAMINHO:            { label: 'A caminho',          bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  ENTREGUE:             { label: 'Entregue',           bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  CANCELADO:            { label: 'Cancelado',          bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
};

// Mensagens dependem do status E do comandaStatus
function getStatusMsg(status, comandaStatus) {
  if (status === 'CANCELADO')             return 'Pedido cancelado. Somente visualização.';
  if (comandaStatus === 'FECHADA')        return 'Comanda fechada. Somente visualização.';
  if (comandaStatus === 'EM_FECHAMENTO')  return 'Conta enviada ao caixa. Aguardando pagamento — nenhuma alteração permitida.';
  if (status === 'ENVIADO')    return 'Pedido enviado à cozinha. Adicione itens à comanda enquanto aguarda.';
  if (status === 'EM_PREPARO') return 'Pedido em preparo. Apenas bebidas podem ser adicionadas agora.';
  if (status === 'PRONTO')     return 'Prato pronto! Apenas bebidas podem ser adicionadas agora.';
  if (status === 'AGUARDANDO_PAGAMENTO') return 'Aguardando pagamento no caixa. Ainda é possível adicionar itens à comanda.';
  if (status === 'A_CAMINHO')  return 'Pedido a caminho. Adicione itens à comanda enquanto aguarda.';
  if (status === 'ENTREGUE' && comandaStatus === 'ABERTA') return 'Prato entregue. A comanda continua aberta — adicione mais itens se necessário.';
  return null;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1)    return 'agora mesmo';
    if (diff < 60)   return `${diff} min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return null;
  } catch { return null; }
}

export function EditOrderModal({ order, type, open, onClose, onSave, onAddItems, existingTables = [] }) {
  const [editing,           setEditing]           = useState(() => JSON.parse(JSON.stringify(order)));
  const [pickerOpen,        setPickerOpen]        = useState(false);
  const [pickerSearch,      setPickerSearch]      = useState('');
  const [mesaError,         setMesaError]         = useState('');
  const [cancelDrinkIdx,    setCancelDrinkIdx]    = useState(null);
  const [cancelDrinkReason, setCancelDrinkReason] = useState('');
  const [cancelDrinkBusy,   setCancelDrinkBusy]   = useState(false);
  const [novosItens,        setNovosItens]        = useState([]);
  const [newPickerOpen,     setNewPickerOpen]     = useState(false);
  const [newPickerSearch,   setNewPickerSearch]   = useState('');
  const [addingBusy,        setAddingBusy]        = useState(false);

  // Sempre busca status, comandaStatus e itens atualizados do backend ao abrir
  useEffect(() => {
    if (!open || !order.id || typeof order.id === 'number') return;
    ordersApi.get(order.id)
      .then((fresh) => setEditing((prev) => ({
        ...prev,
        status:        fresh.status,
        comandaStatus: fresh.comandaStatus ?? 'ABERTA',
        itens:         (fresh.items ?? []).map(mapApiItem),
      })))
      .catch(() => {});
  }, [open, order.id]);

  const { data: rawProducts = [] } = useProducts();

  const status        = editing.status ?? 'PENDENTE';
  const comandaStatus = editing.comandaStatus ?? 'ABERTA';
  const mode          = editMode(status, comandaStatus);
  const cfg           = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE;
  const statusMsg     = getStatusMsg(status, comandaStatus);

  const products = useMemo(() => rawProducts.filter((p) => p.active !== false), [rawProducts]);

  const filteredProducts = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, pickerSearch]);

  const total = editing.itens.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

  function setQty(idx, delta) {
    setEditing((prev) => {
      const itens = [...prev.itens];
      const newQty = Math.max(1, (itens[idx].quantity || 1) + delta);
      itens[idx] = { ...itens[idx], quantity: newQty, total: itens[idx].price * newQty };
      return { ...prev, itens };
    });
  }

  function setObservation(idx, text) {
    setEditing((prev) => {
      const itens = [...prev.itens];
      itens[idx] = { ...itens[idx], observation: text };
      return { ...prev, itens };
    });
  }

  function removeItem(idx) {
    if (editing.itens.length <= 1) return;
    setEditing((prev) => ({ ...prev, itens: prev.itens.filter((_, i) => i !== idx) }));
  }

  function duplicateItem(idx) {
    setEditing((prev) => {
      const source = prev.itens[idx];
      const copy   = { ...source, id: `dup-${Date.now()}` };
      const itens  = [...prev.itens];
      itens.splice(idx + 1, 0, copy);
      return { ...prev, itens };
    });
  }

  function addFromCatalog(product) {
    setEditing((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id:              product.id,
          productId:       product.id,
          name:            product.name,
          quantity:        1,
          price:           Number(product.price),
          total:           Number(product.price),
          observation:     '',
          productCategory: product.productCategory ?? null,
        },
      ],
    }));
    setPickerOpen(false);
    setPickerSearch('');
  }

  async function handleCancelDrink() {
    if (!cancelDrinkReason.trim()) return;
    const item = editing.itens[cancelDrinkIdx];
    setCancelDrinkBusy(true);
    try {
      await ordersApi.cancelItem(editing.id, item.id, cancelDrinkReason.trim());
      setEditing((prev) => ({
        ...prev,
        itens: prev.itens.filter((_, i) => i !== cancelDrinkIdx),
      }));
      setCancelDrinkIdx(null);
      setCancelDrinkReason('');
      toast.success(`"${item.name}" removido do pedido.`);
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Erro ao cancelar item.');
    } finally {
      setCancelDrinkBusy(false);
    }
  }

  function handleSave() {
    if (type === 'comanda' && mode === 'full') {
      const mesa = String(editing.mesa ?? '').trim();
      const isDuplicate = existingTables
        .filter((t) => t.id !== editing.id)
        .some((t) => String(t.mesa ?? '').trim() === mesa && mesa !== '');
      if (isDuplicate) {
        setMesaError(`Mesa ${mesa} já possui uma comanda aberta.`);
        return;
      }
    }
    setMesaError('');
    onSave({ ...editing, total });
  }

  const isReadOnly   = mode === 'none';
  const canAdd       = mode === 'full';
  const canAddNew    = mode === 'add_all' || mode === 'add_drinks';
  const heading      = type === 'comanda' ? `Mesa ${editing.mesa || '—'}` : (editing.nome || 'Delivery');
  const relative     = timeAgo(editing.data || editing.createdAt);
  const totalNovos   = novosItens.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

  // Produtos disponíveis para adicionar em pedidos confirmados
  const addableProducts = useMemo(() => {
    const active = rawProducts.filter((p) => p.active !== false);
    if (mode === 'add_drinks') return active.filter((p) => DRINK_CATEGORIES.has(p.productCategory));
    return active;
  }, [rawProducts, mode]);

  const filteredNewProducts = useMemo(() => {
    const q = newPickerSearch.trim().toLowerCase();
    return q ? addableProducts.filter((p) => p.name.toLowerCase().includes(q)) : addableProducts;
  }, [addableProducts, newPickerSearch]);

  function addToNewOrder(product) {
    setNovosItens((prev) => {
      const existing = prev.findIndex((i) => i.productId === product.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], quantity: next[existing].quantity + 1 };
        return next;
      }
      return [...prev, {
        id: product.id, productId: product.id,
        name: product.name, quantity: 1,
        price: Number(product.price), total: Number(product.price),
        observation: '', productCategory: product.productCategory ?? null,
      }];
    });
    setNewPickerOpen(false);
    setNewPickerSearch('');
  }

  function setNewQty(idx, delta) {
    setNovosItens((prev) => {
      const next = [...prev];
      const newQty = Math.max(1, next[idx].quantity + delta);
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  }

  function removeNewItem(idx) {
    setNovosItens((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleAddItems() {
    if (novosItens.length === 0) return;
    setAddingBusy(true);
    try {
      const payload = novosItens.map((i) => ({
        productId:       i.productId,
        productName:     i.name,
        quantity:        i.quantity,
        unitPrice:       i.price,
        observation:     i.observation || null,
        productCategory: i.productCategory || null,
        additionals:     [],
      }));
      const updated = await ordersApi.addItems(editing.id, payload);
      setEditing((prev) => ({
        ...prev,
        status:        updated.status,
        comandaStatus: updated.comandaStatus ?? prev.comandaStatus ?? 'ABERTA',
        itens:         (updated.items ?? []).map(mapApiItem),
      }));
      setNovosItens([]);
      if (onAddItems) onAddItems(updated);
      toast.success(`${novosItens.length} item(ns) adicionado(s) com sucesso.`);
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Erro ao adicionar itens.');
    } finally {
      setAddingBusy(false);
    }
  }

  // Item cancelável: pendente (ENVIADO) ou bebida sem status conhecido; nunca em preparo/pronto/cancelado
  function canCancelItem(item) {
    if (['PENDENTE', 'ENTREGUE'].includes(status) || status.startsWith('CANCELADO')) return false;
    if (item.itemStatus === 'EM_PREPARO' || item.itemStatus === 'PRONTO') return false;
    if (item.itemStatus?.startsWith('CANCELADO')) return false;
    return DRINK_CATEGORIES.has(item.productCategory) || item.itemStatus === 'ENVIADO';
  }

  const modalTitle = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {type === 'comanda' ? 'Comanda' : 'Delivery'} — {heading}
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        letterSpacing: 0.2,
      }}>
        {cfg.label}
      </span>
    </span>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="ghost" style={{ flex: 1 }} onClick={onClose}>Fechar</Button>
          {mode === 'full' && (
            <Button variant="primary" style={{ flex: 2 }} onClick={handleSave}>
              Salvar alterações
            </Button>
          )}
          {canAddNew && novosItens.length > 0 && (
            <Button
              variant="primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              loading={addingBusy}
              onClick={handleAddItems}
            >
              Salvar
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Data + hora relativa */}
        {editing.data && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: -8 }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--color-text-disabled)" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
              {editing.data}
              {relative && (
                <span style={{ marginLeft: 6, fontStyle: 'italic' }}>({relative})</span>
              )}
            </span>
          </div>
        )}

        {/* Banner de status */}
        {statusMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 'var(--radius-md)',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            fontSize: 12, color: cfg.color, fontWeight: 600,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={cfg.color} strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            {statusMsg}
          </div>
        )}

        {/* Número da mesa — editável só no modo full */}
        {type === 'comanda' && mode === 'full' && (
          <div>
            <label style={labelStyle}>Número da mesa</label>
            <input
              value={editing.mesa ?? ''}
              onChange={(e) => { setEditing((p) => ({ ...p, mesa: e.target.value })); setMesaError(''); }}
              placeholder="Ex: 12"
              style={{ ...inputStyle, borderColor: mesaError ? 'var(--color-error)' : undefined }}
            />
            {mesaError && (
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--color-error)', fontWeight: 600 }}>
                ⚠ {mesaError}
              </p>
            )}
          </div>
        )}

        {/* ── Itens ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ ...labelStyle, margin: 0 }}>
              Itens do pedido
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                ({editing.itens.length})
              </span>
            </span>
            {canAdd && !pickerOpen && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--color-success)',
                  background: 'var(--color-success-surface)',
                  border: '1.5px solid var(--color-success-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 12px', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Produto
              </button>
            )}
          </div>

          {/* Product picker */}
          {pickerOpen && (
            <div style={{
              marginBottom: 10,
              border: '1.5px solid var(--color-success-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-surface)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-success-border)' }}>
                <input
                  autoFocus
                  placeholder="Buscar produto do cardápio…"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  style={{ ...inputStyle, margin: 0, fontSize: 12 }}
                />
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {filteredProducts.length === 0 ? (
                  <p style={{ padding: '14px 10px', fontSize: 12, color: 'var(--color-text-disabled)', textAlign: 'center' }}>
                    Nenhum produto encontrado
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addFromCatalog(p)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', background: 'none', border: 'none',
                        borderBottom: '1px solid var(--color-success-border)',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(46,125,50,0.07)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                          background: 'rgba(46,125,50,0.12)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: 'var(--color-success)',
                        }}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </p>
                        {p.category && (
                          <p style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 1 }}>{p.category}</p>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 700, flexShrink: 0 }}>{fmt(p.price)}</span>
                    </button>
                  ))
                )}
              </div>
              <div style={{ padding: '6px 10px', borderTop: '1px solid var(--color-success-border)' }}>
                <button
                  type="button"
                  onClick={() => { setPickerOpen(false); setPickerSearch(''); }}
                  style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
          )}

          {/* Lista de itens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
            {editing.itens.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}
              >
                {/* Linha principal: qty / nome / preço / ações */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                  {/* Qty: badge (leitura) em qualquer modo não-PENDENTE; controles apenas no full */}
                  {!canAdd ? (
                    <span style={{
                      background: 'var(--color-success-surface)',
                      color: 'var(--color-success)',
                      border: '1px solid var(--color-success-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 8px',
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>
                      {item.quantity}×
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <button type="button" onClick={() => setQty(idx, -1)} disabled={item.quantity <= 1} style={qtyBtnStyle(item.quantity > 1)}>−</button>
                      <span style={{ minWidth: 22, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button type="button" onClick={() => setQty(idx, +1)} style={qtyBtnStyle(true)}>+</button>
                    </div>
                  )}

                  {/* Nome + preço unitário */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                      {fmt(item.price)} / un
                    </p>
                  </div>

                  {/* Preço total do item */}
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-success)', flexShrink: 0 }}>
                    {fmt(item.price * item.quantity)}
                  </span>

                  {/* Ações: modo full (PENDENTE) */}
                  {canAdd && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button type="button" title="Duplicar" onClick={() => duplicateItem(idx)}
                        style={iconBtnStyle('#e0f2fe', '#0369a1')}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                      {editing.itens.length > 1 && (
                        <button type="button" title="Remover" onClick={() => removeItem(idx)}
                          style={iconBtnStyle('#fee2e2', 'var(--color-error)')}>✕</button>
                      )}
                    </div>
                  )}


                  {/* Ação: cancelar item pendente ou bebida */}
                  {canCancelItem(item) && cancelDrinkIdx !== idx && (
                    <button
                      type="button"
                      title="Remover bebida do pedido"
                      onClick={() => { setCancelDrinkIdx(idx); setCancelDrinkReason(''); }}
                      style={{
                        ...iconBtnStyle('#fee2e2', 'var(--color-error)'),
                        width: 'auto', padding: '3px 8px', fontSize: 10, fontWeight: 700, gap: 3,
                        display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-sm)',
                        border: '1px solid #fca5a5',
                      }}
                    >
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </button>
                  )}
                </div>

                {/* Observação — input editável só em PENDENTE; exibe texto se preenchido nos demais modos */}
                {canAdd ? (
                  <input
                    type="text"
                    placeholder="Observação (ex: sem cebola, bem passado…)"
                    value={item.observation ?? ''}
                    onChange={(e) => setObservation(idx, e.target.value)}
                    maxLength={200}
                    style={{ ...inputStyle, fontSize: 11, padding: '4px 8px', marginTop: 8, color: 'var(--color-text-secondary)' }}
                  />
                ) : item.observation ? (
                  <p style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 8, paddingLeft: 8, borderLeft: '2px solid var(--color-border)', lineHeight: 1.4 }}>
                    {item.observation}
                  </p>
                ) : null}

                {/* Formulário inline de cancelamento de bebida */}
                {cancelDrinkIdx === idx && (
                  <div style={{
                    marginTop: 8, padding: '8px 10px',
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', margin: 0 }}>
                      Motivo da remoção <span style={{ fontWeight: 400 }}>(obrigatório)</span>
                    </p>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Ex: cliente mudou de ideia, item errado…"
                      value={cancelDrinkReason}
                      onChange={(e) => setCancelDrinkReason(e.target.value)}
                      maxLength={200}
                      style={{ ...inputStyle, fontSize: 11, padding: '4px 8px', borderColor: '#fca5a5' }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCancelDrink(); if (e.key === 'Escape') setCancelDrinkIdx(null); }}
                    />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => { setCancelDrinkIdx(null); setCancelDrinkReason(''); }}
                        disabled={cancelDrinkBusy}
                        style={{ border: '1px solid var(--color-border)', background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#6b7280' }}
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDrink}
                        disabled={cancelDrinkBusy || !cancelDrinkReason.trim()}
                        style={{
                          border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                          background: cancelDrinkBusy || !cancelDrinkReason.trim() ? '#E0E0E0' : '#dc2626',
                          color: cancelDrinkBusy || !cancelDrinkReason.trim() ? '#9e9e9e' : '#fff',
                          cursor: cancelDrinkBusy || !cancelDrinkReason.trim() ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {cancelDrinkBusy ? 'Removendo…' : 'Confirmar remoção'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Seção: Adicionar novos itens (pedidos confirmados) ── */}
        {canAddNew && (
          <div style={{ borderTop: '2px dashed var(--color-border)', paddingTop: 20, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <span style={{ ...labelStyle, margin: 0 }}>
                  {mode === 'add_drinks' ? 'Adicionar bebidas' : 'Adicionar itens'}
                </span>
                {mode === 'add_all' && (
                  <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    Os itens serão enviados à cozinha e adicionados à comanda
                  </p>
                )}
              </div>
              {!newPickerOpen && (
                <button
                  type="button"
                  onClick={() => setNewPickerOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 700,
                    color: '#0369a1', background: '#e0f2fe',
                    border: '1.5px solid #7dd3fc',
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 12px', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                  {mode === 'add_drinks' ? 'Bebida' : 'Produto'}
                </button>
              )}
            </div>

            {/* Picker para novos itens */}
            {newPickerOpen && (
              <div style={{
                marginBottom: 10, border: '1.5px solid #7dd3fc',
                borderRadius: 'var(--radius-md)', background: '#e0f2fe',
                overflow: 'hidden', boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #7dd3fc' }}>
                  <input
                    autoFocus
                    placeholder={mode === 'add_drinks' ? 'Buscar bebida…' : 'Buscar produto do cardápio…'}
                    value={newPickerSearch}
                    onChange={(e) => setNewPickerSearch(e.target.value)}
                    style={{ ...inputStyle, margin: 0, fontSize: 12 }}
                  />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {filteredNewProducts.length === 0 ? (
                    <p style={{ padding: '12px 10px', fontSize: 12, color: 'var(--color-text-disabled)', textAlign: 'center' }}>
                      Nenhum produto encontrado
                    </p>
                  ) : filteredNewProducts.map((p) => (
                    <button key={p.id} type="button" onClick={() => addToNewOrder(p)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'none', border: 'none', borderBottom: '1px solid #bae6fd', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(3,105,161,0.07)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(3,105,161,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0369a1', flexShrink: 0 }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      </div>
                      <span style={{ fontSize: 12, color: '#0369a1', fontWeight: 700, flexShrink: 0 }}>{fmt(p.price)}</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: '6px 10px', borderTop: '1px solid #bae6fd' }}>
                  <button type="button" onClick={() => { setNewPickerOpen(false); setNewPickerSearch(''); }}
                    style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    ✕ Fechar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de novos itens */}
            {novosItens.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {novosItens.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <button type="button" onClick={() => setNewQty(idx, -1)} disabled={item.quantity <= 1} style={qtyBtnStyle(item.quantity > 1)}>−</button>
                      <span style={{ minWidth: 22, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>{item.quantity}</span>
                      <button type="button" onClick={() => setNewQty(idx, +1)} style={qtyBtnStyle(true)}>+</button>
                    </div>
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', flexShrink: 0 }}>{fmt(item.price * item.quantity)}</span>
                    <button type="button" onClick={() => removeNewItem(idx)} style={iconBtnStyle('#fee2e2', 'var(--color-error)')}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Total */}
        <div style={{
          background: 'var(--color-success-surface)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
        }}>
          {novosItens.length > 0 ? (
            /* Breakdown: anterior + adição = total */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  Pedido atual
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  {fmt(total)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#0369a1' }}>
                  + {novosItens.length} {novosItens.length === 1 ? 'item' : 'itens'} adicionado{novosItens.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                  +{fmt(totalNovos)}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-success-border)', marginTop: 4, paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total
                </span>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-success)' }}>
                  {fmt(total + totalNovos)}
                </span>
              </div>
            </div>
          ) : (
            /* Resumo simples */
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Total do pedido
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, margin: 0 }}>
                  {editing.itens.length} item{editing.itens.length !== 1 ? 'ns' : ''}
                  {' · '}
                  {editing.itens.reduce((s, i) => s + i.quantity, 0)} unidade{editing.itens.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-success)' }}>
                {fmt(total)}
              </span>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--color-text-secondary)', marginBottom: 6,
};

const inputStyle = {
  width: '100%', padding: '8px 10px',
  fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box',
};

function qtyBtnStyle(enabled) {
  return {
    width: 26, height: 26, borderRadius: 'var(--radius-sm)',
    background:  enabled ? 'var(--color-success-surface)' : 'var(--color-bg)',
    color:       enabled ? 'var(--color-success)'         : 'var(--color-text-disabled)',
    border:      `1px solid ${enabled ? 'var(--color-success-border)' : 'var(--color-border)'}`,
    cursor:      enabled ? 'pointer' : 'default',
    fontWeight:  700, fontSize: 15,
    display:     'flex', alignItems: 'center', justifyContent: 'center',
    opacity:     enabled ? 1 : 0.4,
  };
}

function iconBtnStyle(bg, color) {
  return {
    width: 26, height: 26, borderRadius: 'var(--radius-sm)',
    background: bg, color, border: 'none',
    cursor: 'pointer', fontSize: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };
}
