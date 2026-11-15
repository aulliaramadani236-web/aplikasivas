# VAS Android

APK Android memakai `WebViewAssetLoader` untuk menjalankan aset VAS secara lokal pada origin HTTPS internal. Koneksi internet tidak diperlukan untuk pencatatan usaha. Tautan website/kontak dibuka melalui aplikasi eksternal.

- Application ID: `id.vas.umkm`
- Versi: 1.0.0 (version code 1)
- Minimum: Android 8.0 / API 26 dengan Android System WebView terbaru
- Target / compile SDK: 35
- JDK: 17; Gradle: 8.9; Android Gradle Plugin: 8.7.3

## Build

1. Jalankan `node scripts/build-android-assets.mjs` dari root repository.
2. Sediakan `VAS_KEYSTORE_PATH` dan `VAS_KEYSTORE_PASSWORD`; alias kunci adalah `vas`.
3. Dari folder `android`, jalankan `gradle :app:assembleRelease`.
4. APK ada di `app/build/outputs/apk/release/app-release.apk`.

Workflow **Build Android APK** menyediakan build bertanda tangan dan uji emulator. Kunci penandatanganan disimpan sebagai GitHub Actions secrets; kunci dan kata sandi tidak termasuk repository. Gunakan kunci yang sama dan naikkan versionCode untuk pembaruan.

## Integrasi Android

- Ekspor CSV dan cadangan JSON menggunakan Storage Access Framework: pengguna memilih tempat menyimpan berkas.
- Cetak PDF menggunakan layanan cetak Android.
- Dialog konfirmasi JavaScript memakai dialog Android.
- Data memakai penyimpanan WebView privat aplikasi. Data browser dan APK terpisah, belum tersinkron. Menghapus aplikasi/data aplikasi menghapus akun dan catatan.
- Tidak meminta izin akses seluruh penyimpanan, kamera, lokasi, atau kontak perangkat.

APK didistribusikan langsung melalui halaman unduh VAS, bukan Google Play. Pengujian emulator tidak menggantikan pengujian pada seluruh merek/perangkat Android.
