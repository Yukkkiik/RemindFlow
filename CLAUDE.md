@AGENTS.md

# RemindFlow

Aplikasi task manager + pengingat (alarm audio real-time + notifikasi browser). Pemilik: Muhamad Yuki.
UI dan pesan error ke user memakai **Bahasa Indonesia**. Kode, nama variabel, dan commit message memakai **English**.
Balas ke user dalam Bahasa Indonesia kecuali diminta lain.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 + MySQL · Zod 4 · React Hook Form · date-fns 4 · jose + bcryptjs (auth) · Vitest (test).

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
npm test                 # vitest run (wajib hijau; coba juga TZ=UTC npm test)
npm run db:seed          # akun demo (butuh DEMO_PASSWORD di .env)
```

Test hanya untuk logika murni (`src/lib`, `src/utils`), ditaruh di samping sumber sebagai `*.test.ts` (lihat agent `test-writer`).
Env: salin `.env.example` ke `.env` dan isi `JWT_SECRET` (`openssl rand -base64 32`). Jangan pernah membaca, mencetak, atau commit `.env`.

## Arsitektur (berlapis, ikuti urutan ini)

```
src/app/api/**/route.ts        HTTP saja: ambil user, parse + validasi (zod), panggil service, bentuk response
src/server/services/*.service  Aturan bisnis, cek kepemilikan relasi (mis. kategori milik user)
src/server/repositories/*      Satu-satunya tempat yang memanggil prisma untuk entity itu
src/lib/validation/*.schema.ts Skema zod (input create/update/query)
src/lib/                       prisma.ts (client singleton), auth.ts + session.ts (identitas), errors.ts, rate-limit.ts, progress.ts (murni)
src/proxy.ts, instrumentation.ts   Redirect halaman (optimistis); cek JWT_SECRET saat start
src/utils/                     date.ts (helper tanggal/timezone), sound.ts (Web Audio synth, tanpa file audio)
src/components/{auth,dashboard,layout,progress,reminder,task}/   UI
src/types/index.ts             Tipe bersama + REMINDER_OFFSETS
```

Halaman: `/login`, `/register` (publik), `/dashboard`, `/tasks`, `/calendar`, `/progress`, `/settings`. Di bawah lebar `md`, `Sidebar` berubah menjadi bar navigasi bawah.
Reminder: `AlarmManager` (client) polling tiap 5 detik, memainkan nada via Web Audio, `AlarmDialog` menawarkan snooze 5/10 menit, dismiss, atau selesai. Hanya jalan saat tab terbuka.

## Konvensi wajib

- **Response API** selalu `{ success: boolean, data?, message?, error?, details? }` (tipe `ApiResponse`). Validasi gagal = 400 dengan `details: error.format()`.
- **Setiap query data user harus memfilter `userId`** di repository. Repository menerima `userId` sebagai argumen, jangan ambil dari tempat lain.
- Route handler dinamis: `params` adalah `Promise` (`{ params }: { params: Promise<{ id: string }> }`, lalu `await params`).
- Input selalu lewat skema zod di `src/lib/validation`. Jangan percaya body/query mentah.
- Logika bisnis baru masuk service, bukan route. Query Prisma baru masuk repository, bukan service.
- Alias import `@/*` mengarah ke `src/*`.
- Komponen yang memakai hooks/browser API harus diberi `"use client"`. Default-nya server component.
- Tailwind v4 (config lewat CSS di `globals.css`, bukan `tailwind.config.js`). Tema saat ini terang (belum ada varian `dark:`); ikuti gaya komponen yang ada.
- Prisma: ubah `prisma/schema.prisma`, lalu `prisma generate`. Perubahan kolom yang akan masuk produksi lewat migration, bukan `db push`.

## Kondisi saat ini (baca sebelum merencanakan apa pun)

1. **Auth sudah ada** (email + password). Session = JWT `jose` HS256 di cookie `httpOnly` `session` (7 hari, `secure` di production, `sameSite: lax`); `bcryptjs` cost 12.
   - `getCurrentUser()` (`src/lib/auth.ts`) melempar `UnauthorizedError` (401) bila tidak ada session atau user sudah dihapus (cookie basi ikut dibersihkan). Semua route memanggilnya; jangan ambil identitas dari tempat lain.
   - `src/proxy.ts` (nama Next 16 untuk middleware) hanya redirect optimistis ke `/login`. Otorisasi sebenarnya = `getCurrentUser()` di route + filter `userId` di repository.
   - `JWT_SECRET` wajib: `src/instrumentation.ts` menolak start bila kosong; di production harus ≥ 32 karakter dan bukan nilai contoh.
   - Login/register dibatasi `src/lib/rate-limit.ts` (**in-memory per instance**, tidak efektif di serverless; ganti Redis/WAF sebelum deploy publik). Login punya batas per IP+email dan batas per email saja.
   - Akun demo: `DEMO_PASSWORD=... npm run db:seed` (mengubah user default lama menjadi `demo@remindflow.local`, task lama tetap ada). Password palsu lama tidak lagi bisa dipakai.
2. **Invarian `completedAt`**: `status === COMPLETED` ⇔ `completedAt != null`. Dijaga satu helper `completedAtFor` di `task.repository.ts`, dipakai oleh `create`, `update`, `toggleStatus`, dan `handleAlarmAction("complete")`. Jalur baru yang mengubah status wajib memakainya. Menyimpan ulang task yang sudah selesai mempertahankan `completedAt` aslinya.
3. **Zona waktu sudah diperbaiki.** Helper di `src/utils/date.ts`: `dayKey`, `timeKey`, `dueDateDayRange`, `combineDateTime(date, time, tz)`, semuanya default `DEFAULT_TIMEZONE` (`NEXT_PUBLIC_DEFAULT_TIMEZONE`, `Asia/Jakarta`) dan tidak bergantung zona server.
   - `Task.dueDate` disimpan sebagai **UTC midnight dari tanggal kalender** (skema menolak selain `YYYY-MM-DD`); `dueTime` adalah jam dinding di timezone tersebut.
   - Untuk "hari ini"/deadline jangan pakai `getDate()`, `new Date(y, m, d)`, atau `toISOString()` pada instan; pakai helper di atas.
   - `User` belum punya field timezone (semua user dianggap `Asia/Jakarta`). `formatDate`/`formatRelativeDate` masih memakai zona browser.
4. **Error HTTP**: `src/lib/errors.ts` punya `BadRequestError`/`UnauthorizedError`/`NotFoundError`/`ConflictError` (+ `HttpError` untuk 429). Service dan repository melempar kelas ini, bukan `Error` biasa; setiap `catch` di route memanggil `errorResponse(error, pesanFallback)` (error tak dikenal dicatat dan disembunyikan, jadi 500 generik).
5. **Test**: Vitest (`npm test`, 70 test untuk `progress.ts`, `date.ts`, skema task). Harus hijau juga dengan `TZ=UTC` dan `TZ=Asia/Jakarta`. Route dan repository (butuh DB) belum punya test otomatis; verifikasinya lewat curl/browser.
6. **Utang teknis yang diketahui** (dari audit, belum dikerjakan):
   - Token JWT tidak bisa dicabut saat logout; belum ada pengecekan `Origin` (CSRF) dan ganti password.
   - `getCurrentUser()` mengembalikan `User` utuh termasuk hash password (saat ini selalu lewat `toPublicUser` di response).
   - `/api/progress` memuat seluruh riwayat task selesai user (perlu batas atau index `@@index([userId, completedAt])` bila data besar).
   - `updateTask` membaca status dua kali (service dan repository), ada race kecil pada `completedAt`.
   - `prisma` (CLI) ada di `dependencies`; `npm audit` melaporkan 3 high via `deepmerge-ts` yang hanya diperbaiki lewat Prisma 7 (breaking).
   - `next.config.ts` tanpa security header; `package.json`/README masih berisi placeholder (URL clone).

## Fitur Progress / Konsistensi (sudah dibangun)

Spesifikasi di `docs/progress-feature.md`. Alur: `GET /api/progress?range=7d|30d|90d` → `progress.service` → `TaskRepository.findForProgress` → `src/lib/progress.ts` (fungsi murni: `computeProgress`, `computeActivity`, `computeStreaks`, `consistencyScore`). UI: `/progress` + `src/components/progress/*` (tanpa library chart) dan `StreakCard` di dashboard.

Keputusan yang tidak tertulis di dokumen: rate `null` bila penyebut 0 (UI menampilkan "—"); skor `null` bila rentang tidak punya task due maupun selesai, dan rate `null` dihitung 0 di rumus; heatmap/tren selalu 12 minggu (Senin–Minggu) tanpa memedulikan rentang; `summary.completed` = jumlah selesai di antara task due; kategori kosong tampil sebagai "Tanpa kategori". Belum ada: badge, level, task berulang, breakdown prioritas di UI.

## Cara bekerja

- Untuk tugas non-trivial: baca file terkait dulu, usulkan rencana singkat, baru implementasi. Perubahan kecil dan fokus; jangan refactor di luar scope.
- Sebelum menyatakan selesai: `npm run lint` dan `npx tsc --noEmit` harus lolos. Untuk perubahan UI, jalankan dev server dan periksa halamannya.
- Jangan menambah dependency tanpa alasan jelas; sebutkan alasannya.
- Pakai skill di `.claude/skills/` dan agent di `.claude/agents/` bila relevan (`reviewer` setelah perubahan besar, `security-auditor` setelah menyentuh auth/API).