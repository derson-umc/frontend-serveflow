import { useState } from 'react';
import { Button } from '@shared/components/ui/Button';
import { formatEndereco } from '../../utils/formatEndereco';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_CONFIG = {
  RASCUNHO:  { label: 'Rascunho',   bg: '#e0e7ff', color: '#4338ca' },
  ENVIADO:   { label: 'Enviado',    bg: '#fef9c3', color: '#a16207' },
  EM_PREPARO: { label: 'Em preparo', bg: '#ffedd5', color: '#c2410c' },
  PRONTO:    { label: 'Pronto',     bg: '#dcfce7', color: '#15803d' },
  A_CAMINHO: { label: 'A caminho',  bg: '#e0f2fe', color: '#0369a1' },
  ENTREGUE:  { label: 'Entregue',   bg: '#f0fdf4', color: '#166534' },
  CANCELADO: { label: 'Cancelado',  bg: '#fee2e2', color: '#b91c1c' },
};

export function OrderCard({ order, type, onPrint, onEdit, onFecharConta, onOcultar, onCancelar }) {
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const title    = type === 'comanda' ? `Mesa ${order.mesa}` : order.nome;
  const subtitle = type === 'delivery' ? formatEndereco(order.endereco) : null;
  const status   = order.status ?? 'RASCUNHO';
  const cfg      = STATUS_CONFIG[status] ?? STATUS_CONFIG.RASCUNHO;

  function handleConfirmCancel() {
    onCancelar?.(order.id, cancelReason || null);
    setCancelMode(false);
    setCancelReason('');
  }

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
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              {title}
            </p>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: cfg.bg,
                color: cfg.color,
                borderRadius: 99,
                padding: '2px 8px',
                whiteSpace: 'nowrap',
              }}
            >
              {cfg.label}
            </span>
          </div>
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

      {cancelMode ? (
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontWeight: 'var(--font-semibold)' }}>
            Confirmar cancelamento
          </p>
          <input
            type="text"
            placeholder="Motivo do cancelamento (opcional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            autoFocus
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              outline: 'none',
              width: '100%',
            }}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setCancelMode(false); setCancelReason(''); }}>
              Voltar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Cancelar pedido
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="ghost"   size="sm" onClick={onPrint}>Imprimir</Button>
          <Button variant="warning" size="sm" onClick={onEdit}>Editar</Button>
          <Button variant="primary" size="sm" onClick={onFecharConta}>Fechar Conta</Button>
          <Button variant="ghost"   size="sm" onClick={onOcultar}>Ocultar</Button>
          <Button variant="danger"  size="sm" onClick={() => setCancelMode(true)}>Cancelar</Button>
        </div>
      )}
    </div>
  );
}
