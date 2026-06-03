import { ObservationField } from './ObservationField';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CartItem({
  item,
  extras = [],
  observation = '',
  onIncrease,
  onDecrease,
  onRemove,
  onEditExtras,
  onObservationChange,
}) {
  const extrasTotal = extras.reduce((s, e) => s + Number(e.unitPrice) * e.quantity, 0);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-bg)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        animation: 'slideUp 180ms ease',
      }}
    >
      {/* Row 1: nome + controles de quantidade */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            title={item.name}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            {item.name}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 1 }}>
            {fmt(item.price)} × {item.quantity}
            {' = '}
            <strong style={{ color: 'var(--color-success)' }}>
              {fmt(item.price * item.quantity + extrasTotal)}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onDecrease} style={btn('var(--color-success-surface)', 'var(--color-success)')} aria-label="Diminuir">−</button>
          <span style={{ minWidth: 20, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
            {item.quantity}
          </span>
          <button onClick={onIncrease} style={btn('var(--color-success-surface)', 'var(--color-success)')} aria-label="Aumentar">+</button>
          <button onClick={onRemove}   style={btn('var(--color-error-surface)',   'var(--color-error)')}   aria-label="Remover">✕</button>
        </div>
      </div>

      {/* Row 2: badges de extras + botão extras */}
      <div className="flex items-center gap-1.5">
        <div
          style={{
            flex: 1,
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {extras.map((e, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                color: 'var(--color-warning)',
                background: 'var(--color-warning-surface)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--radius-full)',
                padding: '1px 6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              +{e.quantity}×{e.name}
            </span>
          ))}
        </div>

        <button
          onClick={onEditExtras}
          style={{
            fontSize: 10,
            fontWeight: 'var(--font-semibold)',
            color: extras.length ? 'var(--color-warning)' : 'var(--color-text-disabled)',
            background: extras.length ? 'var(--color-warning-surface)' : 'transparent',
            border: `1px solid ${extras.length ? 'var(--color-warning-border)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {extras.length ? `${extras.length} extra${extras.length > 1 ? 's' : ''}` : '+ extras'}
        </button>
      </div>

      {/* Row 3: campo de observação */}
      <ObservationField value={observation} onChange={(v) => onObservationChange?.(v)} />
    </div>
  );
}

function btn(bg, color) {
  return {
    width: 26, height: 26,
    borderRadius: 'var(--radius-sm)',
    background: bg, color,
    border: 'none', cursor: 'pointer',
    fontWeight: 'var(--font-bold)', fontSize: 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };
}
