# MyRehat Task B — Prompt Log & Implementation Report

## Ringkasan Eksekusi

### 1. Scaffolding Resmi
Menjalankan perintah exact yang ditentukan:
```bash
npx create-better-t-stack@latest myrehat-task-b --frontend next --backend elysia --runtime bun --database postgres --orm drizzle --db-setup none --auth better-auth --api orpc --payments none --examples ai --addons turborepo biome --web-deploy docker --server-deploy docker --package-manager pnpm --no-install --no-git --disable-analytics --no-render-title --directory-conflict overwrite
```

---

### 2. Implementasi 5 Patch Wajib (Sebelum Push Pertama)

1. **Dummy `.env` untuk Build (Commit ke Git)**:
   - `apps/web/.env`:
     ```env
     NODE_ENV=production
     NEXT_PUBLIC_SERVER_URL=http://localhost:3000
     ```
   - `apps/server/.env`:
     ```env
     NODE_ENV=production
     BETTER_AUTH_SECRET=placeholder-min-32-chars-000000000000
     BETTER_AUTH_URL=http://localhost:3000
     CORS_ORIGIN=http://localhost:3001
     GOOGLE_GENERATIVE_AI_API_KEY=placeholder
     DATABASE_URL=placeholder
     ```
   - Dikonfigurasi di `.gitignore` (`!.env`) agar kedua file ini ikut di-commit ke Git repo.

2. **`pnpm-workspace.yaml`**:
   - Menambahkan `msgpackr-extract: true` di bawah blok `allowBuilds:` untuk mencegah kegagalan build native package saat menginstal dependensi OpenCode SDK.

3. **`docker-compose.yml`**:
   - Menghapus blok `ports:` pada container `web` dan `server`.
   - Mengganti `NEXT_PUBLIC_SERVER_URL` menjadi `${NEXT_PUBLIC_SERVER_URL:-http://server:3000}`.
   - Menambahkan environment variables untuk Dokploy:
     - `web`: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`
     - `server`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

4. **`apps/web/next.config.ts`**:
   - Menambahkan rewrites untuk `/rpc/:path*` dan `/api/auth/:path*` mengarah ke `http://server:3000` (atau `${process.env.SERVER_URL}`).

5. **`packages/auth/src/index.ts`**:
   - Mengubah `defaultCookieAttributes` menjadi:
     ```ts
     defaultCookieAttributes: {
       sameSite: "lax",
       secure: false,
       httpOnly: true,
     }
     ```

---

### 3. Implementasi Fitur

#### F4: Hero Heading & Mobile Responsiveness
- Mengubah hero title pada `apps/web/src/app/page.tsx` menjadi:
  `"Book homestays directly with hosts"`
- Penyesuaian layout mobile responsif (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl`, padding responsif, flex-wrap buttons).

#### F1: Form & List BuyHomestay
- **Skema Drizzle** (`packages/db/src/schema/homestay.ts`):
  - Tabel `buy_homestays` dengan field: `id`, `title`, `price`, `location`, `category`, `whatsappContact`, `description`, `userId`, `createdAt`, `updatedAt`.
  - Dropdown & validator ketat untuk TEPAT 4 opsi kategori:
    1. `Buy Property`
    2. `Buy land to build homestay`
    3. `Buy Airbnb Profile`
    4. `Buy Airbnb Business`
- **oRPC Procedures** (`packages/api/src/routers/homestay.ts`):
  - `list`: public procedure untuk membaca daftar listing terurut dari yang terbaru.
  - `create`: protected procedure (hanya user dengan session Better-Auth valid yang diizinkan membuat listing).
- **Halaman UI (`apps/web/src/app/page.tsx`)**:
  - Pengecekan autentikasi: form aktif jika user login; jika belum login, menampilkan call-to-action ke halaman login.
  - Komponen card listing responsif dengan tombol langsung hubungi WhatsApp.

#### F2: Chat Concierge Webhook WAHA
- Endpoint: `apps/web/src/app/api/webhooks/waha/route.ts` (`POST /api/webhooks/waha`).
- Validasi payload format WAHA `{ event, payload: { from, body } }` menggunakan Zod schema.
- Memanggil AI SDK `generateText` menggunakan provider OpenRouter (`@openrouter/ai-sdk-provider`).
- Mengembalikan response JSON berformat exact: `{ to: payload.payload.from, reply: replyText }`.

#### F3: Description Polisher Script
- `scripts/polish.ts` menggunakan provider `ai-sdk-provider-opencode-sdk` dan `generateText` dari AI SDK untuk memoles deskripsi listing homestay.

---

### 4. Hasil Pengujian Vitest (`bunx vitest run`)

Hasil eksekusi test suite:
```
 RUN  v5.0.5 D:/Kerja/Tes Kerja/MyRehat/Task B/myrehat-task-b

 ✓ tests/polish.test.ts (2 tests)
 ✓ tests/categories.test.ts (4 tests)
 ✓ tests/webhook.test.ts (5 tests)

 Test Files  3 passed (3)
      Tests  11 passed (11)
```

1. **Validasi Webhook WAHA**:
   - Memastikan payload valid diterima.
   - Memastikan payload tanpa field wajib ditolak (HTTP 400).
2. **Validasi 4 Kategori Diterima + 1 Ditolak**:
   - Memastikan tepat 4 kategori diizinkan.
   - Memastikan kategori tidak terdaftar (contoh: "Buy Luxury Hotel") ditolak oleh schema validator.
3. **Format Reply Concierge**:
   - Memastikan response selalu berformat `{ to: string, reply: string }`.
4. **Mock Test Polish Script**:
   - Memastikan integrasi provider OpenCode SDK berjalan dengan mock `generateText`.

---

### 5. Typecheck TypeScript (`tsc`)
```bash
turbo run check-types
# 6 successful, 6 total (0 error)
```


---

### 6. Update F1-F4 Refinement & Reviewer Feedback
Berdasarkan verifikasi reviewer:
1. **Halaman `/listings` & `/list` (F1)**:
   - Dibuat dedicated page di `apps/web/src/app/listings/page.tsx` dan `apps/web/src/app/list/page.tsx`.
   - Menampilkan list listing BuyHomestay lengkap dengan filter 4 kategori, pencarian, dan tautan kontak WhatsApp.
   - Ditambahkan tautan navigasi `Listings` pada header navbar (`apps/web/src/components/header.tsx`).
2. **Webhook WAHA Concierge (F2)**:
   - Diperkuat di `apps/web/src/app/api/webhooks/waha/route.ts` dan `apps/server/src/index.ts` untuk melayani GET (status info) dan POST (WAHA payload processing).
3. **AI Polish Listing (F3) & AI Chat**:
   - Dibuat endpoint `POST /api/polish` di `apps/web/src/app/api/polish/route.ts`.
   - Ditambahkan tombol interaktif `Poles dengan AI (F3)` pada form listing BuyHomestay.
   - Diperbarui endpoint `/ai` di Elysia server agar menyediakan fallback streaming dan tidak error jika key external belum diisi.
4. **Verifikasi**:
   - `bunx vitest run`: 11 tests passed (100% hijau).
   - `turbo run check-types`: bersih tanpa error.
