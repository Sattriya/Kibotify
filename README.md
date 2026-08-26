# 🎵 Kibotify

Platform streaming musik full-stack terinspirasi Spotify, dilengkapi dashboard admin dan fitur chat real-time antar pengguna (Socket.io).

![Kibotify Banner](frontend/public/kibotify.png)

## Daftar Isi
- [Tentang Project](#tentang-project)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Known Issues & Roadmap](#known-issues--roadmap)
- [Lisensi](#lisensi)

## Tentang Project

Kibotify adalah aplikasi web streaming musik yang dibangun dengan arsitektur **monorepo**, terdiri dari dua bagian utama:

- **`frontend/`** — React + TypeScript + Vite, UI berbasis shadcn/ui & TailwindCSS
- **`backend/`** — REST API berbasis Express.js + MongoDB, dengan autentikasi Clerk, upload media ke Cloudinary, dan real-time messaging via Socket.io

Dokumentasi lebih detail untuk masing-masing bagian ada di:
- [`frontend/README.md`](./frontend/README.md)
- [`backend/README.md`](./backend/README.md)

## Fitur

- 🎧 Streaming musik dengan section **Featured**, **Made For You**, dan **Trending**
- 💿 Halaman album beserta daftar lagunya
- 🔐 Autentikasi via [Clerk](https://clerk.com) (Google/OAuth)
- 🛠️ Dashboard admin — kelola lagu & album (create/delete), lihat statistik total lagu/album/artis/user
- ☁️ Upload file audio & gambar otomatis ke Cloudinary
- 💬 Chat real-time antar user, lengkap dengan status online & "sedang memutar lagu apa" (Socket.io)
- 🎚️ Audio player dengan queue, next/previous, dan layout resizable panel

> **Catatan:** Fitur chat real-time saat ini berjalan normal di **local development**, tapi belum berfungsi stabil saat **production/deploy**. Lihat bagian [Known Issues & Roadmap](#known-issues--roadmap) — direncanakan menjadi fitur yang disempurnakan ke depannya.

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui, Zustand, React Router v7, Axios, Clerk, Socket.io-client |
| Backend | Node.js, Express 5, MongoDB + Mongoose, Clerk (`@clerk/express`), Cloudinary, Socket.io, express-fileupload, node-cron |
| Deployment | Vercel (frontend static + backend sebagai serverless function) |

## Struktur Folder

```
Kibotify/
├─ api/
│  └─ index.js          # Entry serverless Vercel, re-export Express app dari backend
├─ backend/              # REST API + Socket.io server (lihat backend/README.md)
├─ frontend/             # Aplikasi React (lihat frontend/README.md)
├─ package.json          # Script build/start gabungan untuk deploy
└─ vercel.json           # Konfigurasi rewrite /api/* ke serverless function
```

## Getting Started

### Prasyarat
- Node.js (disarankan v18+)
- MongoDB (lokal atau MongoDB Atlas)
- Akun [Clerk](https://clerk.com) (untuk auth)
- Akun [Cloudinary](https://cloudinary.com) (untuk upload file)

### Instalasi

```bash
git clone https://github.com/Sattriya/Kibotify.git
cd Kibotify
```

Setup environment variable untuk masing-masing bagian — lihat detail lengkap di:
- [`backend/README.md`](./backend/README.md#environment-variables)
- [`frontend/README.md`](./frontend/README.md#environment-variables)

Lalu install & jalankan tiap bagian secara terpisah (dua terminal):

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`, backend di `http://localhost:3000`.

### Script di root `package.json`

Script ini ditujukan untuk keperluan **build/deploy**, bukan development sehari-hari:

```bash
npm run build   # install deps backend & frontend, lalu build frontend ke frontend/dist
npm start       # jalankan backend (production)
```

## Environment Variables

Ringkasan singkat (lihat README masing-masing untuk daftar lengkap & penjelasan):

**Backend (`backend/.env`)**: `PORT`, `FRONTEND_URL`, `MONGO_URI`, `ADMIN_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NODE_ENV`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

**Frontend (`frontend/.env.local`)**: `VITE_CLERK_PUBLISHABLE_KEY`

## Deployment

Project ini dikonfigurasi untuk deploy ke **Vercel** sebagai satu project:

- `vercel.json` di root melakukan rewrite semua request `/api/*` ke serverless function `api/index.js`
- `api/index.js` meng-import Express app dari `backend/src/index.js` dan mengekspornya sebagai handler serverless
- Frontend di-build ke `frontend/dist` dan disajikan sebagai static site

⚠️ **Socket.io butuh koneksi WebSocket yang persisten**, sedangkan Vercel serverless function bersifat stateless/short-lived. Inilah alasan utama kenapa fitur chat real-time hanya berjalan mulus di local development dan belum stabil di production. Untuk mendukung real-time chat di production, backend perlu dijalankan di platform yang mendukung *long-lived connection* (misalnya Railway, Render, VPS, atau layanan real-time pihak ketiga seperti Ably/Pusher).

## Known Issues & Roadmap

- [ ] **Bug (perlu di-fix sebelum run):** `backend/src/index.js` saat ini masih menyisakan conflict marker git (`<<<<<<< HEAD` / `=======` / `>>>>>>>`) sisa dari proses `git rebase` yang belum diselesaikan. Selama marker ini masih ada di file, kode tersebut **tidak valid secara syntax JavaScript** dan backend tidak akan bisa dijalankan sama sekali. Jalankan `git status` di root project untuk melihat rebase yang sedang berjalan, selesaikan konfliknya secara manual, lalu `git rebase --continue` (atau `git rebase --abort` bila ingin mundur ke versi sebelum rebase).
- [ ] Real-time chat belum stabil/berfungsi di environment production (Vercel) — direncanakan menjadi fitur mendatang setelah backend dipindah ke hosting yang mendukung persistent connection.
- [ ] CORS Socket.io di `backend/src/lib/socket.js` saat ini masih di-hardcode ke `http://localhost:5173`, perlu disesuaikan dengan domain frontend production.

## Lisensi

ISC — lihat `package.json`.
