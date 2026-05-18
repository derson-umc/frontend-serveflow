import { memo, useState } from 'react';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Placeholder({ name }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : '?';
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-success-surface) 0%, var(--color-success-border) 100%)',
      }}
    >
      <span
        style={{
          fontWeight: 'var(--font-black)',
          fontSize: 20,
          color: 'var(--color-success)',
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

function MenuProductCard({ item, onAdd, outOfStock = false }) {
  const [imgError, setImgError] = useState(false);
  const showImage = item.imageUrl && !imgError;

  return (
    <div
      className="flex flex-col overflow-hidden transition-all"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        opacity: outOfStock ? 0.5 : 1,
        cursor: outOfStock ? 'not-allowed' : 'default',
      }}
      onMouseEnter={(e) => {
        if (!outOfStock)
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(46,125,50,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
      }}
    >
      {/* Image */}
      <div style={{ height: 90, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Placeholder name={item.name} />
        )}
        {outOfStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.05em',
              }}
            >
              ESGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 pt-2 pb-2.5 flex flex-col gap-1 flex-1">
        <p
          className="truncate"
          style={{
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
          }}
          title={item.name}
        >
          {item.name}
        </p>
        {item.desc && (
          <p
            className="truncate"
            style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}
            title={item.desc}
          >
            {item.desc}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span
            style={{
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-success)',
            }}
          >
            {fmt(item.price)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock) onAdd(item);
            }}
            disabled={outOfStock}
            aria-label={`Adicionar ${item.name}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: outOfStock ? 'var(--color-border)' : 'var(--color-success)',
              color: '#fff',
              border: 'none',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              fontWeight: 'var(--font-bold)',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!outOfStock)
                e.currentTarget.style.background = 'var(--color-success-dark)';
            }}
            onMouseLeave={(e) => {
              if (!outOfStock)
                e.currentTarget.style.background = 'var(--color-success)';
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MenuProductCard);
