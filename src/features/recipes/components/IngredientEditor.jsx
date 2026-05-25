import { palette } from '@styles/ds';

const UNITS = ['UN', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'dz'];

const PRODUCT_TYPES = [
  {
    value:  'FABRICATED',
    label:  'Fabricado',
    desc:   'Múltiplos ingredientes, modo de preparo',
    color:  palette.green,
    bg:     palette.greenSurface,
    border: palette.greenBorder,
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    value:  'COMMERCIAL',
    label:  'Comercial',
    desc:   'Produto pronto, consumido direto do estoque',
    color:  palette.orange,
    bg:     palette.orangeSurface,
    border: palette.orangeBorder,
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

const fieldInput = {
  width:        '100%',
  padding:      '8px 10px',
  borderRadius: 8,
  border:       `1.5px solid ${palette.border}`,
  background:   palette.surface,
  fontSize:     13,
  color:        palette.textPrimary,
  outline:      'none',
  boxSizing:    'border-box',
};

export function IngredientEditor({
  ingredients,
  stockItems,
  productType,
  isCommercial,
  prepMode, setPrepMode,
  onIngredientChange,
  onAddIngredient,
  onRemoveIngredient,
  onProductTypeChange,
  loading,
  recipe,
  onSave,
}) {
  return (
    <div style={{ background: palette.white, borderRadius: 14, border: `1px solid ${palette.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Tipo de Produto
        </span>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {PRODUCT_TYPES.map(({ value, label, desc, color, bg, border, icon }) => (
            <button
              key={value}
              onClick={() => onProductTypeChange(value)}
              style={{
                flex:         1,
                padding:      '12px 16px',
                borderRadius: 12,
                cursor:       'pointer',
                border:       `2px solid ${productType === value ? border : palette.border}`,
                background:   productType === value ? bg : palette.surface,
                textAlign:    'left',
                transition:   'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: productType === value ? color : palette.textMuted }}>{icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: productType === value ? color : palette.textPrimary }}>{label}</span>
              </div>
              <div style={{ fontSize: 11, color: palette.textMuted, lineHeight: 1.4 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: isCommercial ? 20 : 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {isCommercial ? 'Insumo de Estoque' : 'Ingredientes / Insumos'}
          </span>
          {!isCommercial && (
            <button
              onClick={onAddIngredient}
              style={{
                background:   palette.greenSurface,
                color:        palette.green,
                border:       `1px solid ${palette.greenBorder}`,
                borderRadius: 8,
                padding:      '4px 12px',
                fontSize:     11,
                fontWeight:   700,
                cursor:       'pointer',
              }}
            >
              + Adicionar linha
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 72px 32px', gap: 6, marginBottom: 6 }}>
          {['Insumo', 'Qtd / Un', 'Unidade', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase' }}>
              {h}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ingredients.map((ing, idx) => {
            const stockItem = stockItems.find((s) => s.id === ing.stockItemId);
            const lineCost  = (parseFloat(ing.quantityPerUnit) || 0) * (stockItem?.averageCost ?? 0);
            return (
              <div
                key={idx}
                style={{
                  background:   ing.stockItemId ? '#FAFFFE' : palette.surface,
                  borderRadius: 10,
                  padding:      '8px 10px',
                  border:       `1px solid ${ing.stockItemId ? '#C8E6C9' : palette.border}`,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 72px 32px', gap: 6, alignItems: 'center' }}>
                  <select
                    value={ing.stockItemId}
                    onChange={(e) => onIngredientChange(idx, 'stockItemId', e.target.value)}
                    style={fieldInput}
                  >
                    <option value="">— Insumo —</option>
                    {stockItems.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={ing.quantityPerUnit}
                    onChange={(e) => onIngredientChange(idx, 'quantityPerUnit', e.target.value)}
                    placeholder="0"
                    style={fieldInput}
                  />

                  <select
                    value={ing.unit}
                    onChange={(e) => onIngredientChange(idx, 'unit', e.target.value)}
                    style={fieldInput}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>

                  {!isCommercial ? (
                    <button
                      onClick={() => onRemoveIngredient(idx)}
                      disabled={ingredients.length === 1}
                      style={{
                        width:          28,
                        height:         28,
                        borderRadius:   6,
                        border:         `1px solid ${palette.redBorder}`,
                        background:     palette.redSurface,
                        color:          palette.red,
                        fontWeight:     700,
                        fontSize:       14,
                        cursor:         ingredients.length === 1 ? 'not-allowed' : 'pointer',
                        opacity:        ingredients.length === 1 ? 0.35 : 1,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                      }}
                    >
                      x
                    </button>
                  ) : <span />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                  <div>
                    {isCommercial && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: palette.textMuted }}>
                        <span style={{ fontWeight: 600 }}>
                          Validade <span style={{ color: palette.red }}>*</span>
                        </span>
                        <input
                          type="date"
                          value={ing.validity}
                          onChange={(e) => onIngredientChange(idx, 'validity', e.target.value)}
                          style={{
                            padding:      '3px 7px',
                            borderRadius: 6,
                            border:       `1px solid ${ing.validity ? palette.border : palette.redBorder}`,
                            background:   ing.validity ? palette.white : palette.redSurface,
                            fontSize:     11,
                            color:        palette.textPrimary,
                            outline:      'none',
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {lineCost > 0 && (
                    <span style={{ fontSize: 10, color: palette.orange, fontWeight: 600 }}>
                      custo: R$ {lineCost.toFixed(4).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isCommercial && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Modo de Preparo
          </span>
          <textarea
            value={prepMode}
            onChange={(e) => setPrepMode(e.target.value)}
            placeholder="Descreva o passo a passo do preparo..."
            rows={5}
            style={{
              display:     'block',
              marginTop:   6,
              width:       '100%',
              padding:     '10px 12px',
              borderRadius: 10,
              border:      `1.5px solid ${palette.border}`,
              background:  palette.surface,
              fontSize:    13,
              color:       palette.textPrimary,
              outline:     'none',
              resize:      'vertical',
              boxSizing:   'border-box',
              fontFamily:  'inherit',
              lineHeight:  1.7,
            }}
          />
        </div>
      )}

      <button
        onClick={onSave}
        disabled={loading}
        style={{
          width:        '100%',
          padding:      '12px 0',
          borderRadius: 10,
          border:       'none',
          background:   loading ? palette.border : palette.green,
          color:        palette.white,
          fontWeight:   700,
          fontSize:     14,
          cursor:       loading ? 'not-allowed' : 'pointer',
          boxShadow:    loading ? 'none' : '0 4px 16px rgba(46,125,50,0.28)',
          transition:   'background 0.15s',
        }}
      >
        {loading ? 'Salvando...' : recipe ? 'Atualizar Ficha Técnica' : 'Criar Ficha Técnica'}
      </button>
    </div>
  );
}
