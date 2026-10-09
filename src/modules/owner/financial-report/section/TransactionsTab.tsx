import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ReceiptIcon, SearchIcon } from "lucide-react"

import { listCashiers } from "@/modules/owner/cashier/api/cashier.service"
import { reportTransactionColumns } from "@/modules/owner/financial-report/columns/report-transaction.columns"
import { useReportTransactions } from "@/modules/owner/financial-report/financial-report.queries"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { TablePagination } from "@/shared/ui/table-pagination"

const PER_PAGE = TABLE_PER_PAGE
const ALL_CASHIERS = "all-cashiers"

interface TransactionsTabProps {
  from: string
  to: string
  // Kasir/No. Order are lifted up to FinancialReportSection (unlike every
  // other tab's fully-local state) so the page header's Export button can
  // include them as kasir_id/order_no on GET /reports/sales/export when
  // this tab is active — the export should match what the owner is
  // currently filtered to, not always the unfiltered list.
  cashierId: number | undefined
  onCashierIdChange: (id: number | undefined) => void
  orderNo: string
  onOrderNoChange: (value: string) => void
}

// "Detail Transaksi" tab — the only tab with its own local filters (Kasir,
// No. Order) on top of the page-wide date range, since GET
// /reports/sales/transactions is the only one of the four endpoints that
// accepts them. Mirrors sales-report's SalesReportSection/CrudTable idiom.
export function TransactionsTab({
  from,
  to,
  cashierId,
  onCashierIdChange,
  orderNo,
  onOrderNoChange,
}: TransactionsTabProps) {
  // The raw, not-yet-debounced input value stays local — only the debounced
  // result is pushed up to the shell (and from there into both this tab's
  // own query and the Export button's params).
  const [search, setSearch] = useState(orderNo)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => onOrderNoChange(search), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [from, to, cashierId, orderNo])

  const { data: cashiers = [] } = useQuery({
    queryKey: ["cashiers", "all"],
    queryFn: () => listCashiers(1, 100),
  })

  const { data, isLoading, isError, refetch } = useReportTransactions({
    from,
    to,
    kasirId: cashierId,
    orderNo,
    page,
    perPage: PER_PAGE,
  })

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = total > 0 ? Math.ceil(total / (data?.per_page || PER_PAGE)) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Select
          value={cashierId != null ? String(cashierId) : ALL_CASHIERS}
          onValueChange={(value) => onCashierIdChange(value === ALL_CASHIERS ? undefined : Number(value))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Kasir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CASHIERS}>Semua Kasir</SelectItem>
            {cashiers.map((cashier) => (
              <SelectItem key={cashier.id} value={String(cashier.id)}>
                {cashier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari No. Order..."
            className="pl-9"
          />
        </div>
      </div>

      <CrudTable
        columns={reportTransactionColumns}
        rows={rows}
        getRowId={(row) => row.order_no}
        isLoading={isLoading}
        isError={isError}
        errorHint="Laporan transaksi mungkin memerlukan paket Pro atau fitur tambahan Laporan."
        onRetry={() => refetch()}
        minWidth="min-w-[960px]"
        empty={{
          icon: ReceiptIcon,
          title: "Belum ada transaksi",
          hint: "Tidak ada transaksi pada rentang tanggal dan filter ini.",
        }}
        footer={
          total > 0 && (
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              perPage={PER_PAGE}
              noun="transaksi"
              onPageChange={setPage}
            />
          )
        }
      />
    </div>
  )
}
