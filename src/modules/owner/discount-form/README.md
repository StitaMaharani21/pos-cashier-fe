# modules/owner/discount-form

Shared building blocks for the two discount drawers — `modules/owner/voucher` and `modules/owner/product-discount`. No screen of its own.

- `schemas/discount-base.schema.ts` — the fields both forms share, under the same names (`name`, `isActive`, `type`, `value`, `maxDiscount`, `startDate`, `endDate`), plus `refineDiscountBase` (the backend's value / date-range rules). Each module spreads `discountBaseShape` into its own schema.
- `components/` — card contents that read those fields through `useFormContext<DiscountBaseValues>()`: `NameStatusFields` (name + x/50 counter + Aktif), `DiscountValueFields` (Persen/Nominal, Nilai, Maksimal Potongan), `PeriodFields` (date range + presets; empty end = tanpa batas), `SummaryBanner`, `DrawerFooter` (Batal / Simpan, Hapus with a second click to confirm), `AffixInput` (digits with Rp/% boxes, shown as `10.000`).
- `lib/discount-rules.ts` — pure helpers: `discountAmount` (the preview mirror of the backend's `pricing.DiscountAmountFor`: percent capped by `maxDiscount`, never above the price), labels for value / period / days / hours, date presets, `toApiDate` (local midnight **with the browser's offset**, so the backend's end-of-day normalisation lands on the store's day), `randomVoucherCode`.

The card chrome itself is `shared/ui/form-section` (also used by the menu drawer).
