---
name: progress-metrics
description: Use when implementing or changing the progress/consistency feature in RemindFlow (streak, completion rate, on-time rate, heatmap, consistency score, /api/progress, /progress page). Covers metric definitions and timezone rules.
---

# Metrik progress / konsistensi

Definisi resmi ada di `docs/progress-feature.md`. Baca dulu; jika ada perbedaan dengan permintaan user, tanyakan dan perbarui dokumen itu.

Prinsip implementasi:
- Logika hitung ada di `src/lib/progress.ts` sebagai **fungsi murni**: terima array task (hanya kolom yang perlu), `now: Date`, `timeZone: string`. Tidak ada Prisma, tidak ada `new Date()` di dalam fungsi.
- "Hari" selalu menurut timezone user (sementara `DEFAULT_TIMEZONE` dari `src/utils/date.ts`), bukan timezone server. Gunakan `Intl.DateTimeFormat` dengan `timeZone`, atau `@date-fns/tz` jika perlu menambah dependency. Bagi waktu ke kunci hari `YYYY-MM-DD` lewat satu helper saja.
- Deadline task = `dueDate` + `dueTime` (string `HH:mm`). Periksa dulu bagaimana `combineDateTime` di `src/utils/date.ts` menafsirkan zona waktunya; jika memakai waktu lokal server, perbaiki dulu, karena itu menggeser hasil on-time di Vercel (UTC).
- Hanya task `COMPLETED` dengan `completedAt != null` yang dihitung selesai.
- Query: ambil kolom minimum (`status, dueDate, dueTime, completedAt, priority, categoryId`) dengan filter `userId` + rentang; agregasi di memori lewat `progress.ts`. Tambah `@@index([userId, completedAt])` bila query lambat.
- Hari tanpa task jatuh tempo bukan kegagalan; streak hari ini yang belum aktif tidak memutus streak sampai hari berakhir.

Wajib ada test Vitest untuk `progress.ts` (daftar kasus di `docs/progress-feature.md`). Gunakan agent `test-writer` bila Vitest belum terpasang.

UI: halaman `/progress` (server component yang memanggil service langsung atau fetch ke `/api/progress`), komponen di `src/components/progress/`. Sertakan empty state untuk user baru, loading state, dan tampilkan rumus skor konsistensi agar tidak terasa acak. Teks UI Bahasa Indonesia.