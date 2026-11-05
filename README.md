# Pengawasan

Aplikasi ini dapat dipasang di ponsel sebagai PWA melalui browser.

## Pasang di ponsel

1. Buka https://mediakopena-arch.github.io/Pengawasan/ di Chrome (Android) atau Safari (iPhone).
2. Android: buka menu browser lalu pilih **Instal aplikasi** atau **Tambahkan ke layar utama**. iPhone: pilih **Bagikan** lalu **Tambahkan ke Layar Utama**.
3. Buka ikon Pengawasan dari layar utama.

Halaman utama dapat dibuka kembali saat offline setelah kunjungan pertama. Fitur Gemini memerlukan internet.

## Menyiapkan Gemini bersama untuk semua pengguna

Situs GitHub Pages tidak dapat menyimpan rahasia dengan aman. Backend di folder `worker` menjalankan permintaan Gemini dan menyimpan API key sebagai Cloudflare Worker Secret. Pengguna aplikasi tidak perlu memasukkan API key.

1. Buat/login ke akun Cloudflare dan siapkan Wrangler pada komputer atau Termux yang memiliki Node.js/npm.
2. Dari terminal, masuk ke folder `worker`, lalu jalankan:

   ```sh
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put GEMINI_API_KEY
   ```

3. Saat diminta, tempel API key Gemini admin ke terminal. Jangan masukkan key ke file proyek atau chat. Wrangler akan menampilkan alamat Worker setelah deploy.
4. Isi variabel `window.PENGAWASAN_AI_API` di `ai-config.js` dengan alamat tersebut, tanpa `/analyze`. Contoh:

   ```js
   window.PENGAWASAN_AI_API = "https://pengawasan-ai.nama-akun.workers.dev";
   ```

5. Unggah/push perubahan `ai-config.js` dan file aplikasi ke repositori GitHub Pages. Setelah situs terbit ulang, pengguna membuka tab **Analisa AI**, mengunggah laporan mereka seperti biasa, mencentang persetujuan pengiriman angka agregat, lalu menekan **Buat analisa AI**.

### Batasi penggunaan

Worker hanya menerima permintaan dari origin `https://mediakopena-arch.github.io`, tetapi pemeriksaan origin bukan autentikasi dan dapat dipalsukan oleh klien non-browser. Sebelum membagikan aplikasi, buat aturan Cloudflare Rate Limiting untuk endpoint `/analyze` agar satu alamat IP tidak dapat mengirim permintaan terlalu sering. Tanpa login pengguna, siapa pun yang mengetahui URL Worker dapat mencoba memakainya; pantau kuota Gemini dan penggunaan Worker.

Aplikasi hanya mengirim angka agregat dari analisis lokal. Nama nasabah, nomor rekening, nama AO, dan rincian per rekening tidak dikirim. Hasil AI adalah bahan telaah, bukan keputusan kredit atau bukti pelanggaran.
