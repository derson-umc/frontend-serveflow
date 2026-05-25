import { useState, useEffect, useCallback } from 'react';
import { stockApi } from '@core/api/stock';
import { toast } from '@shared/components/feedback/Toast';

export function useAlerts() {
  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [resolving, setResolving] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    stockApi.alerts.list()
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (alertId) => {
    setResolving(alertId);
    try {
      await stockApi.alerts.resolve(alertId);
      toast.success('Alerta resolvido.');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao resolver alerta.');
    } finally {
      setResolving(null);
    }
  };

  return { alerts, loading, resolving, handleResolve };
}
