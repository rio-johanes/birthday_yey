# A Little Birthday Adventure ♡

Website ulang tahun interaktif berbasis React + Vite. Tampilan dibuat dengan CSS dan ilustrasi SVG lokal bergaya kawaii pastel.

## Menjalankan project

Pastikan Node.js dan npm sudah terpasang.

```bash
npm install
npm run dev
```

Buka URL yang muncul di terminal (biasanya `http://localhost:5173`).

Untuk membuat versi production:

```bash
npm run build
npm run preview
```

## Halaman

- `/` — Welcome Page
- `/map` — Adventure Map
- `/garden` — Starry Garden (tap bintang hingga 10)
- `/memories` — Memory Island (buka tiga kartu kenangan)
- `/cake` — Sweet Cake Town (pilih frosting, topping, dan tiup lilin)
- `/castle` — Birthday Castle (terbuka setelah tiga misi selesai)
- `/letter` — Final Surprise (surat ulang tahun)

Progres misi disimpan di `localStorage` browser.

## Personalisasi konten

Buka `src/data/content.js`, lalu ubah:

- `recipientName`: nama panggilan penerima.
- `senderName`: nama pengirim.
- `letterTitle` dan `letterParagraphs`: isi surat.
- `memories`: judul, tanggal/caption, pesan, dan path foto.

### Mengganti foto kenangan

1. Siapkan tiga foto milikmu (JPG, PNG, atau WebP).
2. Salin ke `public/assets/memories/`.
3. Misalnya beri nama `memory-1.jpg`, `memory-2.jpg`, dan `memory-3.jpg`.
4. Di `src/data/content.js`, ubah `image` menjadi:
   - `/assets/memories/memory-1.jpg`
   - `/assets/memories/memory-2.jpg`
   - `/assets/memories/memory-3.jpg`

Foto landscape atau square akan tampil paling baik. Jangan gunakan foto orang lain tanpa izin.

## Mengganti ilustrasi

Ilustrasi utama berada di `public/assets/images/`:

- `mascot-bunny.svg` — maskot Bubu.
- `gift-box.svg` — kotak hadiah.
- `castle.svg` — kastil terakhir.
- `island-garden.svg` — pulau Starry Garden.
- `island-memory.svg` — pulau Memory Island.
- `island-cake.svg` — pulau Sweet Cake Town.

Kamu bisa mengganti SVG dengan file PNG/WebP sendiri. Pertahankan nama file dan ubah ekstensi/path di komponen React jika diperlukan.

## Catatan

- Musik latar sudah terhubung ke `/assets/audio/birthday.mp3`. Tambahkan file MP3 milikmu ke `public/assets/audio/` dengan nama persis `birthday.mp3`, lalu tombol musik dapat memutar/menjeda audio. Tanpa file tersebut, tombol akan menampilkan petunjuk.
- Desain responsive untuk smartphone dan desktop.
- Progres tersimpan per browser/perangkat. Membuka link di perangkat lain memulai progres baru.
- Untuk mengulang dari awal, gunakan tombol `Replay the adventure` di halaman surat.

## Design reference

Lihat `design-reference/birthday-adventure-reference.png` untuk papan referensi visual.
