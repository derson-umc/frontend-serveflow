import { motion } from 'framer-motion';
import { palette } from '@styles/ds';

export function ConfirmCancelModal({ order, loading, onConfirm, onClose }) {
  const shortId = String(order.id).slice(-6).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{
          background:  palette.white,
          border:      `1px solid ${palette.border}`,
          borderRadius: 18,
          padding:     24,
          maxWidth:    360,
          width:       '100%',
          boxShadow:   '0 12px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width:          44,
            height:         44,
            borderRadius:   12,
            background:     palette.redSurface,
            border:         `1px solid ${palette.redBorder}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            fontSize:       20,
            color:          palette.red,
            fontWeight:     800,
          }}>
            !
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: palette.textSecondary, margin: 0 }}>Cancelar Pedido?</p>
            <p style={{ fontSize: 12, color: palette.textMuted, margin: 0 }}>O estoque será restaurado automaticamente</p>
          </div>
        </div>

        <div style={{
          background:   palette.background,
          border:       `1px solid ${palette.border}`,
          borderRadius: 10,
          padding:      '10px 14px',
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 13, color: palette.textSecondary, margin: '0 0 4px' }}>
            <span style={{ color: palette.green, fontWeight: 700 }}>#{shortId}</span>
            {' — '}{order.customerName}
          </p>
          <p style={{ fontSize: 12, color: palette.textMuted, margin: 0 }}>
            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex:         1,
              padding:      '11px 0',
              borderRadius: 10,
              border:       `1px solid ${palette.border}`,
              background:   palette.background,
              color:        palette.textMuted,
              fontWeight:   600,
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            Manter Pedido
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex:         1,
              padding:      '11px 0',
              borderRadius: 10,
              border:       'none',
              background:   palette.red,
              color:        palette.white,
              fontWeight:   800,
              fontSize:     13,
              cursor:       loading ? 'not-allowed' : 'pointer',
              opacity:      loading ? 0.65 : 1,
            }}
          >
            {loading ? 'Cancelando...' : 'Sim, Cancelar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
