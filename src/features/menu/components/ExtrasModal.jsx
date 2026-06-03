import { useState, useMemo } from 'react';
import { Modal } from '@shared/components/ui/Modal';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { useProducts } from '@features/products/hooks/useProducts';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function toTitleCase(s) {
  return String(s ?? '').toLowerCase().replace(/(^|\s)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

export function ExtrasModal({ cartItem, initialExtras = [], onSave, onClose }) {
  const [extras, setExtras]     = useState(initialExtras);
  const [tab, setTab]           = useState('produtos');
  const [search, setSearch]     = useState('');
  const [manualForm, setManual] = useState({ name: '', quantity: 1, unitPrice: '' });
  const [err, setErr]           = useState('');

  const { data: rawProducts = [] } = useProducts();

  const products = useMemo(
    () =>
      rawProducts
        .filter((p) => p.active !== false)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category: toTitleCase(p.category ?? 'Outros'),
        })),
    [rawProducts]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, search]);

  const categories = useMemo(() => {
    const seen = new Set(filtered.map((p) => p.category));
    return [...seen].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [filtered]);

  function getQty(product) {
    return extras.find((e) => e.name === product.name)?.quantity ?? 0;
  }

  function setProductQty(product, qty) {
    setExtras((prev) => {
      const without = prev.filter((e) => e.name !== product.name);
      if (qty <= 0) return without;
      return [...without, { name: product.name, quantity: qty, unitPrice: product.price }];
    });
  }

  function addManual() {
    if (!manualForm.name.trim()) return setErr('Nome é obrigatório.');
    const qty   = parseInt(manualForm.quantity, 10);
    const price = parseFloat(manualForm.unitPrice);
    if (isNaN(qty)   || qty   < 1)  return setErr('Quantidade inválida.');
    if (isNaN(price) || price <= 0) return setErr('Preço deve ser maior que zero.');
    setExtras((prev) => {
      const without = prev.filter((e) => e.name !== manualForm.name.trim());
      return [...without, { name: manualForm.name.trim(), quantity: qty, unitPrice: price }];
    });
    setManual({ name: '', quantity: 1, unitPrice: '' });
    setErr('');
  }

  const extrasTotal = extras.reduce((s, e) => s + e.unitPrice * e.quantity, 0);

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adicionais — ${cartItem.name}`}
      size="md"
      footer={
        <>
          <Button variant="ghost"   fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="primary" fullWidth onClick={() => onSave(cartItem.id, extras)}>
            Confirmar{extrasTotal > 0 ? ` (+${fmt(extrasTotal)})` : ''}
          </Button>
        </>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[
          { id: 'produtos', label: 'Produtos do cardápio' },
          { id: 'manual',   label: 'Adicional manual' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '6px 4px',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid',
              borderColor: tab === t.id ? 'var(--color-success-border)' : 'var(--color-border)',
              background: tab === t.id ? 'var(--color-success-surface)' : 'var(--color-bg)',
              color: tab === t.id ? 'var(--color-success)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selecionados */}
      {extras.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {extras.map((e, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                background: 'var(--color-warning-surface)',
                color: 'var(--color-warning)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
              }}
            >
              {e.quantity}× {e.name} — {fmt(e.unitPrice)}
              <button
                onClick={() => setExtras((prev) => prev.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: 12, lineHeight: 1, padding: 0 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {tab === 'produtos' ? (
        <>
          <Input
            placeholder="Buscar produto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-disabled)', textAlign: 'center', padding: '16px 0' }}>
                Nenhum produto encontrado
              </p>
            ) : (
              categories.map((cat) => (
                <div key={cat}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-disabled)', marginBottom: 6 }}>
                    {cat}
                  </p>
                  <div className="flex flex-col gap-1">
                    {filtered.filter((p) => p.category === cat).map((product) => {
                      const qty = getQty(product);
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between px-3 py-2"
                          style={{
                            borderRadius: 'var(--radius-md)',
                            background: qty > 0 ? 'var(--color-success-surface)' : 'var(--color-bg)',
                            border: `1px solid ${qty > 0 ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                            transition: 'all 0.1s',
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                              {product.name}
                            </p>
                            <p style={{ fontSize: 'var(--text-xs)', color: qty > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                              {fmt(product.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setProductQty(product, qty - 1)}
                              disabled={qty === 0}
                              style={qtyBtn('var(--color-success-surface)', 'var(--color-success)', qty === 0)}
                            >
                              −
                            </button>
                            <span style={{ minWidth: 20, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)' }}>
                              {qty}
                            </span>
                            <button
                              onClick={() => setProductQty(product, qty + 1)}
                              style={qtyBtn('var(--color-success-surface)', 'var(--color-success)', false)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Nome do adicional"
            value={manualForm.name}
            onChange={(e) => setManual((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addManual()}
          />
          <div className="flex gap-2">
            <Input
              type="number" min={1} placeholder="Qtd"
              value={manualForm.quantity}
              onChange={(e) => setManual((f) => ({ ...f, quantity: e.target.value }))}
              containerClassName="flex-1"
            />
            <Input
              type="number" min="0.01" step="0.01" placeholder="R$ unit."
              value={manualForm.unitPrice}
              onChange={(e) => setManual((f) => ({ ...f, unitPrice: e.target.value }))}
              containerClassName="flex-1"
            />
          </div>
          {err && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{err}</p>}
          <Button variant="warning" size="sm" onClick={addManual}>+ Adicionar</Button>
        </div>
      )}
    </Modal>
  );
}

function qtyBtn(bg, color, disabled) {
  return {
    width: 26, height: 26,
    borderRadius: 'var(--radius-sm)',
    background: disabled ? 'var(--color-border)' : bg,
    color: disabled ? 'var(--color-text-disabled)' : color,
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    fontWeight: 'var(--font-bold)',
    fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.4 : 1,
  };
}
