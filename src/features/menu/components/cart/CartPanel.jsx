import { CartItem } from './CartItem';
import { Button } from '@shared/components/ui/Button';
import { EmptyState } from '@shared/components/feedback/EmptyState';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CART_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M7 13l-1-5h13" />
  </svg>
);

export function CartPanel({
  items,
  extras,
  total,
  onIncrease,
  onDecrease,
  onRemove,
  onEditExtras,
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
          {/* Header */}
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

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                extras={extras[item.id] || []}
                onIncrease={() => onIncrease(item.id, item.quantity + 1)}
                onDecrease={() => onDecrease(item.id, item.quantity - 1)}
                onRemove={() => onRemove(item.id)}
                onEditExtras={() => onEditExtras(item)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
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
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-black)',
                  color: 'var(--color-success)',
                }}
              >
                {fmt(total)}
              </span>
            </div>

            {/* Order form slot */}
            {orderForm && (
              <div className="px-4 pb-2">{orderForm}</div>
            )}

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <Button variant="ghost" onClick={onClear} style={{ flex: 1 }}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={onFinalize}
                disabled={finalizeDisabled}
                style={{ flex: 2 }}
              >
                Finalizar Pedido
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
