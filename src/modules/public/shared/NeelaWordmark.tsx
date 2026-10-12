import { cn } from "@/shared/lib/utils"

interface NeelaWordmarkProps {
  // Footer sits on the dark blue band, header on white.
  tone?: "light" | "dark"
  className?: string
}

// Text wordmark only — no committed logo asset yet. Drop a real logo into
// public/ and render it next to this once it exists.
export function NeelaWordmark({ tone = "light", className }: NeelaWordmarkProps) {
  return (
    <span
      className={cn(
        "text-neela-headline-sm font-extrabold tracking-tight",
        tone === "light" ? "text-neela-primary-strong" : "text-white",
        className
      )}
    >
      Neela<span className={tone === "light" ? "text-neela-brand" : "text-neela-blue-100"}>POS</span>
    </span>
  )
}
