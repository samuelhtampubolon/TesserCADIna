# TesserCADIna

**Studio CAD parametrik berbahasa Indonesia yang berjalan sepenuhnya di peramban.**
Pemodelan solid 3D, drafting 2D, dan simulasi 4D (tiga dimensi plus waktu).
Satuan metrik, gambar kerja sudut pertama ISO/SNI. Unduhan desktopnya lebih
ringan dari TesserCAD; salinan webnya membawa kamusnya sendiri, jadi sedikit
lebih besar. Angkanya ada di bawah.

![MIT licence](https://img.shields.io/badge/licence-MIT-3da639)
![No build step](https://img.shields.io/badge/build-none-4c9fff)
![Bahasa Indonesia](https://img.shields.io/badge/UI-Bahasa%20Indonesia-4c9fff)
![202 commands](https://img.shields.io/badge/commands-202-8957e5)
![1346 tests](https://img.shields.io/badge/tests-1346%20passing-3da639)
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

TesserCADIna adalah edisi Bahasa Indonesia dari
[TesserCAD](https://github.com/samuelhtampubolon/TesserCAD): mesin geometri, Boolean,
command registry, Design Doctor, gambar kerja, toleransi, dan simulasi 4D yang sama,
dengan antarmuka sepenuhnya Bahasa Indonesia kecuali istilah CAD yang sudah akrab
(Extrude, Boolean, STL, Gizmo, Undo, Draft, Snap, Ortho, ISO, DXF).

### Seberapa dekat dengan TesserCAD, diukur bukan diklaim

```bash
node tools/parity.mjs ../TesserCAD      # butuh salinan TesserCAD di sebelahnya
```

| | |
|---|---|
| Perintah | **202 di sini, 202 di TesserCAD** — tidak ada satu pun yang hilang |
| API modul | tidak ada ekspor TesserCAD yang absen di sini |
| Sumber yang sama persis | **89,6%** (22.713 dari 25.355 baris) |
| Yang baru atau berubah | 10,4% — hampir seluruhnya kamus dan i18n |
| Unduhan web (gzip) | 0,60 MB di sini, 0,53 MB di TesserCAD (**+11,8%**) |
| Unduhan desktop | lebih kecil: hanya locale `en-US` dan `id`, TesserCAD membawa semuanya |

Jadi "lebih ringan" berlaku untuk `.exe`-nya, bukan untuk halaman webnya. Kamus
1.938 baris itu harus ikut terkirim, dan itulah harga antarmuka yang benar-benar
berbahasa Indonesia. Angka di tabel ini dihasilkan `tools/parity.mjs`, jadi siapa
pun bisa memeriksanya sendiri.

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
