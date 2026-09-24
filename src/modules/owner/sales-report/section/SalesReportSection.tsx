import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CupSodaIcon,
  ReceiptIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"

import { listCashiers } from "@/modules/owner/cashier/api/cashier.service"
import { KpiCard } from "@/modules/owner/dashboard/components/KpiCard"
import { SalesTrendCard } from "@/modules/owner/dashboard/components/SalesTrendCard"
import { useDashboardSummary, usePopularMenu } from "@/modules/owner/dashboard/dashboard.queries"
import { listPaymentMethods } from "@/modules/owner/payment-method/api/payment-method.service"
import { financialReportColumns } from "@/modules/owner/sales-report/columns/financial-report.columns"
import { SalesReportFilterBar } from "@/modules/owner/sales-report/components/SalesReportFilterBar"
import { presetToRange, type DatePreset } from "@/modules/owner/sales-report/lib/date-presets"
import { useFinancialReport } from "@/modules/owner/sales-report/sales-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

const PER_PAGE = 6

export function SalesReportSection() {
  const [preset, setPreset] = useState<DatePreset>("today")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [cashierId, setCashierId] = useState<number | undefined>(undefined)
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [preset, customStart, customEnd, cashierId, paymentMethodId, debouncedSearch])

  // Scoped to the currently active shift ("sejak toko dibuka"), not the
  // calendar day — see dashboard.queries.ts's useDashboardSummary doc.
  const summary = useDashboardSummary(true)
  const popularMenu = usePopularMenu(1)
  const topMenu = popularMenu.data?.[0]

  const { data: cashiers = [] } = useQuery({
    queryKey: ["cashiers", "all"],
    queryFn: () => listCashiers(1, 100),
  })
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["payment-methods", "all"],
    queryFn: listPaymentMethods,
  })

  const range =
    preset === "custom" && customStart && customEnd
      ? { start: new Date(customStart), end: new Date(new Date(customEnd).getTime() + 86_400_000) }
      : presetToRange(preset === "custom" ? "today" : preset)

  const { data: report, isLoading, isError } = useFinancialReport({
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
    cashierId,
    paymentMethodId,
    search: debouncedSearch,
    page,
    perPage: PER_PAGE,
  })

  const rows = report?.data ?? []
  const total = report?.total ?? 0
  const totalPages = report?.total_pages ?? 0
  const pageSummary = report?.page_summary
  const rangeStart = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, total)

  const totalOrders = summary.data?.total_orders ?? 0
  const totalRevenue = summary.data?.total_revenue ?? 0
  const averagePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  // shift_opened_at is only set when a shift is actually active right now —
  // absent (not just falsy-zero totals) means the store hasn't opened yet
  // today, which is a distinct state from "open with zero sales so far".
  const hasActiveShift = summary.data?.shift_opened_at != null
  const shiftOpenedLabel = summary.data?.shift_opened_at
    ? format(new Date(summary.data.shift_opened_at), "HH:mm")
    : null

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Laporan Penjualan</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan transaksi penjualan toko &amp; analitik omset harian
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={ReceiptIcon}
          label="Total Transaksi"
          value={
            summary.isPending ? (
              "—"
            ) : !hasActiveShift ? (
              <span className="text-sm font-medium text-muted-foreground">Toko belum dibuka</span>
            ) : (
              <>
                {totalOrders} <span className="text-sm font-normal text-muted-foreground">Order</span>
              </>
            )
          }
          footer={
            hasActiveShift && (
              <span className="text-xs text-muted-foreground">Sejak toko dibuka {shiftOpenedLabel}</span>
            )
          }
        />
        <KpiCard
          icon={WalletIcon}
          label="Total Pendapatan"
          value={
            summary.isPending ? (
              "—"
            ) : !hasActiveShift ? (
              <span className="text-sm font-medium text-muted-foreground">Toko belum dibuka</span>
            ) : (
              formatRupiah(totalRevenue)
            )
          }
          footer={
            hasActiveShift && (
              <span className="text-xs text-muted-foreground">Sejak toko dibuka {shiftOpenedLabel}</span>
            )
          }
        />
        <KpiCard
          icon={TrendingUpIcon}
          iconTone="neutral"
          label="Rata-rata per Transaksi"
          value={
            summary.isPending ? (
              "—"
            ) : !hasActiveShift ? (
              <span className="text-sm font-medium text-muted-foreground">Toko belum dibuka</span>
            ) : (
              formatRupiah(averagePerOrder)
            )
          }
          footer={
            hasActiveShift && (
              <span className="text-xs text-muted-foreground">Rata-rata sejak toko dibuka</span>
            )
          }
        />
        <KpiCard
          icon={CupSodaIcon}
          iconTone="neutral"
          label="Produk Terlaris"
          value={
            popularMenu.isPending ? (
              "—"
            ) : (
              <span className="text-base font-semibold">{topMenu?.name ?? "—"}</span>
            )
          }
          footer={
            topMenu && (
              <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {topMenu.qty_sold ?? 0} Cup Terjual
              </span>
            )
          }
        />
      </div>

      <p className="-mt-2 text-xs text-muted-foreground">
        Total Transaksi/Pendapatan/Rata-rata dihitung sejak toko dibuka (shift berjalan);
        Produk Terlaris memakai 7 hari terakhir — filter tanggal di bawah hanya berlaku untuk
        tabel transaksi.
      </p>

      <SalesTrendCard />

      <div>
        <h2 className="text-lg font-bold text-foreground">Rincian Transaksi</h2>
        <p className="text-sm text-muted-foreground">
          Daftar transaksi penjualan langsung dari kasir terminal
        </p>
      </div>

      <SalesReportFilterBar
        preset={preset}
        onPresetChange={(value) => {
          setPreset(value)
          if (value !== "custom") {
            setCustomStart("")
            setCustomEnd("")
          }
        }}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={(value) => {
          setCustomStart(value)
          setPreset("custom")
        }}
        onCustomEndChange={(value) => {
          setCustomEnd(value)
          setPreset("custom")
        }}
        cashiers={cashiers}
        cashierId={cashierId}
        onCashierIdChange={setCashierId}
        paymentMethods={paymentMethods}
        paymentMethodId={paymentMethodId}
        onPaymentMethodIdChange={setPaymentMethodId}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="rounded-[18px] border bg-card p-2">
        <CrudTable
          columns={financialReportColumns}
          rows={rows}
          getRowId={(row) => row.order_id ?? 0}
          isLoading={isLoading}
          emptyMessage={
            isError
              ? "Gagal memuat data. Fitur ini mungkin memerlukan upgrade paket."
              : "Belum ada transaksi pada rentang tanggal ini."
          }
        />

        {total > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Total Halaman Ini</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{pageSummary?.item_count ?? 0} Item</span>
                {!!pageSummary?.discount_amount && (
                  <span className="text-destructive">
                    - {formatRupiah(pageSummary.discount_amount)}
                  </span>
                )}
                <span className="font-bold text-foreground">
                  {formatRupiah(pageSummary?.total_paid ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Menampilkan {rangeStart}–{rangeEnd} dari {total} transaksi
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="flex size-7 items-center justify-center rounded-md border text-muted-foreground disabled:opacity-40"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeftIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  className="flex size-7 items-center justify-center rounded-md border text-muted-foreground disabled:opacity-40"
                  aria-label="Berikutnya"
                >
                  <ChevronRightIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
