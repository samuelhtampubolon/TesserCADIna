# Unduhan

**Build tidak ada di folder ini, dan tidak bisa ada.** Jika Anda mencarinya,
mereka ada di
[**halaman Releases**](https://github.com/samuelhtampubolon/TesserCADIna/releases).

## Mengapa tidak di sini

Build desktop TesserCADIna adalah aplikasi Electron, jadi Chromium lengkap ikut
tersertakan dan berkasnya jauh lebih besar daripada batas **100 MB per berkas**
yang diberlakukan GitHub di dalam repositori. Releases ada tepat untuk itu.

Ukurannya tidak ditulis ulang di halaman ini. Satu-satunya tempat yang
menyebutkannya adalah [README](../README.md#build-desktop), karena angka di
sana dicetak ulang oleh CI pada setiap build dan build merah kalau angkanya
bergeser. Menyalinnya ke sini berarti membuat tempat kedua yang bisa basi, dan
memang pernah basi: halaman ini menjanjikan "sekitar 80 MB" sampai ada yang
benar-benar mengukurnya.

## Di mana mendapatkannya

| | |
|---|---|
| **Releases** | [github.com/samuelhtampubolon/TesserCADIna/releases](https://github.com/samuelhtampubolon/TesserCADIna/releases) |
| **Belum ada rilis?** | Setiap build "Desktop build" yang hijau menyimpan berkas yang sama sebagai artefak di tab **Actions** |
| **Tanpa unduhan** | Versi web adalah aplikasi yang sama dan tidak memasang apa pun |

Di Windows, ambil **`.zip`** (`TesserCADIna-1.2.0-windows-x64.zip`) bukan installer.
Ekstrak, jalankan `TesserCADIna.exe`. There is no macOS build.

## Membangun sendiri

```bash
cd desktop
npm install
npm run dist
```
