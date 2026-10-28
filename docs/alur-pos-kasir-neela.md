# Alur POS Kasir Neela (Aplikasi Kasir Mobile) — Bahan Penjelasan Video

Dokumen ini untuk menyusun narasi video: urutan scene, apa yang tampil di layar, dan teks yang bisa dibacakan.

> **Catatan sumber.** Aplikasi kasir mobile (`pos_kasir_mobile`) ada di repo terpisah dan tidak ada di repo ini. Alur di bawah disusun dari yang bisa diverifikasi di repo `pos-cashier-fe`:
> - dashboard owner, yaitu tempat semua pengaturan yang dipakai kasir dibuat;
> - halaman self-order pelanggan;
> - README tiap modul, yang mencatat kontrak dengan aplikasi kasir;
> - tangkapan layar kasir di landing page (`src/assets/landing/*`);
> - Panduan Starter Neela (`docs/panduan-starter`).
>
> Tombol atau label persis di layar kasir mobile sebaiknya dicek sekali lagi saat merekam. Bagian yang berasal dari tangkapan layar landing (tablet/desktop) ditandai **[cek layar]**.

---

## 0. Gambaran besar (30–45 detik pembuka)

Neela POS terdiri dari tiga pihak yang saling terhubung lewat satu backend:

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│ OWNER        │     │ KASIR            │     │ PELANGGAN      │
│ Dashboard    │     │ Aplikasi Android │     │ HP sendiri     │
│ web          │     │ (tablet/HP)      │     │ scan QR meja   │
│              │     │                  │     │ (paket Pro)    │
│ atur menu,   │     │ buka shift,      │     │ pilih menu,    │
│ kasir,       │     │ buat pesanan,    │     │ kirim ke kasir │
│ perangkat,   │     │ terima bayar,    │     │                │
│ lihat laporan│     │ tutup shift      │     │                │
└──────┬───────┘     └────────┬─────────┘     └───────┬────────┘
       └──────────────────────┼───────────────────────┘
                              ▼
                   Backend pos-kasir-be
```

**Narasi:**
> "Neela POS punya tiga sisi. Pemilik toko mengatur semuanya lewat dashboard web. Kasir bekerja di aplikasi Android di tablet atau HP. Dan pelanggan, kalau toko memakai paket Pro, bisa memesan sendiri dari HP lewat QR di meja. Semuanya tersambung ke satu sistem, jadi apa yang diatur pemilik langsung dipakai kasir."

**Pesan kunci untuk diulang:** tunai dan shift tetap jalan tanpa internet. QRIS, kartu, dan transfer butuh internet.

---

## 1. Ringkasan alur dalam satu baris

```
Owner siapkan toko → Hubungkan perangkat (QR) → Kasir login PIN → Buka shift
   → Buat pesanan → Bayar → (Struk) → [ulangi] → Kas masuk/keluar & refund bila perlu
   → Tutup shift (hitung kas) → Owner pantau dashboard & laporan
```

Urutan scene yang disarankan ada di bagian 12.

---

## 2. Scene 1 — Persiapan oleh owner (sebelum kasir bisa bekerja)

Kasir tidak membuat apa pun dari nol. Semua yang dia pakai disiapkan owner di dashboard.

| Yang disiapkan | Menu di dashboard | Dipakai kasir untuk |
|---|---|---|
| Kategori menu | Menu → Kategori Menu | Filter katalog (mis. Coffee, Pastry, Meals) |
| Menu: foto, harga, stok, ketersediaan | Menu → Menu | Katalog yang dipilih saat buat pesanan |
| Tambahan menu (mis. *Gula Merah +Rp5.000*) | Menu → Tambahan | Opsi berbayar di tiap menu |
| Metode pembayaran | Metode Pembayaran | Tunai, Kartu, Transfer Bank, E-Wallet, QRIS |
| Jenis order | Jenis Order | Dine-in / Takeaway / Delivery, bisa diaktifkan dan diurutkan |
| Meja | Meja *(Pro)* | Nomor meja pada pesanan, dan QR self-order |
| Voucher dan Diskon Otomatis | Diskon → Voucher / Diskon Otomatis | Potongan di keranjang |
| Info toko | Pengaturan Bisnis | Nama, alamat, telepon, logo, pajak (%), footer struk |
| Akun kasir | Pengguna → Akun Kasir | Login kasir (username + PIN 6 digit) |
| Perangkat | Pengguna → Perangkat Kasir | Menghubungkan tablet/HP kasir |

**Narasi:**
> "Sebelum kasir mulai, pemilik menyiapkan toko di dashboard: menu lengkap dengan foto dan harga, metode pembayaran yang diterima, jenis order, pajak, sampai voucher dan diskon. Setiap perubahan di sini otomatis muncul di aplikasi kasir."

**Poin yang bisa disorot:**
- Menu yang ditandai *tidak tersedia* tampil sebagai **Sold Out** dan tidak bisa ditambahkan ke pesanan.
- Diskon otomatis per menu ditampilkan di kartu menu (harga coret dan badge persen, mis. "-17%").
- Stok bisa dilacak per menu. Kartu *Stok Hampir Habis* muncul di dashboard.
- Pajak diatur sekali di Pengaturan Bisnis, lalu dihitung otomatis di keranjang.

### Akun kasir

- Kasir login dengan **username + PIN 6 digit**, bukan email atau kata sandi.
- Kuota akun kasir aktif mengikuti paket: **Starter 1, Pro 2, Enterprise 5**. Add-on *Kasir Tambahan* menambah kuota.
- Menonaktifkan seorang kasir langsung membebaskan satu slot.
- Foto profil kasir (opsional) tampil di header aplikasi kasir.

---

## 3. Scene 2 — Menghubungkan perangkat kasir lewat QR

Hanya perangkat yang dipasangkan owner yang bisa dipakai login kasir. Ini mencegah akun kasir dipakai di perangkat sembarangan.

**Langkah (urut):**

1. **Owner:** buka *Pengguna → Perangkat Kasir → Hubungkan Perangkat*. Nama perangkat boleh diisi (opsional).
2. **Dashboard** menampilkan QR pairing dengan hitung mundur **10 menit**.
3. **Kasir:** buka aplikasi di tablet/HP lalu **scan QR** itu.
4. Aplikasi menukar kode QR dengan **token perangkat**, lalu menyimpannya. Token ini dikirim di setiap request berikutnya.
5. Dashboard memantau status tiap ±3 detik, lalu berubah menjadi **"Perangkat terhubung"**.

**Kalau perangkat tidak punya kamera** (PC/laptop Windows): aplikasi menyediakan form **Store ID + Pairing Token**. Owner bisa menyalin keduanya satu per satu, atau menyalin "kode lengkap" lalu menempelkannya sekali. Aplikasi memisahkan isinya otomatis.

**Aturan yang perlu disebut:**

| Aturan | Isi |
|---|---|
| Batas perangkat | Starter 2, Pro 4, Enterprise tak terbatas, ditambah add-on *Device Tambahan* |
| Kode QR kedaluwarsa | 10 menit. Bila lewat, tekan **Buat QR baru** |
| Cabut akses | Owner bisa mencabut perangkat kapan saja. Sesi kasir yang sedang berjalan terputus pada request berikutnya |
| Token terikat perangkat | Token login kasir tidak bisa dipindah ke perangkat lain |

**Narasi:**
> "Supaya aman, kasir hanya bisa login dari perangkat yang sudah dipasangkan. Pemilik membuat kode QR di dashboard, kasir memindainya dari aplikasi, dan dalam beberapa detik perangkat langsung terhubung. Kalau perangkat hilang atau diganti, pemilik cukup mencabut aksesnya."

---

## 4. Scene 3 — Login kasir

1. Buka aplikasi di perangkat yang sudah terhubung.
2. Masukkan **username** dan **PIN 6 digit**.
3. Setelah masuk, nama dan foto kasir tampil di header (**[cek layar]**: sapaan "Halo, Kasir!" dan nama kasir di pojok kanan atas).

**Menu utama kasir** (dari tangkapan layar landing, **[cek layar]** untuk versi mobile):

- **Dashboard**
- **Buat Pesanan**
- **Riwayat Pesanan**
- **Riwayat Refund**
- **Logout**

**Narasi:**
> "Kasir masuk dengan username dan PIN enam digit. Tidak perlu email, tidak perlu kata sandi panjang, jadi cepat di jam sibuk."

---

## 5. Scene 4 — Buka shift (saldo awal)

Kasir tidak bisa mulai berjualan sebelum shift dibuka.

**Layar "Mulai Shift Kerja Anda"** (**[cek layar]**):
- Menampilkan nama kasir dan jam saat ini.
- Satu kolom: **Masukkan Saldo Awal**, yaitu uang modal di laci (contoh di layar: Rp 500.000).
- Pengingat: *"Hitung uang di laci kas dengan teliti sebelum memulai. Jumlah ini akan dicatat sebagai saldo awal kas."*
- Tombol **Mulai Shift**.

**Poin penjelasan:**
- **Saldo awal bukan pendapatan.** Ini modal di laci, dipakai nanti untuk menghitung selisih kas.
- Shift **bisa dibuka dan ditutup tanpa internet**.
- Selama tidak ada shift terbuka, pesanan dari QR meja ditolak dengan pesan *NO_ACTIVE_SHIFT*.

**Narasi:**
> "Setiap hari kerja dimulai dengan membuka shift. Kasir menghitung uang di laci, memasukkan saldo awal, lalu menekan Mulai Shift. Angka ini jadi patokan untuk mencocokkan uang saat tutup shift nanti."

---

## 6. Scene 5 — Buat pesanan

Inti pekerjaan kasir. Layar **Buat Pesanan** (**[cek layar]**) terdiri dari katalog menu dan panel pesanan.

### 6a. Mengisi pesanan

1. **Cari / filter menu** lewat kolom pencarian atau chip kategori (All Items, Coffee, Pastry, Meals).
2. **Tekan + pada kartu menu** untuk menambah ke pesanan.
3. Bila menu punya **Tambahan** (mis. Gula Merah +Rp5.000), pilih opsinya. Harganya otomatis ditambahkan ke baris itu.
4. **Atur jumlah** dengan tombol − dan +.
5. **Add Note** untuk catatan khusus per item (mis. "Pedas Sedang", "Extra Santan").
6. Isi **Nama Customer** dan **Nomor Meja** (untuk dine-in).
7. Pilih **jenis order** (Dine-in, Takeaway, atau Delivery). Hanya yang diaktifkan owner yang tampil.

### 6b. Diskon & voucher

- **Diskon otomatis** per menu langsung terhitung: harga asli dicoret, ada label hemat (mis. *-Rp 15.000 OFF*). Server yang menghitung. Aplikasi tidak menghitung ulang sendiri.
- **Voucher** diterapkan lewat tombol **Discount** dengan memasukkan kode. Aturannya:
  - minimal belanja dicek setelah diskon otomatis;
  - ada batas maksimal potongan untuk voucher persen;
  - voucher kedaluwarsa otomatis nonaktif.
- Bila satu menu kena beberapa diskon, yang dipakai adalah **potongan terbesar**.

### 6c. Ringkasan di bawah panel

```
Subtotal            Rp 150.000
Tax (10%)           Rp  15.000
Voucher           - Rp  20.000
─────────────────────────────
Total               Rp 145.000
```

Tombol di bawahnya membawa kasir ke pembayaran. Angka contoh dari tangkapan layar landing.

**Narasi:**
> "Kasir memilih menu dari katalog, menambah opsi tambahan, mengatur jumlah, dan menulis catatan khusus kalau perlu. Diskon yang sudah diatur pemilik terhitung otomatis, dan voucher tinggal dimasukkan kodenya. Di bagian bawah, subtotal, pajak, potongan, dan total selalu terlihat jelas."

---

## 7. Scene 6 — Pesanan dari QR meja (khusus paket Pro)

Pelanggan bisa memesan sendiri. Kasir hanya menyetujui.

**Sisi pelanggan** (halaman `/pesan/:storeCode/:kodeMeja`, tanpa login):
1. Scan QR yang tercetak di meja.
2. Lihat menu dan pilih item, termasuk opsi tambahan.
3. Isi nama pemesan. Satu keranjang dibagi bersama oleh semua HP di meja yang sama.
4. Tekan **Kirim ke Kasir**. Halaman meminta lokasi, tapi tidak memblokir bila ditolak.
5. Pelanggan bisa memantau status pesanannya (diperbarui tiap ±5 detik).

**Sisi kasir:**
1. Pesanan masuk ke **antrean pending**.
2. Kasir melihat pesanan, termasuk penanda lokasi *di dalam / di luar / tidak diketahui* radius kafe. Ini hanya petunjuk, bukan blokir.
3. Kasir **menyetujui** pesanan. Sebelum disetujui, tidak ada yang dimasak dan tidak ada yang ditagih.
4. Setelah itu pesanan diproses seperti pesanan biasa, lalu dibayar di kasir.

**Perlindungan dari penyalahgunaan QR** (jelaskan singkat bila ditanya):
- Setiap pesanan wajib disetujui kasir.
- Maksimal 2 pesanan menunggu per meja.
- Keranjang dibatasi (20 per item, 60 total).
- Request dibatasi kecepatannya.
- Owner bisa **Ganti QR** meja kapan saja. QR lama langsung tidak berlaku.

**Pesan error yang mungkin dilihat pelanggan:** belum ada shift aktif, dine-in dinonaktifkan, meja nonaktif, masih ada pesanan menunggu di meja itu, terlalu banyak request, atau server bermasalah.

**Narasi:**
> "Di paket Pro, pelanggan bisa memesan sendiri dengan memindai QR di meja. Pesanan masuk ke antrean kasir sebagai pesanan menunggu. Kasir memeriksa lalu menyetujuinya, jadi tidak ada pesanan iseng yang langsung diproses."

---

## 8. Scene 7 — Pembayaran

Dari pesanan, kasir menekan bayar. Layar **Pembayaran** menampilkan **ID Pesanan** (contoh: `INV-20260101-100`) dan **Total Tagihan** (**[cek layar]**).

Metode yang tampil hanya yang **diaktifkan owner**: Tunai, Kartu, Transfer, E-Wallet, QRIS.

### 8a. Tunai
1. Pilih **Tunai**.
2. Isi **Uang Diterima**, bisa lewat tombol cepat nominal (+Rp 5, +Rp 10, +Rp 20, +Rp 50 ribu).
3. **Kembalian** terhitung otomatis. Contoh: tagihan Rp 13.200, diterima Rp 20.000, kembalian Rp 6.800.
4. Tekan **Confirm Payment**.

**Tunai bisa diproses tanpa internet.**

### 8b. QRIS
- **QRIS statis:** layar menampilkan kode QR toko. Kasir menunggu pelanggan membayar, memeriksa notifikasi dana masuk, lalu menekan **Confirm Payment**. Layar mengingatkan: *"Pastikan pembayaran telah diterima."*
- **QRIS dinamis (Pro):** toko menyambungkan akun Midtrans sendiri di dashboard (*Pengaturan → Pembayaran Online*). Uang masuk langsung ke akun toko.
- Butuh internet.

### 8c. Kartu, Transfer, E-Wallet
- **Kartu** debit/kredit: kasir bisa memilih bank bila perlu. Owner mengatur jenis kartu dan MDR.
- **Transfer Bank / E-Wallet:** kasir bisa menunjukkan **nomor rekening / nomor e-wallet dan nama pemilik** yang diisi owner, supaya pelanggan tahu ke mana harus transfer.
- Butuh internet.

### Aturan pembayaran penting
- Nominal pembayaran = **total tagihan**. Pelanggan **tidak dikenai biaya tambahan**.
- Untuk kartu, **MDR hanya dicatat** (untuk laporan), tidak ditagihkan ke pelanggan.
- Metode atau channel yang dinonaktifkan owner akan ditolak backend.
- Pesanan yang dibayar menjadi satu transaksi tercatat dengan kasir, metode bayar, dan waktu.

**Narasi:**
> "Untuk tunai, kasir cukup memasukkan uang yang diterima dan kembalian langsung dihitung. Untuk QRIS, kode pembayaran tampil di layar. Tunai tetap bisa jalan walau internet mati, sedangkan QRIS, kartu, dan transfer butuh koneksi karena diproses lewat penyedia pembayaran."

---

## 9. Scene 8 — Struk

- Struk berisi data dari **Pengaturan Bisnis**: logo, nama usaha, alamat, telepon, dan **footer struk** yang ditulis owner.
- Cetak lewat **printer Bluetooth atau USB di Android**.
- Windows memakai jalur cetak Windows sendiri.

> Format dan tombol struk di aplikasi mobile **[cek layar]**. Repo ini hanya memuat pengaturan datanya.

---

## 10. Scene 9 — Riwayat, refund, dan kas masuk/keluar

### Riwayat Pesanan
Daftar semua pesanan beserta detailnya: item, catatan, tambahan, ringkasan, dan pembayaran. Owner melihat data yang sama dari dashboard.

**Status pesanan:**
- *Menunggu*
- *Diproses*
- *Selesai*
- *Dibatalkan*
- *Direfund*

### Refund
- Dilakukan dari **Riwayat Pesanan / Riwayat Refund**, bisa **sebagian (per item)** atau penuh.
- Nilai refund = **harga item + bagian pajaknya**.
- Pesanan tetap *Selesai* selama baru sebagian item yang direfund. Statusnya jadi *Direfund* bila semua item dikembalikan.
- **Semua refund dibayar tunai dari laci**, apa pun metode bayar aslinya. Karena itu refund mengurangi uang yang seharusnya ada di laci.

### Kas masuk / kas keluar
- Untuk uang yang bergerak di luar penjualan, misalnya beli es batu (keluar) atau tambah uang receh (masuk).
- Wajib diisi **keterangan**.
- Langsung memengaruhi perhitungan "uang seharusnya ada".

**Narasi:**
> "Kalau ada pesanan yang perlu dikembalikan, refund bisa dilakukan per item. Uang refund keluar dari laci, jadi sistem ikut mengurangi kas yang seharusnya ada. Pengeluaran kecil di luar penjualan, seperti beli es batu, dicatat sebagai kas keluar lengkap dengan keterangan."

---

## 11. Scene 10 — Tutup shift (hitung kas)

Bagian yang paling sering ditanya: **bagaimana uang di laci dicocokkan.**

**Langkah:**
1. Kasir **menghitung uang fisik** di laci.
2. Memasukkan jumlah itu sebagai **kas aktual** (saldo akhir).
3. Sistem menampilkan **kas yang diharapkan** dan **selisih**.
4. Bila selisih tidak nol, kasir **wajib menulis catatan**.
5. Tekan tutup shift. Shift berakhir dan hasil rekonsiliasi tersimpan.

**Rumus:**

```
Kas yang Diharapkan = Saldo Awal
                      + Penjualan Tunai
                      + Kas Masuk
                      − Kas Keluar
                      − Refund (tunai)

Selisih = Kas Aktual − Kas yang Diharapkan
```

**Cara membacanya:**

| Hasil | Arti | Warna di dashboard |
|---|---|---|
| Selisih = 0 | Uang pas | Hijau |
| Selisih > 0 | Uang lebih | Kuning |
| Selisih < 0 | Uang kurang | Merah |

**Yang dihitung sebagai "penjualan tunai":** total pesanan yang dibayar tunai, **bukan** uang yang diserahkan pelanggan. Kembalian hanya menukar uang, jadi tidak ikut dihitung.

**Pendapatan:** `Total Pendapatan = Tunai + Non-Tunai − Refund`. Saldo awal tidak pernah dihitung sebagai pendapatan.

**Narasi:**
> "Saat shift berakhir, kasir menghitung uang di laci dan memasukkannya ke aplikasi. Sistem membandingkannya dengan uang yang seharusnya ada, yaitu saldo awal ditambah penjualan tunai, ditambah kas masuk, dikurangi kas keluar dan refund. Kalau ada selisih, langsung terlihat dan kasir menuliskan alasannya."

---

## 12. Scene 11 — Owner memantau hasilnya

Setelah shift berjalan, owner melihat hasilnya di dashboard web, kapan saja dan dari mana saja.

**Dashboard (shift yang sedang berjalan):**
- **Ringkasan penjualan:** Total Pendapatan, Total Pesanan, Tunai, Non-Tunai, Refund.
- **Uang di laci:** Uang Modal Awal, Uang Seharusnya Ada, Uang Hasil Hitung, Uang Kurang/Lebih.
- Menu terpopuler, komposisi metode bayar (donut), tren penjualan 7/30 hari, stok hampir habis, komposisi jenis order.
- Kartu **Batas Transaksi Harian** (Starter ±80, penanda saja, kasir **tidak diblokir**).
- Owner juga bisa **Catat Kas** dan **Tutup Shift** langsung dari dashboard.

**Laporan** (Pro, atau add-on *Laporan Lengkap* di Starter):
- **Laporan Keuangan:** ringkasan, metode bayar, diskon, pajak, performa kasir, kategori, jam ramai, produk terlaris, detail transaksi, ekspor Excel.
- **Laporan Kas:** ringkasan shift, transaksi tiap shift, rekap kasir, tren selisih, dan anomali selisih kas.

**Narasi:**
> "Di sisi pemilik, semua transaksi kasir langsung terlihat: omzet, metode pembayaran, menu terlaris, sampai selisih kas tiap shift. Kalau ada kasir yang sering selisih, laporan kas menandainya sebagai anomali."

---

## 13. Online vs offline (tampilkan sebagai satu slide ringkas)

| Tetap jalan **tanpa internet** | Butuh **internet** |
|---|---|
| Pesanan dan pembayaran **tunai** | Pembayaran **QRIS** |
| **Buka dan tutup shift** | Pembayaran **kartu** |
| **Hitung kas** di laci | Pembayaran **transfer** / e-wallet |
| | Pesanan **QR meja** dari pelanggan |
| | Pengiriman data ke pusat dan laporan |

Data yang tersimpan saat offline **terkirim otomatis** begitu internet kembali, tanpa input ulang.

> Jangan menjanjikan lebih dari ini: aplikasi **tidak** berjalan sepenuhnya offline.

---

## 14. Batas per paket (untuk slide penutup)

| | Starter | Pro | Enterprise |
|---|---|---|---|
| Akun kasir aktif | 1 | 2 | 5 |
| Perangkat | 2 | 4 | Tanpa batas |
| Transaksi harian | ±80 (penanda) | Tanpa batas | Tanpa batas |
| Kasir, shift, voucher dan diskon, tunai offline | Ya | Ya | Ya |
| Laporan | Add-on | Ya | Ya |
| Inventori bahan baku dan resep | Add-on | Ya | Ya |
| QR self-order, Kelola Meja, QRIS dinamis | Tidak | Ya | Ya |

Add-on: *Laporan Lengkap*, *Inventori Lengkap*, *Kasir Tambahan*, *Device Tambahan* (Rp30.000 per bulan per perangkat).

> **Cek dulu sebelum menyebut angka di video:** harga dan batas harian masih ada selisih antara price list dan backend (lihat `docs/panduan-starter/CATATAN-SELISIH.md`). Batas harian Starter tertulis ±50 di price list, tetapi 80 di backend. Paling aman sebut "sekitar 80 transaksi per hari, sebagai penanda kapasitas".

---

## 15. Susunan scene video yang disarankan

Total sekitar 6–8 menit.

| # | Scene | Layar yang direkam | Durasi |
|---|---|---|---|
| 1 | Gambaran besar: owner, kasir, pelanggan | Slide diagram bagian 0 | 0:40 |
| 2 | Owner menyiapkan toko | Dashboard: Menu, Metode Pembayaran, Pengaturan Bisnis | 1:00 |
| 3 | Hubungkan perangkat lewat QR | Dashboard (QR) + aplikasi kasir (scan) | 0:50 |
| 4 | Login kasir dan buka shift | Aplikasi: login PIN, Mulai Shift | 0:45 |
| 5 | Buat pesanan (menu, tambahan, catatan, voucher) | Aplikasi: Buat Pesanan | 1:15 |
| 6 | Pesanan QR meja (Pro) | HP pelanggan + antrean kasir | 0:50 |
| 7 | Bayar tunai dan QRIS | Aplikasi: layar Pembayaran | 1:00 |
| 8 | Refund dan kas masuk/keluar | Aplikasi: Riwayat, Catat Kas | 0:40 |
| 9 | Tutup shift, hitung kas, selisih | Aplikasi: Tutup Shift | 1:00 |
| 10 | Owner melihat dashboard dan laporan | Dashboard + Laporan Kas | 0:50 |
| 11 | Offline vs online, batas paket, penutup | Slide bagian 13–14 | 0:40 |

**Tips merekam:**
- Siapkan data demo dulu: 8–10 menu berfoto, satu menu bertanda Sold Out, satu menu berdiskon, satu menu dengan tambahan, satu voucher aktif.
- Siapkan dua metode bayar aktif (Tunai dan QRIS) agar pindah metode terlihat.
- Rekam tutup shift **dengan selisih** (mis. kurang Rp 5.000) agar warna dan wajibnya catatan terlihat. Satu rekaman dengan hasil "pas" juga berguna untuk perbandingan.
- Gunakan akun demo. Jangan tampilkan PIN kasir asli, token pairing, atau server key Midtrans di layar.
- Tampilkan sekali pesan offline, misalnya mode pesawat saat bayar tunai, karena itu pembeda utama Neela.

---

## 16. Hal yang belum terverifikasi dari repo ini

Cek di aplikasi mobile sebelum merekam:

1. Label tombol dan urutan menu di versi **mobile** (tangkapan layar landing berukuran tablet/desktop).
2. Apakah layar kasir menampilkan penanda lokasi pesanan QR (*guest_geo_status*) sebagai teks atau ikon. Backend mewajibkan aplikasi menampilkannya.
3. Format struk dan tombol cetak.
4. Apakah catatan wajib saat selisih ≠ 0 juga berlaku di aplikasi kasir. Yang terverifikasi hanya di dialog **Tutup Shift** dashboard owner.
5. Nama persis tombol pembatalan pesanan dan alurnya di aplikasi kasir.
6. Pembayaran *Transfer*/*E-Wallet* di aplikasi: apakah ada pilihan bank atau e-wallet saat konfirmasi.
