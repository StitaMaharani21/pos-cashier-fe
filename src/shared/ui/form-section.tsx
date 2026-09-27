import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

// The rounded card that groups a drawer form's fields (menu, voucher,
// diskon otomatis): icon tile + title/description, then the fields.
// `aside` sits at the right of the header (e.g. a counter or a switch).
export function FormSection({
  icon: Icon,
  title,
  description,
  aside,
  className,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  aside?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl border bg-muted/40 p-5", className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function RequiredMark() {
  return <span className="text-destructive"> *</span>
}
