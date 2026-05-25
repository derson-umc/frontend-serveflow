import { useState, useEffect, useCallback } from 'react';
import { stockApi } from '@core/api/stock';

export function useStock() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    setLoading(true);
    stockApi.items.list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const activeItems = items.filter((i) => i.status === 'ACTIVE');
  const belowMin    = items.filter((i) => i.belowMinimum && i.status === 'ACTIVE').length;

  return { items, loading, loadItems, activeItems, belowMin };
}
