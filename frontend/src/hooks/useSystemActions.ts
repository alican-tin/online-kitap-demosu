import { useCallback, useState } from 'react';
import { api } from '../lib/api';

export function useSystemActions() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'reset' | 'corrupt' | null>(null);

  const reset = useCallback(async (): Promise<boolean> => {
    setLoading('reset');
    setMessage(null);
    setError(null);

    try {
      await api.reset();
      setMessage('Reset tetiklendi. Veriler birazdan yenilenecek.');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset işlemi başarısız oldu.');
      return false;
    } finally {
      setLoading(null);
    }
  }, []);

  const corrupt = useCallback(async (): Promise<boolean> => {
    setLoading('corrupt');
    setMessage(null);
    setError(null);

    try {
      const { inserted } = await api.corrupt();
      setMessage(`${inserted} bozuk kitap eklendi.`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bozuk veri üretilemedi.');
      return false;
    } finally {
      setLoading(null);
    }
  }, []);

  return {
    message,
    error,
    loading,
    reset,
    corrupt,
    clear: () => {
      setMessage(null);
      setError(null);
    },
  };
}
