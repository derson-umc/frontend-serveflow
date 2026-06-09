import { useState } from 'react';
import { ContextMenu }    from './ContextMenu';
import { formatEndereco } from '../../utils/formatEndereco';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_CONFIG = {
  PENDENTE:             { label: 'Pendente',            bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  ENVIADO:              { label: 'Enviado',              bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  EM_PREPARO:           { label: 'Em preparo',           bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  PRONTO:               { label: 'Pronto',               bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  AGUARDANDO_PAGAMENTO: { label: 'Aguard. pagamento',    bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  A_CAMINHO:            { label: 'A caminho',            bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  ENTREGUE:             { label: 'Entregue',             bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  CANCELADO:            { label: 'Cancelado',            bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
};

const COMANDA_CONFIG = {
  ABERTA:        { label: '● Comanda aberta',    bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  EM_FECHAMENTO: { label: '◑ Em fechamento',     bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  FECHADA:       { label: '○ Comanda fechada',   bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
};

const CANCELABLE = new Set(['PENDENTE', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO']);
const EDITABLE   = new Set(['PENDENTE', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE', 'AGUARDANDO_PAGAMENTO']);

// Calcula tempo decorrido desde a criação do pedido
function elapsed(order) {
  const iso = order.createdAt;
  if (!iso) return null;
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 0)  return null;
    if (diff < 60) return `${diff}min`;
    return `${Math.floor(diff / 60)}h${diff % 60 > 0 ? `${diff % 60}m` : ''}`;
  } catch { return null; }
}

function elapsedColor(order) {
  const iso = order.createdAt;
  if (!iso) return 'var(--color-text-disabled)';
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff >= 30) return '#b91c1c';
    if (diff >= 15) return '#c2410c';
    return '#15803d';
  } catch { return 'var(--color-text-disabled)'; }
}

export function OrderCard({ order, type, onPrint, onEdit, onFecharConta, onCancelar, onLimpar }) {
  const [cancelMode,    setCancelMode]    = useState(false);
  const [cancelReason,  setCancelReason]  = useState('');
  const [cancelError,   setCancelError]   = useState(false);

  const status       = order.status ?? 'PENDENTE';
  const comandaStatus = order.comandaStatus ?? 'ABERTA';
  const cfg          = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE;
  const cmdCfg       = COMANDA_CONFIG[comandaStatus] ?? COMANDA_CONFIG.ABERTA;
  const isLocal      = type === 'comanda';
  const isEntregue   = status === 'ENTREGUE';
  const isCancelado  = status === 'CANCELADO';
  const isComandaFechada = comandaStatus === 'FECHADA';

  const title  = isLocal ? `Mesa ${order.mesa}` : (order.nome ?? 'Delivery');
  const tempo  = elapsed(order);   // calculado a partir de createdAt (ISO)
  const tColor = elapsedColor(order);

  // Itens: até 2 nomes completos + contador
  const itens = order.itens ?? [];
  const itensDisplay = itens.slice(0, 2).map((i) => `${i.quantity}× ${i.name}`);
  const itensExtra   = itens.length > 2 ? `+${itens.length - 2}` : null;

  function handleConfirmCancel() {
    if (!cancelReason.trim()) {
      setCancelError(true);
      return;
    }
    onCancelar?.(cancelReason.trim());
    setCancelMode(false);
    setCancelReason('');
    setCancelError(false);
  }

  const contextActions = [
    { label: 'Imprimir',        onClick: onPrint },
    { label: 'Visualizar',      onClick: onEdit,                   hidden: !EDITABLE.has(status)              },
    { label: 'Fechar Conta',    onClick: onFecharConta,             hidden: isComandaFechada || isCancelado || comandaStatus === 'EM_FECHAMENTO' },
    { label: 'Cancelar pedido', onClick: () => setCancelMode(true), danger: true, hidden: !CANCELABLE.has(status) || isComandaFechada || comandaStatus === 'EM_FECHAMENTO' },
    { label: 'Limpar da lista', onClick: onLimpar,                  danger: true, hidden: comandaStatus === 'ABERTA' && !isCancelado },
  ];

  return (
    <div style={{
      background:    '#fff',
      border:        '1px solid #e5e7eb',
      borderTop:     `3px solid ${cfg.color}`,
      borderRadius:   10,
      boxShadow:     '0 1px 4px rgba(0,0,0,0.07)',
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',          /* ocupa toda a célula do grid */
      opacity:       isCancelado ? 0.55 : 1,
      transition:    'box-shadow 0.15s',
    }}>

      {/* ── Cabeçalho ── */}
      <div style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight:   800,
            fontSize:     16,
            color:        '#111827',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            lineHeight:    1.2,
          }}>
            {title}
          </p>
          {!isLocal && order.endereco && (
            <p style={{
              fontSize:          11,
              color:             '#6b7280',
              marginTop:          2,
              lineHeight:         1.4,
              display:           '-webkit-box',
              WebkitLineClamp:    2,
              WebkitBoxOrient:   'vertical',
              overflow:          'hidden',
            }}>
              {formatEndereco(order.endereco)}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#15803d' }}>
            {fmt(order.total)}
          </span>
          <ContextMenu actions={contextActions} />
        </div>
      </div>

      {/* ── Itens ── */}
      {itens.length > 0 && (
        <div style={{ padding: '0 12px 8px', borderBottom: '1px solid #f3f4f6', flex: 1 }}>
          {itensDisplay.map((txt, i) => (
            <p key={i} style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{txt}</p>
          ))}
          {itensExtra && (
            <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>{itensExtra} mais itens</p>
          )}
        </div>
      )}

      {/* ── Rodapé: badges + tempo ── */}
      {!cancelMode && (
        <div style={{
          padding:     '6px 12px',
          display:     'flex',
          alignItems:  'center',
          gap:          6,
          background:  '#f9fafb',
          flexWrap:    'wrap',
        }}>
          {/* Badge tipo */}
          <span style={{
            fontSize:     9,
            fontWeight:   700,
            letterSpacing: 0.4,
            background:   isLocal ? '#f3e8ff' : '#dbeafe',
            color:        isLocal ? '#7c3aed' : '#1d4ed8',
            border:       `1px solid ${isLocal ? '#c4b5fd' : '#93c5fd'}`,
            borderRadius:  4,
            padding:      '2px 6px',
          }}>
            {isLocal ? 'Local' : 'Delivery'}
          </span>

          {/* Badge pedido (cozinha) */}
          <span style={{
            fontSize:     9,
            fontWeight:   700,
            letterSpacing: 0.4,
            background:   cfg.bg,
            color:        cfg.color,
            border:       `1px solid ${cfg.border}`,
            borderRadius:  4,
            padding:      '2px 6px',
          }}>
            {cfg.label}
          </span>

          {/* Badge comanda (billing) */}
          <span style={{
            fontSize:     9,
            fontWeight:   700,
            letterSpacing: 0.4,
            background:   cmdCfg.bg,
            color:        cmdCfg.color,
            border:       `1px solid ${cmdCfg.border}`,
            borderRadius:  4,
            padding:      '2px 6px',
          }}>
            {cmdCfg.label}
          </span>

          <span style={{ flex: 1 }} />

          {/* Tempo decorrido */}
          {tempo && (
            <span style={{ fontSize: 11, fontWeight: 700, color: tColor }}>
              {tempo}
            </span>
          )}
        </div>
      )}

      {/* ── Cancelamento inline ── */}
      {cancelMode && (
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6, background: '#fef2f2' }}>
          <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 700 }}>Confirmar cancelamento</span>
          <input
            type="text"
            placeholder="Motivo do cancelamento *"
            value={cancelReason}
            onChange={(e) => { setCancelReason(e.target.value); setCancelError(false); }}
            autoFocus
            style={{
              fontSize:      12,
              padding:       '5px 8px',
              border:        `1px solid ${cancelError ? '#dc2626' : '#fca5a5'}`,
              borderRadius:   6,
              outline:       'none',
              background:    '#fff',
              color:         '#111',
              boxShadow:     cancelError ? '0 0 0 2px rgba(220,38,38,0.2)' : 'none',
            }}
          />
          {cancelError && (
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
              Informe o motivo do cancelamento.
            </span>
          )}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setCancelMode(false); setCancelReason(''); setCancelError(false); }}
              style={{ border: '1px solid #d1d5db', background: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#6b7280' }}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmCancel}
              style={{ border: 'none', background: '#dc2626', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
