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
}

const ICON_TONE_CLASSES: Record<NonNullable<KpiCardProps["iconTone"]>, string> = {
  primary: "bg-primary/10 text-primary",
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
}: KpiCardProps) {
  const isWarning = tone === "warning"

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-[21px] shadow-sm",
        isWarning && "border-destructive/30 shadow-[0_2px_8px_-2px_rgba(186,26,26,0.15)]",
        onClick && "cursor-pointer transition-colors hover:border-primary/40",
        className
      )}
    >
      {isWarning && (
        <div className="absolute top-0 right-0 size-16 rounded-bl-full bg-destructive/5" />
      )}

      <div className="relative flex items-center justify-between pb-3">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium tracking-wide",
            isWarning ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {isWarning && <span className="size-2 rounded-full bg-destructive" />}
          {label}
        </span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            ICON_TONE_CLASSES[iconTone]
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="relative flex flex-col gap-1 pt-1">
        <div className="text-xl font-semibold text-foreground">{value}</div>
        {footer}
      </div>
    </div>
  )
}
