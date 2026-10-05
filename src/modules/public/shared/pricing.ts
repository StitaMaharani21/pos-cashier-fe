// Plan facts quoted on more than one public page (landing pricing, store
// registration benefits, owner billing page). Source: "Price List POS Kasir —
// Asta Studio". Prices are per store, excluding PPN (if applicable).

// Monthly list price per outlet — the landing pricing cards and the
// registration page's plan picker both read this. Enterprise is "mulai dari"
// (custom quote), see PRICE_PREFIX.
export const MONTHLY_PRICE = {
  starter: "Rp99.000",
  pro: "Rp180.000",
  enterprise: "Rp290.000",
} as const

// Yearly billing is switched off for now: pos-kasir-be only sells 30-day plans
// and has no proration for a mid-term upgrade. Flip to true once the backend
// supports annual plans (the prices below stay ready for it).
export const ANNUAL_BILLING_ENABLED = false

// Yearly price = pay 10 months, use 12 (the price list's annual discount,
// which also applies to monthly add-ons).
export const ANNUAL_PRICE = {
  starter: "Rp990.000",
  pro: "Rp1.800.000",
  enterprise: "Rp2.900.000",
} as const

// Shown in front of a price that is only a starting point.
export const PRICE_PREFIX = {
  starter: "",
  pro: "",
  enterprise: "Mulai ",
} as const

// Paid extras from the price list that sales activates by hand (there is no
// self-serve checkout). They are NOT the same as the 3 add-on codes
// pos-kasir-be knows (REPORTS / INVENTORY / EXTRA_CASHIER), which have no
// published price — see owner/billing/content/billingAddons.ts.
export const EXTRA_PRICING = {
  extraDevice: {
    title: "Device Tambahan",
    description: "Tablet kasir atau admin tambahan di luar jumlah device paket. Berlaku untuk Starter dan Pro.",
    price: "Rp30.000",
    unit: "/bulan per device",
  },
  overage: {
    title: "Overage Transaksi",
    description:
      "Opsional, hanya Starter. Dikenakan per transaksi setelah melewati limit harian, ditagih akhir bulan.",
    price: "Rp300",
    unit: "/transaksi",
  },
} as const

// Starter's daily transaction soft limit, per the price list.
// NOTE: pos-kasir-be's plan.StarterDailyTransactionLimit is currently 80 and
// has no "3 consecutive days → upgrade notice" logic yet — it only feeds the
// owner dashboard widget and never blocks checkout. Keep the two in sync.
export const STARTER_SOFT_DAILY_LIMIT = 50
