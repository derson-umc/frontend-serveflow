import { useState } from 'react';
import { motion } from 'framer-motion';
import { palette } from '@styles/ds';
import { CANCEL_REASONS, LIGHT } from '../constants';

export function CancelItemModal({ item, onConfirm, onClose }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);

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
          background:   palette.white,
          border:       `1px solid ${palette.border}`,
          borderRadius: 18,
          padding:      24,
          maxWidth:     340,
          width:        '100%',
          boxShadow:    '0 12px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontWeight: 800, fontSize: 14, color: palette.textSecondary, margin: '0 0 4px' }}>
          Marcar como Indisponível
        </p>
        <p style={{ fontSize: 12, color: palette.textMuted, margin: '0 0 18px' }}>
          <span style={{ color: palette.green, fontWeight: 700 }}>
            {item.quantity}x {item.productName}
          </span>
        </p>

        <p style={{ fontSize: 10, color: LIGHT, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Motivo
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {CANCEL_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              style={{
                padding:    '9px 12px',
                borderRadius: 8,
                textAlign:  'left',
                border:     reason === r ? `1.5px solid ${palette.red}` : `1px solid ${palette.border}`,
                background: reason === r ? palette.redSurface : palette.background,
                color:      reason === r ? palette.red : palette.textSecondary,
                fontSize:   13,
                cursor:     'pointer',
                fontWeight: reason === r ? 700 : 400,
                transition: 'all 0.12s',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex:         1,
              padding:      '10px 0',
              borderRadius: 10,
              border:       `1px solid ${palette.border}`,
              background:   palette.background,
              color:        palette.textMuted,
              fontWeight:   600,
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            Voltar
          </button>
          <button
            onClick={() => onConfirm(reason)}
            style={{
              flex:         1,
              padding:      '10px 0',
              borderRadius: 10,
              border:       'none',
              background:   palette.red,
              color:        palette.white,
              fontWeight:   700,
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
