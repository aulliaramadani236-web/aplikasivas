# VAS — Virtual Administration Service

Asisten administrasi digital untuk UMKM di Indonesia.

## Aplikasi

Alamat GitHub Pages setelah publikasi berhasil:
https://aulliaramadani236-web.github.io/aplikasivas/

Halaman: dashboard, penjualan, stok, keuangan, pelanggan, pesanan, laporan bisnis, pengaturan, dan asisten berbasis aturan. Mendukung desktop serta ponsel, ekspor CSV, dan cetak/simpan PDF melalui browser.

## Penggunaan

- Halaman pertama menyediakan tab Masuk dan Daftar akun. Buat akun dengan nama, email, nama usaha, dan kata sandi minimal 10 karakter.
- Login ini adalah akun lokal pada browser yang sama, bukan autentikasi server. Email tidak diverifikasi dan pemulihan lewat email belum tersedia.
- Tombol Jelajahi data demo membuka Toko Sembako Berkah tanpa membuat akun.
- Klik tombol Mode demo untuk berpindah ke ruang Usaha saya yang terpisah.
- Tambahkan produk dan stok awal, lalu catat penjualan atau pelanggan serta pesanan.
- Pesanan baru mereservasi stok. Pengiriman mengurangi stok fisik dan mencatat penjualan satu kali. Pembayaran harus lunas sebelum pesanan ditandai selesai.
- Retur mengembalikan seluruh barang dan mencatat pengembalian dana. Retur parsial belum tersedia.
- Pilih rentang tanggal pada laporan. Grafik dapat menampilkan omzet, laba, pengeluaran, dan transaksi.
- Unduh cadangan JSON melalui Pengaturan.

## Batasan MVP

Data tersimpan di localStorage browser pada perangkat masing-masing; tidak disimpan dalam repository atau server. Data tidak tersinkron antarperangkat. Penghapusan penyimpanan browser menghapus catatan; simpan cadangan secara berkala. Gunakan satu tab untuk pencatatan.

Tersedia pendaftaran, login, dan logout akun lokal. Data usaha dan demo dipisahkan per ID akun. Kata sandi disimpan sebagai hash PBKDF2-SHA256 dengan salt acak dan 600.000 iterasi, bukan teks mentah. Sesi disimpan di sessionStorage dengan batas 12 jam. Hash ini tidak mengenkripsi data usaha dan bukan pengamanan server: siapa pun yang dapat mengakses penyimpanan browser dapat membaca atau memodifikasi data maupun sesi.

Belum tersedia autentikasi multiuser melalui server, pembatasan akses staf, database server, rekonsiliasi bank, pembelian persediaan terintegrasi, atau AI eksternal. Asisten merupakan simulasi analisis berbasis aturan yang membaca data lokal tanpa mengirimkan data ke layanan AI. Harga pokok menggunakan salinan biaya produk ketika transaksi dibuat.

## Hosting

Aplikasi statis tanpa proses build. GitHub Pages menggunakan branch `main`, folder `/ (root)`. Berkas `.nojekyll` menonaktifkan pemrosesan Jekyll. Semua aset memakai jalur relatif sehingga mendukung subfolder `/aplikasivas/`.

## Berkas

- `assets/logo-vas.jpg`: logo asli yang diberikan pemilik; simbol ditampilkan melalui pembingkaian CSS, tanpa mengubah gambar asli.
- `auth.js`: pendaftaran, pemeriksaan sandi lokal, sesi, dan formulir login.
- `auth.css`: tampilan login dan penyesuaian logo.
- `index.html`: struktur halaman.
- `style.css`: tampilan responsif dan cetak.
- `app.js`: antarmuka, formulir, penyimpanan, laporan, dan ekspor.
- `domain.js`: aturan penjualan, stok, reservasi, pesanan, pembayaran, dan retur.

Untuk menjalankan lokal, layani folder ini menggunakan server HTTP statis. Membuka `index.html` langsung melalui `file://` tidak disarankan karena menggunakan JavaScript modules.

## Akun dan data versi sebelumnya

Keluar akun melalui tombol di sidebar. Akun berbeda memiliki ruang data tersendiri pada browser ini. Menghapus data browser juga menghapus akun dan catatan. Akun pertama dapat memilih Impor data sebelumnya untuk mengambil data Usaha saya dari versi sebelum login. Impor hanya ditawarkan jika ruang akun masih kosong, memerlukan konfirmasi, dan mempertahankan salinan asli. Data lama tidak dibagikan otomatis ke setiap akun.

## Menjalankan dan menguji

Memerlukan Node.js 20+. Jalankan `npm.cmd install`, kemudian `npm.cmd start` dan buka http://127.0.0.1:3001. `npm.cmd test` menguji logika akun dan domain usaha; `npm.cmd run test:e2e` menguji alur browser. Pengujian browser memakai Chrome Windows; atur `CHROME_PATH` jika lokasi berbeda. GitHub Pages melayani aplikasi langsung tanpa Node atau build.
