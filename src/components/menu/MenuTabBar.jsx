import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { id: 'venda', label: 'Vendas' },
  { id: 'comandas', label: 'Comandas' },
  { id: 'delivery', label: 'Delivery' },
  { to: '/pagamento', label: 'Pagamento' },
];

export function MenuTabBar({ activeTab, onTabChange, search, onSearchChange }) {
  const location = useLocation();

  return (
    <div
      className="flex items-stretch flex-shrink-0"
      style={{ background: 'var(--color-success)', borderBottom: '1px solid var(--color-success-dark)' }}
    >
      {TABS.map((tab) => {
        const isActive = tab.to
          ? location.pathname === tab.to
          : activeTab === tab.id;

        if (tab.to) {
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className="tab-item"
              style={{
                color: '#fff',
                opacity: isActive ? 1 : 0.78,
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              {tab.label}
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="tab-item"
            style={{
              color: '#fff',
              opacity: isActive ? 1 : 0.78,
              background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            {tab.label}
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
