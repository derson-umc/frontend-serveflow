import { CartItem } from './CartItem';
import { Button } from '@shared/components/ui/Button';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CartPanel({
  items,
  extras,
  observations,
  total,
  customerName,
  tableNumber,
  onIncrease,
  onDecrease,
  onRemove,
  onEditExtras,
  onObservationChange,
  onClear,
  onFinalize,
  orderForm,
  finalizeDisabled,
  deliveryMode,
}) {
  const isEmpty = items.length === 0;

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        width: isEmpty ? 0 : deliveryMode ? 'var(--cart-width-delivery)' : 'var(--cart-width)',
        maxWidth: isEmpty ? 0 : '90vw',
        overflow: 'hidden',
        background: 'var(--color-surface)',
        borderLeft: isEmpty ? 'none' : '1px solid var(--color-border)',
        transition: 'width var(--transition-slow)',
        height: '100%',
      }}
    >
      {!isEmpty && (
        <>
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                Carrinho
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)',
                  background: 'var(--color-success-surface)',
                  color: 'var(--color-success)',
                  border: '1px solid var(--color-success-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 8px',
                }}
              >
                {items.reduce((s, i) => s + i.quantity, 0)} itens
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                extras={extras[item.id] || []}
                observation={observations?.[item.id] ?? ''}
                onIncrease={() => onIncrease(item.id, item.quantity + 1)}
                onDecrease={() => onDecrease(item.id, item.quantity - 1)}
                onRemove={() => onRemove(item.id)}
                onEditExtras={() => onEditExtras(item)}
                onObservationChange={(text) => onObservationChange?.(item.id, text)}
              />
            ))}
          </div>

          <div className="flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="px-4 pt-3 pb-1">
              {(customerName || tableNumber) && (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 4,
                  }}
                >
                  {customerName && <span>Cliente: <strong>{customerName}</strong></span>}
                  {customerName && tableNumber && <span style={{ margin: '0 6px', opacity: 0.4 }}>›</span>}
                  {tableNumber && <span>Mesa: <strong>{tableNumber}</strong></span>}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-bold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Total do pedido
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--color-success)',
                  }}
                >
                  {fmt(total)}
                </span>
              </div>
            </div>

            {orderForm && (
              <div className="px-4 pb-2">{orderForm}</div>
            )}

            <div className="px-4 pb-4 flex gap-2">
              <Button variant="ghost" size="xs" onClick={onClear} style={{ flex: 1 }}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={onFinalize}
                disabled={finalizeDisabled}
                style={{ flex: 2 }}
              >
                Confirmar Pedido
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
