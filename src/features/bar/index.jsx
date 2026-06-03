import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useKdsSocket } from '@features/kds/hooks/useKdsSocket';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { palette } from '@styles/ds';
import { VISIBLE_STATUSES, isBarItem, urgentPulse, STATUS_CONFIG, LIGHT } from '@features/kds/constants';
import { getPrimaryAction, waitColor, waitMinutes } from '@features/kds/utils';
import { useElapsed } from '@features/kds/hooks/useElapsed';
import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@core/api/orders';
import { toast } from '@shared/components/feedback/Toast';
import { useState } from 'react';

// Labels de categoria de bebida
const CATEGORY_LABEL = {
  BEBIDA_ALCOOLICA:     'Alcoólica',
  BEBIDA_NAO_ALCOOLICA: 'Não alcoólica',
};

function SectionHeader({ title, count, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 8px', borderBottom: `2px solid ${color}`, marginBottom: 12 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: 13, color: palette.textSecondary }}>{title}</span>
      <span style={{ marginLeft: 'auto', background: color, color: palette.white, borderRadius: 12, padding: '1px 9px', fontSize: 11, fontWeight: 700 }}>
        {count}
      </span>
    </div>
  );
}

function BarOrderCard({ order, onStatusChange }) {
  const [acting, setActing] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => ordersApi.cancel({ id, reason }),
  });

  const color    = waitColor(order.createdAt);
  const minutes  = waitMinutes(order.createdAt);
  const isUrgent = minutes >= 10;
  const shortId  = String(order.id).slice(-6).toUpperCase();
  const elapsed  = useElapsed(order.createdAt);
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: palette.textMuted };
  const primary   = getPrimaryAction(order);

  async function act(fn, msg) {
    setActing(true);
    try {
      await fn();
      toast.success(msg);
      onStatusChange(order.id);
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar pedido.');
    } finally {
      setActing(false);
    }
  }

  async function handleCancelOrder(reason) {
    try {
      await cancelMutation.mutateAsync({ id: order.id, reason: reason || null });
      toast.success(`Pedido #${shortId} cancelado`);
      setCancellingOrder(false);
      onStatusChange(order.id);
    } catch (err) {
      toast.error(err.message || 'Erro ao cancelar.');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={isUrgent ? { opacity: 1, scale: 1, ...urgentPulse.animate } : { opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={isUrgent ? { opacity: { duration: 0.25 }, ...urgentPulse.transition } : { duration: 0.25 }}
      style={{
        background: palette.white,
        border: `1px solid ${palette.border}`,
        borderTop: `4px solid ${color}`,
        borderRadius: 14,
        boxShadow: isUrgent ? '0 2px 14px rgba(198,40,40,0.15)' : '0 2px 14px rgba(0,0,0,0.09)',
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 14px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={order.customerName}>
            {order.customerName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginLeft: 6 }}>
            <span style={{ background: statusCfg.bg, color: palette.white, padding: '3px 8px', borderRadius: 20, fontWeight: 700, fontSize: 9, letterSpacing: 0.4 }}>
              {statusCfg.label}
            </span>
            <button
              onClick={() => setCancellingOrder(true)}
              style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${palette.redBorder}`, background: palette.redSurface, color: palette.red, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >x</button>
          </div>
        </div>

        {order.tableNumber && (
          <span style={{ fontSize: 10, fontWeight: 700, background: '#F3E5F5', color: '#6A1B9A', borderRadius: 10, padding: '2px 7px', marginBottom: 4, display: 'inline-block' }}>
            MESA {order.tableNumber}
          </span>
        )}

        {/* Itens de bebida */}
        <div style={{ marginTop: 6 }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ padding: '5px 0', borderBottom: `1px solid ${palette.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#212121', margin: 0, lineHeight: 1.3 }}>
                  {item.quantity}× {item.productName}
                </p>
                {item.observation && (
                  <p style={{ fontSize: 11, color: palette.textMuted, margin: '2px 0 0', fontStyle: 'italic' }}>
                    {item.observation}
                  </p>
                )}
              </div>
              {item.productCategory && (
                <span style={{ fontSize: 9, fontWeight: 700, background: '#E3F2FD', color: '#1565C0', borderRadius: 8, padding: '2px 6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {CATEGORY_LABEL[item.productCategory] ?? item.productCategory}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '6px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0' }}>
        <span style={{ fontSize: 11, color: palette.textMuted }}>#{shortId}</span>
        <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color, fontWeight: 700 }}>{elapsed}</span>
      </div>

      {/* Modal de cancelamento inline */}
      {cancellingOrder && (
        <div style={{ padding: '8px 12px', background: '#FEF2F2', borderTop: '1px solid #FECACA' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', margin: '0 0 6px' }}>Cancelar pedido?</p>
          <input
            type="text"
            placeholder="Motivo (opcional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            autoFocus
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #FECACA', borderRadius: 6, outline: 'none', marginBottom: 6, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => { setCancellingOrder(false); setCancelReason(''); }}
              style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${palette.border}`, background: palette.white, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >Voltar</button>
            <button
              onClick={() => handleCancelOrder(cancelReason)}
              disabled={cancelMutation.isPending}
              style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: palette.red, color: palette.white, fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: cancelMutation.isPending ? 0.65 : 1 }}
            >{cancelMutation.isPending ? '...' : 'Cancelar'}</button>
          </div>
        </div>
      )}

      {primary && !cancellingOrder && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => act(primary.fn, primary.msg, false)}
          disabled={acting}
          style={{ width: '100%', padding: '13px 0', border: 'none', background: primary.bg, color: primary.fg, fontWeight: 800, fontSize: 13, letterSpacing: 0.5, cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.65 : 1, transition: 'opacity 0.15s' }}
        >
          {acting ? '...' : primary.label}
        </motion.button>
      )}
    </motion.div>
  );
}

const SECTIONS_BAR = [
  { key: 'pending',     label: 'Aguardando',  statuses: ['ENVIADO'],    color: '#1565C0' },
  { key: 'preparation', label: 'Preparando',  statuses: ['EM_PREPARO'], color: '#E65100' },
  { key: 'ready',       label: 'Prontos',     statuses: ['PRONTO', 'A_CAMINHO'], color: '#2E7D32' },
];

export default function Bar() {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const { orders, connected, refetch } = useKdsSocket();

  const handleStatusChange = () => refetch();

  // Mostra apenas pedidos com itens de bebida
  const visibleOrders = orders
    .filter((o) => VISIBLE_STATUSES.includes(o.status))
    .map((o) => ({ ...o, items: (o.items ?? []).filter(isBarItem) }))
    .filter((o) => o.items.length > 0);

  const backTarget = '/menu';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#EDE7F6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#4527A0', borderBottom: '3px solid #311B92', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', flexShrink: 0, display: 'flex', alignItems: 'center', height: 48 }}>
        <button
          onClick={() => navigate(backTarget)}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 12, fontWeight: 600 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          </svg>
          Menu
        </button>

        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, padding: '0 16px', flex: 1 }}>
          🍺 BAR — Bebidas
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

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {visibleOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}
          >
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
              🍺
            </div>
            <p style={{ color: LIGHT, fontSize: 15, fontWeight: 500 }}>Bar livre — nenhuma bebida pendente</p>
          </motion.div>
        ) : (
          SECTIONS_BAR.map(({ key, label, statuses, color }) => {
            const sectionOrders = visibleOrders.filter((o) => statuses.includes(o.status));
            if (sectionOrders.length === 0) return null;
            return (
              <div key={key}>
                <SectionHeader title={label} count={sectionOrders.length} color={color} />
                <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
                  <AnimatePresence>
                    {sectionOrders.map((order) => (
                      <BarOrderCard
                        key={order.id}
                        order={order}
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

      {/* Footer */}
      <footer style={{ background: '#311B92', color: '#fff', fontSize: 12, padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 600 }}>
          {visibleOrders.length} pedido{visibleOrders.length !== 1 ? 's' : ''} com bebida{visibleOrders.length !== 1 ? 's' : ''}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
          Bebidas Alcoólicas + Não Alcoólicas
        </span>
      </footer>
    </div>
  );
}
