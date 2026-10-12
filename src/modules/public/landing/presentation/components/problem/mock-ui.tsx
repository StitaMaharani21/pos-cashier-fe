import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

// White UI card that stands in for a product screen inside the "after" card.
export function MockCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "w-full max-w-110 overflow-hidden rounded-2xl border border-neela-border bg-white text-neela-body-md text-neela-text shadow-[0_1px_2px_rgb(17_24_39/0.05),0_10px_24px_-12px_rgb(17_24_39/0.22)]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function MockHead({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between gap-2.5 border-b border-neela-border px-3.5 py-3", className)}>
      {children}
    </div>
  )
}

export function MockTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="min-w-0">
      <p className="font-bold whitespace-nowrap">{title}</p>
      <p className="truncate text-neela-body-sm font-medium text-neela-text-muted">{subtitle}</p>
    </div>
  )
}

export function MockHint({ children }: { children: ReactNode }) {
  return <p className="text-center text-neela-body-sm text-neela-text-muted">{children}</p>
}

const CHIP_TONES = {
  slate: "bg-neela-neutral-100 text-neela-neutral-600",
  blue: "bg-neela-blue-100/60 text-neela-blue-700 ring-1 ring-neela-blue-100 ring-inset",
  green: "bg-neela-success-bg text-neela-success-text ring-1 ring-neela-success/25 ring-inset",
  amber: "bg-neela-warning-bg text-neela-warning-text ring-1 ring-neela-warning/35 ring-inset",
  red: "bg-neela-danger/8 text-neela-danger ring-1 ring-neela-danger/20 ring-inset",
} as const

export type ChipTone = keyof typeof CHIP_TONES

export function Chip({ tone, className, children }: { tone: ChipTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-neela-label-sm font-bold whitespace-nowrap tabular-nums",
        CHIP_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
