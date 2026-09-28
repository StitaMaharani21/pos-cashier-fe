import * as React from "react"

import { cn } from "@/shared/lib/utils"

// The owner dashboard's one table look (see README "Tabel"): uppercase gray
// header band, px-6 on the outer columns, soft row hover. Put it inside
// TableCard for the rounded card + footer.

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("border-b bg-muted/40 [&_tr]:border-0 [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/40 font-semibold [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/30 has-aria-expanded:bg-muted/30 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "px-3 py-4 text-left align-middle text-xs font-bold tracking-wide whitespace-nowrap text-muted-foreground uppercase first:pl-6 last:pr-6 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-3 align-middle whitespace-nowrap text-foreground first:pl-6 last:pr-6 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
}

// Rounded card around a table; `footer` (pagination, totals) sits under it.
function TableCard({ className, footer, children }: { className?: string; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div data-slot="table-card" className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      {children}
      {footer && <div className="border-t">{footer}</div>}
    </div>
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, TableCard }
