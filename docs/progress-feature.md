# Fitur Progress / Konsistensi

Tujuan: pengguna bisa melihat seberapa konsisten dan disiplin mereka menyelesaikan task, bukan hanya berapa task yang ada.

> Item bertanda **[DEFAULT]** adalah keputusan sementara. Ubah di dokumen ini lebih dulu jika berbeda, lalu implementasi mengikuti.

## Prasyarat

1. Auth nyata (`docs/auth-plan.md`). Progress adalah data per orang.
2. Penanganan timezone yang benar (hari = hari menurut timezone user, bukan server).
3. `Task.completedAt` sudah ada; invarian `status === COMPLETED ⇔ completedAt != null` harus terjaga.

## Definisi metrik

Semua dihitung dalam rentang (`7d | 30d | 90d`) dan timezone user.

| Metrik | Definisi |
|---|---|
| **Due** | Task dengan `dueDate` (digabung `dueTime`) di dalam rentang dan sudah lewat waktu sekarang, atau sudah selesai |
| **Completion rate** | task Due yang berstatus COMPLETED ÷ semua task Due |
| **On-time** | `completedAt <= deadline`, deadline = `dueDate` + `dueTime` |
| **On-time rate** | task on-time ÷ task COMPLETED di rentang |
| **Hari aktif** | hari (timezone user) dengan ≥ 1 task yang `completedAt`-nya jatuh di hari itu **[DEFAULT]** |
| **Streak saat ini** | jumlah hari aktif berturut-turut sampai hari ini. Jika hari ini belum aktif, streak kemarin tetap hidup sampai hari ini berakhir |
| **Streak terpanjang** | streak terpanjang dalam seluruh riwayat |
| **Skor konsistensi (0–100)** | `0.5 × on-time rate + 0.3 × completion rate + 0.2 × min(streak/7, 1)`, tampilkan rumusnya di UI **[DEFAULT]** |

Aturan:
- Hari tanpa task yang jatuh tempo **tidak** dihitung sebagai kegagalan.
- Task tanpa deadline tidak ada di model saat ini (`dueDate` wajib). Jika kelak opsional, abaikan dari on-time rate.
- Task yang dibuka kembali (`completedAt` dikosongkan) otomatis keluar dari hitungan.
- Task berulang **belum** ada. Jika ditambahkan, rencanakan model data baru dulu; jangan menempelkannya ke metrik ini.

## Data yang dikembalikan

`GET /api/progress?range=7d|30d|90d`

```ts
{
  success: true,
  data: {
    range: "30d",
    summary: { due, completed, completionRate, onTimeRate, currentStreak, longestStreak, consistencyScore },
    daily: [{ date: "2026-11-17", completed: 3, onTime: 2 }],       // untuk heatmap & tren
    byCategory: [{ categoryId, name, color, completed, onTimeRate }],
    byPriority: [{ priority, completed, onTimeRate }]
  }
}
```

## Struktur kode

- `src/lib/progress.ts`: fungsi **murni** (tanpa Prisma, tanpa `new Date()` tersembunyi; `now` dan `timeZone` jadi argumen). Mudah dites.
- `src/server/repositories/task.repository.ts`: query mentah (task selesai/jatuh tempo dalam rentang, pilih kolom seperlunya).
- `src/server/services/progress.service.ts`: gabungkan repository + `progress.ts`.
- `src/app/api/progress/route.ts`: validasi `range` dengan zod.
- `src/app/progress/page.tsx` + komponen di `src/components/progress/`: kartu ringkasan, heatmap 12 minggu, grafik tren mingguan, breakdown kategori. Tambahkan kartu streak kecil di dashboard.
- Index tambahan bila perlu: `@@index([userId, completedAt])`.

## Test yang wajib ada (Vitest, pada `progress.ts`)

Streak melewati tengah malam WIB · hari ini belum aktif tapi kemarin aktif · task dibuka kembali · batas on-time tepat di deadline · rentang tanpa data · beda timezone (UTC vs Asia/Jakarta) pada task yang selesai pukul 00:30 WIB (= 17:30Z hari sebelumnya, hari berbeda di UTC), serta 23:30 WIB (= 16:30Z, hari yang sama di keduanya).

## Di luar scope versi pertama

Badge, level, leaderboard, notifikasi streak, tabel `TaskEvent` untuk riwayat snooze.