# Rencana Auth

## Keadaan sekarang

`src/lib/auth.ts` hanya punya `getCurrentUser()` yang mengembalikan user default. Tidak ada login, register, session, atau proteksi halaman. `jose` dan `bcryptjs` sudah di `package.json` tapi tidak dipakai. Schema `User` sudah punya `email` (unique) dan `password`.

Kabar baiknya: seluruh repository sudah memfilter `userId`, jadi isolasi data tinggal "menyambungkan" identitas nyata.

## Keputusan

Email + password, session JWT (`jose`, HS256) di cookie `httpOnly`. Tidak memakai Auth.js untuk tahap ini. **[DEFAULT]**

- Hash password: `bcryptjs` (cost ≥ 10).
- Cookie: `httpOnly`, `secure` di production, `sameSite: "lax"`, `path: "/"`, masa berlaku 7 hari.
- Payload JWT minimal: `sub` (user id). Ambil data lain dari DB.
- `JWT_SECRET` wajib di env; aplikasi harus gagal start/menolak login jika kosong atau masih nilai contoh di production.

## Langkah

1. `src/lib/session.ts`: `createSession(userId)`, `getSession()`, `destroySession()` (baca/tulis cookie via API cookies Next, cek docs Next 16 untuk `cookies()` yang async).
2. `src/lib/auth.ts`: ganti `getCurrentUser()` agar membaca session dan mengembalikan `User` atau melempar `UnauthorizedError`. Hapus `getOrCreateDefaultUser`. Tanda tangan fungsi dipertahankan agar route yang ada tidak perlu diubah.
3. Skema zod `src/lib/validation/auth.schema.ts` (register: name, email, password min 8; login: email, password).
4. Route: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. Pesan login gagal generik ("Email atau password salah"), jangan bocorkan apakah email terdaftar.
5. Proteksi halaman: gunakan mekanisme middleware/proxy yang berlaku di Next 16 (cek `node_modules/next/dist/docs/`) untuk mengarahkan user tanpa session dari `/dashboard`, `/tasks`, `/calendar`, `/settings`, `/progress` ke `/login`. Redirect di sini hanya kenyamanan UX; **otorisasi sebenarnya tetap di `getCurrentUser()` pada setiap route**.
6. Halaman `/login` dan `/register`, tombol logout di `Header`.
7. Migrasi data: user default lama (`default_user_remindflow`) berisi task demo. Pilih satu: hapus, atau sediakan seed akun demo dengan password yang dibaca dari env. Jangan biarkan akun dengan password palsu hidup di produksi.
8. Rate limiting login (sederhana, per IP + email) sebelum deploy publik.

## Pengecekan setelah selesai (agent `security-auditor`)

- Tidak ada route di `src/app/api` yang bisa dipanggil tanpa session (kecuali `/api/auth/register|login`).
- ID resource dari URL/body selalu dicek terhadap `userId` (termasuk `categoryId` pada task).
- Tidak ada `password` yang ikut ter-serialize ke response (`select` eksplisit atau hapus field).
- Cookie flag benar; `JWT_SECRET` tidak punya fallback hardcoded.