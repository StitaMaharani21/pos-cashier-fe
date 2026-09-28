import { CircleCheckIcon, PackageIcon, TriangleAlertIcon } from "lucide-react"
import { Link } from "react-router-dom"

import type { LowStockMenu } from "@/entities/menu/model/menu.types"
import { useLowStockMenus } from "@/modules/owner/dashboard/dashboard.queries"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

// Rows shown before "+N menu lainnya".
const VISIBLE = 5

// Red once the stock is down to half the menu's threshold (5 → 2 left) or
// gone; amber above that.
function isCritical(item: LowStockMenu): boolean {
  const qty = item.stock_qty ?? 0
  return qty <= 0 || qty <= Math.floor((item.low_stock_threshold ?? 5) / 2)
}

// Dashboard "Stok Hampir Habis": menus tracked per menu (Menu → Stok →
// "Lacak stok · Per menu") at or below their threshold. Every plan.
export function LowStockCard() {
  const { data = [], isPending, isError, refetch } = useLowStockMenus()
  const visible = data.slice(0, VISIBLE)
  const hidden = data.length - visible.length

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Stok Hampir Habis</h2>
        <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <TriangleAlertIcon className="size-4" />
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex min-h-[208px] flex-col gap-3">
        {isPending &&
          Array.from({ length: 3 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />)}

        {isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Gagal memuat data stok.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        )}

        {!isPending && !isError && data.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CircleCheckIcon className="size-5" />
            </span>
            <p className="font-semibold text-foreground">Semua stok menu aman</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Menu yang stoknya dilacak akan muncul di sini saat mendekati batas minimum.
            </p>
          </div>
        )}

        {visible.map((item) => {
          const critical = isCritical(item)
          const qty = item.stock_qty ?? 0
          return (
            <div
              key={item.menu_id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border p-3",
                critical
                  ? "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
                  : "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={cn("size-2 shrink-0 rounded-full", critical ? "bg-red-500" : "bg-amber-500")} />
                <span className="truncate text-sm font-semibold text-foreground">{item.menu_name}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-xs font-bold tabular-nums",
                  critical
                    ? "bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200"
                    : "bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                )}
              >
                {qty <= 0 ? "Habis" : `${qty} tersisa`}
              </span>
            </div>
          )
        })}

        {hidden > 0 && <p className="text-center text-xs text-muted-foreground">+{hidden} menu lainnya</p>}
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to="/app/menu?tab=menu">
          <PackageIcon />
          Kelola Stok
        </Link>
      </Button>
    </div>
  )
}
