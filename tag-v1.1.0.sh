#!/usr/bin/env bash
# Membuat tag v1.1.0 pada commit merge di main dan mendorongnya.
# Mendorong tag v* memicu workflow "Desktop build", yang membangun artefak
# Windows dan Linux lalu menerbitkan GitHub Release publik.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
git fetch origin main
git tag -a v1.1.0 4df931fca0ed0f437fb64ddec5853926f79b3271 -F - <<'MSG'
TesserCADIna 1.1.0

Rilis ini adalah hasil audit keselamatan, keandalan, dan keamanan atas
seluruh pohon sumber: apa yang disentuh aplikasi di komputer Anda, apa
yang dikirimnya ke jaringan, dan apa yang disimpannya secara lokal.

Yang diperbaiki

* Penyekatan berkas pada pembungkus desktop. Protokol app:// memeriksa
  jalur setelah resolusi tautan simbolik, bukan sebelumnya. Sebelum ini
  sebuah symlink di dalam folder aplikasi dapat menunjuk ke berkas di
  luarnya dan tetap dilayani. Sekarang basis dan target sama-sama
  di-realpath, keduanya harus tetap di dalam, dan daftar ekstensi yang
  diizinkan diuji terhadap berkas nyata.

* Perangkat keras ditolak secara menyeluruh. Jendela aplikasi tidak lagi
  dapat meminta USB, serial, HID, atau Bluetooth. Studio CAD ini tidak
  membutuhkannya, jadi permintaan ditolak di tingkat sesi, bukan
  diserahkan pada dialog izin.

* Rantai pasok build. Setiap workflow kini menyatakan permissions-nya
  sendiri secara eksplisit, dan setiap action pihak ketiga dipaku pada
  SHA commit, bukan pada tag yang dapat dipindahkan.

Yang diperiksa dan ternyata sudah benar

Isolasi konteks, sandbox, dan penolakan navigasi keluar pada pembungkus
desktop; kebijakan host-resolver yang memutus jaringan sepenuhnya;
service worker yang hanya melayani asal yang sama; CSP dengan import map
yang dipaku hash; serta penyimpanan lokal yang tidak lagi berbenturan
dengan TesserCAD. Rinciannya ada di SECURITY.md, bagian "The 1.1.0
audit".

Verifikasi

944 pemeriksaan headless di 17 suite, 80 di antaranya khusus keamanan,
ditambah suite peramban. Setiap artefak di bawah ini disertai SHA-256
dan atestasi provenance yang ditandatangani, sehingga dapat ditelusuri
ke commit dan workflow yang menghasilkannya.

Unduhan Windows: zip sekitar 135 MB, penginstal sekitar 98 MB.
MSG

git push origin v1.1.0
echo "Tag v1.1.0 terdorong. Pantau: Actions > Desktop build."
