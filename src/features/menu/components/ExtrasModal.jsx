import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@shared/components/ui/Modal';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { useProducts } from '@features/products/hooks/useProducts';
import { stockApi } from '@core/api/stock';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function toTitleCase(s) {
  return String(s ?? '').toLowerCase()
    .replace(/(^|\s)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

// Faz matching entre ingrediente da ficha técnica e produto do catálogo
function matchIngredient(ingredientName, products) {
  const q = ingredientName.toLowerCase();
  return products.filter((p) => {
    const n = p.name.toLowerCase();
    return n.includes(q) || q.includes(n);
  });
}

export function ExtrasModal({ cartItem, initialExtras = [], onSave, onClose }) {
  const [extras,  setExtras]   = useState(initialExtras);
  const [search,  setSearch]   = useState('');
  const [recipe,  setRecipe]   = useState([]);   // ingredientes da ficha técnica

  const { data: rawProducts = [] } = useProducts();

  // Carrega ficha técnica do produto para gerar sugestões
  useEffect(() => {
    stockApi.recipes.getByProduct(cartItem.id)
      .then((d) => setRecipe(d?.ingredients ?? []))
      .catch(() => setRecipe([]));
  }, [cartItem.id]);

  // Somente produtos marcados como ADICIONAL aparecem aqui
  const adicionais = useMemo(
    () =>
      rawProducts
        .filter((p) => p.active !== false && p.productCategory === 'ADICIONAL')
        .map((p) => ({ id: p.id, name: p.name, price: Number(p.price) })),
    [rawProducts]
  );

  // Sugeridos: cruzamento ficha técnica × adicionais disponíveis
  const suggested = useMemo(() => {
    if (recipe.length === 0) return [];
    const hits = new Map();
    recipe.forEach((ing) => {
      matchIngredient(ing.stockItemName, adicionais).forEach((p) => {
        if (!hits.has(p.id)) hits.set(p.id, p);
      });
    });
    return [...hits.values()];
  }, [recipe, adicionais]);

  const suggestedIds = useMemo(() => new Set(suggested.map((p) => p.id)), [suggested]);

  const otherAdicionais = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adicionais
      .filter((p) => !suggestedIds.has(p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [adicionais, suggestedIds, search]);

  function getQty(name) {
    return extras.find((e) => e.name === name)?.quantity ?? 0;
  }

  function setQty(product, qty) {
    setExtras((prev) => {
      const without = prev.filter((e) => e.name !== product.name);
      if (qty <= 0) return without;
      return [...without, { name: product.name, quantity: qty, unitPrice: product.price }];
    });
  }

  const extrasTotal = extras.reduce((s, e) => s + e.unitPrice * e.quantity, 0);
  const nothingAvailable = adicionais.length === 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adicionais — ${cartItem.name}`}
      size="md"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="ghost"   style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button variant="primary" style={{ flex: 2 }} onClick={() => onSave(cartItem.id, extras)}>
            Confirmar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Selecionados */}
        {extras.length > 0 && (
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              padding: '8px 10px',
              background: 'var(--color-warning-surface)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-warning)', width: '100%', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Selecionados — +{fmt(extrasTotal)}
            </span>
            {extras.map((e, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 600,
                  background: 'var(--color-surface)', color: 'var(--color-warning)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 'var(--radius-full)', padding: '2px 8px',
                }}
              >
                {e.quantity}× {e.name} — {fmt(e.unitPrice)}
                <button
                  onClick={() => setExtras((p) => p.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: 12, lineHeight: 1, padding: 0 }}
                >✕</button>
              </span>
            ))}
          </div>
        )}

        {/* Corpo */}
        {nothingAvailable ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-disabled)' }}>
            <p style={{ fontSize: 'var(--text-sm)', marginBottom: 6 }}>Nenhum adicional cadastrado.</p>
            <p style={{ fontSize: 'var(--text-xs)' }}>
              No cadastro de produtos, defina a categoria como <strong>Adicional</strong> para que apareçam aqui.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 360, overflowY: 'auto' }}>
            {/* Sugeridos */}
            {suggested.length > 0 && (
              <div>
                <SectionLabel>Sugeridos para este prato</SectionLabel>
                <div className="flex flex-col gap-1.5">
                  {suggested.map((p) => (
                    <ProductRow key={p.id} product={p} qty={getQty(p.name)} onQtyChange={(q) => setQty(p, q)} />
                  ))}
                </div>
              </div>
            )}

            {/* Demais adicionais */}
            {otherAdicionais.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SectionLabel style={{ marginBottom: 0 }}>Adicionais disponíveis</SectionLabel>
                  <Input
                    placeholder="Buscar…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, fontSize: 12, padding: '4px 8px' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  {otherAdicionais.map((p) => (
                    <ProductRow key={p.id} product={p} qty={getQty(p.name)} onQtyChange={(q) => setQty(p, q)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function SectionLabel({ children, style }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
      marginBottom: 8, ...style,
    }}>
      {children}
    </p>
  );
}

function ProductRow({ product, qty, onQtyChange }) {
  const active = qty > 0;
  return (
    <div
      className="flex items-center gap-3 px-3 py-2"
      style={{
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--color-success-surface)' : 'var(--color-bg)',
        border: `1px solid ${active ? 'var(--color-success-border)' : 'var(--color-border)'}`,
        transition: 'all 0.12s',
      }}
    >
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          {product.name}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: active ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
          {fmt(product.price)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => onQtyChange(qty - 1)} disabled={qty === 0} style={qBtn(qty > 0)}>−</button>
        <span style={{ minWidth: 18, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: active ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
          {qty}
        </span>
        <button onClick={() => onQtyChange(qty + 1)} style={qBtn(true)}>+</button>
      </div>
    </div>
  );
}

function qBtn(enabled) {
  return {
    width: 24, height: 24,
    borderRadius: 'var(--radius-sm)',
    background: enabled ? 'var(--color-success-surface)' : 'var(--color-bg)',
    color:       enabled ? 'var(--color-success)' : 'var(--color-text-disabled)',
    border: `1px solid ${enabled ? 'var(--color-success-border)' : 'var(--color-border)'}`,
    cursor: enabled ? 'pointer' : 'default',
    fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: enabled ? 1 : 0.4,
  };
}
