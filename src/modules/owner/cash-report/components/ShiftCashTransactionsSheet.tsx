import type { ReactNode } from "react"
import { format } from "date-fns"
import { InboxIcon, TriangleAlertIcon } from "lucide-react"

import { useShiftCashTransactions } from "@/modules/owner/cash-report/cash-report.queries"
import type { ShiftCashRow } from "@/modules/owner/cash-report/cash-report.types"
import { formatSelisih, selisihToneClassName } from "@/modules/owner/cash-report/lib/selisih"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"

interface ShiftCashTransactionsSheetProps {
  // The already-loaded table row the owner clicked — no need to refetch
  // these 9 summary fields, only the transaction list itself is fetched
  // here. null closes the sheet (same open-state idiom as MenuPreviewSheet).
  shift: ShiftCashRow | null
  onClose: () => void
}

function formatDateTime(value: string | null) {
  return value ? format(new Date(value), "d MMM yyyy, HH:mm") : "—"
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{children}</span>
    </div>
  )
}

// Row-click drill-down for one shift (ShiftSummaryTab) — follows
// MenuPreviewSheet's read-only Sheet pattern.
export function ShiftCashTransactionsSheet({ shift, onClose }: ShiftCashTransactionsSheetProps) {
  const shiftId = shift?.shift_id ?? null
  const { data, isLoading, isError, refetch } = useShiftCashTransactions(shiftId)
  const transactions = data?.data ?? []

  return (
    <Sheet open={shift !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0">
        {shift && (
          <>
            <SheetHeader>
              <SheetTitle>{shift.kasir_name || "—"}</SheetTitle>
              <SheetDescription>
                {formatDateTime(shift.opened_at)} –{" "}
                {shift.is_open ? "Sedang Berjalan" : formatDateTime(shift.closed_at)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-0.5 border-b px-6 py-4">
              <SummaryRow label="Saldo Awal">{formatRupiah(shift.saldo_awal ?? 0)}</SummaryRow>
              <SummaryRow label="Kas Masuk">{formatRupiah(shift.kas_masuk ?? 0)}</SummaryRow>
              <SummaryRow label="Kas Keluar">{formatRupiah(shift.kas_keluar ?? 0)}</SummaryRow>
              <SummaryRow label="Penjualan Tunai">{formatRupiah(shift.penjualan_tunai ?? 0)}</SummaryRow>
              <SummaryRow label="Perkiraan Saldo Akhir (sementara)">
                {formatRupiah(shift.estimasi_saldo_akhir ?? 0)}
              </SummaryRow>
              <SummaryRow label="Saldo Akhir">
                {shift.saldo_akhir === null ? (
                  <span className="font-normal text-muted-foreground" title="Shift belum ditutup">
                    —
                  </span>
                ) : (
                  formatRupiah(shift.saldo_akhir)
                )}
              </SummaryRow>
              <SummaryRow label="Selisih">
                {shift.selisih === null ? (
                  <span className="font-normal text-muted-foreground" title="Shift belum ditutup">
                    —
                  </span>
                ) : (
                  <span className={selisihToneClassName(shift.selisih)}>{formatSelisih(shift.selisih)}</span>
                )}
              </SummaryRow>
            </div>

            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-6 py-5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-lg bg-muted/40" />
                ))
              ) : isError ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <TriangleAlertIcon className="size-5" />
                  </span>
                  <p className="font-semibold text-foreground">Gagal memuat data</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Tidak dapat memuat kas masuk/keluar untuk shift ini.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="mt-1">
                    Coba lagi
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <InboxIcon className="size-5" />
                  </span>
                  <p className="font-semibold text-foreground">Belum ada transaksi</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Belum ada kas masuk/keluar tercatat untuk shift ini.
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex flex-col gap-1.5 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {tx.type === "in" ? (
                          <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            Masuk
                          </Badge>
                        ) : (
                          // Amber, not red — a cash-out entry is a normal
                          // operational record, not a problem signal.
                          <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                            Keluar
                          </Badge>
                        )}
                        <span className="text-sm font-semibold text-foreground">{tx.category || "—"}</span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          tx.type === "in" ? "text-emerald-600" : "text-amber-600"
                        )}
                      >
                        {tx.type === "in" ? "+" : "-"}
                        {formatRupiah(tx.amount ?? 0)}
                      </span>
                    </div>
                    {tx.description && <p className="text-sm text-muted-foreground">{tx.description}</p>}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDateTime(tx.created_at)}</span>
                      <span>Diinput oleh: {tx.created_by_kasir_name || "—"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
