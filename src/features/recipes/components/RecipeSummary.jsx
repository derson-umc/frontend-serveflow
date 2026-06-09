import { palette } from '@styles/ds';

const TYPE_META = {
  FABRICATED: {
    label:  'Fabricado',
    color:  palette.green,
    bg:     palette.greenSurface,
    border: palette.greenBorder,
    icon: (
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
};

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  color: palette.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  margin: '0 0 10px',
  display: 'block',
};

const KG_UNITS = new Set(['kg', 'g', 'L', 'ml']);

function totalWeightLabel(ingredients) {
  const kg = ingredients
    .filter((i) => i.stockItemId && i.quantityPerUnit)
    .reduce((sum, i) => {
      const q = Number(i.quantityPerUnit) || 0;
      if (i.unit === 'kg' || i.unit === 'L')  return sum + q;
      if (i.unit === 'g'  || i.unit === 'ml') return sum + q / 1000;
      return sum;
    }, 0);
  if (kg === 0) return null;
  return kg >= 1
    ? `${kg.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} kg`
    : `${(kg * 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} g`;
}

export function RecipeSummary({ ingredients, stockItems, productType, selectedProduct, prepMode }) {
  const meta   = TYPE_META[productType] ?? TYPE_META.FABRICATED;
  const filled = ingredients.filter((i) => i.stockItemId && i.quantityPerUnit);
  const weight = totalWeightLabel(filled);

  return (
    <div style={{
      background:   palette.white,
      borderRadius: 14,
      border:       `1px solid ${palette.border}`,
      boxShadow:    '0 4px 20px rgba(0,0,0,0.08)',
      overflow:     'hidden',
      position:     'sticky',
      top:          24,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${palette.border}`, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: palette.textPrimary }}>Resumo</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          {meta.icon}{meta.label}
        </span>
      </div>

      {/* KPIs rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: weight ? '1fr 1fr' : '1fr', gap: 0, borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ padding: '12px 18px', textAlign: 'center', borderRight: weight ? `1px solid ${palette.border}` : 'none' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Ingredientes</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: palette.green, lineHeight: 1 }}>{filled.length}</div>
        </div>
        {weight && (
          <div style={{ padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Peso total</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: palette.textPrimary, lineHeight: 1 }}>{weight}</div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Lista de ingredientes */}
        {filled.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
            {filled.map((ing, i) => {
              const item    = stockItems.find((s) => s.id === ing.stockItemId);
              const isEven  = i % 2 === 0;
              return (
                <div key={ing.stockItemId ?? i} style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  padding:        '6px 8px',
                  borderRadius:   6,
                  background:     isEven ? '#F9FAFB' : 'transparent',
                }}>
                  <span style={{ fontSize: 12, color: palette.textPrimary, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                    {ing.stockItemName || item?.name || '—'}
                  </span>
                  <span style={{ fontSize: 12, color: palette.textMuted, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>
                    {Number(ing.quantityPerUnit || 0).toLocaleString('pt-BR')} {ing.unit}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: palette.textMuted, marginBottom: 16, textAlign: 'center', padding: '12px 0' }}>
            Nenhum ingrediente adicionado
          </p>
        )}

        {/* Modo de preparo */}
        {prepMode && (
          <>
            <div style={{ height: 1, background: palette.border, margin: '4px 0 14px' }} />
            <span style={sectionLabel}>Modo de preparo</span>
            <p style={{ fontSize: 12, color: palette.textPrimary, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {prepMode}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
