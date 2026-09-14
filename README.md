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
![1355 tests](https://img.shields.io/badge/tests-1355%20passing-3da639)
![Touch ready](https://img.shields.io/badge/touch-ready-4c9fff)

> **▶ Pakai sekarang, tanpa instalasi:**
> https://samuelhtampubolon.github.io/TesserCADIna/
>
> **⬇ Unduh untuk dipakai offline:**
> [**Releases**](https://github.com/samuelhtampubolon/TesserCADIna/releases)
> — ambil **`.zip` Windows**, ekstrak, jalankan `TesserCADIna.exe`. Tidak ada installer,
> tidak perlu hak administrator. Ada build Linux juga. **There is no macOS build**:
> `.dmg` yang tidak ditandatangani ditolak Gatekeeper, jadi yang ditawarkan hanya
> versi web dan zip Windows/Linux. Ukuran unduhan Windows, **terukur di CI**:
> zip **135 MB**, installer NSIS **98 MB**. Itu berat Electron 44, bukan berat
> aplikasinya — sumber aplikasi ini sendiri sekitar 2 MB.
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

## Build desktop

Dijalankan di GitHub Actions saat Anda menandai rilis `v*`, atau secara lokal:

```bash
cd desktop
npm install
npm run dist
```

Artefak: `TesserCADIna-1.1.0-windows-x64.zip` dan installer NSIS per-pengguna.
Locale Chromium selain Inggris dan Indonesia dibuang, yang menghemat belasan MB.

Ukuran itu diperiksa setiap build: langkah **The Windows download is the size the
README promises** di `.github/workflows/desktop.yml` mencetak ukuran sebenarnya
dan menggagalkan build kalau melewati batas. Batasnya adalah penjaga regresi di
atas angka terukur sekarang, bukan target: kalau locale stripping lepas atau ada
yang ikut terbungkus, build merah alih-alih halaman ini diam-diam jadi salah.

> **Catatan jujur soal ukuran.** Halaman ini dulu menjanjikan zip "sekitar 80 MB,
> di bawah 90 MB". Sampai langkah pengukuran di atas ada, tidak ada yang pernah
> memeriksanya, dan ternyata tidak benar: Electron 44 saja sudah sebesar itu.
> Menurunkannya sampai 90 MB bukan soal menyetel konfigurasi — perlu memilih
> salah satu dari: format unduhan `.7z` (LZMA, sekitar 75 MB, tapi pengguna
> butuh 7-Zip), `compression: maximum` untuk installer (mungkin cukup untuk
> installer saja, tetapi LZMA solid kerap dicurigai antivirus), atau Electron
> versi lama. Ketiganya punya harga, jadi belum dipilih.

## Yang perlu Anda lakukan sendiri

Dua hal di bawah ini tidak bisa dilakukan sebuah workflow atas namanya sendiri.
Keduanya sengaja begitu: menerbitkan sesuatu ke publik adalah keputusan pemilik
repositori, bukan efek samping sebuah build.

1. **GitHub Pages** — Settings → Pages → Source: **GitHub Actions**. Satu kali
   saja, per repositori. Setelah itu setiap push ke `main` menerbitkan ulang
   halamannya sendiri.

2. **Rilis desktop** — halaman [Releases][rel] kosong sampai ada tag `v*`, dan
   tag itulah yang menyuruh Actions membangun serta melampirkan berkasnya.
   Nomor tag harus sama dengan `desktop/package.json`; workflow menolak tag yang
   tidak cocok, karena nama setiap berkas diambil dari manifes, bukan dari tag.

   Lewat peramban, tanpa baris perintah: **Releases → Draft a new release →
   Choose a tag →** ketik `v1.1.0` **→ Create new tag: v1.1.0 on publish →**
   Target: `main` **→ Publish release**. Build berjalan sekitar tiga menit, lalu
   berkasnya menempel sendiri ke rilis itu.

   Lewat baris perintah, yang juga memeriksa versi dan tag ganda lebih dulu:

   ```bash
   bash tools/release.sh --dry-run   # lihat apa yang akan ditandai
   bash tools/release.sh             # tandai dan dorong
   ```

   Tanda tangan kode Windows (sertifikat) tidak disertakan, jadi SmartScreen
   akan memperingatkan saat berkas pertama dijalankan. Yang tersedia sebagai
   gantinya adalah SHA-256 di samping tiap berkas dan atestasi provenance
   bertanda tangan — lihat [SECURITY.md](SECURITY.md).

**Belum menandai, tapi butuh `.exe`-nya sekarang?** Setiap build menyimpan
artefaknya di tab **Actions**: buka run **Desktop build** yang hijau, gulir ke
**Artifacts**, ambil `tessercadina-windows`. Isinya sama persis dengan yang akan
dilampirkan ke rilis (`TesserCADIna-1.1.0-setup.exe`,
`TesserCADIna-1.1.0-windows-x64.zip`, dan `.sha256` masing-masing). Bedanya:
artefak Actions hanya bisa diunduh sambil masuk ke akun GitHub, terbungkus satu
lapis zip tambahan, dan dihapus otomatis setelah 90 hari. Rilis tidak.

**Tidak ada build macOS** — pakai versi web, atau bangun sendiri dari `desktop/`.

[rel]: https://github.com/samuelhtampubolon/TesserCADIna/releases

## Lisensi

MIT. Lihat [LICENSE](LICENSE), [NOTICE](NOTICE), dan [ATTRIBUTION.md](ATTRIBUTION.md).
Mesin dan arsitektur berasal dari TesserCAD, MIT, © Samuel Tampubolon.
