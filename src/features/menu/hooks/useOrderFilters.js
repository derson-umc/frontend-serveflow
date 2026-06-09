import { useState, useMemo, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export const ORDER_STATUSES = [
  { value: '',                    label: 'Todos os status'      },
  { value: 'PENDENTE',            label: 'Pendente'             },
  { value: 'EM_PREPARO',          label: 'Em preparo'           },
  { value: 'PRONTO',              label: 'Pronto'               },
  { value: 'AGUARDANDO_PAGAMENTO',label: 'Aguard. pagamento'    },
];

/**
 * orders deve ter _tipo: 'comanda' | 'delivery' já injetado.
 */
export function useOrderFilters(orders) {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter,   setTipoFilter]   = useState(''); // '' | 'comanda' | 'delivery'

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (tipoFilter   && o._tipo  !== tipoFilter)   return false;
      if (statusFilter && o.status !== statusFilter)  return false;
      if (debouncedSearch) {
        const q    = debouncedSearch.toLowerCase();
        const name = (o.mesa ?? o.nome ?? o.customerName ?? '').toLowerCase();
        const addr = (o.endereco ?? '').toLowerCase();
        if (!name.includes(q) && !addr.includes(q)) return false;
      }
      return true;
    });
  }, [orders, tipoFilter, statusFilter, debouncedSearch]);

  const reset = () => {
    setSearch('');
    setStatusFilter('');
    setTipoFilter('');
  };

  return {
    search,       setSearch,
    statusFilter, setStatusFilter,
    tipoFilter,   setTipoFilter,
    filtered,
    reset,
    hasActiveFilters: !!(debouncedSearch || statusFilter || tipoFilter),
  };
}
