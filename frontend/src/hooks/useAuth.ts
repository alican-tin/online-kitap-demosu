import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { UserInfo } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const { user: me } = await api.me();
      setUser(me);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userInfo: UserInfo) => {
    setUser(userInfo);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const { user: me } = await api.me();
        setUser(me);
      } catch (_) {
        setUser(null);
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    refresh,
  };
}
