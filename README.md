# Unknown Novel

Unknown Novel adalah aplikasi web modern untuk membaca novel secara gratis. Dibangun dengan fokus pada kecepatan dan kenyamanan pengguna, aplikasi ini menggunakan arsitektur Single Page Application (SPA) untuk memberikan pengalaman navigasi yang mulus.

## 🌟 Fitur Utama

- **📖 Baca Novel**: Akses koleksi novel dari berbagai genre dengan tampilan baca yang nyaman.
- **🔍 Pencarian Cepat**: Cari novel berdasarkan judul, penulis, atau deskripsi secara instan.
- **🌙 Mode Gelap (Dark Mode)**: Dukungan tema gelap otomatis atau manual untuk kenyamanan mata.
- **📱 Desain Responsif**: Tampilan yang optimal di semua perangkat (Desktop, Tablet, Ponsel).
- **⚡ Navigasi Cepat**: Menggunakan teknik SPA (Single Page Application) untuk transisi antar halaman tanpa reload.
- **📚 Perpustakaan**: Simpan novel favorit Anda untuk diakses kembali dengan mudah.
- **👤 Manajemen Akun**: Fitur login dan pendaftaran untuk pembaca dan admin.
- **🛠️ Dashboard Admin**: Panel khusus bagi administrator untuk mengelola, menambah, dan mengedit konten novel.

## 🛠️ Teknologi yang Digunakan

- **Frontend**:
  - HTML5
  - [Tailwind CSS](https://tailwindcss.com/) (Styling)
  - JavaScript (Vanilla ES6+)
  - Font Awesome (Ikon)
  - Google Fonts (Inter)
- **Backend & Database**:
  - [Supabase](https://supabase.com/) (Database & Autentikasi)
- **Runtime**:
  - [Node.js](https://nodejs.org/) (untuk menjalankan server lokal)

## 📋 Prasyarat

Pastikan Anda telah menginstal software berikut di komputer Anda:
- [Node.js](https://nodejs.org/) (v14 atau lebih baru)
- npm (biasanya terinstal otomatis bersama Node.js)

## 🚀 Cara Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda:

1. **Clone Repositori**
   ```bash
   git clone https://github.com/username/unknown-novel.git
   cd unknown-novel
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Supabase**
   Pastikan file konfigurasi Supabase (`assets/js/supabase.js`) telah diisi dengan URL dan Key proyek Supabase Anda yang valid.

4. **Jalankan Server**
   ```bash
   npm run dev
   ```

5. **Buka di Browser**
   Buka browser dan kunjungi `http://localhost:5000`.

## 📂 Struktur Proyek

```
unknown-novel/
├── 📁 admin/          # File halaman dan logika untuk Admin Dashboard
├── 📁 assets/         # Aset statis (CSS, JS, Gambar)
│   ├── css/           # File CSS kustom
│   ├── js/            # Skrip JavaScript (termasuk konfigurasi Supabase)
│   └── img/           # Gambar dan logo
├── 📁 database/       # File terkait database (SQL dump, dll)
├── 📁 pages/          # File HTML parsial untuk konten halaman (Home, Explore, dll)
├── 📄 index.html      # File utama aplikasi (Shell SPA)
├── 📄 server.js       # Server Node.js sederhana untuk menyajikan file statis
└── 📄 package.json    # Daftar dependensi dan skrip NPM
```

## 📜 Lisensi

Proyek ini didistribusikan di bawah lisensi **ISC**.
