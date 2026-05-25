import { palette } from '@styles/ds';

const SEARCH_MODES = [
  { value: 'name',     label: 'Nome'      },
  { value: 'category', label: 'Categoria' },
];

export function ProductList({
  filteredProducts,
  selectedProductId,
  recipe,
  search, setSearch,
  searchType, setSearchType,
  debouncedSearch,
  onSelect,
}) {
  return (
    <div style={{
      background:   palette.white,
      borderRadius: 14,
      border:       `1px solid ${palette.border}`,
      overflow:     'hidden',
      boxShadow:    '0 2px 10px rgba(0,0,0,0.06)',
    }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${palette.border}`, background: palette.surface }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
          Produtos
        </p>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {SEARCH_MODES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSearchType(opt.value); setSearch(''); }}
              style={{
                flex:       1,
                padding:    '4px 8px',
                borderRadius: 6,
                fontSize:   11,
                fontWeight: 600,
                border:     `1.5px solid ${searchType === opt.value ? palette.green : palette.border}`,
                background: searchType === opt.value ? palette.greenSurface : palette.white,
                color:      searchType === opt.value ? palette.green : palette.textMuted,
                cursor:     'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar por ${searchType === 'name' ? 'nome' : 'categoria'}...`}
            style={{
              width:        '100%',
              padding:      '7px 32px 7px 10px',
              borderRadius: 8,
              border:       `1.5px solid ${search.length > 0 && search.length < 3 ? palette.orange : palette.border}`,
              background:   palette.white,
              fontSize:     12,
              color:        palette.textPrimary,
              outline:      'none',
              boxSizing:    'border-box',
            }}
          />
          {search.length > 0 && (
            <button
              onClick={() => setSearch('')}
              style={{
                position:  'absolute',
                right:     8,
                top:       '50%',
                transform: 'translateY(-50%)',
                background:'none',
                border:    'none',
                color:     palette.textMuted,
                cursor:    'pointer',
                fontSize:  13,
                lineHeight: 1,
              }}
            >
              x
            </button>
          )}
        </div>

        {search.length > 0 && search.length < 3 && (
          <p style={{ fontSize: 10, color: palette.orange, margin: '4px 0 0', fontWeight: 600 }}>
            Digite ao menos 3 caracteres
          </p>
        )}
      </div>

      <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
        {debouncedSearch.length < 3 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: palette.textMuted }}>
              {search.length === 0 ? 'Digite para pesquisar' : 'Continue digitando...'}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: palette.textMuted, fontSize: 13 }}>
            Nenhum produto encontrado
          </div>
        ) : (
          filteredProducts.map((p) => {
            const hasRecipe = selectedProductId === p.id && recipe !== null;
            const isActive  = selectedProductId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        10,
                  width:      '100%',
                  padding:    '10px 16px',
                  border:     'none',
                  borderBottom: `1px solid ${palette.border}`,
                  background: isActive ? palette.greenSurface : 'transparent',
                  cursor:     'pointer',
                  textAlign:  'left',
                  transition: 'background 0.12s',
                  borderLeft: isActive ? `3px solid ${palette.green}` : '3px solid transparent',
                }}
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width:          36,
                    height:         36,
                    borderRadius:   8,
                    background:     isActive ? '#C8E6C9' : '#EEEEEE',
                    flexShrink:     0,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={isActive ? palette.green : palette.textMuted} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? palette.greenDark : palette.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 1 }}>
                    {p.category}
                  </div>
                </div>

                {isActive && (
                  <span style={{
                    fontSize:   9,
                    fontWeight: 700,
                    padding:    '2px 6px',
                    borderRadius: 8,
                    background: hasRecipe ? palette.greenSurface : palette.orangeSurface,
                    color:      hasRecipe ? palette.green : palette.orange,
                    border:     `1px solid ${hasRecipe ? palette.greenBorder : palette.orangeBorder}`,
                    flexShrink: 0,
                  }}>
                    {hasRecipe ? 'Ficha' : 'Nova'}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
