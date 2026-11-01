import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowRightIcon, HistoryIcon } from "lucide-react"

import type { PriceHistoryEntityType, PriceHistoryEntry } from "@/entities/price-history/model/price-history.types"
import { listPriceHistory } from "@/modules/owner/price-history/api/price-history.service"
import type { CrudColumn } from "@/shared/api/crud/types"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { formatRupiah } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { TablePagination } from "@/shared/ui/table-pagination"

const PER_PAGE = TABLE_PER_PAGE

// What is being priced, for the sheet's wording.
const PRICE_NOUN: Record<PriceHistoryEntityType, string> = {
  menu: "harga jual",
  addon_option: "harga opsi",
  ingredient: "harga beli",
}

const SOURCE_LABEL: Record<PriceHistoryEntry["source"], string> = {
  CREATE: "Harga awal",
  UPDATE: "Diubah di form",
  STOCK_IN: "Dari stok masuk",
  BACKFILL: "Harga saat pencatatan dimulai",
}

export interface PriceHistoryTarget {
  type: PriceHistoryEntityType
  id: number
  name: string
}

interface PriceHistorySheetProps {
  // null = closed.
  target: PriceHistoryTarget | null
  onOpenChange: (open: boolean) => void
}

// Every change of one price, newest first. Sales reports are not affected by
// these changes: each order keeps the price it was sold at.
export function PriceHistorySheet({ target, onOpenChange }: PriceHistorySheetProps) {
  return (
    <Sheet open={target != null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        {/* Keyed + mounted only while open, so the page starts fresh per item. */}
        {target && <SheetBody key={`${target.type}-${target.id}`} target={target} />}
      </SheetContent>
    </Sheet>
  )
}

function SheetBody({ target }: { target: PriceHistoryTarget }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["price-history", target.type, target.id, page],
    queryFn: () => listPriceHistory({ entityType: target.type, entityId: target.id, page, perPage: PER_PAGE }),
  })
  const total = data?.total ?? 0

  return (
    <>
      <SheetHeader className="pr-14">
        <SheetTitle>Riwayat {PRICE_NOUN[target.type]} — {target.name}</SheetTitle>
        <SheetDescription>
          Perubahan harga hanya berlaku untuk pesanan baru. Laporan penjualan lama tetap memakai harga saat transaksi.
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <CrudTable
          columns={COLUMNS}
          rows={data?.items ?? []}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          minWidth="min-w-[520px]"
          empty={{
            icon: HistoryIcon,
            title: "Belum ada riwayat harga",
            hint: "Perubahan harga berikutnya akan tercatat di sini.",
          }}
          footer={
            !isLoading &&
            total > 0 && (
              <TablePagination
                page={page}
                totalPages={data?.totalPages ?? 0}
                total={total}
                perPage={PER_PAGE}
                noun="perubahan"
                onPageChange={setPage}
              />
            )
          }
        />
      </div>
    </>
  )
}

const COLUMNS: CrudColumn<PriceHistoryEntry>[] = [
  {
    key: "created_at",
    header: "Waktu",
    className: "whitespace-nowrap",
    render: (row) => (row.created_at ? format(new Date(row.created_at), "d MMM yyyy HH:mm") : "—"),
  },
  {
    key: "price",
    header: "Harga",
    className: "tabular-nums whitespace-nowrap",
    render: (row) => (
      <span className="inline-flex items-center gap-2">
        {row.previous_price != null && (
          <>
            <span className="text-muted-foreground">{formatRupiah(row.previous_price)}</span>
            <ArrowRightIcon className="size-3.5 text-muted-foreground" />
          </>
        )}
        <span className="font-semibold text-foreground">{formatRupiah(row.price)}</span>
      </span>
    ),
  },
  {
    key: "source",
    header: "Sumber",
    render: (row) => SOURCE_LABEL[row.source] ?? row.source,
  },
  {
    key: "created_by_name",
    header: "Oleh",
    render: (row) => row.created_by_name || "—",
  },
]
