import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@shared/components/ui/Modal';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { useProducts } from '@features/products/hooks/useProducts';
import { stockApi } from '@core/api/stock';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Categorias que são pratos completos — não devem aparecer como adicionais
const EXCLUDED_CATEGORIES = [
  'pratos principais', 'prato principal',
  'pratos a la carte', 'pratos à la carte', 'a la carte', 'à la carte',
  'pratos', 'refeições', 'refeicoes', 'lanches', 'combos', 'combo',
];

function isExcluded(category = '') {
  const cat = category.toLowerCase().trim();
  return EXCLUDED_CATEGORIES.some((exc) => cat.includes(exc) || exc.includes(cat));
}

function toTitleCase(s) {
  return String(s ?? '').toLowerCase()
    .replace(/(^|\s)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

// Tenta casar nome do ingrediente da ficha técnica com produto do catálogo
function matchIngredientToProducts(ingredientName, products) {
  const name = ingredientName.toLowerCase();
  return products.filter((p) => {
    const pName = p.name.toLowerCase();
    return pName.includes(name) || name.includes(pName);
  });
}

export function ExtrasModal({ cartItem, initialExtras = [], onSave, onClose }) {
  const [extras, setExtras]     = useState(initialExtras);
  const [tab, setTab]           = useState('adicionais');
  const [search, setSearch]     = useState('');
  const [manualForm, setManual] = useState({ name: '', quantity: 1, unitPrice: '' });
  const [err, setErr]           = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([]);

  const { data: rawProducts = [] } = useProducts();

  // Carrega ficha técnica do produto
  useEffect(() => {
    stockApi.recipes.getByProduct(cartItem.id)
      .then((data) => setRecipeIngredients(data?.ingredients ?? []))
      .catch(() => setRecipeIngredients([]));
  }, [cartItem.id]);

  const products = useMemo(
    () =>
      rawProducts
        .filter((p) => p.active !== false && !isExcluded(p.category))
        .map((p) => ({
          id:       p.id,
          name:     p.name,
          price:    Number(p.price),
          category: toTitleCase(p.category ?? 'Outros'),
        })),
    [rawProducts]
  );

  // Produtos "sugeridos" — cruzamento entre ingredientes da ficha técnica e catálogo
  const suggestedProducts = useMemo(() => {
    if (recipeIngredients.length === 0) return [];
    const matched = new Map();
    recipeIngredients.forEach((ing) => {
      matchIngredientToProducts(ing.stockItemName, products).forEach((p) => {
        if (!matched.has(p.id)) matched.set(p.id, p);
      });
    });
    return [...matched.values()];
  }, [recipeIngredients, products]);

  // Outros produtos (excluindo já sugeridos)
  const suggestedIds = useMemo(() => new Set(suggestedProducts.map((p) => p.id)), [suggestedProducts]);

  const otherProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !suggestedIds.has(p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, suggestedIds, search]);

  const otherByCategory = useMemo(() => {
    const map = new Map();
    otherProducts.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
  }, [otherProducts]);

  function getQty(name) {
    return extras.find((e) => e.name === name)?.quantity ?? 0;
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
    if (isNaN(qty) || qty < 1)   return setErr('Quantidade inválida.');
    if (isNaN(price) || price <= 0) return setErr('Preço deve ser maior que zero.');
    setExtras((prev) => {
      const without = prev.filter((e) => e.name !== manualForm.name.trim());
      return [...without, { name: manualForm.name.trim(), quantity: qty, unitPrice: price }];
    });
    setManual({ name: '', quantity: 1, unitPrice: '' });
    setErr('');
  }

  const extrasTotal = extras.reduce((s, e) => s + e.unitPrice * e.quantity, 0);

  const hasAdicionais = suggestedProducts.length > 0 || otherProducts.length > 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adicionais — ${cartItem.name}`}
      size="md"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button variant="primary" style={{ flex: 2 }} onClick={() => onSave(cartItem.id, extras)}>
            Confirmar{extrasTotal > 0 ? ` (+${fmt(extrasTotal)})` : ''}
          </Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {[
          { id: 'adicionais', label: 'Adicionais' },
          { id: 'manual',     label: 'Manual' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '6px 8px',
              fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
              borderRadius: 'var(--radius-sm)', border: '1.5px solid',
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
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            padding: '8px 10px', marginBottom: 12,
            background: 'var(--color-warning-surface)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-warning)', width: '100%', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Selecionados — total +{fmt(extrasTotal)}
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
                onClick={() => setExtras((prev) => prev.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: 12, lineHeight: 1, padding: 0 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {tab === 'adicionais' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 360, overflowY: 'auto' }}>
          {!hasAdicionais ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-disabled)', textAlign: 'center', padding: '24px 0' }}>
              Nenhum adicional disponível no catálogo.
            </p>
          ) : (
            <>
              {/* Sugeridos pela ficha técnica */}
              {suggestedProducts.length > 0 && (
                <div>
                  <SectionLabel>Sugeridos para este prato</SectionLabel>
                  <div className="flex flex-col gap-1.5">
                    {suggestedProducts.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        qty={getQty(p.name)}
                        onQtyChange={(q) => setProductQty(p, q)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Outros do catálogo, agrupados por categoria */}
              {otherByCategory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SectionLabel style={{ marginBottom: 0 }}>Catálogo</SectionLabel>
                    <Input
                      placeholder="Buscar…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flex: 1, fontSize: 12, padding: '4px 8px' }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    {otherByCategory.map(([cat, prods]) => (
                      <div key={cat}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-disabled)', marginBottom: 6 }}>
                          {cat}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {prods.map((p) => (
                            <ProductRow
                              key={p.id}
                              product={p}
                              qty={getQty(p.name)}
                              onQtyChange={(q) => setProductQty(p, q)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
              containerClassName="w-20"
            />
            <Input
              type="number" min="0.01" step="0.01" placeholder="R$ unitário"
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
        <button
          onClick={() => onQtyChange(qty - 1)}
          disabled={qty === 0}
          style={qBtn(qty > 0)}
        >
          −
        </button>
        <span style={{ minWidth: 18, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: active ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
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
    color: enabled ? 'var(--color-success)' : 'var(--color-text-disabled)',
    border: `1px solid ${enabled ? 'var(--color-success-border)' : 'var(--color-border)'}`,
    cursor: enabled ? 'pointer' : 'default',
    fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: enabled ? 1 : 0.4,
  };
}
