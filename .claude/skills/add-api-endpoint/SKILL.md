---
name: add-api-endpoint
description: Use when adding or changing an API route in RemindFlow (anything under src/app/api), including its zod schema, service, and repository code. Enforces the route → service → repository layering, userId scoping, and the ApiResponse shape.
---

# Menambah / mengubah endpoint API RemindFlow

Ikuti urutan ini. Contoh acuan: `src/app/api/tasks/route.ts`, `src/server/services/task.service.ts`, `src/server/repositories/task.repository.ts`.

1. **Skema zod** di `src/lib/validation/<entity>.schema.ts`. Export tipe input dengan `z.infer`. Query string juga divalidasi (lihat `taskQuerySchema`). Zod yang dipakai adalah v4.
2. **Repository** (`src/server/repositories/`): method statis, **argumen `userId` wajib**, semua `where` memuat `userId`. Untuk update/delete pakai `where: { id, userId }`. Pilih kolom/relasi seperlunya (`select`/`include`); jangan pernah mengembalikan `password` user.
3. **Service** (`src/server/services/`): aturan bisnis, cek kepemilikan relasi (mis. `categoryId` harus milik user), lempar `Error` dengan pesan Bahasa Indonesia.
4. **Route** (`src/app/api/.../route.ts`):
   - `const user = await getCurrentUser();` di awal.
   - Parse body/query → `schema.safeParse`. Gagal → `400` dengan `{ success: false, error: "...", details: result.error.format() }`.
   - Panggil service dengan `user.id`.
   - Sukses → `{ success: true, data, message? }` (201 untuk create).
   - Segmen dinamis: `{ params }: { params: Promise<{ id: string }> }` lalu `const { id } = await params;`.
   - Bungkus `try/catch`, `console.error("METHOD /path error:", error)`. Pesan "tidak ditemukan" → 404, tidak sah → 401, selain itu 500.
5. **Konsumsi di klien**: ikuti pola `fetch` yang sudah ada di halaman/komponen terkait dan baca `json.success`.
6. **Verifikasi**: `npm run lint`, `npx tsc --noEmit`, lalu panggil endpoint (curl atau UI) untuk happy path + input tidak valid + ID milik user lain (harus 404, bukan data).

Larangan: query Prisma langsung di route atau service; endpoint tanpa `getCurrentUser()`; response dengan bentuk selain `ApiResponse`; ID dari klien dipakai tanpa filter `userId`.