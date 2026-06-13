# 🌍 GeoVerse — Platform Edukasi Lingkungan Digital

<div align="center">

### Edukasi Lingkungan Interaktif untuk Generasi Muda Ulubelu

GeoVerse adalah platform edukasi lingkungan berbasis web yang dirancang untuk membantu generasi muda memahami energi panas bumi, membangun kebiasaan hijau, serta mencatat aksi lingkungan melalui sistem komunitas yang interaktif dan modern.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-black?style=for-the-badge)

</div>

---

# 📖 Tentang Project

GeoVerse merupakan platform edukasi digital yang menggabungkan pembelajaran lingkungan, gamifikasi, aksi komunitas, dan teknologi AI dalam satu ekosistem modern berbasis web.

Platform ini dikembangkan untuk:
- Mengenalkan energi panas bumi kepada masyarakat
- Meningkatkan kesadaran lingkungan generasi muda
- Membantu pengguna membangun kebiasaan hijau
- Menghadirkan pengalaman belajar interaktif berbasis AI

> ⚠️ **Catatan:**  
> Repository ini merupakan private prototype GeoVerse dan belum ditujukan untuk penggunaan komersial maupun distribusi publik.

---

# ✨ Fitur Utama

## 📚 Belajar Geothermal
Modul edukasi interaktif mengenai:
- Energi panas bumi
- Pemilahan sampah
- Aksi iklim
- Edukasi lingkungan dasar

---

## ♻️ Green Log
Sistem pencatatan aksi lingkungan harian:
- Input aktivitas pilah sampah
- Riwayat aksi pengguna
- Validasi aktivitas
- Sistem poin otomatis

---

## 🏆 Tantangan Komunitas
Fitur challenge berbasis komunitas:
- Tantangan mingguan
- Tantangan bulanan
- Reward poin
- Progress pengguna

---

## 🎖️ Sistem Poin & Badge
Gamifikasi interaktif:
- Poin dari aksi lingkungan
- Badge pencapaian
- Reward aktivitas positif

---

## 📊 Dashboard Pengguna
Dashboard modern dan interaktif:
- Statistik aktivitas
- Grafik progres pengguna
- Total poin
- Rekomendasi pembelajaran

---

## 🤖 GeoVerse AI Assistant
Asisten AI interaktif yang terintegrasi langsung dalam platform GeoVerse.

Fitur:
- Tanya jawab edukasi lingkungan
- Penjelasan energi panas bumi
- Bantuan memahami modul belajar
- Rekomendasi aksi hijau
- Interaksi AI secara real-time

### ⚡ AI Stack
GeoVerse AI Assistant menggunakan:
- OpenRouter API
- Model AI: Google Gemini 2.0 Flash

AI dirancang untuk memberikan pengalaman belajar yang cepat, modern, dan lebih personal bagi pengguna.

---

## 🛠️ Admin Lite Dashboard
Dashboard monitoring sederhana untuk admin:
- Monitoring pengguna
- Monitoring Green Log
- Validasi aktivitas
- Statistik platform

---

## 🔐 Authentication
Sistem autentikasi menggunakan Supabase Auth:
- Login Google
- Session management
- Protected route
- Role-based access sederhana

---

# 🧰 Tech Stack

| Technology | Description |
|---|---|
| Next.js App Router | React Framework |
| TypeScript | Static Type Checking |
| Tailwind CSS v4 | Utility-first CSS |
| Supabase Auth | Authentication |
| Supabase Database | Backend Database |
| OpenRouter API | AI Gateway |
| Google Gemini 2.0 Flash | AI Model |
| React Hook Form | Form Management |
| Zod | Schema Validation |
| Recharts | Data Visualization |
| Framer Motion | Animation Library |
| Lucide React | Icon Library |

---

# 🚀 Instalasi Project

## 1. Clone Repository

```bash
git clone <repository-url>
cd geoverse
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Supabase

1. Buka Supabase Dashboard
2. Buat project baru
3. Aktifkan Authentication
4. Aktifkan Google Provider
5. Salin Project URL dan Anon Key

---

## 4. Setup OpenRouter

1. Buka OpenRouter
2. Buat API Key baru
3. Gunakan model:
   ```txt
   google/gemini-2.5-flash
   ```

---

## 5. Setup Environment Variables

Salin file `.env.example` menjadi `.env.local`

```bash
cp .env.example .env.local
```

Isi dengan konfigurasi berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=qwen/qwen3-37b-a22b
```

---

## 6. Jalankan Development Server

```bash
npm run dev
```

Buka browser:

```txt
http://localhost:3000
```

---

# 📁 Struktur Folder

```txt
geoverse/
├── app/
│   ├── dashboard/
│   ├── learn/
│   ├── green-log/
│   ├── challenges/
│   ├── assistant-ai/
│   ├── profile/
│   ├── admin/
│   └── api/
│
├── components/
├── hooks/
├── lib/
├── services/
├── types/
├── public/
├── styles/
└── utils/
```

---

# ⚡ Fokus Pengembangan

GeoVerse dikembangkan dengan fokus:
- Lightweight performance
- Mobile-first design
- Responsive UI
- Clean architecture
- Reusable component
- Fast loading
- Modern UI/UX
- AI-integrated experience
- Scalability

---

# 📌 Catatan Admin Dashboard

Admin dashboard hanya dapat diakses oleh email yang terdaftar pada:

```env
NEXT_PUBLIC_ADMIN_EMAILS
```

Fitur admin:
- Monitoring pengguna
- Monitoring Green Log
- Validasi aktivitas pengguna
- Statistik platform

---

# 🔒 Status Project

```txt
Private Prototype
```

Project masih dalam tahap pengembangan aktif dan belum dirilis untuk publik.

---

# 📄 Lisensi

Private Prototype — Tidak untuk distribusi publik.

---

<div align="center">

### 🌱 Build for Better Environment

GeoVerse © 2026

</div>
```
