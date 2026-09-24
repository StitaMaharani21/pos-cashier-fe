// Plan facts quoted on more than one public page (landing pricing, store
// registration benefits).

// Monthly list price per outlet — the landing pricing cards and the
// registration page's plan picker both read this.
export const MONTHLY_PRICE = {
  starter: "Rp99.000",
  pro: "Rp180.000",
  enterprise: "Rp290.000",
} as const

// Starter's daily transaction soft limit as stated in the landing brief.
// NOTE: pos-kasir-be's plan.StarterDailyTransactionLimit is currently 80 and
// has no "3 consecutive days → upgrade notice" logic yet — it only feeds the
// owner dashboard widget and never blocks checkout. Keep the two in sync.
export const STARTER_SOFT_DAILY_LIMIT = 50
