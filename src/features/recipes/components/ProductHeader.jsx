import { palette } from '@styles/ds';

export function ProductHeader({ product, ingredientCount, totalCost }) {
  return (
    <div style={{
      background:   palette.white,
      borderRadius: 14,
      border:       `1px solid ${palette.border}`,
      boxShadow:    '0 2px 10px rgba(0,0,0,0.06)',
      overflow:     'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width:          56,
            height:         56,
            borderRadius:   12,
            background:     palette.greenSurface,
            flexShrink:     0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: palette.textPrimary, margin: 0 }}>
            {product?.name}
          </h2>
          <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
            {product?.category}
            {product?.price ? ` · R$ ${product.price.toFixed(2).replace('.', ',')}` : ''}
            {product?.portion ? ` · ${product.portion}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ background: palette.greenSurface, border: `1px solid ${palette.green}30`, borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: palette.green, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              Ingredientes
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: palette.green }}>{ingredientCount}</div>
          </div>
          <div style={{ background: palette.orangeSurface, border: `1px solid ${palette.orange}30`, borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: palette.orange, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              Custo Est.
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: palette.orange }}>
              R$ {totalCost.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
