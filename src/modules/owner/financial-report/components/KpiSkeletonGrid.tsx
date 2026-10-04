// Loading placeholder shared by the KPI-card tabs (Ringkasan, Diskon) while
// their query is pending — same skeleton shape as shared/ui/kpi-cards-grid.tsx.
export function KpiSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[141px] animate-pulse rounded-xl border bg-muted/40" />
      ))}
    </div>
  )
}
