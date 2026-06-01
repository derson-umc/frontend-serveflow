import { useLocation } from 'react-router-dom';

/**
 * Props:
 *   activeTab       – id da aba activa ('venda' | 'comandas' | 'delivery')
 *   onTabChange     – (id) => void
 *   search          – valor do campo de busca
 *   onSearchChange  – (value) => void
 *   hasComandas     – boolean — exibe aba Comandas apenas quando true
 *   hasDeliveries   – boolean — exibe aba Delivery apenas quando true
 *   comandasCount   – number — badge de contagem na aba Comandas
 *   deliveriesCount – number — badge de contagem na aba Delivery
 */
export function MenuTabBar({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  hasComandas     = false,
  hasDeliveries   = false,
  comandasCount   = 0,
  deliveriesCount = 0,
}) {
  useLocation(); // mantém re-render quando rota muda

  const TABS = [
    { id: 'venda',    label: 'Vendas',   show: true,          count: 0 },
    { id: 'comandas', label: 'Comandas', show: hasComandas,   count: comandasCount },
    { id: 'delivery', label: 'Delivery', show: hasDeliveries, count: deliveriesCount },
  ];

  const visibleTabs = TABS.filter((t) => t.show);

  return (
    <div
      className="flex items-stretch flex-shrink-0"
      style={{ background: 'var(--color-success)', borderBottom: '1px solid var(--color-success-dark)' }}
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="tab-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#fff',
              opacity: isActive ? 1 : 0.78,
              background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
              transition: 'opacity 0.15s, background 0.15s',
            }}
          >
            {tab.label}

            {/* Badge de contagem — exibe apenas quando há pedidos */}
            {tab.count > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  borderRadius: 99,
                  background: 'var(--color-accent)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}

      <div className="ml-auto flex items-center px-4">
        <div className="relative flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 pointer-events-none"
            width={14}
            height={14}
            fill="none"
            viewBox="0 0 24 24"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              paddingLeft: 30,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: 'var(--text-sm)',
              width: 180,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
