# Online Kitap Demosu

Sunum odakli, tam fonksiyonel bir kitap siparis web uygulamasi.

Bu proje, canli demo sirasinda olusabilecek kusurlu veya istenmeyen icerigi hizli temizlemek icin **Admin Reset** mekanizmasi icerir. Boylece sistem, tek adimda tekrar tutarli bir seed veri durumuna donebilir.

## Ozellikler

- JWT + cookie tabanli kimlik dogrulama
- Rol bazli yetkilendirme (`ADMIN`, `CUSTOMER`)
- Kitap listeleme, ekleme, guncelleme, silme (admin)
- Kullanici rolleri paneli (admin)
- Aylik ciro raporu (admin)
- Bozuk veri uretme (`/api/system/corrupt`)
- Veri sifirlama ve seed'e donus (`/api/system/reset`)
- Reset sonrasi gecersiz kullanici oturumlarini otomatik sonlandirma

## Teknoloji Yigini

- Backend: NestJS, Prisma, SQLite
- Frontend: React, Vite, TypeScript
- Auth: JWT, Passport, HttpOnly cookie

## Proje Yapisi

- `backend`: API, auth, seed, reset/corrupt, raporlar
- `frontend`: panel UI, login/register, inventory, roles, revenue

## Kurulum

### 1) Backend

```bash
cd backend
npm install
```

`backend/.env` icin ornek:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="demo-secret-change-me"
JWT_EXPIRES_IN="1d"
```

Prisma ve seed:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

Backend'i calistir:

```bash
npm run start:dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Varsayilan API adresi:

- `http://localhost:3000/api`

Isterseniz `VITE_API_BASE` ile degistirebilirsiniz.

## Demo Akisi (Pitch icin)

1. Admin girisi yapin.
2. Kitap ekleyin/guncelleyin/silin.
3. Bozuk veri uretin.
4. Admin Reset tetikleyin.
5. Sistemin temiz ve tutarli veri setine geri dondugunu gosterin.

## Test Hesaplari

- Admin: `alican@demo.local` / `123456`
- Musteri: `caner@demo.local` / `123456`

## API Ozet

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/books`
- `POST /api/books` (admin)
- `PATCH /api/books/:id` (admin)
- `DELETE /api/books/:id` (admin)
- `GET /api/reports/revenue` (admin)
- `GET /api/users` (admin)
- `POST /api/system/corrupt` (admin)
- `POST /api/system/reset` (admin)

## Notlar

- `reset` mevcut verileri temizleyip seed veri ile yeniden olusturur.
- `corrupt` endpoint'i demo amacli kusurlu kitap/kullanici verisi ekler.
- Uretim ortami icin gizli bilgiler kesinlikle repoya yazilmamalidir.
