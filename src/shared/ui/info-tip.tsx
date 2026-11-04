import type { ReactNode } from "react"
import { InfoIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

// A small round "i" that opens the explanation on click / tap / Enter, so a
// form can keep only what the owner needs to act on in sight and still offer
// the rest (examples, rules, why). A popover, not a hover tooltip: it must work
// on touch screens and may hold a link. `label` names what it explains for
// screen readers ("Info: Harga Pokok").
//
// Put it NEXT TO a <FormLabel>, not inside it: a click inside a label focuses
// its input. The trigger is type="button" so it never submits the form it sits in.
//
//   <LabelWithInfo info="Berlaku untuk pesanan baru." infoLabel="Harga">
//     <FormLabel>Harga</FormLabel>
//   </LabelWithInfo>
export function InfoTip({
  label,
  title,
  children,
  className,
}: {
  label: string
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Info: ${label}`}
          className={cn(
            "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-primary-strong focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-primary-strong",
            className
          )}
        >
          <InfoIcon className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        {title && <p className="mb-1 font-semibold text-foreground">{title}</p>}
        <div className="flex flex-col gap-2 text-muted-foreground">{children}</div>
      </PopoverContent>
    </Popover>
  )
}

// A label with its "i" beside it on one line.
export function LabelWithInfo({
  info,
  infoLabel,
  infoTitle,
  className,
  children,
}: {
  info: ReactNode
  infoLabel: string
  infoTitle?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {children}
      <InfoTip label={infoLabel} title={infoTitle}>
        {info}
      </InfoTip>
    </div>
  )
}
