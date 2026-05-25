import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@core/api/orders';
import { stockApi } from '@core/api/stock';
import { toast } from '@shared/components/feedback/Toast';
import { palette } from '@styles/ds';
import { STATUS_CONFIG, urgentPulse, LIGHT } from '../constants';
import { waitColor, waitMinutes, getPrimaryAction } from '../utils';
import { useElapsed } from '../hooks/useElapsed';
import { ItemRow } from './ItemRow';
import { StatusProgress } from './StatusProgress';
import { ConfirmCancelModal } from './ConfirmCancelModal';
import { CancelItemModal } from './CancelItemModal';
import { StockConsumptionModal } from './StockConsumptionModal';

export function OrderCard({ order, position, onStatusChange }) {
  const cancelMutation = useMutation({ mutationFn: (id) => ordersApi.cancel(id) });
  const [acting, setActing]             = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancellingItem, setCancellingItem]   = useState(null);
  const [cancelledItems, setCancelledItems]   = useState({});
  const [stockMovements, setStockMovements]   = useState(null);

  const color     = waitColor(order.createdAt);
  const minutes   = waitMinutes(order.createdAt);
  const isUrgent  = minutes >= 15;
  const shortId   = String(order.id).slice(-6).toUpperCase();
  const elapsed   = useElapsed(order.createdAt);
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: palette.textMuted };
  const primary   = getPrimaryAction(order);

  const positionBg    = position === 1 ? '#FFF8E1' : position === 2 ? palette.background : '#FFF3E0';
  const positionColor = position === 1 ? '#F57F17' : position === 2 ? palette.textMuted   : '#BF360C';

  const markItemCancelled = (item, reason) => {
    setCancelledItems((prev) => ({ ...prev, [item.id]: reason }));
    setCancellingItem(null);
    toast.warning(`"${item.productName}" marcado como indisponível`);
  };

  const handleCancelOrder = async () => {
    try {
      await cancelMutation.mutateAsync(order.id);
      toast.success(`Pedido #${shortId} cancelado`);
      setCancellingOrder(false);
      onStatusChange(order.id);
    } catch (err) {
      toast.error(err.message || 'Erro ao cancelar pedido.');
    }
  };

  const act = async (fn, successMsg, deductsStock) => {
    setActing(true);
    try {
      await fn();
      toast.success(successMsg);
      if (deductsStock) {
        try {
          const [movements, allItems] = await Promise.all([
            stockApi.movements.listByOrder(order.id),
            stockApi.items.list(),
          ]);
          const consumed = movements.filter((m) => m.type === 'ORDER_CONSUMPTION');
          const itemMap  = Object.fromEntries(allItems.map((i) => [i.id, i]));
          setStockMovements(consumed.map((m) => ({
            ...m,
            currentQuantity: itemMap[m.stockItemId]?.currentQuantity ?? null,
          })));
        } catch { }
      }
      onStatusChange(order.id);
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar pedido. Verifique o estoque e as fichas técnicas.');
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={
          isUrgent
            ? { opacity: 1, y: 0, scale: 1, ...urgentPulse.animate }
            : { opacity: 1, y: 0, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0.88, y: -12, transition: { duration: 0.3 } }}
        transition={
          isUrgent
            ? { opacity: { duration: 0.3 }, y: { type: 'spring', stiffness: 200, damping: 22 }, ...urgentPulse.transition }
            : { type: 'spring', stiffness: 200, damping: 22 }
        }
        whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.14)' }}
        style={{
          background:   palette.white,
          border:       `1px solid ${palette.border}`,
          borderTop:    `4px solid ${color}`,
          borderRadius: 14,
          boxShadow:    isUrgent ? '0 2px 14px rgba(198,40,40,0.15)' : '0 2px 14px rgba(0,0,0,0.09)',
          width:        300,
          flexShrink:   0,
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
        }}
      >
        <div style={{ padding: '12px 14px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{
                background:     positionBg,
                color:          positionColor,
                border:         `1px solid ${positionColor}40`,
                borderRadius:   7,
                minWidth:       28,
                height:         28,
                paddingInline:  5,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontWeight:     900,
                fontSize:       11,
                flexShrink:     0,
              }}>
                #{position}
              </span>
              <span
                style={{ fontWeight: 700, fontSize: 15, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={order.customerName}
              >
                {order.customerName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginLeft: 6 }}>
              <motion.span
                key={order.status}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                style={{
                  background:    statusCfg.bg,
                  color:         palette.white,
                  padding:       '3px 8px',
                  borderRadius:  20,
                  fontWeight:    700,
                  fontSize:      9,
                  letterSpacing: 0.4,
                }}
              >
                {statusCfg.label}
              </motion.span>
              <button
                onClick={() => setCancellingOrder(true)}
                title="Cancelar pedido"
                style={{
                  width:          24,
                  height:         24,
                  borderRadius:   6,
                  border:         `1px solid ${palette.redBorder}`,
                  background:     palette.redSurface,
                  color:          palette.red,
                  fontSize:       12,
                  cursor:         'pointer',
                  flexShrink:     0,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>
          </div>

          <StatusProgress status={order.status} />

          {order.type === 'DELIVERY' && (
            <span style={{
              display:       'inline-block',
              marginTop:     4,
              marginBottom:  2,
              background:    palette.blueSurface,
              color:         palette.blue,
              fontSize:      10,
              fontWeight:    700,
              padding:       '2px 7px',
              borderRadius:  10,
              letterSpacing: 0.3,
            }}>
              DELIVERY
            </span>
          )}

          <div style={{ maxHeight: 250, overflowY: 'auto', marginTop: 6 }}>
            {order.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                cancelled={cancelledItems[item.id]}
                onCancelRequest={(it) => setCancellingItem(it)}
              />
            ))}
          </div>
        </div>

        <div style={{
          padding:        '6px 14px 8px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          borderTop:      '1px solid #F0F0F0',
        }}>
          <span style={{ fontSize: 11, color: palette.textMuted }}>{order.customerName}</span>
          <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color, fontWeight: 700 }}>
            {elapsed}
          </span>
        </div>

        {primary && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => act(primary.fn, primary.msg, primary.deductsStock)}
            disabled={acting}
            style={{
              width:         '100%',
              padding:       '13px 0',
              border:        'none',
              background:    primary.bg,
              color:         primary.fg,
              fontWeight:    800,
              fontSize:      13,
              letterSpacing: 0.5,
              cursor:        acting ? 'not-allowed' : 'pointer',
              opacity:       acting ? 0.65 : 1,
              transition:    'opacity 0.15s',
            }}
          >
            {acting ? '...' : primary.label}
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {cancellingOrder && (
          <ConfirmCancelModal
            order={order}
            loading={cancelMutation.isPending}
            onConfirm={handleCancelOrder}
            onClose={() => setCancellingOrder(false)}
          />
        )}
        {cancellingItem && (
          <CancelItemModal
            item={cancellingItem}
            onConfirm={(reason) => markItemCancelled(cancellingItem, reason)}
            onClose={() => setCancellingItem(null)}
          />
        )}
        {stockMovements !== null && (
          <StockConsumptionModal
            movements={stockMovements}
            onClose={() => setStockMovements(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
