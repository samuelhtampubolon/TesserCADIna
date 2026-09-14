# Unduhan

**Build tidak ada di folder ini, dan tidak bisa ada.** Jika Anda mencarinya,
mereka ada di
[**halaman Releases**](https://github.com/samuelhtampubolon/TesserCADIna/releases).

## Mengapa tidak di sini

Build desktop TesserCADIna adalah aplikasi Electron: Chromium lengkap ikut
tersertakan. Locale selain Inggris dan Indonesia dibuang, sehingga zip Windows
berada **sekitar 80 MB (di bawah 90 MB)**.

GitHub menolak berkas di atas **100 MB** di dalam repositori. Releases ada
tepat untuk itu.

## Di mana mendapatkannya

| | |
|---|---|
| **Releases** | [github.com/samuelhtampubolon/TesserCADIna/releases](https://github.com/samuelhtampubolon/TesserCADIna/releases) |
| **Tanpa unduhan** | Versi web adalah aplikasi yang sama dan tidak memasang apa pun |

Di Windows, ambil **`.zip`** (`TesserCADIna-1.1.0-windows-x64.zip`) bukan installer.
Ekstrak, jalankan `TesserCADIna.exe`. There is no macOS build.

## Membangun sendiri

```bash
cd desktop
npm install
npm run dist
```
