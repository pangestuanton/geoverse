# GeoVerse — Platform Edukasi Lingkungan Digital

GeoVerse adalah platform web edukasi digital yang dirancang untuk membantu anak muda Ulubelu memahami energi panas bumi, mencatat aksi pilah sampah melalui Green Log, dan membangun kebiasaan hijau berbasis komunitas.

> **Catatan:** Ini adalah private prototype GeoVerse. Bukan produk komersial.

---

## Fitur Utama

- **Belajar Geothermal** — Modul edukasi singkat tentang energi panas bumi, pemilahan sampah, dan aksi iklim.
- **Green Log** — Pencatatan aksi pilah sampah harian dengan validasi dan poin.
- **Tantangan Komunitas** — Tantangan aksi lingkungan dengan durasi dan hadiah poin.
- **Sistem Poin & Badge** — Poin otomatis dari aksi dan kuis, badge dari pencapaian.
- **Dashboard Pengguna** — Statistik, grafik aktivitas, dan rekomendasi modul.
- **Admin Lite Dashboard** — Monitoring aktivitas platform untuk admin.
- **Login dengan Google** — Autentikasi menggunakan Firebase Authentication.

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Login)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Recharts](https://recharts.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)

---

## Cara Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd geoverse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Siapkan Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat project baru atau gunakan project yang sudah ada.
3. Aktifkan **Authentication** → pilih **Google** sebagai provider.
4. Aktifkan **Firestore Database** dalam mode test atau atur rules sesuai kebutuhan.
5. Salin konfigurasi Firebase dari **Project Settings** → **General** → **Your apps** → **Web app**.

### 4. Isi Environment Variables

Salin file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi dengan konfigurasi Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

> **NEXT_PUBLIC_ADMIN_EMAILS**: Daftar email admin yang dipisahkan koma. Hanya email ini yang dapat mengakses `/admin`.

### 5. Jalankan Project

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Struktur Folder

```
geoverse/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   ├── login/            # Halaman login
│   ├── dashboard/        # Dashboard pengguna
│   ├── learn/            # Modul belajar
│   ├── green-log/        # Pencatatan Green Log
│   ├── challenges/       # Tantangan komunitas
│   ├── badges/           # Badge & penghargaan
│   ├── profile/          # Profil pengguna
│   └── admin/            # Admin Lite Dashboard
├── components/           # Komponen React
│   ├── common/           # Komponen umum (Navbar, Sidebar, dll.)
│   ├── landing/          # Komponen landing page
│   ├── dashboard/        # Komponen dashboard
│   ├── learn/            # Komponen modul belajar
│   ├── green-log/        # Komponen Green Log
│   ├── challenges/       # Komponen tantangan
│   ├── badges/           # Komponen badge
│   └── admin/            # Komponen admin
├── lib/                  # Library dan helper
│   ├── firebase.ts       # Konfigurasi Firebase
│   ├── auth.ts           # Auth helpers
│   ├── firestore.ts      # Firestore CRUD
│   ├── points.ts         # Kalkulasi poin
│   └── validations.ts    # Validasi Zod
├── hooks/                # Custom React hooks
├── data/                 # Data statis (modul, tantangan, badge)
├── types/                # TypeScript type definitions
└── public/               # Aset statis
```

---

## Catatan Admin Dashboard

Admin dashboard hanya dapat diakses oleh email yang tercantum di `NEXT_PUBLIC_ADMIN_EMAILS`. Dashboard ini bersifat sederhana dan ditujukan untuk monitoring, bukan manajemen enterprise.

Fitur admin:
- Ringkasan platform (total pengguna, Green Log, sampah terpilah)
- Daftar pengguna
- Catatan Green Log (dengan fitur ubah status: Menunggu/Disetujui/Ditolak)
- Daftar modul (read-only)
- Daftar tantangan (read-only)

---

## Lisensi

Private prototype. Tidak untuk distribusi publik.
