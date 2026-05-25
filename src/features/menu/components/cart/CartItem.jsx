const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CartItem({ item, extras = [], onIncrease, onDecrease, onRemove, onEditExtras }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-bg)',
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        animation: 'slideUp 180ms ease',
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
            }}
            title={item.name}
          >
            {item.name}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            {fmt(item.price)} × {item.quantity} ={' '}
            <strong style={{ color: 'var(--color-success)' }}>
              {fmt(item.price * item.quantity)}
            </strong>
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onDecrease}
            style={ctrlBtn('var(--color-success-surface)', 'var(--color-success)')}
            aria-label="Diminuir"
          >
            −
          </button>
          <span
            style={{
              minWidth: 22,
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {item.quantity}
          </span>
          <button
            onClick={onIncrease}
            style={ctrlBtn('var(--color-success-surface)', 'var(--color-success)')}
            aria-label="Aumentar"
          >
            +
          </button>
          <button
            onClick={onRemove}
            style={ctrlBtn('var(--color-error-surface)', 'var(--color-error)')}
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Extras */}
      <div className="flex items-center justify-between">
        {extras.length > 0 ? (
          <div className="flex flex-wrap gap-1 flex-1">
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
                }}
              >
                +{e.quantity}× {e.name}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <button
          onClick={onEditExtras}
          style={{
            fontSize: 10,
            fontWeight: 'var(--font-semibold)',
            color: extras.length ? 'var(--color-warning)' : 'var(--color-text-disabled)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {extras.length ? `${extras.length} extra${extras.length > 1 ? 's' : ''}` : '+ extras'}
        </button>
      </div>
    </div>
  );
}

function ctrlBtn(bg, color) {
  return {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-sm)',
    background: bg,
    color,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'var(--font-bold)',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}
