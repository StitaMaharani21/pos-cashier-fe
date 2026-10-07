# modules/public/self-order

Customer "Pesan dari Meja" page at `/pesan/:storeCode/:qrToken` — what a table's QR opens. No login: scan → menu → one cart shared by the whole table → "Kirim ke Kasir". Pro plan (`qr_self_order`) on the backend.

The order lands in the cashier's pending queue (`GET /orders?status=pending`, approved with `PATCH /orders/:id/status`) with no web-side code: the cashier app already polls it. This page only follows the order's status back (`GET /guest/orders/:id`, every 5 s).

Backend contract (`pos-kasir-be`, all under `/api/v1`, every request needs `X-Store-Code`):

| Step | Endpoint |
| --- | --- |
| QR token → guest token + shared cart | `POST /guest/sessions/resolve` (public) |
| Menu | `GET /guest/menus?page&per_page` (public; categories are derived from `category_name`) |
| Cart | `GET/POST/PUT/DELETE /guest/carts/:id[/items[/:itemId]]` (`X-Guest-Token`) |
| Send | `POST /guest/carts/:id/checkout` → order `pending` |
| Track | `GET /guest/orders/:id` (`X-Guest-Token`) |

Layers (same split as `store-registration`): `domain/` (hand-written DTO types — the generator leaves `/guest/*` out), `infrastructure/` (axios + endpoints), `application/` (react-query hooks), `presentation/` (screens + `self-order.css`).

**Printed, permanent QR.** The link a table's QR opens is `/pesan/:storeCode/<table code>`; `POST /guest/sessions/resolve` takes that permanent code (or an older 4-hour session token) and opens/reuses the table's session by itself. Because anyone with a photo of the QR could try to order from home, the protection is layered and mostly on the backend:

- the cashier must **approve** every order (it arrives as `pending`; nothing is cooked or charged before that);
- at most 2 orders per table can wait for the cashier, a guest cart is capped (20 per item, 60 in total), and the guest routes are rate limited (per guest token, since a cafe's guests share one Wi-Fi IP);
- when the guest presses "Kirim ke Kasir" the page asks for their **location** (`infrastructure/guest-location.ts`, 8 s, never blocking — a refusal just sends no coordinates) and the backend flags the order `inside` / `outside` / `unknown` against the cafe's coordinates and radius (Pengaturan Bisnis). It is only a hint for the cashier and the guest never sees it; the cashier app has to show `guest_geo_status`.

Error codes the page words for customers (`guestErrorMessage`, `SessionError`): `NO_ACTIVE_SHIFT`, `DINE_IN_DISABLED`, `TABLE_INACTIVE`, `TABLE_HAS_PENDING_ORDER`, `RATE_LIMITED`, `QTY_LIMIT`; any 5xx becomes `SERVER_ERROR` ("Server sedang bermasalah") instead of echoing the backend text.

Things to know:

- **Own axios client** (`infrastructure/guest-client.ts`), never `apiClient`: that one attaches the owner's token/store code and logs the owner out on 401, opens the upsell modal on 402 and toasts on 403.
- The cart lives on the server; phones at the same table see each other's items via a 5 s poll. Totals (tax, grand total) are the server's.
- "Nama pemesan" is sent as `ordered_by` and groups the cart; it is remembered per tab in `sessionStorage`.
- Styling follows the Neela design: plain CSS under `.so-root` whose `--so-*` tokens alias the global `--color-neela-*` palette from `landing.css`, Plus Jakarta Sans, `NeelaWordmark`. Light only, like the landing page, and kept apart from the shadcn theme.
- The link is built in `shared/lib/self-order-url.ts` (also used by the owner's table QR in `modules/owner/table`) — `modules/owner` and `modules/public` must not import each other.
