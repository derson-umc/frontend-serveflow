import { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useProducts } from '@features/products/hooks/useProducts';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_CONFIG = {
  RASCUNHO:  { label: 'Rascunho',   bg: '#e0e7ff', color: '#4338ca' },
  ENVIADO:   { label: 'Enviado',    bg: '#fef9c3', color: '#a16207' },
  EM_PREPARO: { label: 'Em preparo', bg: '#ffedd5', color: '#c2410c' },
  PRONTO:    { label: 'Pronto',     bg: '#dcfce7', color: '#15803d' },
  A_CAMINHO: { label: 'A caminho',  bg: '#e0f2fe', color: '#0369a1' },
  ENTREGUE:  { label: 'Entregue',   bg: '#f0fdf4', color: '#166534' },
  CANCELADO: { label: 'Cancelado',  bg: '#fee2e2', color: '#b91c1c' },
};

// full: adicionar, remover, editar qty e mesa
// qty: apenas ajustar quantidades
// none: somente leitura
function editMode(status) {
  if (status === 'RASCUNHO') return 'full';
  if (status === 'ENVIADO')  return 'qty';
  return 'none';
}

const WARNING = {
  ENVIADO:   { icon: '⚠', text: 'Pedido já enviado — apenas ajustes de quantidade são permitidos.' },
  EM_PREPARO: { icon: '🔒', text: 'Pedido em preparo — edição não disponível.' },
  PRONTO:    { icon: '✅', text: 'Pedido pronto — não é possível editar.' },
  A_CAMINHO: { icon: '🚚', text: 'Pedido a caminho — não é possível editar.' },
  ENTREGUE:  { icon: '✔', text: 'Pedido entregue — somente visualização.' },
  CANCELADO: { icon: '✕',  text: 'Pedido cancelado — somente visualização.' },
};

export function EditOrderModal({ order, type, open, onClose, onSave }) {
  const [editing, setEditing] = useState(() => JSON.parse(JSON.stringify(order)));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const { data: rawProducts = [] } = useProducts();

  const status = editing.status ?? 'RASCUNHO';
  const mode   = editMode(status);
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.RASCUNHO;
  const warn   = WARNING[status];

  const products = useMemo(
    () => rawProducts.filter((p) => p.active !== false),
    [rawProducts]
  );

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

  function removeItem(idx) {
    if (editing.itens.length <= 1) return; // ao menos 1 item
    setEditing((prev) => ({ ...prev, itens: prev.itens.filter((_, i) => i !== idx) }));
  }

  function addFromCatalog(product) {
    setEditing((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id:       product.id,
          name:     product.name,
          quantity: 1,
          price:    Number(product.price),
          total:    Number(product.price),
        },
      ],
    }));
    setPickerOpen(false);
    setPickerSearch('');
  }

  const isReadOnly = mode === 'none';
  const canAdd     = mode === 'full';
  const canRemove  = mode === 'full';

  const shortId = String(editing.id ?? '').slice(-8).toUpperCase();
  const heading = type === 'comanda'
    ? `Mesa ${editing.mesa || '—'}`
    : editing.nome || 'Delivery';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${type === 'comanda' ? 'Comanda' : 'Delivery'} — ${heading}`}
      size="lg"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="ghost" style={{ flex: 1 }} onClick={onClose}>Fechar</Button>
          {!isReadOnly && (
            <Button variant="primary" style={{ flex: 2 }} onClick={() => onSave({ ...editing, total })}>
              Salvar alterações
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Badge de status + ID curto */}
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: 11, fontWeight: 700,
              background: cfg.bg, color: cfg.color,
              borderRadius: 99, padding: '3px 10px',
            }}
          >
            {cfg.label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
            #{shortId}
          </span>
        </div>

        {/* Banner de aviso por status */}
        {warn && (
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: mode === 'qty' ? '#fefce8' : '#fef2f2',
              border: `1px solid ${mode === 'qty' ? '#fef08a' : '#fecaca'}`,
              fontSize: 'var(--text-xs)',
              color: mode === 'qty' ? '#854d0e' : '#991b1b',
            }}
          >
            <span style={{ flexShrink: 0, fontSize: 14 }}>{warn.icon}</span>
            <span>{warn.text}</span>
          </div>
        )}

        {/* Info do pedido */}
        {editing.data && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}>
            Registrado em {editing.data}
          </p>
        )}

        {/* Mesa (editável apenas no modo full) */}
        {type === 'comanda' && mode === 'full' && (
          <div>
            <label style={labelStyle}>Número da mesa</label>
            <input
              value={editing.mesa ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, mesa: e.target.value }))}
              placeholder="Ex: 12"
              style={inputStyle}
            />
          </div>
        )}

        {/* Itens */}
        <div>
          <div className="flex items-center justify-between mb-2">
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
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--color-success)',
                  background: 'var(--color-success-surface)',
                  border: '1.5px solid var(--color-success-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 12px',
                  cursor: 'pointer',
                }}
              >
                + Adicionar produto
              </button>
            )}
          </div>

          {/* Picker de produtos do catálogo */}
          {pickerOpen && (
            <div
              style={{
                marginBottom: 8,
                border: '1.5px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-success-surface)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-success-border)' }}>
                <input
                  autoFocus
                  placeholder="Buscar produto do cardápio…"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  style={{ ...inputStyle, margin: 0, fontSize: 12 }}
                />
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {filteredProducts.length === 0 ? (
                  <p style={{ padding: '12px 10px', fontSize: 12, color: 'var(--color-text-disabled)', textAlign: 'center' }}>
                    Nenhum produto encontrado
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addFromCatalog(p)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', gap: 8,
                        padding: '8px 12px', background: 'none', border: 'none',
                        borderBottom: '1px solid var(--color-success-border)',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(46,125,50,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 700, flexShrink: 0 }}>
                        {fmt(p.price)}
                      </span>
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
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {editing.itens.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}
              >
                {/* Nome */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', marginBottom: 1 }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {fmt(item.price)} / un
                  </p>
                </div>

                {/* Controles de quantidade */}
                {isReadOnly ? (
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: 40, textAlign: 'center' }}>
                    {item.quantity}×
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setQty(idx, -1)}
                      disabled={item.quantity <= 1}
                      style={qtyBtnStyle(item.quantity > 1)}
                    >−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {item.quantity}
                    </span>
                    <button type="button" onClick={() => setQty(idx, +1)} style={qtyBtnStyle(true)}>+</button>
                  </div>
                )}

                {/* Total do item */}
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-success)', minWidth: 64, textAlign: 'right', flexShrink: 0 }}>
                  {fmt(item.price * item.quantity)}
                </span>

                {/* Remover */}
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={editing.itens.length <= 1}
                    title={editing.itens.length <= 1 ? 'Pedido precisa ter ao menos 1 item' : 'Remover item'}
                    style={{
                      width: 26, height: 26, flexShrink: 0,
                      borderRadius: 'var(--radius-sm)',
                      background: editing.itens.length <= 1 ? 'var(--color-bg)' : 'var(--color-error-surface)',
                      color: editing.itens.length <= 1 ? 'var(--color-text-disabled)' : 'var(--color-error)',
                      border: `1px solid ${editing.itens.length <= 1 ? 'var(--color-border)' : 'var(--color-error-border, #fca5a5)'}`,
                      cursor: editing.itens.length <= 1 ? 'default' : 'pointer',
                      fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: editing.itens.length <= 1 ? 0.4 : 1,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total geral */}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--color-success-surface)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)' }}>
            Total do pedido
          </span>
          <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-black)', color: 'var(--color-success)' }}>
            {fmt(total)}
          </span>
        </div>

      </div>
    </Modal>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  boxSizing: 'border-box',
};

function qtyBtnStyle(enabled) {
  return {
    width: 26, height: 26,
    borderRadius: 'var(--radius-sm)',
    background: enabled ? 'var(--color-success-surface)' : 'var(--color-bg)',
    color: enabled ? 'var(--color-success)' : 'var(--color-text-disabled)',
    border: `1px solid ${enabled ? 'var(--color-success-border)' : 'var(--color-border)'}`,
    cursor: enabled ? 'pointer' : 'default',
    fontWeight: 700, fontSize: 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: enabled ? 1 : 0.4,
  };
}
