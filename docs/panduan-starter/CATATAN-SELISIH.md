# Catatan Selisih untuk Tim Produk/Dev (bukan bagian guidebook owner)

Sumber harga dan fitur paket: **Price List POS Kasir (Asta Studio)**. FE dan guidebook sudah disesuaikan dengannya. Berikut hal yang masih **tidak sinkron dengan BE/aplikasi** dan perlu keputusan.

## A. Sudah disesuaikan di FE & guidebook
- Harga bulanan: Starter Rp99.000, Pro Rp180.000, Enterprise mulai Rp290.000 (custom quote).
- **Bayar tahunan dimatikan sementara** lewat flag `ANNUAL_BILLING_ENABLED = false` di `modules/public/shared/pricing.ts` (toggle landing disembunyikan, teks tahunan hilang dari landing, halaman Paket & Addon, dan guidebook). Data harga tahunan (Rp990.000 / Rp1.800.000 / Rp2.900.000, bayar 10 bulan pakai 12) tetap tersimpan di `ANNUAL_PRICE`. Alasan: BE hanya menjual paket 30 hari dan belum punya prorata untuk upgrade di tengah masa langganan. Sebelum menyalakan lagi, putuskan aturan upgrade/downgrade/refund tahunan.
- Batas lunak Starter ±50/hari, pembatasan baru bila terlampaui 3 hari berturut-turut; opsional overage Rp300/transaksi.
- Daftar fitur Starter/Pro/Enterprise di landing mengikuti tabel perbandingan price list (Starter tidak lagi mengklaim voucher/diskon, stok & notifikasi, laporan; Pro: 3 outlet, 4 perangkat; Enterprise: outlet unlimited, hapus "+Rp150.000 per outlet").
- Halaman Paket & Addon (owner) menampilkan Device Tambahan Rp30.000/bln per device dan Overage Rp300/transaksi. Tiga add-on di BE tampil "Harga: hubungi tim Neela".

## B. Selisih price list vs BE/aplikasi (perlu keputusan)
1. **Add-on**: sekarang owner bisa membeli sendiri lewat QRIS (halaman Paket & Addon): *Laporan Lengkap*, *Inventori Lengkap* (`REPORTS`, `INVENTORY`) dan *Device Tambahan* (`EXTRA_DEVICE`, per unit, batas device ditegakkan BE: Starter 2, Pro 4). Harganya ada di tabel pusat `addon_catalog` — **Laporan dan Inventori di-seed nonaktif/harga 0, isi harga price list lalu nyalakan** (`UPDATE addon_catalog SET price=..., is_active=1 WHERE code='REPORTS'`). Masih manual lewat WA: *Kasir Tambahan* (`EXTRA_CASHIER`, tanpa harga di price list) dan *Overage transaksi* (tidak ada logika penagihannya).
2. **Batas harian**: price list ±50; BE `StarterDailyTransactionLimit = 80` (`pos-kasir-be/internal/common/plan/plan.go:16`). Hanya widget; tidak ada logika "3 hari berturut-turut".
3. **Starter dan diskon/notifikasi stok**: price list menandai voucher+diskon otomatis dan notifikasi stok hampir habis sebagai Pro ke atas; di BE keduanya terbuka untuk semua paket (`discount` ada di fitur Starter; `/master/menus/low-stock` tanpa gate). Sidebar Starter masih menampilkan Voucher dan Diskon Otomatis.
4. **Outlet & perangkat**: price list Starter 1 outlet/2 device, Pro 3 outlet/4 device. BE kini membatasi **device** yang terpasang lewat QR (Starter 2, Pro 4, Enterprise tak terbatas, + add-on Device Tambahan); outlet tidak dibatasi. Akun kasir tetap dibatasi terpisah (Starter 1, Pro 2, Enterprise 5).
5. **Upgrade di tengah masa langganan (bulanan)**: BE tidak punya prorata. Owner kini bisa upgrade Starter → Pro sendiri lewat QRIS; masa aktif dihitung ulang dari hari bayar dan sisa hari paket lama hangus — dialog pembayaran memperingatkan ini sebelum bayar. Turun paket dan Enterprise ditolak BE (lewat tim Neela). Admin internal tetap bisa mengganti paket tanpa mengubah `renew_at`.
6. **Trial 14 hari** (masih di landing) tidak ada di price list maupun BE; daftar tanpa bayar menghasilkan `renew_at = NULL`.
7. **"Gratis asistensi setup via WhatsApp"** (halaman daftar) vs price list: setup & training Rp500.000 (bisa gratis sebagai promo tahun pertama), input menu awal Rp200.000.
8. **Support**: price list menaruh "support prioritas" hanya di Enterprise; copy "Support prioritas (< 3 menit)" di Pro sudah dihapus dari landing.
9. **"Tanpa kontrak / batalkan kapan saja"** masih di landing; tidak ada di price list.
10. Fitur Pro/Enterprise di landing yang tidak ada di price list dan tidak diverifikasi di BE (dipertahankan): split bill & pindah meja, analisa menu terlaris & margin, transfer stok antar cabang, role supervisor & otorisasi void, integrasi akuntansi REST API.

## C. Perilaku BE yang perlu diketahui
- `stores.renew_at` tidak ditegakkan middleware mana pun; status `suspended` juga tidak dibaca saat runtime (`pos-kasir-be/CLAUDE.md:92`).
- Reaktivasi kasir tidak mengecek kuota (`auth_service.go:391-401`).
- Add-on bisa diaktifkan admin internal (`/internal/stores/:id/addons`, tanpa masa berlaku) **atau** dibeli owner (`POST /subscriptions/addon-payments`, 30 hari, `store_addon.expires_at`). Add-on yang kedaluwarsa tidak lagi dihitung aktif; yang dari admin (`expires_at` NULL) tidak pernah kedaluwarsa.
- Seed `subscription_plan` di BE masih placeholder (Starter Rp100.000, Pro Rp250.000); harga asli ada di tabel produksi, **harus disamakan dengan price list (Starter 99.000, Pro 180.000)** karena FE kini menampilkan harga dari BE di halaman Paket & Addon.
- Skema DB pusat butuh `addon_catalog`, kolom `store_addon.expires_at` dan kolom `subscription_payment.kind/addon_code/qty` sebelum BE ini dideploy (SQL di `pos-kasir-be/app.env.example`).
- Cache plan/entitlement BE 60 detik; FE `capabilities` staleTime 5 menit.

## D. Temuan FE
- `REGISTRATION_NOT_PAYABLE` menyuruh "Masuk ke portal untuk membeli paket", padahal portal tidak punya alur beli.
- `contactLink()` mengembalikan `undefined` bila `VITE_SALES_WA` kosong sehingga tombol upsell/add-on Laporan & Inventori hilang; `waLink()` punya fallback nomor. `.env` repo ini belum mengisi `VITE_SALES_WA`.
- `CASHIER_LIMIT_REACHED` berbahasa Inggris dan kartu "Kuota Kasir" menampilkan plan mentah ("starter").
