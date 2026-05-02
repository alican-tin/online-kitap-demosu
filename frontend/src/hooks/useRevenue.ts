import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { RevenueResponse } from '../lib/api';

export function useRevenue(months: number, enabled: boolean) {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.revenue(months);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ciro verisi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [months, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}
