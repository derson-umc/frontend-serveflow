import { ORDER_STATUSES } from '../../hooks/useOrderFilters';

const SEL = {
  height:       30,
  padding:      '0 8px',
  fontSize:     12,
  border:       '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background:   'var(--color-bg)',
  color:        'var(--color-text-primary)',
  cursor:       'pointer',
  outline:      'none',
};

export function OrderFilters({
  search,              onSearchChange,
  status,              onStatusChange,
  tipo,                onTipoChange,
  hasActive,           onReset,
  total,               filtered,
  countFinalizados,    onLimparFinalizados,
}) {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:           8,
      padding:      '7px 16px',
      borderBottom: '1px solid var(--color-border)',
      background:   'var(--color-surface)',
      flexShrink:    0,
      flexWrap:     'wrap',
    }}>

      {/* Busca */}
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar cliente, mesa..."
        style={{ ...SEL, width: 200, padding: '0 10px' }}
      />

      {/* Status */}
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} style={SEL}>
        {ORDER_STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Tipo */}
      <select value={tipo} onChange={(e) => onTipoChange(e.target.value)} style={SEL}>
        <option value="">Local + Delivery</option>
        <option value="comanda">Local</option>
        <option value="delivery">Delivery</option>
      </select>

      {/* Limpar filtros ativos */}
      {hasActive && (
        <button
          onClick={onReset}
          style={{
            border:       'none',
            background:   '#fee2e2',
            color:        'var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            padding:      '4px 10px',
            fontSize:      11,
            fontWeight:    700,
            cursor:        'pointer',
          }}
        >
          ✕ Limpar filtros
        </button>
      )}

      {/* ── Botão: Limpar Finalizados (lote) ── */}
      {countFinalizados > 0 && (
        <button
          onClick={onLimparFinalizados}
          title="Remove da lista todos os pedidos Entregues e Cancelados"
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:           5,
            border:       '1px solid #d1d5db',
            background:   '#f9fafb',
            color:        '#374151',
            borderRadius: 'var(--radius-sm)',
            padding:      '4px 11px',
            fontSize:      11,
            fontWeight:    600,
            cursor:        'pointer',
            whiteSpace:   'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
        >
          Limpar finalizados
          <span style={{
            background:    '#374151',
            color:         '#fff',
            borderRadius:  99,
            fontSize:       10,
            fontWeight:     700,
            minWidth:       18,
            height:         18,
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            padding:       '0 5px',
          }}>
            {countFinalizados}
          </span>
        </button>
      )}

      {/* Contador de pedidos visíveis */}
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-disabled)', whiteSpace: 'nowrap' }}>
        {filtered} de {total} pedido{total !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
