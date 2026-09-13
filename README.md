# TesserCADIna

**Studio CAD parametrik berbahasa Indonesia yang berjalan sepenuhnya di peramban.**
Pemodelan solid 3D, drafting 2D, dan simulasi 4D (tiga dimensi plus waktu).
Satuan metrik, gambar kerja sudut pertama ISO/SNI, lebih ringan dari TesserCAD.

![MIT licence](https://img.shields.io/badge/licence-MIT-3da639)
![No build step](https://img.shields.io/badge/build-none-4c9fff)
![Bahasa Indonesia](https://img.shields.io/badge/UI-Bahasa%20Indonesia-4c9fff)
![202 commands](https://img.shields.io/badge/commands-202-8957e5)
![1309 tests](https://img.shields.io/badge/tests-1309%20passing-3da639)
![Touch ready](https://img.shields.io/badge/touch-ready-4c9fff)

> **▶ Pakai sekarang, tanpa instalasi:**
> https://samuelhtampubolon.github.io/TesserCADIna/
>
> **⬇ Unduh untuk dipakai offline:**
> [**Releases**](https://github.com/samuelhtampubolon/TesserCADIna/releases)
> — ambil **`.zip` Windows**, ekstrak, jalankan `TesserCADIna.exe`. Tidak ada installer,
> tidak perlu hak administrator. Ada build Linux juga. **There is no macOS build**:
> `.dmg` yang tidak ditandatangani ditolak Gatekeeper, jadi yang ditawarkan hanya
> versi web dan zip Windows/Linux. Target ukuran exe/zip Windows: **sekitar 80 MB,
> di bawah 90 MB** (Chromium locale hanya `en-US` dan `id`).
>
> Salinan web juga bekerja offline setelah dibuka: **Bantuan → Offline dan
> kepemilikan** memasangnya, lalu jaringan boleh dimatikan.

TesserCADIna adalah edisi Bahasa Indonesia yang lebih ringan dari
[TesserCAD](https://github.com/samuelhtampubolon/TesserCAD): mesin geometri, Boolean,
command registry, Design Doctor, gambar kerja, toleransi, dan simulasi 4D yang sama
(sekitar 85–95%), dengan antarmuka sepenuhnya Bahasa Indonesia kecuali istilah CAD
yang sudah akrab (Extrude, Boolean, STL, Gizmo, Undo, Draft, Snap, Ortho, ISO, DXF).

## Yang ada di dalamnya

| | Gaya SolidWorks | Gaya AutoCAD | Dimensi keempat |
|---|---|---|---|
| **Workspace** | **Model** | **Draft** | **Simulasi** |
| Riwayat fitur parametrik | ✔ | | |
| Primitif solid + boolean | ✔ | | |
| Extrude / revolve sketch | ✔ | ✔ | |
| Pattern, mirror, transform | ✔ | ✔ | |
| Layer, object snap, dimensi | | ✔ | |
| Tukar DXF / SVG | | ✔ | |
| Timeline, keyframe, easing | | | ✔ |
| Urutan konstruksi (4D BIM) | | | ✔ |
| Dinamika rigid-body & motor | | | ✔ |
| Rekam video animasi | | | ✔ |

Semua dikendalikan **parameter bernama**. Ketik `plate_w / 2 - clearance` di field
dimensi mana pun — itulah yang membuat ini CAD, bukan program gambar 3D.

Satuan internal selalu milimeter. Mata uang default studio: **Rp**. Proyeksi gambar
kerja default: **sudut pertama (ISO/SNI)**. Kertas A4/A3.

## Menjalankan secara lokal

Tidak ada langkah build. Sajikan folder ini:

```bash
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`. `npm test` menjalankan suite headless.

## Build desktop (Windows zip ~80 MB)

Dijalankan di GitHub Actions saat Anda menandai rilis `v*`, atau secara lokal:

```bash
cd desktop
npm install
npm run dist
```

Artefak: `TesserCADIna-1.0.0-windows-x64.zip` dan installer NSIS per-pengguna.
Locale Chromium selain Inggris dan Indonesia dibuang agar ukuran tetap di bawah 90 MB.

## Yang perlu Anda lakukan sendiri

1. **GitHub Pages** — Settings → Pages → Source: GitHub Actions. Workflow tidak
   bisa mengaktifkannya sendiri.
2. **Rilis desktop** — buat tag `v1.0.0` (harus sama dengan `desktop/package.json`)
   agar Actions membangun zip Windows/Linux. Tanda tangan kode Windows (sertifikat)
   tidak disertakan; zip unsigned.
3. **Tidak ada build macOS** — pakai versi web, atau bangun sendiri dari `desktop/`.

## Lisensi

MIT. Lihat [LICENSE](LICENSE), [NOTICE](NOTICE), dan [ATTRIBUTION.md](ATTRIBUTION.md).
Mesin dan arsitektur berasal dari TesserCAD, MIT, © Samuel Tampubolon.
