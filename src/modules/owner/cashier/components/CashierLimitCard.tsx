import { useQuery } from "@tanstack/react-query"

import { getCashierLimit } from "@/modules/owner/cashier/api/cashier.service"

// Same structure as dashboard/components/TransactionLimitCard.tsx — a
// used/limit line + progress bar, sourced from
// GET /auth/users/cashier/limit instead of the daily transaction limit.
export function CashierLimitCard() {
  const { data, isPending } = useQuery({
    queryKey: ["cashiers", "limit"],
    queryFn: getCashierLimit,
  })

  const percent = data && data.limit > 0 ? Math.min((data.used / data.limit) * 100, 100) : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">Kuota Kasir</h2>
        <p className="text-sm text-muted-foreground">Jumlah akun kasir aktif vs batas paket</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
          <span>Kasir Aktif</span>
          <span>{isPending ? "—" : `${data?.used ?? 0} / ${data?.limit ?? 0} kasir`}</span>
        </div>

        {!isPending && data && (
          <>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Paket {data.plan}</p>
          </>
        )}
      </div>
    </div>
  )
}
