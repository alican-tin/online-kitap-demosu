export const API_BASE =
  import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

type ApiError = {
  message: string;
};

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
};

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
};

export type BookItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  imagePath: string;
};

export type BookListResponse = {
  items: BookItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type RevenueMonth = {
  label: string;
  amount: number;
  year: number;
  month: number;
};

export type RevenueResponse = {
  months: RevenueMonth[];
};

const readJson = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    let message = 'Sunucu istegi basarisiz oldu.';

    try {
      const data = await readJson<ApiError>(response);
      if (data?.message) {
        message = data.message;
      }
    } catch (_) {
      // ignore json parse errors
    }

    throw new Error(message);
  }

  return readJson<T>(response);
};

const fetchJson = async <T>(path: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  return handleResponse<T>(response);
};

export const api = {
  login: (email: string, password: string) =>
    fetchJson<{ user: UserInfo }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    fetchJson<{ user: UserInfo }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => fetchJson<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => fetchJson<{ user: UserInfo }>('/auth/me'),
  books: (page: number, pageSize: number, search: string) =>
    fetchJson<BookListResponse>(
      `/books?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
    ),
  createBook: (payload: Omit<BookItem, 'id'>) =>
    fetchJson<BookItem>('/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBook: (id: string, payload: Partial<Omit<BookItem, 'id'>>) =>
    fetchJson<BookItem>(`/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBook: (id: string) =>
    fetchJson<{ ok: boolean }>(`/books/${id}`, { method: 'DELETE' }),
  revenue: (months: number) =>
    fetchJson<RevenueResponse>(`/reports/revenue?months=${months}`),
  reset: () => fetchJson<{ status: string }>('/system/reset', { method: 'POST' }),
  corrupt: () => fetchJson<{ inserted: number }>('/system/corrupt', { method: 'POST' }),
  users: () => fetchJson<UserSummary[]>('/users'),
};
