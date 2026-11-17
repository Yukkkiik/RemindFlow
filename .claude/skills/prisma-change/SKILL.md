---
name: prisma-change
description: Use when changing prisma/schema.prisma in RemindFlow (new column, index, model, enum), including migrations and backfilling existing rows. MySQL + Prisma 6.
---

# Perubahan schema Prisma (MySQL)

1. Baca `prisma/schema.prisma` dulu. Konvensi: `id String @id @default(cuid())`, tabel dipetakan dengan `@@map("snake_plural")`, setiap model user-owned punya `userId` + relasi `onDelete: Cascade`, index memakai `userId` di depan (`@@index([userId, dueDate])`).
2. Ubah schema. Kolom baru pada tabel yang sudah berisi data: buat **nullable** atau beri `@default`, agar migrasi tidak gagal.
3. Jalankan:
   - Dev lokal cepat: `npm run prisma:push`
   - Perubahan yang akan di-deploy: `npm run prisma:migrate -- --name <deskripsi-singkat>` dan commit folder `prisma/migrations`.
   - Lalu `npm run prisma:generate`.
4. **Backfill** bila perlu (script satu kali di `prisma/` atau `scripts/`, idempoten, jalan dengan `npx tsx`). Contoh: `completedAt` untuk task COMPLETED lama = `updatedAt` (perkiraan, catat di komentar).
5. Perbarui: tipe di `src/types/index.ts` bila ada, skema zod terkait, repository yang membaca/menulis kolom itu, dan `docs/` jika perilaku berubah.
6. Invarian penting: `Task.status === COMPLETED ⇔ completedAt != null`. Jangan menulis salah satu tanpa yang lain.
7. Semua waktu disimpan UTC. Jangan menyimpan "hari lokal" sebagai `DateTime`; hitung dari UTC + timezone saat query/render.
8. Verifikasi: `npx tsc --noEmit` dan `npm run build`.

Jangan menjalankan `prisma migrate reset` atau `db push --force-reset` terhadap database yang bukan lokal, dan jangan membaca `.env`.