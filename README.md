# Pengawasan

Aplikasi ini dapat dipasang di ponsel sebagai PWA melalui browser.

## Pasang di ponsel

1. Buka https://mediakopena-arch.github.io/Pengawasan/ di Chrome (Android) atau Safari (iPhone).
2. Android: buka menu browser lalu pilih **Instal aplikasi** atau **Tambahkan ke layar utama**. iPhone: pilih **Bagikan** lalu **Tambahkan ke Layar Utama**.
3. Buka ikon Pengawasan dari layar utama.

Halaman utama dapat dibuka kembali saat offline setelah kunjungan pertama. Fitur Gemini memerlukan internet.

## Menyiapkan Gemini bersama untuk semua pengguna

Situs GitHub Pages tidak dapat menyimpan rahasia dengan aman. Backend di folder `worker` menjalankan permintaan Gemini dan menyimpan API key sebagai Cloudflare Worker Secret. Pengguna aplikasi tidak perlu memasukkan API key.

### Jika memakai Termux di Android

Wrangler saat ini tidak dapat berjalan di Android ARM64, sehingga perintah `npx wrangler ...` gagal di Termux. Gunakan Cloudflare Dashboard atau jalankan Wrangler dari komputer.

### Deploy lewat Cloudflare Dashboard

1. Buka Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Create Worker**. Beri nama `pengawasan-ai`, lalu deploy Worker baru.
2. Buka Worker tersebut, pilih **Edit code**, ganti seluruh kode contoh dengan isi file `worker/index.js`, lalu **Deploy**.
3. Buka **Settings** → **Variables and Secrets** → **Add** → pilih tipe **Secret**. Isi nama `GEMINI_API_KEY`, tempel API key Gemini admin sebagai nilainya, lalu simpan/deploy. Jangan tempel API key ke chat atau file aplikasi.
4. Salin alamat Worker yang berakhiran `.workers.dev`.
5. Isi `window.PENGAWASAN_AI_API` di `ai-config.js` dengan alamat itu, tanpa `/analyze`. Contoh:

   ```js
   window.PENGAWASAN_AI_API = "https://pengawasan-ai.nama-akun.workers.dev";
   ```

6. Terbitkan ulang file aplikasi di GitHub Pages. Setelah itu pengguna membuka tab **Analisa AI**, memuat laporan mereka seperti biasa, menyetujui pengiriman angka agregat, lalu menekan **Buat analisa AI**.

### Batasi penggunaan

Worker hanya menerima permintaan dari origin `https://mediakopena-arch.github.io`, tetapi pemeriksaan origin bukan autentikasi dan dapat dipalsukan oleh klien non-browser. Sebelum membagikan aplikasi, buat aturan Cloudflare Rate Limiting untuk endpoint `/analyze` agar satu alamat IP tidak dapat mengirim permintaan terlalu sering. Tanpa login pengguna, siapa pun yang mengetahui URL Worker dapat mencoba memakainya; pantau kuota Gemini dan penggunaan Worker.

Aplikasi hanya mengirim angka agregat dari analisis lokal. Nama nasabah, nomor rekening, nama AO, dan rincian per rekening tidak dikirim. Hasil AI adalah bahan telaah, bukan keputusan kredit atau bukti pelanggaran.
