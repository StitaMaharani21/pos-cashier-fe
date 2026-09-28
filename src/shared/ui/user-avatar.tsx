import { useState } from "react"

import { cn } from "@/shared/lib/utils"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2)
  return letters.toUpperCase()
}

// Round profile photo, falling back to the name's initials when there's no
// photo (or it fails to load).
export function UserAvatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  const showImage = !!src && failed !== src

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary select-none",
        className
      )}
    >
      {showImage ? (
        <img src={src} alt={name} className="size-full object-cover" onError={() => setFailed(src)} />
      ) : (
        initials(name)
      )}
    </span>
  )
}
