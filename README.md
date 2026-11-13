# VAS — Virtual Administration Service

Asisten administrasi digital untuk UMKM di Indonesia.

## Aplikasi

Alamat GitHub Pages setelah publikasi berhasil:
https://aulliaramadani236-web.github.io/aplikasivas/

Halaman: dashboard, penjualan, stok, keuangan, pelanggan, pesanan, laporan bisnis, pengaturan, dan asisten berbasis aturan. Mendukung desktop serta ponsel, ekspor CSV, dan cetak/simpan PDF melalui browser.

## Penggunaan

- Aplikasi mulai dengan data demo Toko Sembako Berkah.
- Klik tombol Mode demo untuk berpindah ke ruang Usaha saya yang terpisah.
- Tambahkan produk dan stok awal, lalu catat penjualan atau pelanggan serta pesanan.
- Pesanan baru mereservasi stok. Pengiriman mengurangi stok fisik dan mencatat penjualan satu kali. Pembayaran harus lunas sebelum pesanan ditandai selesai.
- Retur mengembalikan seluruh barang dan mencatat pengembalian dana. Retur parsial belum tersedia.
- Pilih rentang tanggal pada laporan. Grafik dapat menampilkan omzet, laba, pengeluaran, dan transaksi.
- Unduh cadangan JSON melalui Pengaturan.

## Batasan MVP

Data tersimpan di localStorage browser pada perangkat masing-masing; tidak disimpan dalam repository atau server. Data tidak tersinkron antarperangkat. Penghapusan penyimpanan browser menghapus catatan; simpan cadangan secara berkala. Gunakan satu tab untuk pencatatan.

Belum tersedia autentikasi multiuser, pembatasan akses staf, database server, rekonsiliasi bank, pembelian persediaan terintegrasi, atau AI eksternal. Asisten merupakan simulasi analisis berbasis aturan yang membaca data lokal tanpa mengirimkan data ke layanan AI. Harga pokok menggunakan salinan biaya produk ketika transaksi dibuat.

## Hosting

Aplikasi statis tanpa proses build. GitHub Pages menggunakan branch `main`, folder `/ (root)`. Berkas `.nojekyll` menonaktifkan pemrosesan Jekyll. Semua aset memakai jalur relatif sehingga mendukung subfolder `/aplikasivas/`.

## Berkas

- `index.html`: struktur halaman.
- `style.css`: tampilan responsif dan cetak.
- `app.js`: antarmuka, formulir, penyimpanan, laporan, dan ekspor.
- `domain.js`: aturan penjualan, stok, reservasi, pesanan, pembayaran, dan retur.

Untuk menjalankan lokal, layani folder ini menggunakan server HTTP statis. Membuka `index.html` langsung melalui `file://` tidak disarankan karena menggunakan JavaScript modules.
