import { useLocation } from 'react-router-dom';

export function MenuTabBar({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  pedidosCount = 0,
}) {
  useLocation();

  const TABS = [
    { id: 'venda',   label: 'Vendas',  count: 0            },
    { id: 'pedidos', label: 'Pedidos', count: pedidosCount },
  ];

  return (
    <div
      style={{
        background:   'var(--color-success)',
        borderBottom: '1px solid var(--color-success-dark)',
        display:      'flex',
        alignItems:   'center',
        height:        48,
        flexShrink:    0,
        paddingLeft:   12,
        gap:            8,
      }}
    >
      {/* ── Abas ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display:     'flex',
          alignItems:  'stretch',
          gap:          2,
          padding:     '5px 4px',
          background:  'rgba(0,0,0,0.12)',
          borderRadius: 'var(--radius-lg)',
          height:       36,
        }}
      >
        {TABS.map(({ id, label, count }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:             6,
                minWidth:        80,
                padding:        '0 14px',
                borderRadius:   'var(--radius-md)',
                border:         'none',
                cursor:         'pointer',
                fontWeight:      700,
                fontSize:       'var(--text-sm)',
                color:          '#fff',
                background:     isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
                boxShadow:      isActive ? 'inset 0 0 0 1.5px rgba(255,255,255,0.35)' : 'none',
                opacity:        isActive ? 1 : 0.72,
                transition:     'background 0.12s, opacity 0.12s',
                touchAction:    'manipulation',
                userSelect:     'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {label}
              {count > 0 && (
                <span
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    minWidth:        18,
                    height:          18,
                    padding:        '0 5px',
                    borderRadius:    99,
                    background:     'var(--color-accent)',
                    color:          '#fff',
                    fontSize:        10,
                    fontWeight:      700,
                    lineHeight:      1,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Busca — colada às abas, visível só em Vendas ──────────────────── */}
      {activeTab === 'venda' && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', left: 10, pointerEvents: 'none' }}
            width={13}
            height={13}
            fill="none"
            viewBox="0 0 24 24"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              paddingLeft:   32,
              paddingRight:  12,
              height:        30,
              background:    'rgba(255,255,255,0.15)',
              border:        '1px solid rgba(255,255,255,0.28)',
              borderRadius:  'var(--radius-full)',
              color:         '#fff',
              fontSize:      'var(--text-sm)',
              width:          185,
              outline:       'none',
              transition:    'background 0.15s, border-color 0.15s, width 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.background  = 'rgba(255,255,255,0.22)';
              e.target.style.borderColor = 'rgba(255,255,255,0.55)';
              e.target.style.width       = '215px';
            }}
            onBlur={(e) => {
              e.target.style.background  = 'rgba(255,255,255,0.15)';
              e.target.style.borderColor = 'rgba(255,255,255,0.28)';
              e.target.style.width       = '185px';
            }}
          />
        </div>
      )}
    </div>
  );
}
