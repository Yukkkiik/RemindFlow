@AGENTS.md

# RemindFlow

Aplikasi task manager + pengingat (alarm audio real-time + notifikasi browser). Pemilik: Muhamad Yuki.
UI dan pesan error ke user memakai **Bahasa Indonesia**. Kode, nama variabel, dan commit message memakai **English**.
Balas ke user dalam Bahasa Indonesia kecuali diminta lain.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 + MySQL · Zod 4 · React Hook Form · date-fns 4 · jose + bcryptjs (terpasang, **belum dipakai**).

> Next.js 16 punya breaking changes. Sebelum menyentuh routing, caching, middleware/proxy, atau API Next lain, baca panduan terkait di `node_modules/next/dist/docs/` (lihat AGENTS.md). Jangan mengandalkan memori.

## Commands

```bash
npm run dev              # dev server
npm run lint             # eslint (wajib hijau sebelum selesai)
npx tsc --noEmit         # type check (wajib hijau sebelum selesai)
npm run build            # prisma generate + next build
npm run prisma:push      # sinkron schema ke DB (dev cepat)
npm run prisma:migrate   # buat migration (pakai ini untuk perubahan yang akan di-deploy)
npm run format           # prettier
```

Belum ada test runner. Jika menambah test, pakai Vitest dan hanya untuk logika murni (lihat agent `test-writer`).
Env: salin `.env.example` ke `.env`. Jangan pernah membaca, mencetak, atau commit `.env`.

## Arsitektur (berlapis, ikuti urutan ini)

```
src/app/api/**/route.ts        HTTP saja: ambil user, parse + validasi (zod), panggil service, bentuk response
src/server/services/*.service  Aturan bisnis, cek kepemilikan relasi (mis. kategori milik user)
src/server/repositories/*      Satu-satunya tempat yang memanggil prisma untuk entity itu
src/lib/validation/*.schema.ts Skema zod (input create/update/query)
src/lib/prisma.ts, auth.ts     Prisma client singleton, identitas user
src/utils/                     date.ts (helper tanggal), sound.ts (Web Audio synth, tanpa file audio)
src/components/{dashboard,layout,reminder,task}/   UI
src/types/index.ts             Tipe bersama + REMINDER_OFFSETS
```

Halaman: `/dashboard`, `/tasks`, `/calendar`, `/settings`.
Reminder: `AlarmManager` (client) polling tiap 5 detik, memainkan nada via Web Audio, `AlarmDialog` menawarkan snooze 5/10 menit, dismiss, atau selesai. Hanya jalan saat tab terbuka.

## Konvensi wajib

- **Response API** selalu `{ success: boolean, data?, message?, error?, details? }` (tipe `ApiResponse`). Validasi gagal = 400 dengan `details: error.format()`.
- **Setiap query data user harus memfilter `userId`** di repository. Repository menerima `userId` sebagai argumen, jangan ambil dari tempat lain.
- Route handler dinamis: `params` adalah `Promise` (`{ params }: { params: Promise<{ id: string }> }`, lalu `await params`).
- Input selalu lewat skema zod di `src/lib/validation`. Jangan percaya body/query mentah.
- Logika bisnis baru masuk service, bukan route. Query Prisma baru masuk repository, bukan service.
- Alias import `@/*` mengarah ke `src/*`.
- Komponen yang memakai hooks/browser API harus diberi `"use client"`. Default-nya server component.
- Tailwind v4 (config lewat CSS di `globals.css`, bukan `tailwind.config.js`). Tema dark mode.
- Prisma: ubah `prisma/schema.prisma`, lalu `prisma generate`. Perubahan kolom yang akan masuk produksi lewat migration, bukan `db push`.

## Kondisi saat ini (baca sebelum merencanakan apa pun)

1. **Auth belum ada.** `src/lib/auth.ts` `getCurrentUser()` selalu membuat/mengembalikan satu user default (`default_user_remindflow`, password palsu). Semua route memanggil fungsi ini. Rencana ada di `docs/auth-plan.md`.
2. **`Task.completedAt` sudah ada** dan diisi di tiga tempat di `task.repository.ts`: `update`, `toggleStatus`, `handleAlarmAction("complete")`. Setiap jalur baru yang mengubah status ke/dari `COMPLETED` harus menjaga invarian: `status === COMPLETED` ⇔ `completedAt != null`.
3. **Bug zona waktu**: `getStatistics` memakai batas hari dari server-local time (di Vercel = UTC), jadi "due today" meleset untuk WIB (UTC+7). `User` belum punya field timezone; default dari `NEXT_PUBLIC_DEFAULT_TIMEZONE` (`Asia/Jakarta`). Cek juga bagaimana `combineDateTime` di `utils/date.ts` menafsirkan zona waktu.
4. **Semua error jadi HTTP 500**, termasuk "Tugas tidak ditemukan" (seharusnya 404). Perbaiki dengan error class sederhana jika menyentuh area itu.
5. **Belum ada test.** `package.json` bernama `project-reminder`; README masih punya placeholder URL clone.

## Fitur yang sedang dikerjakan: Progress / Konsistensi

Spesifikasi di `docs/progress-feature.md`. Urutan kerja: (1) auth nyata, (2) perbaiki timezone, (3) `src/lib/progress.ts` murni + test, (4) `GET /api/progress`, (5) halaman `/progress` + kartu streak di dashboard.

## Cara bekerja

- Untuk tugas non-trivial: baca file terkait dulu, usulkan rencana singkat, baru implementasi. Perubahan kecil dan fokus; jangan refactor di luar scope.
- Sebelum menyatakan selesai: `npm run lint` dan `npx tsc --noEmit` harus lolos. Untuk perubahan UI, jalankan dev server dan periksa halamannya.
- Jangan menambah dependency tanpa alasan jelas; sebutkan alasannya.
- Pakai skill di `.claude/skills/` dan agent di `.claude/agents/` bila relevan (`reviewer` setelah perubahan besar, `security-auditor` setelah menyentuh auth/API).