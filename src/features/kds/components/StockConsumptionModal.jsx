import { motion } from 'framer-motion';
import { palette } from '@styles/ds';

export function StockConsumptionModal({ movements, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{
          background:   palette.white,
          border:       `1px solid ${palette.border}`,
          borderRadius: 16,
          padding:      24,
          maxWidth:     400,
          width:        '100%',
          boxShadow:    '0 12px 40px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     palette.greenSurface,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: palette.textSecondary, margin: 0 }}>
              Insumos Baixados do Estoque
            </p>
            <p style={{ fontSize: 11, color: palette.textMuted, margin: 0 }}>
              Registrado automaticamente ao iniciar o preparo
            </p>
          </div>
        </div>

        {movements.length === 0 ? (
          <p style={{ fontSize: 13, color: palette.textMuted, textAlign: 'center', padding: '12px 0' }}>
            Nenhuma movimentação registrada para este pedido.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {movements.map((m, i) => {
              const insumoMatch = m.reason?.match(/Insumo:\s*([^|]+)/);
              const qtdMatch    = m.reason?.match(/Qtd:\s*([^|]+)/);
              const insumoName  = insumoMatch?.[1]?.trim() ?? (m.stockItemName || m.reason);
              const qtdInfo     = qtdMatch?.[1]?.trim() ?? Number(m.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
              return (
                <div
                  key={i}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '8px 12px',
                    borderRadius:   8,
                    background:     palette.background,
                    border:         `1px solid ${palette.border}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: palette.textSecondary, fontWeight: 500 }}>{insumoName}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, marginLeft: 8 }}>
                    <span style={{
                      fontSize:    13,
                      fontWeight:  700,
                      color:       palette.red,
                      background:  palette.redSurface,
                      padding:     '2px 8px',
                      borderRadius: 6,
                      whiteSpace:  'nowrap',
                    }}>
                      - {qtdInfo}
                    </span>
                    {m.balanceAfter != null && (
                      <span style={{ fontSize: 10, color: palette.textMuted, whiteSpace: 'nowrap' }}>
                        saldo: {Number(m.balanceAfter).toFixed(3)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width:        '100%',
            padding:      '10px 0',
            borderRadius: 10,
            border:       'none',
            background:   palette.green,
            color:        palette.white,
            fontWeight:   700,
            fontSize:     13,
            cursor:       'pointer',
          }}
        >
          Entendido
        </button>
      </motion.div>
    </motion.div>
  );
}
