import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  footer?: ReactNode
  tone?: "default" | "warning"
  iconTone?: "primary" | "neutral" | "warning"
  onClick?: () => void
  className?: string
  // Stable hook for e2e/UI tests (e.g. "card-total-pendapatan").
  testId?: string
}

const ICON_TONE_CLASSES: Record<NonNullable<KpiCardProps["iconTone"]>, string> = {
  primary: "bg-primary/10 text-primary-strong",
  neutral: "bg-muted text-foreground",
  warning: "bg-destructive/15 text-destructive",
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  footer,
  tone = "default",
  iconTone = "primary",
  onClick,
  className,
  testId,
}: KpiCardProps) {
  const isWarning = tone === "warning"

  return (
    <div
      data-testid={testId}
      className={cn(
        "group relative flex min-h-[8.75rem] flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
        isWarning && "border-destructive/40",
        onClick &&
          "transition-[border-color,box-shadow] focus-within:border-primary/50 hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      {isWarning && (
        <div aria-hidden className="absolute top-0 right-0 size-16 rounded-bl-full bg-destructive/5" />
      )}

      {/* A card that does something gets a real <button> stretched over it,
          rather than an onClick on the div: that way it's keyboard-reachable
          and announced, and the footer can still hold its own buttons (the
          cash card's "Tutup Shift") without nesting one button in another. */}
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          aria-label={`${label} — buka detail`}
          className="absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      )}

      <div
        className={cn(
          "relative flex items-start justify-between gap-2 pb-3",
          // The overlay button sits behind these positioned siblings, so the
          // content has to let clicks through for the whole card to be the
          // hit area. Re-enabled per-control below.
          onClick && "pointer-events-none"
        )}
      >
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium tracking-wide",
            isWarning ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {isWarning && <span aria-hidden className="size-2 shrink-0 rounded-full bg-destructive" />}
          {label}
        </span>
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            ICON_TONE_CLASSES[iconTone]
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div
        className={cn(
          "relative flex flex-col gap-1 pt-1",
          onClick && "pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
        )}
      >
        <div className="text-xl font-bold tracking-tight text-foreground tabular-nums">{value}</div>
        {footer}
      </div>
    </div>
  )
}
