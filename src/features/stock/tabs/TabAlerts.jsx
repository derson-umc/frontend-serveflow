import { Spinner } from '@shared/components/feedback/Spinner';
import { Btn } from '@shared/components/ui/Btn';
import { dsCard, palette } from '@styles/ds';

export function TabAlerts({ alerts, loading, resolving, handleResolve }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner size={20} />
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: palette.textMuted, fontSize: 14 }}>
        Nenhum alerta ativo no momento.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            ...dsCard,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderLeft: `4px solid ${palette.orange}`,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: palette.textPrimary, marginBottom: 2 }}>
              {alert.stockItemName ?? alert.itemName ?? 'Insumo'}
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted }}>
              {alert.message ?? `Estoque abaixo do mínimo: ${alert.currentQuantity} / ${alert.minimumQuantity}`}
            </div>
          </div>
          <Btn
            variant="ghost"
            disabled={resolving === alert.id}
            onClick={() => handleResolve(alert.id)}
            style={{ fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap' }}
          >
            {resolving === alert.id ? 'Resolvendo...' : 'Resolver'}
          </Btn>
        </div>
      ))}
    </div>
  );
}
