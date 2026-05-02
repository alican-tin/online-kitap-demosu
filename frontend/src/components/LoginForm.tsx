import { useState } from 'react';
import { api } from '../lib/api';
import type { UserInfo } from '../lib/api';

const DEFAULT_EMAIL = 'alican@demo.local';

export type LoginFormProps = {
  onLogin: (user: UserInfo) => void;
};

export function LoginForm({ onLogin }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { name: name.trim(), email, password };
      const { user } =
        mode === 'register'
          ? await api.register(payload.name, payload.email, payload.password)
          : await api.login(payload.email, payload.password);

      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-head">
        <p className="login-tag">Sanal Kitap Satış Platformu</p>
        <h1>{mode === 'register' ? 'Hesap Oluştur' : 'Yönetim Paneli'}</h1>
        <p className="login-sub">
          Demo akışını görmek için test hesaplarından biriyle giriş yapın.
        </p>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        {mode === 'register' ? (
          <label>
            <span>Ad Soyad</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ad Soyad"
              required
            />
          </label>
        ) : null}
        <label>
          <span>E-posta</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@demo.local"
            required
          />
        </label>
        <label>
          <span>Şifre</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="login-error">{error}</p> : null}
        <button type="submit" className="primary" disabled={loading}>
          {loading
            ? mode === 'register'
              ? 'Kayıt oluşturuluyor...'
              : 'Giriş yapılıyor...'
            : mode === 'register'
              ? 'Kayıt Ol'
              : 'Giriş Yap'}
        </button>
      </form>
      <div className="login-foot">
        <span>Admin: alican@demo.local</span>
        <span>Kullanıcı: caner@demo.local</span>
        <button
          type="button"
          className="ghost link-button"
          onClick={() => {
            setError(null);
            setMode(mode === 'login' ? 'register' : 'login');
          }}
        >
          {mode === 'login' ? 'Yeni hesap oluştur' : 'Hesabım var'}
        </button>
      </div>
    </div>
  );
}
