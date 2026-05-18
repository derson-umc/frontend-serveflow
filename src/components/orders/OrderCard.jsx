import { Button } from '../ui/Button';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function OrderCard({ order, type, onPrint, onEdit, onFecharConta, onOcultar, onCancelar }) {
  const title = type === 'comanda' ? `Mesa ${order.mesa}` : order.nome;
  const subtitle = type === 'delivery' ? order.endereco : null;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animation: 'slideUp 200ms ease',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{subtitle}</p>
          )}
          {order.data && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)', marginTop: 2 }}>{order.data}</p>
          )}
        </div>
        <span style={{ fontWeight: 'var(--font-black)', fontSize: 'var(--text-xl)', color: 'var(--color-success)' }}>
          {fmt(order.total)}
        </span>
      </div>

      {/* Items */}
      {order.itens?.length > 0 && (
        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
          }}
        >
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Itens
          </p>
          <div className="flex flex-col gap-1">
            {order.itens.map((item, idx) => (
              <div key={idx} className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-primary)' }}>{item.quantity}× {item.name}</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)' }}>{fmt(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap justify-end">
        <Button variant="ghost" size="sm" onClick={onPrint}>Imprimir</Button>
        <Button variant="warning" size="sm" onClick={onEdit}>Editar</Button>
        <Button variant="primary" size="sm" onClick={onFecharConta}>Fechar Conta</Button>
        <Button variant="ghost" size="sm" onClick={onOcultar}>Ocultar</Button>
        <Button variant="danger" size="sm" onClick={onCancelar}>Cancelar</Button>
      </div>
    </div>
  );
}
