// The app's one categorical chart palette. Recharts writes colors straight
// into SVG `fill`/`stroke` attributes, so these have to be resolvable values
// rather than Tailwind class names — `var(--chart-n)` works there and keeps
// the light/dark definitions in index.css as the single source of truth.
//
// Before this, PaymentMethodDonutCard, CategoryBreakdownTab and OrderSourceTab
// each carried their own literal hex array, so the same payment method drew in
// a different color depending on which screen you were looking at.

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const

// Cycles, so a chart with more series than the palette still renders.
export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

// Series that always mean the same thing across screens, so they keep one
// color everywhere: brand blue for the app's own channel, amber for manual /
// off-system entry, emerald for "good", destructive red for variance.
export const SEMANTIC_CHART_COLORS = {
  primary: "var(--chart-1)",
  manual: "var(--chart-4)",
  positive: "var(--chart-3)",
  negative: "var(--chart-7)",
} as const
