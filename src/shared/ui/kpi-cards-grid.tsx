import { useState, type ReactNode } from "react"
import { format } from "date-fns"
import {
  BanknoteIcon,
  CalculatorIcon,
  CreditCardIcon,
  LandmarkIcon,
  LockIcon,
  PlusIcon,
  ReceiptIcon,
  ScaleIcon,
  UndoIcon,
  WalletIcon,
} from "lucide-react"

import {
  SELISIH_STATUS_BADGE_CLASSNAME,
  SELISIH_STATUS_LABEL,
  formatSelisih,
  selisihStatus,
} from "@/modules/owner/cash-report/lib/selisih"
import { CashMovementDialog } from "@/modules/owner/dashboard/components/CashMovementDialog"
import { CashCountDialog } from "@/modules/owner/dashboard/components/CashCountDialog"
import { CloseShiftDialog } from "@/modules/owner/dashboard/components/CloseShiftDialog"
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
export function KpiCardsGrid() {
  const [cashDialogOpen, setCashDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
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
  // Live difference against the CURRENT expected cash — the stored snapshot
  // (`activeCash.difference`) goes stale once more transactions come in.
  const difference = hasCount ? countedCash - expectedCash : null
  const status = difference === null ? null : selisihStatus(difference)
  const lastCountedAt = activeCash?.last_recorded_at ? format(new Date(activeCash.last_recorded_at), "HH:mm") : null

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
          description="Uang tunai yang ada di laci kasir. Pembayaran non-tunai tidak masuk ke laci."
          columns={hasShift ? "xl:grid-cols-4" : "xl:grid-cols-2"}
          action={
            hasShift && (
              <Button type="button" variant="outline" size="sm" onClick={() => setMovementDialogOpen(true)}>
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
            onClick={() => setCashDialogOpen(true)}
            value={!hasShift ? "—" : hasCount ? formatRupiah(countedCash) : "Belum dihitung"}
            footer={
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
                      setCloseDialogOpen(true)
                    }}
                  >
                    <LockIcon />
                    Tutup Kasir
                  </Button>
                </div>
              )
            }
          />
          <KpiCard
            testId="card-selisih-kas"
            icon={ScaleIcon}
            iconTone={status === "shortage" ? "warning" : "neutral"}
            tone={status === "shortage" ? "warning" : "default"}
            label="Uang Kurang/Lebih"
            value={difference === null ? "—" : formatSelisih(difference)}
            footer={
              status ? (
                <span
                  className={`inline-flex w-fit items-center rounded px-2 py-0.5 text-xs font-semibold ${SELISIH_STATUS_BADGE_CLASSNAME[status]}`}
                >
                  {SELISIH_STATUS_LABEL[status]}
                </span>
              ) : (
                footerNote("Hitung uang di laci dulu")
              )
            }
          />
            </>
          )}
        </CardGroup>
      </div>

      <CloseShiftDialog
        shift={
          closeDialogOpen && activeCash?.shift_id
            ? {
                id: activeCash.shift_id,
                expectedAmount: activeCash.current_expected_amount ?? activeCash.expected_amount ?? 0,
              }
            : null
        }
        onOpenChange={setCloseDialogOpen}
      />

      <CashMovementDialog
        shiftId={movementDialogOpen && activeCash?.shift_id ? activeCash.shift_id : null}
        onOpenChange={setMovementDialogOpen}
      />

      <CashCountDialog open={cashDialogOpen} onOpenChange={setCashDialogOpen} cashSummary={activeCash} />
    </>
  )
}
