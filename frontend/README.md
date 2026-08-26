# Kibotify — Frontend

Antarmuka web aplikasi streaming musik **Kibotify**. Dibangun dengan React 19, TypeScript, dan Vite, styling dengan TailwindCSS 4 + shadcn/ui, state management dengan Zustand, dan autentikasi via Clerk.

> Bagian dari monorepo [Kibotify](../README.md). Lihat juga [`backend/README.md`](../backend/README.md).

## Daftar Isi
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan](#menjalankan)
- [Routing](#routing)
- [State Management](#state-management-zustand-stores)
- [Fitur Utama](#fitur-utama)
- [Deployment](#deployment)

## Tech Stack

- React 19 + TypeScript
- Vite
- TailwindCSS 4
- shadcn/ui (komponen berbasis Radix)
- Zustand — state management
- React Router DOM v7
- Axios
- Clerk (`@clerk/react`) — autentikasi
- Socket.io-client — real-time chat
- react-hot-toast — notifikasi
- react-resizable-panels — layout resizable

## Struktur Folder

```
frontend/
├─ src/
│  ├─ components/        # Komponen reusable (TopBar, skeletons, ui/ dari shadcn)
│  ├─ layouts/            # MainLayout + komponen player, sidebar, friends activity
│  ├─ lib/                 # axios instance, utils
│  ├─ pages/               # Halaman: home, album, chat, admin, auth-callback, 404
│  ├─ providers/           # AuthProvider (sinkronisasi Clerk → backend)
│  ├─ stores/              # Zustand stores
│  ├─ types/               # Tipe TypeScript (Song, Album, User, Message, Stats)
│  ├─ App.tsx              # Definisi routing utama
│  └─ main.tsx              # Entry point
├─ public/                  # Asset statis (cover image, sample lagu mp3, logo)
└─ package.json
```

## Instalasi

```bash
cd frontend
npm install
```

## Environment Variables

Buat file `.env.local` di folder `frontend/`:

| Variable | Deskripsi |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Publishable key dari dashboard Clerk — **wajib diisi**, aplikasi akan `throw error` saat start kalau kosong |
| `VITE_API_BASE_URL` | Opsional & saat ini tidak dipakai langsung. Base URL backend sudah di-hardcode di `src/lib/axios.ts`: `http://localhost:3000/api` saat development, `/api` saat production |

## Menjalankan

```bash
npm run dev        # dev server (Vite), default di http://localhost:5173
npm run build       # type-check (tsc -b) lalu build production ke dist/
npm run preview      # preview hasil build production secara lokal
npm run lint          # jalankan ESLint
```

> Pastikan backend (lihat [`backend/README.md`](../backend/README.md)) sudah berjalan di `http://localhost:3000` saat development — axios instance & socket.io-client di frontend mengarah ke sana secara default.

## Routing

| Path | Halaman | Deskripsi |
|---|---|---|
| `/` | `HomePage` | Section Featured, Made For You, Trending songs |
| `/albums/:albumId` | `AlbumPage` | Detail album & daftar lagunya |
| `/chat` | `ChatPage` | Chat real-time antar user |
| `/admin` | `AdminPage` | Dashboard admin (khusus akun admin) |
| `/sso-callback` | – | Callback OAuth dari Clerk |
| `/auth-callback` | `AuthCallbackPage` | Sinkronisasi user baru/login ke backend |
| `*` | `NotFoundPage` | Halaman 404 |

`/` , `/albums/:albumId`, dan `/chat` dibungkus oleh `MainLayout` (sidebar kiri, audio player, panel friends activity di kanan).

## State Management (Zustand Stores)

| Store | Fungsi |
|---|---|
| `useAuthStore` | Status admin (`isAdmin`), dicek lewat endpoint `/admin/check` |
| `useMusicStore` | Data lagu, album, dan statistik — fetch & delete (khusus admin) |
| `usePlayerStore` | State audio player: lagu aktif, antrian, play/pause, next/previous, sekaligus broadcast status "sedang memutar" lewat socket |
| `useChatStore` | Koneksi Socket.io, daftar user online, status aktivitas user lain, riwayat pesan chat |

## Fitur Utama

- **Autentikasi** via Clerk (Google OAuth), user baru otomatis di-sync ke database backend lewat `AuthCallbackPage` & `AuthProvider`
- **Home page** dengan beberapa section rekomendasi lagu (featured, made for you, trending)
- **Audio player** dengan kontrol play/pause/next/previous & antrian lagu, tampil persisten di layout utama
- **Chat real-time**: daftar user online, status "sedang memutar lagu apa", kirim & terima pesan secara instan
- **Dashboard admin**: tambah/hapus lagu & album (dengan upload file), lihat statistik total lagu/album/artis/user

> ⚠️ Chat real-time (Socket.io) saat ini hanya berjalan mulus di **local development**. Saat frontend & backend di-deploy (mis. ke Vercel), koneksi WebSocket belum stabil karena keterbatasan backend serverless — lihat [`backend/README.md`](../backend/README.md#deployment) untuk detail. Fitur ini direncanakan disempurnakan lebih lanjut untuk production ke depannya.

## Deployment

`npm run build` menghasilkan folder `dist/` berisi static assets, yang disajikan sebagai frontend dari project Vercel yang sama dengan backend (lihat `vercel.json` di root repo untuk konfigurasi rewrite `/api/*` ke serverless function backend).
