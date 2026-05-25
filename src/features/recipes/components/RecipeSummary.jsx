import { palette } from '@styles/ds';

const TYPE_META = {
  FABRICATED: {
    label:  'Fabricado',
    color:  palette.green,
    bg:     palette.greenSurface,
    border: palette.greenBorder,
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  COMMERCIAL: {
    label:  'Comercial',
    color:  palette.orange,
    bg:     palette.orangeSurface,
    border: palette.orangeBorder,
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
};

export function RecipeSummary({ ingredients, stockItems, productType, totalCost, selectedProduct, prepMode }) {
  const meta = TYPE_META[productType] ?? TYPE_META.FABRICATED;
  const filled = ingredients.filter((i) => i.stockItemId && i.quantityPerUnit);

  return (
    <div style={{ background: palette.white, borderRadius: 14, border: `1px solid ${palette.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${palette.border}`, background: palette.surface }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Resumo da Ficha
        </span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        6,
            padding:    '4px 12px',
            borderRadius: 20,
            fontSize:   11,
            fontWeight: 700,
            background: meta.bg,
            color:      meta.color,
            border:     `1px solid ${meta.border}`,
          }}>
            {meta.icon}{meta.label}
          </span>
        </div>

        {filled.length > 0 ? (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
              Ingredientes
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <tbody>
                {ingredients.filter((i) => i.stockItemId).map((ing, i) => {
                  const item = stockItems.find((s) => s.id === ing.stockItemId);
                  const cost = (parseFloat(ing.quantityPerUnit) || 0) * (item?.averageCost ?? 0);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '6px 0', fontSize: 12, color: palette.textPrimary }}>
                        {ing.stockItemName || '-'}
                        {ing.validity && (
                          <div style={{ fontSize: 9, color: palette.textMuted }}>val. {ing.validity}</div>
                        )}
                      </td>
                      <td style={{ padding: '6px 0', fontSize: 12, color: palette.textMuted, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {Number(ing.quantityPerUnit || 0).toLocaleString('pt-BR')} {ing.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <p style={{ fontSize: 12, color: palette.textMuted, textAlign: 'center', padding: '16px 0' }}>
            Nenhum ingrediente adicionado
          </p>
        )}

        <div style={{
          background:   palette.orangeSurface,
          border:       `1px solid ${palette.orangeBorder}`,
          borderRadius: 10,
          padding:      '10px 12px',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: palette.orange, textTransform: 'uppercase', marginBottom: 2 }}>
            Custo estimado
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: palette.orange }}>
            R$ {totalCost.toFixed(2).replace('.', ',')}
          </div>
          {selectedProduct?.price > 0 && (
            <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 2 }}>
              {((totalCost / selectedProduct.price) * 100).toFixed(1)}% do preço de venda
            </div>
          )}
        </div>

        {prepMode && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>
              Preparo
            </p>
            <p style={{
              fontSize:    12,
              color:       palette.textPrimary,
              lineHeight:  1.7,
              margin:      0,
              whiteSpace:  'pre-line',
              maxHeight:   120,
              overflow:    'hidden',
              maskImage:   'linear-gradient(to bottom, black 70%, transparent)',
            }}>
              {prepMode}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
