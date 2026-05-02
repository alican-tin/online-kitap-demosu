import { useEffect, useState } from 'react';
import type { BookItem } from '../lib/api';

export type BookFormPayload = {
  title: string;
  author: string;
  imagePath: string;
  price: number;
};

type BookFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: BookItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: BookFormPayload) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

const toPriceInput = (price?: number) =>
  price !== undefined ? (price / 100).toFixed(2) : '';

export function BookFormModal({
  open,
  mode,
  initial,
  loading,
  onClose,
  onSubmit,
  onDelete,
}: BookFormModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setAuthor(initial?.author ?? '');
    setImagePath(initial?.imagePath ?? '');
    setPrice(toPriceInput(initial?.price));
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const numericPrice = Number(price.replace(',', '.'));
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Fiyat gecersiz.');
      return;
    }

    const payload: BookFormPayload = {
      title: title.trim(),
      author: author.trim(),
      imagePath: imagePath.trim(),
      price: Math.round(numericPrice * 100),
    };

    if (!payload.title || !payload.author || !payload.imagePath) {
      setError('Tum alanlar zorunludur.');
      return;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz oldu.');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2>{mode === 'create' ? 'Yeni Kitap' : 'Kitabi Duzenle'}</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Kapat
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Baslik</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Yazar</span>
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Gorsel Yolu</span>
            <input
              type="text"
              value={imagePath}
              onChange={(event) => setImagePath(event.target.value)}
              placeholder="/images/ornek.jpg"
              required
            />
          </label>
          <label>
            <span>Fiyat (TL)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <div className="modal-actions">
            <div style={{ display: 'flex', gap: 8 }}>
              {mode === 'edit' && onDelete && initial ? (
                <button
                  type="button"
                  className="danger"
                  onClick={async () => {
                    if (!initial) return;
                    if (!confirm('Bu kitabı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
                    try {
                      await onDelete(initial.id);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Silme başarısız.');
                    }
                  }}
                  disabled={loading}
                >
                  Sil
                </button>
              ) : null}

              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button type="button" className="ghost" onClick={onClose}>
                Vazgec
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
