import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { UserSummary } from '../lib/api';

export function useUsers(enabled: boolean) {
  const [data, setData] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.users();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanicilar alinamadi.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    void load();
  }, [load, enabled]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}
