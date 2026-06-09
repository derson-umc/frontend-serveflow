import { EmptyState }    from '@shared/components/feedback/EmptyState';
import { OrderFilters }  from './OrderFilters';
import { OrderCard }     from './OrderCard';
import { useOrderFilters } from '../../hooks/useOrderFilters';

const EMPTY_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

/**
 * orders — array unificado com _tipo: 'comanda' | 'delivery' já injetado
 */
const FINALIZADOS = new Set(['ENTREGUE', 'CANCELADO']);

export function OrderList({ orders, onPrint, onEdit, onFecharConta, onCancelar, onLimpar, onLimparFinalizados }) {
  const countFinalizados = orders.filter((o) => FINALIZADOS.has(o.status ?? 'PENDENTE')).length;

  const {
    search,       setSearch,
    statusFilter, setStatusFilter,
    tipoFilter,   setTipoFilter,
    filtered,
    reset,
    hasActiveFilters,
  } = useOrderFilters(orders);

  if (orders.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f3f4f6' }}>
        <EmptyState
          icon={EMPTY_ICON}
          title="Nenhum pedido"
          description="Comandas e deliveries registrados aparecem aqui."
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#f3f4f6' }}>

      {/* Barra de filtros */}
      <OrderFilters
        search={search}               onSearchChange={setSearch}
        status={statusFilter}         onStatusChange={setStatusFilter}
        tipo={tipoFilter}             onTipoChange={setTipoFilter}
        hasActive={hasActiveFilters}  onReset={reset}
        total={orders.length}         filtered={filtered.length}
        countFinalizados={countFinalizados}
        onLimparFinalizados={onLimparFinalizados}
      />

      {filtered.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <EmptyState
            icon={EMPTY_ICON}
            title="Nenhum resultado"
            description="Ajuste os filtros ou limpe a busca."
          />
        </div>
      ) : (
        /* Grid responsivo: 1 col mobile → 2 col tablet → 3 col desktop */
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap:                  12,
            alignItems:          'stretch',   /* todas as células da linha com a mesma altura */
          }}>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                type={order._tipo}
                onPrint={()           => onPrint(order)}
                onEdit={()            => onEdit(order, order._tipo)}
                onFecharConta={()     => onFecharConta(order, order._tipo)}
                onCancelar={(reason)  => onCancelar(order.id, order._tipo, reason)}
                onLimpar={()          => onLimpar(order.id, order._tipo)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
