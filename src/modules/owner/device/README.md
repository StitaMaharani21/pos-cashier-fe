# modules/owner/device

"Perangkat Kasir" — the second tab of **Pengguna** (`/app/users?tab=devices`, see `modules/owner/cashier/section/UsersSection.tsx`). Only devices the owner paired through a QR can log a cashier in.

Backed by `pos-kasir-be`'s `internal/central/device` (table `devices` in the central DB), owner-only:
- `POST /devices/pairing-code` `{name}` → `{device_id, pairing_token, expires_at}` — a new PENDING device, valid 10 minutes.
- `GET /devices` — all of the store's devices, newest first; PENDING rows carry `pairing_expires_at`.
- `PATCH /devices/:id/revoke`.
- `GET /devices/quota` → `{limit, used, base, extra, unlimited}`: the plan's allowance (Starter 2, Pro 4, Enterprise unlimited) plus active *Device Tambahan* add-ons; `used` = BOUND devices. Pairing is refused with `DEVICE_LIMIT_REACHED` (403) once `used >= limit` — at both `pairing-code` and `claim` — while devices already bound keep working if the allowance later shrinks. `DeviceSection` shows "x dari y perangkat terpakai", disables "Hubungkan Perangkat" when full and links to `/app/billing` to buy more (`DEVICE_QUOTA_KEY`, a child of `DEVICES_KEY` so a revoke refreshes it).

**Enforcement is backend-side and cashier-only** (`middleware.RequireCashierDevice`, mounted on `/api/v1` of every store engine):
- `POST /auth/login/pin` and every request with a cashier JWT need `X-Device-Token` of a BOUND device.
- The device id is signed into the cashier JWT, so a token can't be moved to another device, and revoking cuts a running session on its next request.
- The owner dashboard and customer self-order (`/guest/*`) are not gated.

**QR contract** (`lib/pairing-payload.ts`): JSON `{"v":1,"store_code","pairing_token","api"}`. The cashier app:
1. Scans the QR.
2. Calls `POST {api}/devices/claim` with header `X-Store-Code: store_code` and body `{pairing_token, device_name?}`.
3. Stores the returned `device_token` and sends it as `X-Device-Token` from then on.

`api` is `VITE_CASHIER_API_URL`, or `VITE_API_BASE_URL` made absolute. The dialog warns when that points at localhost, which a phone can't reach.

Sublayers:
- `api/` — hand-written service, `DEVICES_KEY`.
- `lib/` — the QR payload; status → label/tone. PENDING past `pairing_expires_at` counts as "Kedaluwarsa".
- `components/PairingQrDialog.tsx`:
  1. Optional device name.
  2. QR (`qrcode.react`) with a countdown.
  3. It polls `GET /devices` every 3 s (also while the tab is in the background) until that `device_id` is BOUND, then shows "Perangkat terhubung".
  4. When expired, "Buat QR baru"; "Salin kode" copies the payload.
- `section/DeviceSection.tsx` — the standard table (see `shared/ui/README.md` "Tabel"):
  - Search and a status filter.
  - Columns: Perangkat, Status, Terhubung Sejak, Terakhir Aktif.
  - "Cabut akses" with confirmation (BOUND and PENDING only).
