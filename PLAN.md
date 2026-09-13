# web-jualan — PLAN (brutalism-neo)

> caveman full + ponytail ultra + vercel best-practice. Build minimal, gas-ready.

## 1. Struktur file — paling males (3 file inti)

```
web-jualan/
├── PLAN.md            # ini
├── index.html         # single page, semua section
├── css/
│   └── style.css      # reuse brutalism-neo dari portfolio-web
├── js/
│   └── app.js         # vanilla JS, no framework
├── data/
│   └── menu.json      # sumber menu (edit tanpa ngoding, GAS sync nanti)
└── gas/
    └── Code.gs        # template GAS doGet/doPost (copy-paste ke Apps Script)
```

Test local linux: `python3 -m http.server 8000 --directory /home/jawa/web-jualan` → buka `http://localhost:8000`

Why 3 file inti only:
- ponytail ladder: no build, no npm, no React. Native HTML/CSS/JS cukup untuk <100 user. Tambah framework = bundle bloat, waterfall, hydration flicker (vercel: bundle-*, rendering-hydration-no-flicker).
- Already in codebase: portfolio-web punya `neo-card`, `neo-btn`, `brutalStickyNav`, palet `neo-*` → reuse 100%, bukan bikin baru.

## 2. Web mau ada apa — MVP (YAGNI extremist)

**A. Header brutalism-neo (reuse portfolio-web persis)**
- `fixed top-0` bar: kiri `bg-gray-950 text-white px-4 py-2 font-mono: TOKO KUE // ORDER`, kanan hamburger `neo-btn bg-white` 3 garis.
- Click hamburger → dropdown `border-[3px] border-gray-950 shadow-[8px_8px_0px_#111]` isi nav anchor: MENU, KERANJANG, PESAN.
- Font: Space Grotesk + JetBrains Mono + Oswald (sama portfolio). Warna: `neo-yellow #FACC15`, `neo-pink #FF4D8D`, `neo-blue #0038FF`, `neo-green #22C55E`, `neo-orange #FF5500`.

**B. Hero section**
- Kiri: headline `font-oswald text-6xl brutal-headline glitch-text` → "KUE ENAK // SIAP PESAN", underline `h-[6px] bg-gray-950`.
- Kanan: badge pill `neo-card` ("BUKA 08-20", "QR SCAN READY").
- Background: grid `linear-gradient(#111 1px, transparent 1px)` opacity 0.03 + floating shape 2 biji (kuning/pink).

**C. Menu grid**
- `grid 2col mobile, 3col desktop`, card = `neo-card p-3` + `border-[3px] shadow-[6px_6px_0px_#111]`.
- Tiap card: foto (placeholder `via.placeholder.com`), nama, harga, deskripsi 1 baris, tombol `+ TAMBAH` (`neo-btn bg-neo-yellow`).
- Data dari `data/menu.json` → `fetch().then(render)`. Local fallback: inline `const MENU` kalau fetch gagal (vercel: async-parallel, no waterfall).

**D. Keranjang (cart drawer + sticky footer)**
- Sticky bottom bar `fixed bottom-0 border-t-[3px] bg-white shadow` : kiri `3 item • Rp 85.000`, kanan `LIHAT KERANJANG` (`neo-btn bg-gray-950 text-white`).
- Drawer slide-over: list item + qty `− 1 +`, total, tombol `PESAN SEKARANG`.
- State: `localStorage` + `Map` (js-set-map-lookups). No backend yet.

**E. Checkout modal/form**
- Field: Nama* , WA* (`type=tel` native), Catatan, Metode `Ambil di tempat / Antar`.
- Submit → `POST` ke GAS jika `GAS_URL` diisi, else `localStorage + download CSV` + `console.log`. Validasi native `required` (no lib).
- Success: overlay `neo-card bg-neo-green` "PESANAN TERKIRIM" + ringkasan.

**F. Footer minimal**
- `section-divider` 4px gradient + `© 2026 TOKO KUE` mono.

Skipped (add when need):
- Login/admin/dashboard → belum perlu, cek Sheet langsung. Add when >50 order/hari butuh filter.
- Payment QRIS/Midtrans → add when manual transfer ribet.
- Search/filter kategori → add when menu >20 item. Sekarang 6-12 cukup.
- Database → `menu.json` + Sheet cukup, no MySQL.

## 3. Alur & algoritma

**Local (python3 test):**
```
user scan QR (localhost) → index.html → JS fetch data/menu.json → render grid
→ click + → cart Map {id→qty} → render sticky bar
→ Pesan → JSON.stringify({nama,wa,items,total,ts}) → localStorage.setItem + POST ke /api_mock (optional python)
→ show success
```

**GAS (deploy nanti, 1 ganti URL doang):**
```
same, tapi POST ke https://script.google.com/.../exec
Code.gs doPost(e):
  data=JSON.parse(e.postData.contents)
  SpreadsheetApp.openById(ID).getSheetByName("PESANAN").appendRow([new Date(), data.nama, data.wa, data.items.join(", "), data.total, data.catatan])
```

Bahasa: HTML/CSS/JS (frontend) + JS GAS (backend). Test local gak butuh GAS.

## 4. Brutalism-neo reuse checklist (copy dari portfolio-web)

- [ ] `tailwind.config` colors `neo-*` + fonts `grotesk/mono/oswald` via CDN (no npm)
- [ ] Class `neo-card` (`border 3px #111, shadow 8px 8px #111, hover translate 4px`) + `neo-btn` exact
- [ ] `#brutalStickyNav` + `#brutalHamburger` + `#brutalNavMenu` behavior JS (copy `js/app.js` portfolio, strip extra)
- [ ] `halftone-frame`, `marquee-strip`, `parallax-shape` kalau mau, tapi v1 cukup 2 shape biar ringan

## 5. Vercel perf (walaupun vanilla)

- `bundle-*`: no barrel, no heavy import, CDN tailwind only. No Next needed → zero bundle.
- `rendering-content-visibility`: grid `content-visibility:auto` untuk 20+ card.
- `rendering-hoist-jsx`: template card string, bukan createElement per render.
- `js-combine-iterations`: satu loop untuk total + render.
- `rendering-hydration-no-flicker`: no SSR, semua static → no flicker.
- `server-*`: n/a (static). Deploy Vercel cukup drag folder (vercel.json `cleanUrls:true`).

## 6. Testing plan (linux python3)

```bash
cd /home/jawa/web-jualan
python3 -m http.server 8000
# buka http://localhost:8000
# test: tambah 3 kue → cek sticky bar total benar → checkout → cek localStorage 'pesanan' ada → cek CSV download (jika mock)
```

Satu check runnable di `js/app.js`:
```js
// ponytail: one assert self-check
console.assert(cartTotal([{harga:10000,qty:2},{harga:5000,qty:1}])===25000, "total fail");
```

## 7. Steps setelah approve

1. `index.html` skeleton + CDN tailwind + css/style.css (copy neo-* dari portfolio)
2. `data/menu.json` dummy 6 kue (brownies, nastar, etc + foto placeholder)
3. `js/app.js` fetch+render+cart+checkout (vanilla, <150 line)
4. `gas/Code.gs` template (10 line)
5. test `python3 -m http.server` → QR generate dari localhost / GAS URL

Estimasi: <200 line total, 1 jam jadi.

## 8. Approval

Setuju → gue gas build file 3 inti langsung. Mau tweak menu dummy / warna / nama toko sebelum gas?
