# Proses Bisnis Landing Page Neela POS

Dokumen ini menjelaskan **proses bisnis halaman landing saja**: siapa yang datang, apa yang mereka lihat, ke mana mereka diarahkan, dan apa yang terjadi sesudah mereka bertindak. Tidak membahas implementasi teknis atau desain visual.

## 1. Tujuan halaman

Mengubah pengunjung (pemilik atau pengelola kafe/restoran) menjadi **pendaftar toko Neela POS** atau **prospek yang berbicara dengan tim lewat WhatsApp**.

Halaman ini tidak menjual langsung dan tidak menerima pembayaran. Ia menjelaskan produk, memperlihatkan pilihan paket, lalu mengarahkan ke dua jalur: daftar sendiri atau konsultasi.

## 2. Siapa pengunjungnya

| Pengunjung | Kebutuhan | Yang dicari di halaman |
|---|---|---|
| Pemilik kafe/restoran/kedai (calon pelanggan) | Kasir yang tidak berhenti saat internet putus, kas dan stok yang cocok | Janji utama, tur produk, harga |
| Pemilik yang sudah mendaftar | Cek status pendaftaran atau masuk ke dashboard | Tautan Masuk dan Status pendaftaran |
| Pemilik yang sudah login | Langsung ke dashboard | Tombol utama berubah menjadi "Buka Dashboard" |
| Pemilik usaha besar atau kebutuhan khusus | Penawaran sendiri | Paket Enterprise dan WhatsApp |

## 3. Alur pengunjung

```
Datang (iklan, pencarian, rekomendasi, tautan)
   │
   ▼
Hero: memahami janji utama dalam beberapa detik
   │
   ▼
Fakta singkat → Masalah yang diselesaikan
   │
   ▼
Tur produk → Mode offline → Fitur → Pilihan metode/tipe/perangkat
   │
   ▼
Paket dan harga (+ perbandingan)
   │
   ├── Yakin ──────────────► Daftar  (/daftar, bisa membawa pilihan paket)
   ├── Butuh penjelasan ───► Konsultasi via WhatsApp
   ├── Sudah punya akun ───► Masuk / Buka Dashboard
   └── Masih ragu ─────────► FAQ → Early access → CTA penutup
```

Setiap bagian punya satu tugas:

| Bagian | Tugas bisnis |
|---|---|
| Hero | Menyampaikan satu janji: kasir tetap jalan saat internet putus. Dua tombol: Daftar dan WhatsApp. |
| Fakta singkat | Menjawab cepat: platform, pembayaran, cetak struk. |
| Masalah → solusi | Membuat pengunjung merasa dipahami (internet putus, catatan berantakan, stok dan kas tidak cocok). |
| Tur produk | Membuktikan produk nyata lewat layar aplikasi. |
| Mode offline | Menjelaskan jujur apa yang tetap jalan dan apa yang butuh internet. |
| Fitur dan Pilihan Anda | Menunjukkan kelengkapan dan opsi yang bisa diatur pemilik. |
| Self-order QR (Pro) | Menjadi alasan naik ke paket Pro. |
| Paket dan harga | Memudahkan keputusan dengan harga terbuka. |
| Early access | Menggantikan testimoni sampai ada pelanggan yang bisa dikutip. |
| FAQ | Menghilangkan keberatan terakhir. |
| CTA penutup | Mengulang dua jalur tindakan. |

## 4. Jalur konversi dan apa yang terjadi sesudahnya

### 4.1 Daftar sendiri (`/daftar`)
1. Pengunjung mengisi data toko di halaman pendaftaran (pilihan paket bisa terbawa dari landing, mis. `?paket=starter` atau `?paket=pro`).
2. **Setiap pendaftaran baru diperiksa dan disetujui dulu oleh tim admin** sebelum toko aktif.
3. Starter dan Pro dibayar lewat **QRIS** saat pendaftaran. Masa langganan 30 hari dihitung **sejak disetujui**, bukan sejak dibayar.
4. Pendaftar mengecek perkembangan di halaman **Status pendaftaran** dengan email dan kata sandi.
5. Setelah disetujui, owner masuk ke dashboard, menyiapkan menu, membuat akun kasir, dan menghubungkan perangkat kasir lewat QR.

### 4.2 Konsultasi via WhatsApp
- Untuk pertanyaan, demo, dan paket **Enterprise** (penawaran sesuai kebutuhan, tidak dibeli sendiri).
- Dilayani tim setiap hari **07.00 – 24.00 WIB**.
- Nomor sales diatur lewat konfigurasi (`VITE_SALES_WA`); pastikan nomor produksi sudah diisi sebelum rilis.

### 4.3 Masuk
- Pengguna lama memakai tautan **Masuk**. Bila sesi owner masih aktif, tombol utama berganti menjadi **Buka Dashboard**.

## 5. Paket dan aturan harga yang ditampilkan

Harga per toko per bulan, belum termasuk PPN.

| Paket | Harga tampil | Kuota | Isi utama |
|---|---|---|---|
| Starter | Rp99.000 | 1 kasir, 2 perangkat | Kasir, shift, hitung kas, voucher dan diskon, offline untuk tunai |
| Pro | Rp180.000 | 2 kasir, 4 perangkat | Starter + laporan, stok per bahan dan resep, self-order QR, Kelola Meja, QRIS dinamis |
| Enterprise | Mulai Rp290.000 | 5 kasir, perangkat tanpa batas | Pro + penawaran khusus lewat sales |

- **Perangkat tambahan:** Rp30.000 per bulan per perangkat.
- Pembelian dan perpanjangan Starter/Pro lewat QRIS dari dashboard. Penagihan memakai siklus 30 hari; **belum ada penagihan tahunan**.
- Naik paket tidak menghitung sisa hari paket lama; turun paket ditolak.

## 6. Aturan isi (apa yang boleh dan tidak boleh dijanjikan)

Landing hanya boleh menyebut hal yang **sudah ada**:
- Offline untuk **pesanan tunai dan shift**; QRIS, kartu, dan transfer butuh internet.
- Android dan Windows; cetak struk Bluetooth dan USB hanya di Android.
- QRIS dinamis, self-order QR, laporan, dan stok per bahan adalah fitur **Pro**.

Landing **tidak boleh** menjanjikan: trial 14 hari, batas transaksi yang "tidak memblokir", multi-outlet, split bill, laba-rugi/margin, integrasi akuntansi, backup terjadwal, ekspor PDF, cetak dari Windows, scan barcode produk, kitchen display, loyalty/CRM, integrasi GoFood dkk, iOS, serta logo pelanggan, testimoni, rating, atau angka metrik yang belum ada.

## 7. Bukti sosial: mode early access

Belum ada pelanggan yang bisa dikutip, jadi bagian testimoni diganti **program early access**: pendampingan setup, masukan pelanggan menentukan prioritas, dan dukungan WhatsApp. Saat pelanggan pertama bersedia dikutip, bagian ini diganti testimoni bernama beserta jenis usaha dan hasil nyata.

## 8. Dukungan dan tanggung jawab

| Hal | Penanggung jawab |
|---|---|
| Menyetujui pendaftaran baru | Tim admin |
| Menjawab WhatsApp dan demo | Tim sales/support (07.00–24.00 WIB) |
| Harga dan paket yang tampil | Pemilik produk, harus sama dengan tabel paket produksi |
| Kebenaran klaim di halaman | Pemilik produk, mengacu bab 6 |
| Konten halaman (teks, FAQ, harga) | Satu sumber: berkas konten landing di `pos-cashier-fe` |

## 9. Ukuran keberhasilan (usulan)

Belum ada analitik yang terpasang; angka di bawah baru bisa diukur setelah dipasang.

- Kunjungan unik dan sumber kunjungan.
- Klik **Daftar** dan klik **WhatsApp** per bagian halaman.
- Rasio pendaftaran selesai terhadap kunjungan, dan rasio pendaftaran yang disetujui.
- Pilihan paket yang paling sering dipilih (Starter vs Pro).
- Pertanyaan yang paling sering muncul di WhatsApp, sebagai bahan memperbarui FAQ.

## 10. Hal yang perlu diputuskan atau diperiksa sebelum rilis

1. **Harga:** harga tampil di landing berasal dari berkas pricing di web; data paket di backend masih memakai angka contoh. Samakan keduanya, karena pembayaran memakai harga backend.
2. **Pendaftaran gratis:** pendaftaran Starter tanpa bayar tidak punya masa berlaku di backend dan tetap perlu persetujuan admin. Putuskan apakah itu boleh disebut "gratis" atau cukup "Daftar".
3. **Nomor WhatsApp produksi** dan jam layanan harus dipastikan.
4. **Biaya setup:** bila ada, putuskan kapan dan bagaimana ditampilkan; landing sengaja belum menyebut "setup gratis".
5. **Legalitas dan kebijakan:** nama badan usaha, alamat, kebijakan privasi, dan syarat layanan belum dicantumkan.
6. **Analitik:** pilih alat dan pastikan persetujuan penggunaan data pengunjung.
