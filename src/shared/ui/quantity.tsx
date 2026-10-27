import { cn, formatNumber } from "@/shared/lib/utils"

// An amount with its unit as a separate muted chip, so a numeric-looking unit
// (e.g. "100") can't be misread as part of the amount ("50 100").
export function Quantity({
  value,
  unit,
  className,
}: {
  value: number
  unit?: string | null
  className?: string
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={cn(className)}>{formatNumber(value)}</span>
      {unit && (
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{unit}</span>
      )}
    </span>
  )
}
