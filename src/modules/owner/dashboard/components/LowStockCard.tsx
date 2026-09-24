import { isAxiosError } from "axios"
import { TriangleAlertIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { useLowStockMenus } from "@/modules/owner/dashboard/dashboard.queries"
import { Button } from "@/shared/ui/button"

export function LowStockCard() {
  const { data, isPending, isError, error } = useLowStockMenus()
  // RequirePlan responds 403 {"error": "plan_upgrade_required"} — a shape
  // the api client doesn't recognize as ApiError, so it surfaces as a raw
  // AxiosError here. Any other failure (network, 401, ...) gets a generic
  // message instead of incorrectly blaming the plan.
  const requiresProPlan = isAxiosError(error) && error.response?.status === 403

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Stok Hampir Habis</h2>
        <span className="flex size-8 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <TriangleAlertIcon className="size-4" />
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex min-h-[208px] flex-col gap-3">
        {isPending && (
          <p className="py-8 text-center text-sm text-muted-foreground">Memuat...</p>
        )}

        {isError && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {requiresProPlan
              ? "Fitur ini memerlukan paket Pro."
              : "Gagal memuat data stok."}
          </p>
        )}

        {!isPending && !isError && (data?.length ?? 0) === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Semua stok menu aman.
          </p>
        )}

        {data?.map((item) => {
          const critical = (item.stock_qty ?? 0) <= 0
          return (
            <div
              key={item.menu_id}
              className={
                critical
                  ? "flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  : "flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3"
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    critical
                      ? "size-2 rounded-full bg-destructive"
                      : "size-2 rounded-full bg-amber-500"
                  }
                />
                <span className="text-sm font-semibold text-foreground">{item.menu_name}</span>
              </div>
              <span
                className={
                  critical
                    ? "rounded-md bg-destructive/15 px-2 py-1 text-xs font-bold text-destructive"
                    : "rounded-md bg-amber-200 px-2 py-1 text-xs font-bold text-amber-800"
                }
              >
                {item.stock_qty} tersisa
              </span>
            </div>
          )
        })}
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to="/app/menu">Kelola Stok</Link>
      </Button>
    </div>
  )
}
