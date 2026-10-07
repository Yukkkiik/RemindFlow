# ⏰ RemindFlow — Smart Task & Audio Alarm Manager

> **Aplikasi manajemen tugas dan pengingat pintar berbasis Next.js dengan alarm audio real-time dan notifikasi web browser.**

---

## 📖 Cerita Pengalaman Menggunakan RemindFlow: Dari Awal Hingga Selesai

Bayangkan Anda memiliki hari yang sangat padat dengan puluhan tenggat waktu: presentasi kerja, rapat klien, minum obat, hingga membeli kebutuhan rumah. Seringkali aplikasi to-do list biasa hanya berupa daftar pasif yang mudah terlupakan begitu Anda tenggelam dalam kesibukan. 

**RemindFlow hadir untuk mengubah cara Anda menuntaskan hari.** Berikut adalah cerita bagaimana RemindFlow menemani Anda dari detik pertama Anda membukanya hingga semua tugas tuntas dengan tenang:

```mermaid
journey
    title Perjalanan Pengguna Bersama RemindFlow
    section Langkah Awal
      Membuka Dashboard & melihat statistik: 5: User
      Menyiapkan Kategori & Warna Tag: 4: User
    section Perencanaan
      Menambahkan Tugas & Tenggat Waktu: 5: User
      Mengatur Offset Alarm Pengingat: 5: User
      Melihat Jadwal di Tampilan Kalender: 4: User
    section Eksekusi & Alarm
      Bekerja sambil sistem siaga di background: 5: RemindFlow
      Web Audio Synthesizer berdering & Notifikasi muncul: 5: RemindFlow, User
    section Penyelesaian
      Menunda (Snooze) atau Menyelesaikan Tugas: 5: User
      Melihat Tugas Bertanda Selesai di Dashboard: 5: User
```

---

### 🌅 Babak 1: Membuka Hari di Dashboard (The Morning Cockpit)
Saat pertama kali membuka **RemindFlow** di browser (`http://localhost:3000`), Anda langsung disambut oleh **Dashboard Interaktif** yang bersih dan modern.
- Di bagian atas, kartu ringkasan menampilkan status terkini: **Total Tugas**, **Tugas Hari Ini (Due Today)**, **Tugas Berlangsung**, dan **Tugas Selesai**.
- Jika ada tugas prioritas tinggi (*Urgent* atau *High Priority*), kartu peringatan langsung memberikan tanda agar Anda tidak melewatkannya.
- Indikator status di sidebar menyala hijau: `● Online`, menandakan sistem pengingat di latar belakang aktif dan siap siaga.

---

### 🎨 Babak 2: Merapikan Kategori (Organizing with Colors)
Sebelum mencatat semua rencana, Anda ingin tugas-tugas terorganisasi dengan rapi:
1. Anda membuka menu kategori untuk membuat label khusus sesuai ranah kehidupan Anda:
   - 💼 **Pekerjaan** (Warna Biru / Indigo)
   - 🎓 **Belajar / Kuliah** (Warna Ungu)
   - 🏠 **Pribadi & Rumah** (Warna Hijau Zamrud)
   - 🚨 **Mendesak** (Warna Merah Rose)
2. Setiap tugas nantinya akan memiliki tanda warna visual yang memudahkan Anda membedakannya hanya dalam sekali lirikan mata.

---

### ✍️ Babak 3: Menanamkan Tugas & Mengatur Alarm (Planting the Reminders)
Sekarang saatnya merencanakan tugas penting: *"Kirim Laporan Keuangan Bulanan"*.
1. Anda mengklik tombol **"+ Tambah Tugas"**.
2. Modal formulir muncul dengan rapi:
   - **Judul**: *Kirim Laporan Keuangan Bulanan*
   - **Deskripsi**: *Cek kembali lembar rekonsiliasi bank sebelum dikirim ke manajer.*
   - **Tenggat Waktu**: Hari ini, pukul **15:30**.
   - **Prioritas**: `URGENT`.
   - **Kategori**: *Pekerjaan*.
3. **Fitur Kunci — Offset Pengingat:** Anda tidak ingin baru teringat saat jam 15:30 tiba. Anda menyalakan pengingat dan memilih offset: **"15 Menit Sebelumnya" (15:15)**.
4. Anda menyimpan tugas tersebut. Seketika tugas masuk ke daftar antrean dan sistem menjadwalkan alarm otomatis untuk berbunyi tepat pukul 15:15!

---

### 🗓️ Babak 4: Monitoring di List & Kalender (Living the Day)
Sepanjang siang, Anda bisa memantau agenda dengan berbagai perspektif:
- **Filter Fleksibel**: Menyaring tugas berdasarkan status (*Semua*, *Hari Ini*, *Mendatang*, atau *Selesai*).
- **Pencarian Cepat**: Mengetik kata kunci di kolom pencarian untuk menemukan tugas lama dalam hitungan milidetik.
- **Tampilan Kalender (Calendar View)**: Meninjau jadwal mingguan dan bulanan dalam format timeline visual berdasarkan tanggal jatuh tempo.

---

### 🚨 Babak 5: Detik yang Menegangkan — Alarm Berbunyi! (The Climax)
Waktu menunjukkan pukul **15:15**. Anda sedang asyik fokus mengetik dokumen lain di layar komputer:

1. **Synthesizer Audio Aktif:** Tanpa perlu memuat file audio MP3 eksternal yang lambat, *Web Audio API Synthesizer* bawaan RemindFlow langsung memainkan melodi berulang bernada harmonis nan tegas.
2. **Notifikasi Browser:** Di sudut layar muncul pemberitahuan desktop:
   > ⏰ **Pengingat: Kirim Laporan Keuangan Bulanan**  
   > *Jatuh tempo pada 15:30! Periksa tugas Anda sekarang.*
3. **Pop-up Dialog Penuh:** Layar Anda menampilkan dialog alarm khusus (`AlarmDialog`) dengan animasi lonceng bergetar, memperlihatkan judul tugas, rincian, dan waktu tenggat.

Anda tidak akan pernah lagi melewatkan deadline karena kelupaan!

---

### 🎯 Babak 6: Eksekusi Keputusan (Snooze or Done)
Di hadapan Anda pada dialog alarm yang sedang berdering, terdapat 3 pilihan cepat:
- ⏳ **Tunda (Snooze 5 atau 10 Menit):** Jika Anda sedang berada di tengah percakapan telepon dan butuh waktu sedikit lagi, klik tombol tunda. Alarm akan langsung diam dan otomatis berdering kembali 5/10 menit kemudian.
- 🔕 **Matikan Suara (Dismiss):** Hentikan bunyi jika Anda sudah siap mengerjakannya tanpa alarm tambahan.
- ✅ **Tandai Selesai (Mark as Completed):** Anda langsung mengirimkan laporan tersebut, lalu menekan tombol **"Tandai Selesai"**.

Seketika musik alarm berhenti, status tugas diperbarui menjadi `COMPLETED`, dan waktu penyelesaian dicatat secara akurat ke dalam database.

---

### 🏆 Babak 7: Puncak Kepuasan & Akhir yang Tenang (Mission Accomplished)
Saat jam kerja berakhir, Anda membuka kembali tab Dashboard:
- Angka counter **"Tugas Selesai"** bertambah.
- Kartu tugas hari ini menampilkan coretan centang hijau yang memuaskan.
- Tidak ada tugas tertinggal, tidak ada kepanikan, dan pikiran Anda tenang menyambut waktu istirahat.

---

## 🛠️ Diagram Arsitektur & Logika Sistem

```
[ Pengguna ]
    │
    ▼ (Input Tugas & Jam & Offset)
[ TaskFormModal ] ───▶ [ Next.js API Routes (/api/tasks) ]
                               │
                               ▼
                       [ Database MySQL via Prisma ]
                               │
                               ▼
    [ AlarmManager (Polling & Pengecekan Waktu setiap 5 detik) ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ Web Audio API Synth ]              [ Web Notification ]
   (Melodi berulang real-time)           (Notifikasi desktop browser)
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
                      [ AlarmDialog Modal ]
                 (Tandai Selesai / Snooze / Dismiss)
```

---

## ✨ Fitur-Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **Real-Time Sound Alarm** | Alarm berbunyi otomatis menggunakan synthesizer Web Audio API (*Oscillator sine & triangle*) tanpa dependensi file MP3 luar. |
| **Browser Web Notification** | Notifikasi sistem desktop muncul bahkan saat pengguna sedang berada di jendela aplikasi lain. |
| **Smart Alarm Offsets** | Pilihan fleksibel kapan alarm berdering: Tepat waktu, 5 mnt, 10 mnt, 15 mnt, 30 mnt, 1 jam, atau 1 hari sebelum deadline. |
| **Snooze Engine** | Tombol tunda praktis (5 menit / 10 menit) yang menjadwal ulang pemicu alarm tanpa merusak jadwal asli. |
| **Dashboard Metrik** | Rangkuman tugas hari ini, status progres, dan peringatan prioritas tinggi. |
| **Interactive Calendar** | Visualisasi tugas yang dikelompokkan berdasarkan tanggal jatuh tempo. |
| **Kategori & Warna Kustom** | Manajemen tag kategori untuk mengelompokkan tugas kantor, pribadi, maupun proyek sampingan. |
| **Filter & Pencarian** | Filter cepat (*Hari Ini*, *Mendatang*, *Selesai*, *Prioritas*) serta pencarian teks instan. |

---

## 💻 Teknologi yang Digunakan

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library UI**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database Engine**: MySQL
- **Audio & Notifikasi**: HTML5 Web Audio API & Web Notification API
- **Form & Validasi**: React Hook Form & Zod
- **Tanggal & Waktu**: `date-fns`

---

## 🚀 Panduan Memulai & Menjalankan Proyek

### 1. Prasyarat Sistem
- **Node.js**: versi 18 atau lebih baru (disarankan Node.js 20+)
- **MySQL**: Server database MySQL lokal (misal: XAMPP, Laragon, Docker, atau MySQL Community Server)

### 2. Kloning & Instalasi Dependensi
```bash
# Clone repositori
git clone https://github.com/username/project-reminder.git
cd project-reminder

# Install seluruh package dependensi
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env` dan sesuaikan koneksi database MySQL Anda:

```bash
cp .env.example .env
```

Contoh isi `.env`:
```env
# Koneksi Database MySQL
DATABASE_URL="mysql://root:password@localhost:3306/remindflow"

# Kunci Rahasia Sesi / JWT
JWT_SECRET="remindflow-super-secret-key-development"

# Zona Waktu
NEXT_PUBLIC_DEFAULT_TIMEZONE="Asia/Jakarta"
```

### 4. Setup Database dengan Prisma
Jalankan migrasi atau sinkronisasi skema ke database MySQL Anda:

```bash
# Sinkronkan schema ke database lokal
npm run prisma:push

# Generate client Prisma terbaru
npm run prisma:generate
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```

Buka peramban (browser) di **[http://localhost:3000](http://localhost:3000)**.

> **💡 Tips Suara & Notifikasi:**  
> 1. Buka menu **Settings** (`/settings`), lalu klik tombol **"Minta Izin"** untuk mengaktifkan notifikasi browser.
> 2. Klik tombol **"Uji Suara Alarm Audio"** untuk mencoba nada alarm synthesizer Web Audio di perangkat Anda.

---

## 📁 Struktur Direktori

```text
project-reminder/
├── prisma/
│   └── schema.prisma         # Skema database (User, Category, Task)
├── src/
│   ├── app/
│   │   ├── api/              # API Routes (tasks, categories, dashboard, auth)
│   │   ├── calendar/         # Halaman kalender visual
│   │   ├── dashboard/        # Halaman ringkasan metrik utama
│   │   ├── settings/         # Halaman preferensi audio & izin notifikasi
│   │   ├── tasks/            # Halaman daftar tugas & filter
│   │   ├── layout.tsx        # Layout utama & penyedia AlarmManager global
│   │   └── page.tsx          # Pengalihan rute awal ke dashboard
│   ├── components/
│   │   ├── dashboard/        # Kartu statistik (StatCard)
│   │   ├── layout/           # Sidebar navigasi & Header
│   │   ├── reminder/         # AlarmManager & AlarmDialog (Audio Synth)
│   │   └── task/             # TaskCard, TaskFormModal, CategoryModal, dsb.
│   ├── lib/                  # Inisialisasi Prisma & autentikasi
│   ├── types/                # Definisi TypeScript & konstanta offsets
│   └── utils/                # Logika synthesizer suara & manipulasi tanggal
├── package.json
└── README.md
```

---

## 📄 Lisensi
Proyek ini dibuat untuk keperluan pengelolaan tugas dan produktivitas harian. Lisensi bersifat open-source di bawah lisensi MIT.
