import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { BookListResponse } from '../lib/api';

export function useBooks(page: number, pageSize: number, search: string, enabled = true) {
  const [data, setData] = useState<BookListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.books(page, pageSize, search);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kitaplar alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, enabled]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
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
