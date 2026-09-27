# modules/owner/payment-method

Which payments the store accepts. **One payment method per type**, fixed list of five (`constants/payment-providers.ts` `METHOD_TYPES`): Tunai, Kartu Debit/Kredit, Transfer Bank, E-Wallet, QRIS. Left: the list with an on/off switch each; right: the selected method's settings.

Backed by `pos-kasir-be`:
- `/master/payment-methods` (`internal/master/payment_method`) — `name`, `type`, `status`, `image` (QRIS), and for `type=card`: `card_types` (debit/credit), `card_networks` (visa, mastercard, gpn, jcb, amex, unionpay) and `credit_surcharge_percent`. **POST/PUT are `multipart/form-data`**, list fields as repeated form fields; PUT replaces every field, so the section always resends the saved values (`methodPayload`). The backend clears card fields for non-card types.
- `/master/payment-channels` (`internal/master/payment_channel`) — the specific banks (`type=bank`) and e-wallets (`type=ewallet`) the cashier picks as the second step when paying by card/transfer (bank list, shared) or e-wallet. Same multipart shape.

Behaviour:
- **On/off switches save immediately** (list row or "Aktifkan metode ini"). Turning on a type the store has no row for creates it. Inactive methods/channels are rejected at payment by the backend (`PAYMENT_METHOD_INACTIVE` / `PAYMENT_CHANNEL_INACTIVE`).
- **Settings are a draft** ("Ada perubahan belum disimpan") saved with "Simpan Perubahan": card types/networks/surcharge and the QRIS image update the method; bank/e-wallet checkboxes create missing channels or flip existing ones' status (channels are never deleted — payments reference them). Switching method with unsaved edits asks first.
- Bank/e-wallet grids = suggested names (`BANK_PROVIDERS`, `EWALLET_PROVIDERS`) plus any channel the store already has.
- **Credit-card surcharge is real**: at checkout the backend adds `credit_surcharge_percent` of the grand total when the cashier sends `card_type: "credit"` (payment `amount` = grand total + `surcharge_amount`; `Order.GrandTotal` unchanged). A cashier app that doesn't send `card_type` yet charges no surcharge.
- Legacy: stores may have several rows of one type from the old free-form screen; the oldest is the one managed here (and gets renamed to the canonical name on the next save).

Sublayers: `api/` (multipart service for methods + channels), `constants/` (method types, card options, provider suggestions, `TYPE_META` icon/tile colour), `components/` (`MethodListItem`, `MethodDetailPanel`, `ConfigPanels` — card / channel / QRIS, `OptionCard`, `method-draft` — draft model & dirty check), `section/` (`PaymentMethodSection.tsx` — queries, immediate toggles, draft save).
