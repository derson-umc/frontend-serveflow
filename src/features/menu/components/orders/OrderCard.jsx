import { useState, useMemo } from 'react';
import { ContextMenu }    from './ContextMenu';
import { formatEndereco } from '../../utils/formatEndereco';
import { isKdsItem }      from '@features/kds/constants';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_CONFIG = {
  PENDENTE:             { label: 'Pendente',         bg: 'rgba(109,40,217,0.10)', color: '#6d28d9', borderColor: 'rgba(109,40,217,0.22)' },
  ENVIADO:              { label: 'Enviado',           bg: 'rgba(161,98,7,0.10)',   color: '#92400e', borderColor: 'rgba(161,98,7,0.22)'   },
  EM_PREPARO:           { label: 'Em preparo',        bg: 'rgba(194,65,12,0.10)',  color: '#c2410c', borderColor: 'rgba(194,65,12,0.22)'  },
  PRONTO:               { label: 'Pronto',            bg: 'rgba(21,128,61,0.10)',  color: '#166534', borderColor: 'transparent'           },
  AGUARDANDO_PAGAMENTO: { label: 'Aguard. pagamento', bg: 'rgba(217,119,6,0.10)', color: '#b45309', borderColor: 'rgba(217,119,6,0.22)'  },
  A_CAMINHO:            { label: 'A caminho',         bg: 'rgba(3,105,161,0.10)', color: '#0369a1', borderColor: 'rgba(3,105,161,0.22)'  },
  ENTREGUE:             { label: 'Entregue',          bg: 'rgba(22,101,52,0.10)', color: '#166534', borderColor: 'transparent'           },
  CANCELADO:            { label: 'Cancelado',         bg: 'rgba(185,28,28,0.10)', color: '#b91c1c', borderColor: 'rgba(185,28,28,0.22)'  },
};

const COMANDA_CONFIG = {
  ABERTA:        { label: 'Comanda aberta',  bg: 'rgba(67,56,202,0.08)',   color: '#4338ca', borderColor: 'rgba(67,56,202,0.22)'   },
  EM_FECHAMENTO: { label: 'Em fechamento',   bg: 'rgba(180,83,9,0.08)',    color: '#b45309', borderColor: 'rgba(180,83,9,0.22)'    },
  FECHADA:       { label: 'Comanda fechada', bg: 'rgba(107,114,128,0.08)', color: '#374151', borderColor: 'rgba(107,114,128,0.22)' },
};

const CANCELABLE = new Set(['PENDENTE', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO']);
const EDITABLE   = new Set(['PENDENTE', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE', 'AGUARDANDO_PAGAMENTO']);

function mkBadge(bg, color, borderColor) {
  return {
    fontSize:      9,
    fontWeight:    700,
    letterSpacing: 0.5,
    background:    bg,
    color,
    border:        `1px solid ${borderColor}`,
    borderRadius:  4,
    padding:       '2px 7px',
    whiteSpace:    'nowrap',
  };
}

function ClockIcon({ color }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

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
  if (!iso) return 'rgba(107,114,128,0.7)';
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff >= 30) return '#b91c1c';
    if (diff >= 15) return '#c2410c';
    return '#15803d';
  } catch { return 'rgba(107,114,128,0.7)'; }
}

export function OrderCard({ order, type, onPrint, onEdit, onFecharConta, onCancelar, onLimpar }) {
  const [cancelMode,   setCancelMode]   = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError,  setCancelError]  = useState(false);
  const [hovered,      setHovered]      = useState(false);

  const status           = order.status ?? 'PENDENTE';
  const comandaStatus    = order.comandaStatus ?? 'ABERTA';
  const cfg              = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE;
  const cmdCfg           = COMANDA_CONFIG[comandaStatus] ?? COMANDA_CONFIG.ABERTA;
  const isLocal          = type === 'comanda';
  const isCancelado      = status === 'CANCELADO';
  const isComandaFechada = comandaStatus === 'FECHADA';

  const title  = isLocal ? `Mesa ${order.mesa}` : (order.nome ?? 'Delivery');
  const tempo  = elapsed(order);
  const tColor = elapsedColor(order);

  const itens      = order.itens ?? [];
  const itensExtra = itens.length > 2 ? `+${itens.length - 2}` : null;

  const allBeverages = useMemo(
    () => itens.length > 0 && itens.every((i) => !isKdsItem({ ...i, productName: i.name })),
    [itens],
  );

  const kitchenBadge = useMemo(() => {
    if (allBeverages) return mkBadge('rgba(107,114,128,0.08)', '#6b7280', 'rgba(107,114,128,0.2)');
    return mkBadge(cfg.bg, cfg.color, cfg.borderColor);
  }, [allBeverages, cfg]);

  function handleConfirmCancel() {
    if (!cancelReason.trim()) { setCancelError(true); return; }
    onCancelar?.(cancelReason.trim());
    setCancelMode(false);
    setCancelReason('');
    setCancelError(false);
  }

  const contextActions = [
    { label: 'Imprimir',        onClick: onPrint },
    { label: 'Visualizar',      onClick: onEdit,                   hidden: !EDITABLE.has(status) },
    { label: 'Fechar Conta',    onClick: onFecharConta,             hidden: isComandaFechada || isCancelado || comandaStatus === 'EM_FECHAMENTO' },
    { label: 'Cancelar pedido', onClick: () => setCancelMode(true), danger: true, hidden: !CANCELABLE.has(status) || isComandaFechada || comandaStatus === 'EM_FECHAMENTO' },
    { label: 'Limpar da lista', onClick: onLimpar,                  danger: true, hidden: comandaStatus === 'ABERTA' && !isCancelado },
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    '#fff',
        border:        '1px solid rgba(0,0,0,0.08)',
        borderTop:     `3px solid ${cfg.color}`,
        borderRadius:   10,
        boxShadow:     hovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.07)',
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        opacity:       isCancelado ? 0.55 : 1,
        transition:    'box-shadow 0.2s ease',
      }}
    >

      {/* Header */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize:      9,
            fontWeight:    700,
            letterSpacing: 0.5,
            background:    isLocal ? 'rgba(124,58,237,0.10)' : 'rgba(29,78,216,0.10)',
            color:         isLocal ? '#7c3aed' : '#1d4ed8',
            border:        `1px solid ${isLocal ? 'rgba(124,58,237,0.25)' : 'rgba(29,78,216,0.25)'}`,
            borderRadius:  4,
            padding:       '2px 6px',
          }}>
            {isLocal ? 'Local' : 'Delivery'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{
            flex:         1,
            minWidth:     0,
            fontWeight:   800,
            fontSize:     16,
            color:        '#111827',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            lineHeight:    1.2,
            margin:        0,
          }}>
            {title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
              {fmt(order.total)}
            </span>
            <ContextMenu actions={contextActions} />
          </div>
        </div>

        {!isLocal && order.endereco && (
          <p style={{
            fontSize:          11,
            color:             'rgba(107,114,128,0.9)',
            marginTop:          4,
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

      {/* Items */}
      {itens.length > 0 && (
        <div style={{ padding: '0 12px 10px', flex: 1 }}>
          {itens.slice(0, 2).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <span style={{
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:        10,
                fontWeight:      700,
                background:     'rgba(0,0,0,0.06)',
                color:          '#374151',
                borderRadius:    3,
                padding:        '0 4px',
                height:          16,
                marginRight:     6,
                flexShrink:      0,
              }}>
                {item.quantity}×
              </span>
              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{item.name}</span>
            </div>
          ))}
          {itensExtra && (
            <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.85)', fontStyle: 'italic', marginTop: 2 }}>
              {itensExtra} mais itens
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      {!cancelMode && (
        <div style={{
          padding:    '6px 12px',
          display:    'flex',
          alignItems: 'center',
          gap:         6,
          borderTop:  '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(0,0,0,0.015)',
          flexWrap:   'wrap',
        }}>
          <span style={kitchenBadge}>
            {`Cozinha: ${allBeverages ? '-' : cfg.label}`}
          </span>

          <span style={mkBadge(cmdCfg.bg, cmdCfg.color, cmdCfg.borderColor)}>
            {cmdCfg.label}
          </span>

          <span style={{ flex: 1 }} />

          {tempo && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: tColor }}>
              <ClockIcon color={tColor} />
              {tempo}
            </span>
          )}
        </div>
      )}

      {/* Cancel inline */}
      {cancelMode && (
        <div style={{
          padding:     '8px 12px',
          display:     'flex',
          flexDirection: 'column',
          gap:          6,
          background:  'rgba(185,28,28,0.04)',
          borderTop:   '1px solid rgba(185,28,28,0.12)',
        }}>
          <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 700 }}>Confirmar cancelamento</span>
          <input
            type="text"
            placeholder="Motivo do cancelamento *"
            value={cancelReason}
            onChange={(e) => { setCancelReason(e.target.value); setCancelError(false); }}
            autoFocus
            style={{
              fontSize:     12,
              padding:      '5px 8px',
              border:       `1px solid ${cancelError ? '#dc2626' : 'rgba(185,28,28,0.3)'}`,
              borderRadius:  6,
              outline:      'none',
              background:   '#fff',
              color:        '#111',
              boxShadow:    cancelError ? '0 0 0 2px rgba(220,38,38,0.2)' : 'none',
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
              style={{ border: '1px solid rgba(0,0,0,0.12)', background: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#6b7280' }}
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
