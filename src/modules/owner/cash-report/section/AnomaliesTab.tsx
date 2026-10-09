import { useEffect, useState } from "react"
import { AlertTriangleIcon, ShieldCheckIcon } from "lucide-react"

import { useCashAnomalies } from "@/modules/owner/cash-report/cash-report.queries"
import { shiftCashColumns } from "@/modules/owner/cash-report/columns/shift-cash.columns"
import { ShiftCashTransactionsSheet } from "@/modules/owner/cash-report/components/ShiftCashTransactionsSheet"
import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { Input } from "@/shared/ui/input"
import { KpiCard } from "@/shared/ui/kpi-card"
import { Label } from "@/shared/ui/label"

const DEFAULT_THRESHOLD = 20000

// "Anomali" tab — a differently-filtered view over the SAME row shape as
// "Ringkasan Shift" (ShiftCashRow), so it reuses shiftCashColumns and
// ShiftCashTransactionsSheet as-is rather than duplicating either. The
// warning KpiCard mirrors VoidTransactionsTab's anti-fraud treatment
// (tone="warning"/iconTone="warning") for visual consistency across the
// app's reports.
export function AnomaliesTab({ from, to }: { from: string; to: string }) {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)

  useEffect(() => {
    setSelectedShiftId(null)
  }, [from, to, threshold])

  const query = useCashAnomalies({ from, to, threshold })
  const rows = query.data?.items ?? []
  const selectedShift = rows.find((row) => row.shift_id === selectedShiftId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="anomaly-threshold" className="text-xs text-muted-foreground">
            Tampilkan jika selisih lebih dari (Rp)
          </Label>
          <Input
            id="anomaly-threshold"
            type="number"
            min={0}
            step={1000}
            value={threshold}
            onChange={(event) => setThreshold(Math.max(0, Number(event.target.value) || 0))}
            className="w-[160px]"
          />
        </div>
      </div>

      <KpiCard
        icon={AlertTriangleIcon}
        tone="warning"
        iconTone="warning"
        label="Shift dengan Selisih Tak Wajar"
        value={
          <>
            {rows.length} <span className="text-sm font-normal text-muted-foreground">Shift</span>
          </>
        }
        className="sm:max-w-sm"
      />

      {!query.isPending && !query.isError && rows.length === 0 ? (
        // Reassuring, not alarming — 0 anomalies is a good outcome, same
        // principle VoidTransactionsTab applies to its own zero-count empty
        // state (ReportStateCard's default "muted" tone, never "danger").
        <ReportStateCard
          icon={ShieldCheckIcon}
          title="Tidak ada shift dengan selisih di atas batas pada periode ini"
          hint="Uang tunai sesuai catatan pada rentang tanggal dan batas selisih ini."
        />
      ) : (
        <CrudTable
          columns={shiftCashColumns}
          rows={rows}
          getRowId={(row) => row.shift_id}
          isLoading={query.isPending}
          isError={query.isError}
          errorHint="Laporan kas mungkin memerlukan paket Pro atau fitur tambahan Laporan."
          onRetry={() => query.refetch()}
          onRowClick={(row) => setSelectedShiftId(row.shift_id)}
          minWidth="min-w-[1080px]"
          empty={{
            icon: AlertTriangleIcon,
            title: "Tidak ada shift dengan selisih tak wajar",
          }}
        />
      )}

      <ShiftCashTransactionsSheet shift={selectedShift} onClose={() => setSelectedShiftId(null)} />
    </div>
  )
}
