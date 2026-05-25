import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useKdsSocket } from './hooks/useKdsSocket';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { palette } from '@styles/ds';
import { VISIBLE_STATUSES, SECTIONS, LIGHT } from './constants';
import { OrderCard } from './components/OrderCard';

function SectionHeader({ title, count, color }) {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          8,
      padding:      '0 4px 8px',
      borderBottom: `2px solid ${color}`,
      marginBottom: 12,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: 13, color: palette.textSecondary }}>{title}</span>
      <span style={{
        marginLeft:   'auto',
        background:   color,
        color:        palette.white,
        borderRadius: 12,
        padding:      '1px 9px',
        fontSize:     11,
        fontWeight:   700,
      }}>
        {count}
      </span>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>{label}</span>
    </span>
  );
}

export default function Kds() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { orders, connected, refetch } = useKdsSocket();

  const handleStatusChange = () => refetch();
  const visibleOrders = orders.filter((o) => VISIBLE_STATUSES.includes(o.status));

  const backTarget = user?.role === 'cozinheiro' ? '/cadastro-produtos' : '/menu';
  const backLabel  = user?.role === 'cozinheiro' ? 'Produtos' : 'Menu';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: palette.background, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{
        background:   palette.green,
        borderBottom: `3px solid ${palette.greenDark}`,
        boxShadow:    '0 2px 8px rgba(0,0,0,0.18)',
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        height:       48,
      }}>
        <button
          onClick={() => navigate(backTarget)}
          style={{
            background:  'rgba(255,255,255,0.12)',
            border:      'none',
            borderRight: '1px solid rgba(255,255,255,0.15)',
            color:       palette.white,
            cursor:      'pointer',
            padding:     '0 16px',
            height:      '100%',
            display:     'flex',
            alignItems:  'center',
            gap:         6,
            flexShrink:  0,
            fontSize:    12,
            fontWeight:  600,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          </svg>
          {backLabel}
        </button>

        <span style={{ color: palette.white, fontWeight: 700, fontSize: 15, padding: '0 16px', flex: 1 }}>
          KDS — Monitor de Preparo
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 16 }}>
          <motion.span
            animate={{ opacity: connected ? 1 : [1, 0.3, 1] }}
            transition={connected ? {} : { duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#69F0AE' : '#FF5252' }}
          />
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
            {connected ? 'Ao vivo' : 'Polling'}
          </span>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {visibleOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}
          >
            <div style={{
              width:          72,
              height:         72,
              borderRadius:   20,
              background:     palette.greenSurface,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p style={{ color: LIGHT, fontSize: 15, fontWeight: 500 }}>Cozinha livre — nenhum pedido pendente</p>
          </motion.div>
        ) : (
          SECTIONS.map(({ key, label, statuses, color }) => {
            const sectionOrders = visibleOrders.filter((o) => statuses.includes(o.status));
            if (sectionOrders.length === 0) return null;
            return (
              <div key={key}>
                <SectionHeader title={label} count={sectionOrders.length} color={color} />
                <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
                  <AnimatePresence mode="popLayout">
                    {sectionOrders.map((order, idx) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        position={idx + 1}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer style={{
        background:     palette.greenDark,
        color:          palette.white,
        fontSize:       12,
        padding:        '8px 20px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
        gap:            16,
      }}>
        <span style={{ fontWeight: 600 }}>
          {visibleOrders.length} pedido{visibleOrders.length !== 1 ? 's' : ''} ativo{visibleOrders.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <LegendDot color={palette.green}  label="< 5 min"  />
          <LegendDot color="#F9A825"        label="< 10 min" />
          <LegendDot color={palette.orange} label="< 15 min" />
          <LegendDot color={palette.red}    label=">= 15 min" />
        </div>
      </footer>
    </div>
  );
}
