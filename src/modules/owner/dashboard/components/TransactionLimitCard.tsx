import { TriangleAlertIcon } from "lucide-react"

import { useDailyTransactionLimit } from "@/modules/owner/dashboard/dashboard.queries"
import { formatRupiah } from "@/shared/lib/utils"

// The Figma mock renders this widget's numbers as Rupiah, but
// DailyTransactionLimitResponse's limit/used are transaction *counts*
// (see pos-kasir-be's order_dto.go) — plan-tiered, not a revenue cap. Copy
// below follows the real field semantics rather than the mockup's numbers.
export function TransactionLimitCard() {
  const { data, isPending } = useDailyTransactionLimit()

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Jatah Transaksi</h2>
        <p className="text-sm text-muted-foreground">
          Transaksi yang sudah dipakai hari ini dari jatah paket Anda
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
          <span>Jatah Transaksi per Hari</span>
          <span>
            {isPending
              ? "—"
              : data?.unlimited
                ? "Tanpa batas"
                : `${data?.used ?? 0} / ${data?.limit ?? 0} transaksi`}
          </span>
        </div>

        {!isPending && !data?.unlimited && (
          <>
            <div
              role="progressbar"
              aria-label="Transaksi yang sudah dipakai hari ini"
              aria-valuenow={Math.round(Math.min(data?.percent ?? 0, 100))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${(data?.percent ?? 0).toFixed(0)}% dari jatah harian sudah dipakai`}
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(data?.percent ?? 0, 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Terpakai: {data?.used ?? 0} transaksi
              </span>
              <span className="font-semibold text-primary-strong">
                {(data?.percent ?? 0).toFixed(0)}%
              </span>
            </div>
          </>
        )}

        {!isPending && !data?.unlimited && data?.level === "near" && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              Jatah hari ini hampir habis ({data.remaining ?? 0} transaksi tersisa). Kasir tetap bisa bertransaksi; transaksi di
              atas batas dikenakan biaya per transaksi.
            </span>
          </p>
        )}

        {!isPending && !data?.unlimited && data?.level === "over" && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              Melewati batas hari ini: <span className="font-bold">{data.over_today ?? 0} transaksi</span> di atas jatah
              {data.overage_price != null && data.over_today_amount != null
                ? ` (${data.over_today ?? 0} × ${formatRupiah(data.overage_price)} = ${formatRupiah(data.over_today_amount)})`
                : ""}
              . Kasir tetap bisa bertransaksi.
            </span>
          </p>
        )}

        {!isPending && !data?.unlimited && data?.month_overage_amount != null && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-xs">
            <span className="text-muted-foreground">
              Perkiraan tagihan bulan ini
              {data.overage_price != null
                ? ` (${data.month_over ?? 0} transaksi di atas batas × ${formatRupiah(data.overage_price)})`
                : ""}
              , ditagih di akhir bulan
            </span>
            <span className="shrink-0 text-sm font-bold text-foreground">{formatRupiah(data.month_overage_amount)}</span>
          </div>
        )}

        {!isPending && data?.unlimited && (
          <p className="mt-2 text-xs text-muted-foreground">
            Paket {data.plan} — tidak ada batas transaksi harian.
          </p>
        )}
      </div>
    </div>
  )
}
