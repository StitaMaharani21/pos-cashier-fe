import { cn } from "@/shared/lib/utils"

interface NeelaWordmarkProps {
  // Footer sits on the dark navy band, header on white.
  tone?: "light" | "dark"
  className?: string
}

// Text wordmark only — the Stitch export's logo image was a temporary
// googleusercontent URL, not a committed asset. Drop the real logo into
// public/ and render it next to this once it exists.
export function NeelaWordmark({ tone = "light", className }: NeelaWordmarkProps) {
  return (
    <span
      className={cn(
        "text-neela-headline-sm tracking-tight",
        tone === "light" ? "text-neela-on-primary-fixed" : "font-bold text-neela-on-primary",
        className
      )}
    >
      Neela
      <span className={tone === "light" ? "text-neela-primary-container" : "text-neela-primary-fixed"}>
        POS
      </span>
    </span>
  )
}
