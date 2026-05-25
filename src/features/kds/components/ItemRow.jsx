import { useState } from 'react';
import { motion } from 'framer-motion';
import { palette } from '@styles/ds';
import { LIGHT } from '../constants';

export function ItemRow({ item, cancelled, onCancelRequest }) {
  const [checked, setChecked] = useState(false);
  const isCancelled = !!cancelled;

  return (
    <motion.div
      animate={{
        background:   isCancelled ? palette.redSurface   : checked ? palette.greenSurface : palette.background,
        borderColor:  isCancelled ? palette.redBorder    : checked ? palette.greenBorder  : palette.border,
      }}
      transition={{ duration: 0.18 }}
      style={{ border: `1px solid ${palette.border}`, borderRadius: 8, padding: '7px 10px', marginBottom: 5 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {isCancelled ? (
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1, color: palette.red }}>x</span>
        ) : (
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((v) => !v)}
            style={{ marginTop: 3, accentColor: palette.green, width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontWeight:     700,
            fontSize:       14,
            color:          isCancelled ? LIGHT : checked ? LIGHT : '#212121',
            textDecoration: (isCancelled || checked) ? 'line-through' : 'none',
          }}>
            {item.quantity}x {item.productName}
          </span>

          {isCancelled && (
            <p style={{ fontSize: 11, color: palette.red, margin: '3px 0 0', fontStyle: 'italic' }}>
              Indisponível: {cancelled}
            </p>
          )}
          {item.observation && !isCancelled && (
            <p style={{ fontSize: 11, color: palette.red, fontStyle: 'italic', margin: '3px 0 0' }}>
              * {item.observation}
            </p>
          )}
          {(item.additionals || []).map((a, i) => (
            <p key={i} style={{ fontSize: 11, color: palette.textSecondary, margin: '2px 0 0' }}>
              + {typeof a === 'string' ? a : `${a.quantity}x ${a.name}`}
            </p>
          ))}
        </div>

        {!isCancelled && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancelRequest(item); }}
            title="Marcar como indisponível"
            style={{
              width:          22,
              height:         22,
              borderRadius:   6,
              border:         `1px solid ${palette.redBorder}`,
              background:     palette.redSurface,
              color:          palette.red,
              fontSize:       13,
              cursor:         'pointer',
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            x
          </button>
        )}
      </div>
    </motion.div>
  );
}
