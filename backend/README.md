# Kibotify — Backend

REST API & real-time server untuk aplikasi streaming musik **Kibotify**. Dibangun dengan Express.js, MongoDB (Mongoose), autentikasi Clerk, upload media ke Cloudinary, dan real-time messaging via Socket.io.

> Bagian dari monorepo [Kibotify](../README.md). Lihat juga [`frontend/README.md`](../frontend/README.md).

## Daftar Isi
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan](#menjalankan)
- [Catatan Penting Sebelum Menjalankan](#-catatan-penting-sebelum-menjalankan)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Autentikasi & Otorisasi](#autentikasi--otorisasi)
- [Real-time (Socket.io)](#real-time-socketio)
- [Upload File](#upload-file)
- [Deployment](#deployment)

## Tech Stack

- Node.js (ESM — `"type": "module"`)
- Express 5
- MongoDB + Mongoose
- Clerk (`@clerk/express`) — autentikasi & otorisasi
- Cloudinary — penyimpanan file audio & gambar
- Socket.io — real-time chat & status online
- express-fileupload — handle multipart file upload
- node-cron — pembersihan file temporary tiap jam
- dotenv, cors

## Struktur Folder

```
backend/
├─ src/
│  ├─ controller/        # Logic tiap endpoint (admin, album, auth, song, stats, user)
│  ├─ lib/                # Koneksi DB, konfigurasi Cloudinary, setup Socket.io
│  ├─ middleware/         # protectRoute & requireAdmin (berbasis Clerk)
│  ├─ models/             # Schema Mongoose: User, Song, Album, Message
│  ├─ routes/             # Definisi route Express per resource
│  ├─ seeds/               # Script seeding data lagu & album dummy
│  └─ index.js             # Entry point Express app
├─ temp/                   # Temp file upload (auto-dibersihkan cron tiap jam)
├─ vercel.json              # Config deploy serverless (alternatif, khusus backend)
└─ package.json
```

## Instalasi

```bash
cd backend
npm install
```

## Environment Variables

Buat file `.env` di folder `backend/` (sudah masuk `.gitignore`):

| Variable | Deskripsi |
|---|---|
| `PORT` | Port server backend (mis. `3000`) |
| `FRONTEND_URL` | URL frontend, dipakai untuk konfigurasi CORS Express |
| `MONGO_URI` | Connection string MongoDB |
| `ADMIN_EMAIL` | Email yang dianggap sebagai admin, dicocokkan dengan email primer user Clerk |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |
| `NODE_ENV` | `development` atau `production` |
| `CLERK_PUBLISHABLE_KEY` | Publishable key dari dashboard Clerk |
| `CLERK_SECRET_KEY` | Secret key dari dashboard Clerk |

## Menjalankan

```bash
npm run dev            # dev mode dengan nodemon (auto-reload)
npm start               # jalankan di production mode
npm run seed:songs      # isi database dengan data lagu dummy
npm run seed:albums     # isi database dengan data album dummy
```

## ⚠️ Catatan Penting Sebelum Menjalankan

File `src/index.js` di dalam project saat ini masih menyisakan **conflict marker git** (`<<<<<<< HEAD ... ======= ... >>>>>>>`) sisa dari proses `git rebase` yang belum selesai diresolve. Selama marker ini masih ada, file tersebut **tidak valid secara syntax JavaScript** dan backend tidak akan bisa dijalankan sama sekali (baik lokal maupun saat deploy).

Yang perlu dilakukan:
1. Jalankan `git status` — akan terlihat rebase sedang berjalan dengan `backend/src/index.js` berstatus *unmerged*.
2. Buka file tersebut, pilih/gabungkan versi yang benar (versi lengkap yang memanggil `connectDB()`, memasang `cors`, `clerkMiddleware`, `fileUpload`, seluruh routes, `initializeSocket(httpServer)`, cron pembersihan temp file, dan `httpServer.listen(...)`), lalu hapus semua marker `<<<<<<<`, `=======`, `>>>>>>>`.
3. `git add backend/src/index.js && git rebase --continue` (atau `git rebase --abort` jika ingin mundur dulu ke kondisi sebelum rebase).

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/callback` | – | Sinkronisasi data user dari Clerk ke database (upsert berdasarkan `clerkId`) setelah login |

### Users — `/api/users`
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/` | ✅ login | List semua user selain user yang sedang login |
| GET | `/messages/:userId` | ✅ login | Ambil histori chat dengan user tertentu |

### Songs — `/api/songs`
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/` | ✅ admin | List semua lagu (terbaru dulu) |
| GET | `/featured` | – | 6 lagu acak untuk section "Featured" |
| GET | `/made-for-you` | – | 4 lagu acak untuk section "Made For You" |
| GET | `/trending` | – | 4 lagu acak untuk section "Trending" |

### Albums — `/api/albums`
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/` | – | List semua album |
| GET | `/:albumId` | – | Detail album beserta daftar lagunya |

### Admin — `/api/admin`
*(semua route di bawah butuh login **dan** email = `ADMIN_EMAIL`)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/check` | Cek apakah user saat ini admin |
| POST | `/songs` | Tambah lagu baru — upload `audioFile` & `imageFile` (multipart) ke Cloudinary |
| DELETE | `/songs/:id` | Hapus lagu, otomatis lepas dari album terkait |
| POST | `/albums` | Tambah album baru — upload `imageFile` |
| DELETE | `/albums/:id` | Hapus album beserta seluruh lagu di dalamnya |

### Stats — `/api/stats`
*(khusus admin)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/` | Total lagu, album, user, dan jumlah artis unik |

## Data Models

| Model | Field Utama |
|---|---|
| **User** | `fullName`, `imageUrl`, `clerkId` (unik) |
| **Song** | `title`, `artist`, `imageUrl`, `audioUrl`, `duration`, `albumId` (opsional, ref `Album`) |
| **Album** | `title`, `artist`, `imageUrl`, `releaseYear`, `songs[]` (ref `Song`) |
| **Message** | `senderId`, `receiverId`, `content` |

Semua model menggunakan `timestamps: true` (otomatis punya `createdAt` & `updatedAt`).

## Autentikasi & Otorisasi

- `protectRoute` (`middleware/auth.middleware.js`) — memastikan request punya session Clerk yang valid.
- `requireAdmin` — mengambil data user dari Clerk lalu mencocokkan `primaryEmailAddress` dengan `ADMIN_EMAIL` di `.env`. Kalau tidak cocok, request ditolak dengan `401`.

## Real-time (Socket.io)

Diinisialisasi di `lib/socket.js`, dipasang di HTTP server yang sama dengan Express.

| Event | Arah | Deskripsi |
|---|---|---|
| `user_connected` | client → server | Kirim `userId` saat pertama kali connect |
| `users_online` | server → client | Daftar `userId` yang sedang online |
| `activities` | server → client | Status aktivitas semua user saat ini |
| `update_activity` | client → server | Update status aktivitas user (mis. `"Playing <judul> by <artis>"` atau `"Idle"`) |
| `activity_updated` | server → client | Broadcast perubahan aktivitas ke semua client |
| `send_message` | client → server | Kirim pesan chat — otomatis disimpan ke MongoDB via model `Message` |
| `receive_message` | server → client | Pesan masuk, dikirim ke socket penerima |
| `message_sent` | server → client | Konfirmasi pesan tersimpan, dikirim balik ke pengirim |
| `message_error` | server → client | Dikirim kalau gagal menyimpan pesan |
| `user_disconnect` | server → client | Broadcast saat user disconnect/offline |

> ⚠️ CORS Socket.io saat ini **di-hardcode** ke `http://localhost:5173` di `lib/socket.js`. Untuk production, sesuaikan ke domain frontend yang sebenarnya — idealnya diambil dari `process.env.FRONTEND_URL`, konsisten dengan konfigurasi CORS Express.

## Upload File

Upload audio/gambar memakai `express-fileupload` (file sementara disimpan di folder `temp/`) → di-upload ke Cloudinary via `lib/cloudinary.js` → URL hasil upload (`secure_url`) disimpan ke database. File temporary otomatis dibersihkan setiap jam lewat `node-cron`.

## Deployment

Backend di-deploy sebagai **serverless function** di Vercel lewat `api/index.js` (di root project), yang meng-import `app` dari `backend/src/index.js`.

Yang perlu diperhatikan:
- Socket.io tidak cocok berjalan optimal di lingkungan serverless karena koneksinya tidak persisten — inilah penyebab utama fitur chat real-time belum berfungsi di production meski normal di local. Untuk mendukungnya di production, backend perlu dijalankan di server yang persistent (VPS, Railway, Render, dll.) atau gunakan layanan real-time pihak ketiga.
- Pastikan file `src/index.js` sudah bebas dari conflict marker git (lihat [bagian di atas](#-catatan-penting-sebelum-menjalankan)) sebelum melakukan deploy.
