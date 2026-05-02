import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { BookFormModal } from './components/BookFormModal'
import type { BookFormPayload } from './components/BookFormModal'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { LoginForm } from './components/LoginForm'
import { Pagination } from './components/Pagination'
import { RevenueChart } from './components/RevenueChart'
import { SearchInput } from './components/SearchInput'
import { useAuth } from './hooks/useAuth'
import { useBooks } from './hooks/useBooks'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useKeyboardReset } from './hooks/useKeyboardReset'
import { useRevenue } from './hooks/useRevenue'
import { useSystemActions } from './hooks/useSystemActions'
import { useUsers } from './hooks/useUsers.ts'
import { api } from './lib/api'
import type { BookItem, UserInfo } from './lib/api'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(value / 100)

function App() {
  const { user, loading: authLoading, login, logout } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [editMode, setEditMode] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingBook, setEditingBook] = useState<BookItem | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'inventory' | 'roles'>(
    'inventory',
  )
  const isAdmin = user?.role === 'ADMIN'

  const {
    data: booksData,
    loading: booksLoading,
    error: booksError,
    reload: reloadBooks,
  } = useBooks(page, 5, debouncedSearch, Boolean(user))
  const {
    data: revenueData,
    loading: revenueLoading,
    error: revenueError,
    reload: reloadRevenue,
  } = useRevenue(6, Boolean(user) && isAdmin)
  const {
    message: systemMessage,
    error: systemError,
    loading: systemLoading,
    reset: resetSystem,
    corrupt: corruptSystem,
    clear: clearSystemMessage,
  } = useSystemActions()

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    reload: reloadUsers,
  } = useUsers(Boolean(user) && isAdmin && activeSection === 'roles')

  const statusMeta = isAdmin ? systemError ?? systemMessage : null
  const statusTone = systemError ? 'error' : 'info'
  const statusNote = isAdmin
    ? 'Sanal Kitap Satış Platformu - Yönetim Paneli'
    : 'Sanal Kitap Satış Platformu'

  const handleReset = useCallback(async () => {
    const ok = await resetSystem()

    if (ok) {
      setPage(1)
      window.setTimeout(() => {
        reloadBooks()
        if (isAdmin) {
          reloadRevenue()
          reloadUsers()
        }
      }, 800)
    }
  }, [resetSystem, reloadBooks, reloadRevenue, reloadUsers, isAdmin])

  const handleCorrupt = useCallback(async () => {
    const ok = await corruptSystem()

    if (ok) {
      setPage(1)
      reloadBooks()
      if (isAdmin) {
        reloadRevenue()
        reloadUsers()
      }
    }
  }, [corruptSystem, reloadBooks, reloadRevenue, reloadUsers, isAdmin])

  useKeyboardReset({
    enabled: Boolean(user) && isAdmin && systemLoading === null,
    onReset: handleReset,
  })

  const userLabel = useMemo(() => {
    if (!user) return ''
    return user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'
  }, [user])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleLogin = (userInfo: UserInfo) => {
    login(userInfo)
    setActiveSection('inventory')
  }

  useEffect(() => {
    if (!isAdmin) {
      clearSystemMessage()
      setActiveSection('inventory')
    }
  }, [isAdmin, clearSystemMessage])

  const openCreateForm = () => {
    setFormMode('create')
    setEditingBook(null)
    setFormOpen(true)
  }

  const openEditForm = (book: BookItem) => {
    setFormMode('edit')
    setEditingBook(book)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingBook(null)
  }

  const handleSubmitBook = useCallback(
    async (payload: BookFormPayload) => {
      setFormLoading(true)

      try {
        if (formMode === 'edit' && editingBook) {
          await api.updateBook(editingBook.id, payload)
        } else {
          await api.createBook(payload)
          setPage(1)
        }

        closeForm()
        reloadBooks()
      } finally {
        setFormLoading(false)
      }
    },
    [formMode, editingBook, reloadBooks],
  )

    const handleDeleteBook = useCallback(async (id: string) => {
      try {
        await api.deleteBook(id);
        closeForm();
        reloadBooks();
      } catch (err) {
        // bubble up via BookFormModal error UI
        throw err;
      }
    }, [reloadBooks]);

  if (authLoading) {
    return (
      <div className="app">
        <LoadingState label="Oturum kontrol ediliyor..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app login-layout">
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">OK</div>
          <div>
            <p className="brand-title">Online Kitap Demosu</p>
            <p className="brand-sub">Envanter + Satış Görünümü</p>
          </div>
        </div>
        <div className="status">
          <span className={`badge ${isAdmin ? 'clean' : 'junk'}`}>{userLabel}</span>
          <div className="status-stack">
            <span className="status-note">{statusNote}</span>
            {statusMeta ? (
              <span className={`status-meta ${statusTone}`} role="status" aria-live="polite">
                {statusMeta}
              </span>
            ) : null}
          </div>
        </div>
        <div className="top-actions">
          {isAdmin ? (
            <>
              <button
                type="button"
                className="ghost"
                onClick={handleCorrupt}
                disabled={systemLoading !== null}
              >
                {systemLoading === 'corrupt' ? 'Bozuk Veri...' : 'Bozuk Veri Üret'}
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleReset}
                disabled={systemLoading !== null}
              >
                {systemLoading === 'reset' ? 'Reset...' : 'Admin Reset'}
              </button>
            </>
          ) : null}
          <button type="button" className="ghost" onClick={logout}>
            Çıkış
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="nav-group">
            <p className="nav-title">{isAdmin ? 'Yönetim' : 'Katalog'}</p>
            <button
              type="button"
              className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveSection('inventory')}
            >
              Envanter
            </button>
            <button type="button" className="nav-item">
              Siparişler
            </button>
            {isAdmin ? (
              <>
                <button type="button" className="nav-item">
                  Gelir Raporu
                </button>
                <button
                  type="button"
                  className={`nav-item ${activeSection === 'roles' ? 'active' : ''}`}
                  onClick={() => setActiveSection('roles')}
                >
                  Kullanıcı Rolleri
                </button>
              </>
            ) : null}
          </div>
        </aside>

        <main className="content">
          {isAdmin && activeSection === 'inventory' ? (
            <section className="hero fade-in">
              <div className="hero-text">
                <p className="eyebrow">Sanal Kitap Satış Platformu</p>
                <h1>Yönetim Paneli</h1>
                <p className="hero-copy">
                  Operasyon görünürlüğünü artırmak için temel metrikleri ve katalog
                  yönetimini tek ekranda topladık.
                </p>
                <div className="hero-actions">
                  <button type="button" className="primary" onClick={openCreateForm}>
                    Yeni Kitap Ekle
                  </button>
                  <button
                    type="button"
                    className={`ghost ${editMode ? 'active' : ''}`}
                    onClick={() => setEditMode((value) => !value)}
                  >
                    {editMode ? 'Düzenleme Modu Açık' : 'Düzenleme Modu'}
                  </button>
                </div>
              </div>
              <div className="hero-stats">
                <div className="stat-card">
                  <p className="stat-label">Toplam Kitap</p>
                  <p className="stat-value">{booksData?.total ?? '-'}</p>
                  <p className="stat-foot">Katalogdaki kitap sayısı</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Aylık Ciro</p>
                  <p className="stat-value">
                    {revenueData?.months?.length
                      ? formatPrice(revenueData.months.at(-1)?.amount ?? 0)
                      : '-'}
                  </p>
                  <p className="stat-foot">Son ay kapanışı</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Satış Adedi</p>
                  <p className="stat-value">-</p>
                  <p className="stat-foot">Yakında eklenecek</p>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === 'inventory' ? (
            <section className={`grid ${isAdmin ? '' : 'grid-single'}`}>
              <div className="panel panel--wide fade-in stagger-1">
              <div className="panel-head">
                <div>
                  <h2>Kitap Listesi</h2>
                  <p className="panel-sub">Başlık, yazar, fiyat ve kapak</p>
                </div>
                <SearchInput value={search} onChange={handleSearchChange} />
              </div>
              {booksLoading ? (
                <LoadingState label="Kitaplar yükleniyor..." />
              ) : booksError ? (
                <ErrorState message={booksError} onRetry={reloadBooks} />
              ) : (
                <>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Başlık</th>
                          <th>Yazar</th>
                          <th>Fiyat</th>
                          <th>Kapak</th>
                          {isAdmin && editMode ? <th>İşlem</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {booksData?.items.map((book) => (
                          <tr key={book.id}>
                            <td className="book-title">{book.title}</td>
                            <td>{book.author}</td>
                            <td>{formatPrice(book.price)}</td>
                            <td>
                              <div className="cover">
                                <img src={book.imagePath} alt={book.title} />
                              </div>
                            </td>
                            {isAdmin && editMode ? (
                              <td>
                                <button
                                  type="button"
                                  className="pill action"
                                  onClick={() => openEditForm(book)}
                                >
                                  Düzenle
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-foot">
                    <span>
                      {booksData?.total ?? 0} kitap içinde {booksData?.page ?? 1}. sayfa
                    </span>
                    <Pagination
                      page={booksData?.page ?? 1}
                      totalPages={booksData?.totalPages ?? 1}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </div>

              {isAdmin ? (
                <div className="panel fade-in stagger-2">
                <div className="panel-head">
                  <div>
                    <h2>Aylık Ciro</h2>
                    <p className="panel-sub">Son 6 ay trendi</p>
                  </div>
                  <span className="pill">Admin</span>
                </div>
                {revenueLoading ? (
                  <LoadingState label="Ciro verisi yükleniyor..." />
                ) : revenueError ? (
                  <ErrorState message={revenueError} onRetry={reloadRevenue} />
                ) : revenueData?.months ? (
                  <RevenueChart months={revenueData.months} />
                ) : (
                  <ErrorState message="Ciro verisi bulunamadi." />
                )}
                </div>
              ) : null}

              {isAdmin ? (
                <div className="panel fade-in stagger-3">
                <div className="panel-head">
                  <div>
                    <h2>Son Satışlar</h2>
                    <p className="panel-sub">Gözden geçirme listesi</p>
                  </div>
                </div>
                <ul className="sales">
                  <li>
                    <span>Saatleri Ayarlama Enstitüsü</span>
                    <strong>+{formatPrice(24500)}</strong>
                  </li>
                  <li>
                    <span>Kürk Mantolu Madonna</span>
                    <strong>+{formatPrice(14900)}</strong>
                  </li>
                  <li>
                    <span>İnce Memed</span>
                    <strong>+{formatPrice(21000)}</strong>
                  </li>
                  <li>
                    <span>Tehlikeli Oyunlar</span>
                    <strong>+{formatPrice(19800)}</strong>
                  </li>
                </ul>
                <div className="panel-foot">
                  <span>Demo notu: veriler seed ile doldurulur.</span>
                </div>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="grid grid-single">
              <div className="panel fade-in">
                <div className="panel-head">
                  <div>
                    <h2>Kullanıcı Rolleri</h2>
                    <p className="panel-sub">Kayıtlı hesaplar ve rolleri</p>
                  </div>
                  <button type="button" className="pill" onClick={reloadUsers}>
                    Yenile
                  </button>
                </div>
                {usersLoading ? (
                  <LoadingState label="Kullanıcılar yükleniyor..." />
                ) : usersError ? (
                  <ErrorState message={usersError} onRetry={reloadUsers} />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ad Soyad</th>
                          <th>E-posta</th>
                          <th>Rol</th>
                          <th>Kayıt Tarihi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.map((userItem) => (
                          <tr key={userItem.id}>
                            <td className="book-title">{userItem.name}</td>
                            <td>{userItem.email}</td>
                            <td>{userItem.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}</td>
                            <td>
                              {new Date(userItem.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
      <BookFormModal
        open={formOpen}
        mode={formMode}
        initial={editingBook}
        loading={formLoading}
        onClose={closeForm}
          onSubmit={handleSubmitBook}
          onDelete={handleDeleteBook}
      />
    </div>
  )
}

export default App
