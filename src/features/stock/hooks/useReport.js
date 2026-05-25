import { useState, useEffect, useCallback } from 'react';
import { stockApi } from '@core/api/stock';

export function useReport() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = useCallback(() => {
    setLoading(true);
    stockApi.report.consolidated()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered      = rows.filter((r) => r.insumo?.toLowerCase().includes(search.toLowerCase()));
  const totalEntradas = rows.reduce((s, r) => s + (parseFloat(r.totalEntradas) || 0), 0);
  const totalSaidas   = rows.reduce((s, r) => s + (parseFloat(r.totalSaidas)   || 0), 0);

  return { filtered, loading, search, setSearch, load, totalEntradas, totalSaidas };
}
