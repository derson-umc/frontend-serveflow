import { memo, useState } from 'react';

const G = '#2E7D32', GD = '#1B5E20', GF = '#E8F5E9';
const O = '#F57C00', OF = '#FFF3E0';
const D = '#424242', M = '#757575', W = '#FFFFFF';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const toTitleCase = (s) =>
  String(s ?? '').toLowerCase().replace(/(^|\s|-|\/)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase());

function Placeholder({ name, dim }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : '?';
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: dim ? '#FFF3F3' : GF }}>
      <span style={{ fontWeight: 900, fontSize: 28, color: dim ? '#EF9A9A' : '#A5D6A7', lineHeight: 1 }}>
        {initials}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: dim ? '#EF9A9A' : '#A5D6A7', letterSpacing: '0.03em' }}>
        Sem imagem
      </span>
    </div>
  );
}

function MenuProductCard({ item, onAdd, outOfStock = false }) {
  const [imgError, setImgError] = useState(false);
  const showImage = item.imageUrl && !imgError;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all"
      style={{
        background: W,
        border: `1px solid ${outOfStock ? '#FFCDD2' : '#E0E0E0'}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        borderTop: `3px solid ${outOfStock ? '#EF5350' : G}`,
        opacity: outOfStock ? 0.82 : 1,
        cursor: outOfStock ? 'not-allowed' : 'default',
      }}
      onMouseEnter={(e) => {
        if (!outOfStock) e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
      }}
    >
      {/* Image */}
      <div style={{ height: 136, background: outOfStock ? '#FFF3F3' : GF, position: 'relative', flexShrink: 0 }}>
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Placeholder name={item.name} dim={outOfStock} />
        )}
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '3px 10px',
              borderRadius: 20, letterSpacing: '0.05em',
            }}>
              ESGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col" style={{ padding: '12px 14px 10px' }}>
        {/* Badge categoria */}
        {item.category && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 9px', borderRadius: 20,
              background: OF, color: O,
            }}>
              {toTitleCase(item.category)}
            </span>
          </div>
        )}

        <p
          className="truncate"
          style={{ fontSize: 14, fontWeight: 800, color: D, lineHeight: 1.3, marginBottom: 4 }}
          title={item.name}
        >
          {item.name}
        </p>

        {item.desc && (
          <p
            style={{
              fontSize: 11, color: '#9E9E9E', lineHeight: 1.55,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              marginTop: 'auto', paddingTop: 4,
            }}
            title={item.desc}
          >
            {item.desc}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #F0F0F0', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: M, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>Preço</p>
            <p style={{ fontSize: 17, fontWeight: 900, color: G, letterSpacing: '-0.01em' }}>{fmt(item.price)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock) onAdd(item);
            }}
            disabled={outOfStock}
            aria-label={`Adicionar ${item.name}`}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: outOfStock ? '#E0E0E0' : G,
              color: '#fff', border: 'none',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              fontWeight: 900, fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: outOfStock ? 'none' : '0 4px 12px rgba(46,125,50,0.3)',
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!outOfStock) e.currentTarget.style.background = GD; }}
            onMouseLeave={(e) => { if (!outOfStock) e.currentTarget.style.background = G; }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MenuProductCard);
