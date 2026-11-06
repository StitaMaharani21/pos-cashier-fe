import { useState, type ReactNode } from "react"
import { format } from "date-fns"
import {
  ArrowLeftRightIcon,
  BanknoteIcon,
  CalculatorIcon,
  CreditCardIcon,
  LandmarkIcon,
  LockIcon,
  PlusIcon,
  ReceiptIcon,
  UndoIcon,
  WalletIcon,
} from "lucide-react"

import { CashMovementDialog } from "@/modules/owner/dashboard/components/CashMovementDialog"
import { CashCountDialog, type CashCountTarget } from "@/modules/owner/dashboard/components/CashCountDialog"
import { CloseShiftDialog, type ShiftToClose } from "@/modules/owner/dashboard/components/CloseShiftDialog"
import { PerCashierDrawers } from "@/modules/owner/dashboard/components/PerCashierDrawers"
import { useCashSummary, useDashboardSummary } from "@/modules/owner/dashboard/dashboard.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { KpiCard } from "@/shared/ui/kpi-card"

function SkeletonCard() {
  return <div className="h-35 animate-pulse rounded-2xl border bg-muted/40" />
}

function CardGroup({
  title,
  description,
  columns,
  action,
  children,
}: {
  title: string
  description: string
  columns: string
  // Optional button on the right of the group header.
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${columns}`}>{children}</div>
    </section>
  )
}

function footerNote(text: string) {
  return <span className="text-xs text-muted-foreground">{text}</span>
}

// Dashboard cards for the shift that is open right now (GET
// /orders/dashboard-summary?since_shift_open=true), in two groups:
// - Ringkasan Penjualan: revenue figures. Kas Awal is never part of these.
// - Rekonsiliasi Kas Laci: what should be in the drawer vs what was counted.
//   Expected = Kas Awal + Cash Sales + Cash In - Cash Out - Cash Refund;
//   Selisih = Kas Aktual - Expected. Non-cash sales only raise revenue, never
//   the drawer.
//
// Every cashier works in their own shift, so several can be open at once: the cards are the TOTAL of
// all open shifts, and with more than one a "Per Kasir" table lists each drawer with its own
// Catat Kas / Hitung / Tutup actions. With a single open shift the cards carry those actions.
export function KpiCardsGrid() {
  const [countTarget, setCountTarget] = useState<CashCountTarget | null>(null)
  const [closeTarget, setCloseTarget] = useState<ShiftToClose | null>(null)
  const [movementShiftId, setMovementShiftId] = useState<number | null>(null)
  const summary = useDashboardSummary(true)
  const cashSummary = useCashSummary()

  if (summary.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const data = summary.data
  // Setelah refetch gagal (404 = tidak ada shift aktif, mis. baru saja ditutup),
  // TanStack Query tetap menyimpan data sukses terakhir di `.data` — jadi
  // `.data` saja tidak cukup untuk tahu ada shift aktif.
  const activeCash = cashSummary.isError ? undefined : cashSummary.data
  const hasShift = Boolean(data?.shift_opened_at) && Boolean(activeCash)

  const money = (value: number | undefined) => (hasShift ? formatRupiah(value ?? 0) : "—")

  const expectedCash = data?.expected_cash ?? activeCash?.current_expected_amount ?? 0
  const hasCount = hasShift && Boolean(activeCash?.has_count)
  const countedCash = activeCash?.counted_amount ?? 0
  const lastCountedAt = activeCash?.last_recorded_at ? format(new Date(activeCash.last_recorded_at), "HH:mm") : null

  const openShifts = activeCash?.shifts ?? []
  const isMulti = hasShift && openShifts.length > 1
  // The one open shift (cards act on it); null when several are open (the table acts per cashier).
  const soleShift =
    hasShift && !isMulti && activeCash?.shift_id
      ? {
          shiftId: activeCash.shift_id,
          cashierName: openShifts[0]?.cashier_name,
          expectedAmount: activeCash.current_expected_amount ?? activeCash.expected_amount ?? 0,
        }
      : null

  return (
    <>
      <div className="flex flex-col gap-6">
        {!hasShift && (
          <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
            Kasir belum dibuka. Ringkasan penjualan dan uang di laci muncul setelah kasir mulai bekerja.
          </p>
        )}

        <CardGroup
          title="Ringkasan Penjualan"
          description="Penjualan sejak kasir dibuka. Uang modal awal tidak dihitung sebagai penjualan."
          columns="xl:grid-cols-3"
        >
          <KpiCard
            testId="card-total-pendapatan"
            icon={WalletIcon}
            label="Total Pendapatan"
            value={money(data?.total_revenue)}
            footer={footerNote("Tunai + non-tunai, dikurangi refund")}
          />
          <KpiCard
            testId="card-total-pesanan"
            icon={ReceiptIcon}
            label="Total Pesanan"
            value={
              hasShift ? (
                <>
                  {data?.total_orders ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">Pesanan</span>
                </>
              ) : (
                "—"
              )
            }
            footer={footerNote("Transaksi berhasil")}
          />
          <KpiCard
            testId="card-total-cash"
            icon={BanknoteIcon}
            iconTone="neutral"
            label="Total Tunai"
            value={money(data?.cash_sales)}
            footer={footerNote("Penjualan yang dibayar tunai")}
          />
          <KpiCard
            testId="card-total-non-cash"
            icon={CreditCardIcon}
            iconTone="neutral"
            label="Total Non-Tunai"
            value={money(data?.non_cash_sales)}
            footer={footerNote("QRIS, kartu, dan dompet digital")}
          />
          <KpiCard
            testId="card-total-refund"
            icon={UndoIcon}
            iconTone="neutral"
            label="Total Refund"
            value={money(data?.total_refunds)}
            footer={footerNote("Refund tunai dan non-tunai")}
          />
        </CardGroup>

        <CardGroup
          title="Uang di Laci"
          description={
            isMulti
              ? `Gabungan ${openShifts.length} kasir yang sedang buka. Pembayaran non-tunai tidak masuk ke laci.`
              : "Uang tunai yang ada di laci kasir. Pembayaran non-tunai tidak masuk ke laci."
          }
          columns={hasShift ? "xl:grid-cols-4" : "xl:grid-cols-2"}
          action={
            soleShift && (
              <Button type="button" variant="outline" size="sm" onClick={() => setMovementShiftId(soleShift.shiftId)}>
                <PlusIcon />
                Catat Kas
              </Button>
            )
          }
        >
          <KpiCard
            testId="card-kas-awal"
            icon={LandmarkIcon}
            iconTone="neutral"
            label="Uang Modal Awal"
            value={money(data?.opening_balance)}
            footer={footerNote("Modal di laci saat kasir dibuka")}
          />
          <KpiCard
            testId="card-kas-diharapkan"
            icon={CalculatorIcon}
            iconTone="neutral"
            label="Uang Seharusnya Ada"
            value={money(expectedCash)}
            footer={
              hasShift &&
              footerNote(
                `Modal awal + penjualan tunai + uang masuk (${formatRupiah(data?.cash_in ?? 0)}) − uang keluar (${formatRupiah(data?.cash_out ?? 0)}) − refund (${formatRupiah(data?.cash_refunds ?? 0)})`
              )
            }
          />
          {/* Kas Aktual and Selisih belong to a running shift. After it is closed
              the drawer figures reset for the next shift, so they are not shown
              until a new shift opens. */}
          {hasShift && (
            <>
          <KpiCard
            testId="card-kas-aktual"
            icon={WalletIcon}
            label="Uang Hasil Hitung"
            onClick={soleShift ? () => setCountTarget(soleShift) : undefined}
            value={!hasShift ? "—" : hasCount ? formatRupiah(countedCash) : "Belum dihitung"}
            footer={
              isMulti ? (
                footerNote(hasCount ? "Semua laci sudah dihitung" : "Hitung tiap laci di tabel Per Kasir")
              ) : (
                hasShift && (
                  <div className="flex items-center justify-between gap-2">
                    {footerNote(
                      hasCount && lastCountedAt
                        ? `Dihitung pukul ${lastCountedAt}`
                        : "Ketuk untuk menghitung uang di laci"
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        // The card itself opens the cash-count dialog.
                        event.stopPropagation()
                        if (soleShift) setCloseTarget({ id: soleShift.shiftId, cashierName: soleShift.cashierName, expectedAmount: soleShift.expectedAmount })
                      }}
                    >
                      <LockIcon />
                      Tutup Kasir
                    </Button>
                  </div>
                )
              )
            }
          />
          {/* Same as the cashier app: what was booked with "Catat Kas" on this
              shift. The count difference (Kurang/Lebih) is shown when the shift
              is closed and in the cash report. */}
          <KpiCard
            testId="card-kas-masuk-keluar"
            icon={ArrowLeftRightIcon}
            iconTone="neutral"
            label="Kas Masuk / Keluar"
            value={`Masuk ${formatRupiah(data?.cash_in ?? 0)}`}
            footer={footerNote(`Keluar ${formatRupiah(data?.cash_out ?? 0)}`)}
          />
            </>
          )}
        </CardGroup>

        {isMulti && (
          <PerCashierDrawers
            shifts={openShifts}
            sales={data?.shifts}
            onRecordCash={(shift) => setMovementShiftId(shift.shift_id)}
            onCount={(shift) =>
              setCountTarget({
                shiftId: shift.shift_id,
                cashierName: shift.cashier_name,
                expectedAmount: shift.current_expected_amount,
              })
            }
            onClose={(shift) =>
              setCloseTarget({
                id: shift.shift_id,
                cashierName: shift.cashier_name,
                expectedAmount: shift.current_expected_amount,
              })
            }
          />
        )}
      </div>

      <CloseShiftDialog shift={closeTarget} onOpenChange={(open) => !open && setCloseTarget(null)} />

      <CashMovementDialog shiftId={movementShiftId} onOpenChange={(open) => !open && setMovementShiftId(null)} />

      <CashCountDialog target={countTarget} onOpenChange={(open) => !open && setCountTarget(null)} />
    </>
  )
}
