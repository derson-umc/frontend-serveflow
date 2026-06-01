import { useState, useCallback, useRef } from 'react';
import { stockApi } from '@core/api/stock';
import { toast } from '@shared/components/feedback/Toast';

const EMPTY_FILTERS = { type: '', itemId: '', startDate: '', endDate: '' };

const hasFilter = (f) =>
  (f.type && f.type !== '') || (f.itemId && f.itemId !== '') || f.startDate || f.endDate;

const buildParams = (f, p) => {
  const params = { page: p, size: 10 };
  if (f.itemId)    params.stockItemId = f.itemId;
  if (f.type)      params.type        = f.type;
  if (f.startDate) params.startDate   = f.startDate;
  if (f.endDate)   params.endDate     = f.endDate;
  return params;
};

export function useMovements() {
  const [filters, setFilters]        = useState(EMPTY_FILTERS);
  const [appliedFilters, setApplied] = useState(null);
  const [page, setPage]              = useState(0);
  const [result, setResult]          = useState(null);
  const [loading, setLoading]        = useState(false);
  const debounceRef                  = useRef(null);

  const doSearch = useCallback((f, p) => {
    if (!hasFilter(f)) return;
    setLoading(true);
    stockApi.movements.filter(buildParams(f, p))
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = () => {
    if (!hasFilter(filters)) {
      toast.error('Informe pelo menos um filtro antes de buscar.');
      return;
    }
    setPage(0);
    setApplied({ ...filters });
    doSearch(filters, 0);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(null);
    setResult(null);
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (appliedFilters && hasFilter(next)) {
        setPage(0);
        setApplied({ ...next });
        doSearch(next, 0);
      }
    }, 400);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (appliedFilters) doSearch(appliedFilters, newPage);
  };

  return {
    filters, appliedFilters,
    page, result, loading,
    handleApply, handleReset,
    handleFilterChange, handlePageChange,
    doSearch,
  };
}
