# Game Realms - Panduan Setup

## Isi paket ini
- index.html - halaman landing/splash
- login.html - login & register (email/password + Google), desain kartu + banner gambar
- intro.html - halaman gambar full-screen sesudah login, auto-skip 5 detik
- jelajah.html - lihat semua produk (publik), filter kategori & search
- produk-detail.html - detail produk, galeri foto, grafik harga, chat, rating, tandai terjual
- dashboard.html - "Toko Saya": kelola produk (multi-foto, kategori, stok) & lelang milik sendiri
- lelang.html - lihat semua lelang aktif + yang segera berakhir
- lelang-detail.html - bid, riwayat bid, chat, hasil pemenang
- profile.html - profil, bio, statistik, badge, notifikasi, wishlist, riwayat, toggle tema
- toko.html - halaman etalase publik per user (bio + rating gabungan + produk aktif)
- user-profile.html - halaman detail user (avatar, badge, tanggal gabung, jumlah produk/lelang, rating) - bisa diakses dari nama di chat, riwayat bid, ulasan, dll
- admin.html - panel admin (laporan+bukti, ban user, badge, banner+pengumuman) - HANYA buat akun admin
- firestore.rules - aturan keamanan database, WAJIB di-publish ke Firebase Console
- assets/js/firebase-config.js - satu-satunya file yang perlu diisi config Firebase kamu
- assets/bg.mp4 - video background (opsional, taruh sendiri)
- assets/login-banner.jpg - gambar banner di halaman login (opsional, taruh sendiri)
- assets/intro.mp4 - video full-screen di halaman intro (opsional, taruh sendiri)

## Langkah setup

### 1. Buat project Firebase
1. Buka https://console.firebase.google.com > Add project
2. Kasih nama project (bebas, misal "kenzy-store")

### 2. Aktifkan Authentication
1. Build > Authentication > Get Started
2. Aktifkan "Email/Password"
3. Aktifkan juga "Google" (isi email support project)

### 3. Aktifkan Firestore Database
1. Build > Firestore Database > Create database
2. Pilih mode "Production"
3. Setelah dibuat, buka tab "Rules", copy-paste isi file `firestore.rules` dari paket ini, lalu klik **Publish**

### 4. Ambil config & isi ke kode
1. Project Settings (ikon gear) > General > scroll ke "Your apps" > klik ikon web `</>`
2. Kasih nama app, daftar
3. Copy object `firebaseConfig` yang muncul
4. Buka file `assets/js/firebase-config.js`, ganti bagian `firebaseConfig` dengan yang kamu copy tadi
   **Ini satu-satunya tempat yang perlu diedit** - semua halaman lain otomatis ikut

### 5. (Opsional) Setup reCAPTCHA buat form register
1. Buka https://www.google.com/recaptcha/admin
2. Daftar situs baru, pilih reCAPTCHA v2 "I'm not a robot" Checkbox
3. Masukkan domain kamu (kalau masih testing lokal, bisa tambah `localhost`)
4. Copy "Site Key", buka `login.html`, cari teks `GANTI_DENGAN_SITE_KEY_RECAPTCHA_KAMU` dan ganti

### 6. Jadikan akun kamu admin
Setelah daftar akun pertama kali di web:
1. Buka Firebase Console > Firestore Database > koleksi `users`
2. Cari dokumen dengan uid akun kamu
3. Edit field `isAdmin` jadi `true` (boolean)
4. Sekarang tombol "Panel Admin" muncul di halaman profil kamu

### 7. Hosting
Bisa upload semua file ini ke GitHub Pages (kayak project Kenchats kamu) atau Firebase Hosting.
Pastikan struktur folder tetap sama (index.html sejajar folder `assets/`).

## Catatan penting
- Foto produk/lelang disimpan sebagai base64 langsung di Firestore (dikompres dulu di browser), JADI GRATIS - gak perlu upgrade paket Blaze buat Firebase Storage.
- Finalisasi lelang (nentuin pemenang) dicek otomatis SETIAP KALI ada yang buka halaman detail lelang tersebut setelah waktunya habis - karena situs ini statis (tanpa server backend), bukan dicek oleh timer background. Jadi kalau gak ada yang buka halamannya persis pas waktu habis, status "selesai" baru muncul begitu ada yang buka lagi (biasanya gak masalah karena seller/pembid pasti balik ngecek).
- Field `banned` dicek pas login - kalau `true`, otomatis logout paksa.
- Kalau ada error "Missing or insufficient permissions", biasanya karena `firestore.rules` belum di-publish atau ada typo pas copy-paste.
- TRANSAKSI LEWAT WHATSAPP: web ini SENGAJA gak punya sistem pembayaran. Tiap user isi nomor WhatsApp di halaman Profil (ikon WA di sebelah nama), nanti muncul tombol "Hubungi Penjual via WhatsApp" di halaman produk & pas menang lelang. Pembayaran/COD/nego harga diselesaikan sendiri di luar web lewat WA.
- REPORT WAJIB BUKTI: setiap laporan produk/lelang sekarang wajib upload screenshot, gak bisa kirim tanpa bukti. Bukti ini muncul di panel admin.
- BANNER & PENGUMUMAN: admin bisa upload gambar banner (PNG/JPG) dan tulis pengumuman lewat tab "Banner" di admin.html. Otomatis muncul di halaman Jelajah semua user. Kalau belum diisi, banner fallback ke gradient polos.
- ANIMASI HALAMAN: tiap pindah halaman ada efek fade in/out otomatis (diatur di assets/js/common.js fungsi enablePageTransitions), gak perlu setup tambahan.
- MULTI-FOTO, KATEGORI, STOK: tiap produk sekarang bisa punya sampai 5 foto (galeri swipe di halaman detail), kategori bebas ketik (dipakai buat filter di Jelajah), dan stok yang diupdate manual sama seller lewat Edit Produk.
- MODE GELAP/TERANG: toggle di halaman Profil, disimpan di localStorage browser (per device, bukan per akun).
- HALAMAN TOKO PUBLIK: tiap user punya halaman etalase sendiri di `toko.html?uid=<uid>` - isinya bio toko, rating gabungan dari semua produk dia, dan daftar produk aktif. Bio diisi lewat halaman Profil.
- LOGIN & INTRO BARU: `login.html` didesain ulang jadi kartu dengan banner gambar di atas (taruh gambar kamu di `assets/login-banner.jpg`, fallback ke gradient kalau belum ada). Setelah login/daftar, muncul `intro.html` - halaman VIDEO full-screen (taruh di `assets/intro.mp4`) dengan tombol "Lewati" dan auto-lanjut 5 detik ke Dashboard.
- ICON PAKAI SIMBOL: semua icon di web ini pakai karakter simbol Unicode biasa (bukan library icon dari internet), jadi web-nya lebih ringan dan tetap jalan normal walau koneksi lambat/CDN icon down.
- VVIP MEMBER: admin bisa kasih status VVIP ke user tertentu lewat tab "Kelola User" di admin.html (cari username, klik "Kasih VVIP", isi tanggal berakhirnya). Produk & lelang milik user VVIP otomatis naik ke paling atas di halaman Jelajah & Lelang, dan muncul badge emas "VVIP" di produk/lelang/profil mereka. Status ini otomatis hilang sendiri kalau udah lewat tanggal yang di-set (gak perlu admin cabut manual, kecuali mau dicabut lebih cepat).
- LIVE CHAT KE ADMIN: ada tombol chat mengambang di pojok kanan bawah tiap halaman (buat user yang login) - beda dari chat per-produk/lelang. Admin bisa balas semua chat ini lewat tab "Live Chat" di admin.html. Ada tanda titik merah kalau ada balasan admin yang belum dibaca.
- **PENTING - RULES DIUPDATE**: kalau kamu udah publish `firestore.rules` sebelumnya, WAJIB publish ulang versi terbaru di paket ini - ada perubahan penting (proteksi biar user gak bisa jadiin diri sendiri VVIP/admin, plus rules buat koleksi `support` buat live chat).
- VERIFIKASI EMAIL WAJIB: daftar pakai email/password sekarang WAJIB verifikasi dulu (link dikirim otomatis ke email pas daftar) sebelum bisa login. Kalau belum verifikasi dan coba login, ada link "Kirim ulang email verifikasi". Login pakai Google TIDAK perlu verifikasi tambahan (email Google udah otomatis terverifikasi).
