import { palette } from '@styles/ds';

export function ProductHeader({ product, ingredientCount }) {
  return (
    <div style={{
      background:   palette.white,
      borderRadius: 14,
      border:       `1px solid ${palette.border}`,
      boxShadow:    '0 2px 10px rgba(0,0,0,0.05)',
      overflow:     'hidden',
    }}>
      {/* Faixa verde de destaque no topo */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${palette.green}, ${palette.greenDark ?? '#1B5E20'})` }} />

      <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Imagem / placeholder */}
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: 62, height: 62, borderRadius: 14, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          />
        ) : (
          <div style={{
            width:          62,
            height:         62,
            borderRadius:   14,
            background:     palette.greenSurface,
            border:         `1.5px solid ${palette.greenBorder}`,
            flexShrink:     0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize:     22,
            fontWeight:   800,
            color:        palette.textPrimary,
            margin:       '0 0 5px',
            lineHeight:   1.2,
            letterSpacing: '-0.02em',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {product?.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {product?.category && (
              <span style={{
                fontSize:     11,
                fontWeight:   600,
                color:        palette.textMuted,
                background:   '#F5F5F5',
                border:       '1px solid #E0E0E0',
                borderRadius: 6,
                padding:      '2px 8px',
              }}>
                {product.category}
              </span>
            )}
            {product?.price && (
              <span style={{ fontSize: 13, fontWeight: 700, color: palette.green }}>
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </span>
            )}
            {product?.portion && (
              <span style={{ fontSize: 12, color: palette.textMuted }}>{product.portion}</span>
            )}
          </div>
        </div>

        {/* KPI — Ingredientes */}
        <div style={{
          background:   palette.greenSurface,
          border:       `1.5px solid ${palette.greenBorder}`,
          borderRadius: 12,
          padding:      '10px 18px',
          textAlign:    'center',
          flexShrink:   0,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: palette.green, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Ingredientes
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: palette.green, lineHeight: 1 }}>{ingredientCount}</div>
        </div>
      </div>
    </div>
  );
}
