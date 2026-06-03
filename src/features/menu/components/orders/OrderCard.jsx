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

// Statuses onde "Editar" faz sentido (abre o modal com edição ou visualização)
const EDITABLE_STATUSES   = ['RASCUNHO', 'ENVIADO'];
const READONLY_STATUSES   = ['EM_PREPARO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE'];
const CANCELABLE_STATUSES = ['RASCUNHO', 'ENVIADO', 'EM_PREPARO'];

export function OrderCard({ order, type, onPrint, onEdit, onFecharConta, onCancelar }) {
  const [cancelMode, setCancelMode]     = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const title    = type === 'comanda' ? `Mesa ${order.mesa}` : order.nome;
  const subtitle = type === 'delivery' ? formatEndereco(order.endereco) : null;
  const status   = order.status ?? 'RASCUNHO';
  const cfg      = STATUS_CONFIG[status] ?? STATUS_CONFIG.RASCUNHO;

  const canEdit   = EDITABLE_STATUSES.includes(status) || READONLY_STATUSES.includes(status);
  const canCancel = CANCELABLE_STATUSES.includes(status);

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
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        animation: 'slideUp 200ms ease',
      }}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              {title}
            </p>
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                background: cfg.bg, color: cfg.color,
                borderRadius: 99, padding: '2px 8px',
                whiteSpace: 'nowrap',
              }}
            >
              {cfg.label}
            </span>
          </div>
          {subtitle && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{subtitle}</p>
          )}
          {order.data && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)', marginTop: 2 }}>{order.data}</p>
          )}
        </div>
        <span style={{ fontWeight: 'var(--font-black)', fontSize: 'var(--text-xl)', color: 'var(--color-success)', flexShrink: 0, marginLeft: 12 }}>
          {fmt(order.total)}
        </span>
      </div>

      {/* Itens */}
      {order.itens?.length > 0 && (
        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-disabled)', marginBottom: 4 }}>
            Itens
          </p>
          <div className="flex flex-col gap-0.5">
            {order.itens.map((item, idx) => (
              <div key={idx} className="flex justify-between items-baseline" style={{ fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-primary)' }}>{item.quantity}× {item.name}</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)' }}>{fmt(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modo cancelamento inline */}
      {cancelMode ? (
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontWeight: 'var(--font-semibold)' }}>
            Confirmar cancelamento
          </p>
          <input
            type="text"
            placeholder="Motivo (opcional)"
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
              Confirmar cancelamento
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="ghost" size="sm" onClick={onPrint}>
            Imprimir
          </Button>

          {canEdit && (
            <Button
              variant={EDITABLE_STATUSES.includes(status) ? 'warning' : 'ghost'}
              size="sm"
              onClick={onEdit}
              title={READONLY_STATUSES.includes(status) ? 'Visualizar pedido (somente leitura)' : 'Editar pedido'}
            >
              {EDITABLE_STATUSES.includes(status) ? 'Editar' : 'Visualizar'}
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={onFecharConta}>
            Fechar Conta
          </Button>

          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setCancelMode(true)}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
