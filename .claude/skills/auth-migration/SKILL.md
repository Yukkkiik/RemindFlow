---
name: auth-migration
description: Use when implementing or modifying authentication in RemindFlow (login, register, session cookie, getCurrentUser, route protection). Replaces the default-user stub with real email/password + JWT cookie auth.
---

# Implementasi auth RemindFlow

Sumber kebenaran rencana: `docs/auth-plan.md`. Baca dulu, ikuti langkahnya secara berurutan.

Fakta kode saat ini:
- `src/lib/auth.ts` `getCurrentUser()` selalu mengembalikan user default; semua route API memanggilnya, jadi **pertahankan tanda tangannya** (`Promise<User>`) dan ganti isinya.
- `jose` (JWT) dan `bcryptjs` sudah terpasang. Jangan menambah library auth lain tanpa persetujuan user.
- Next.js 16: API `cookies()` bersifat async dan konvensi middleware/proxy bisa berbeda dari yang Anda ingat. Baca `node_modules/next/dist/docs/` sebelum menulis.

Aturan keamanan (tidak boleh dikompromikan):
- Password di-hash `bcryptjs` (cost ≥ 10); tidak pernah di-log atau dikembalikan di response.
- Cookie session: `httpOnly`, `secure` di production, `sameSite: "lax"`.
- `JWT_SECRET` dibaca dari env tanpa fallback; jika kosong, lempar error saat dipakai.
- Pesan login gagal generik. Register: normalisasi email (trim + lowercase), tangani duplikasi tanpa membocorkan detail berlebihan.
- Redirect di middleware/proxy hanya UX. Otorisasi nyata = `getCurrentUser()` di setiap route + filter `userId` di repository.
- Hapus `getOrCreateDefaultUser` dan password palsu `dev_password_hashed`.

Setelah selesai: jalankan agent `security-auditor`, lalu `npm run lint` dan `npx tsc --noEmit`. Uji manual: akses API tanpa cookie (401), user A mengakses task user B (404), logout menghapus cookie.