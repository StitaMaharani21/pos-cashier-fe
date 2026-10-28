import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownToLineIcon, ArrowUpFromLineIcon, HistoryIcon, PlusIcon } from "lucide-react"

import type {
  IngredientStockMovement,
  MenuStockMovement,
  StockMovementDirection,
} from "@/entities/stock-movement/model/stock-movement.types"
import {
  listIngredientStockMovements,
  listMenuStockMovements,
} from "@/modules/owner/stock-history/api/stock-history.service"
import { stockMovementColumns } from "@/modules/owner/stock-history/columns/stock-movement.columns"
import {
  normalizeIngredientMovement,
  normalizeMenuMovement,
} from "@/modules/owner/stock-history/lib/normalize"
import type { StockItem } from "@/modules/owner/stock-history/lib/stock-item"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { cn, formatNumber } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { TablePagination } from "@/shared/ui/table-pagination"

const PER_PAGE = TABLE_PER_PAGE

type DirectionFilter = StockMovementDirection | "all"

const FILTERS: { id: DirectionFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "in", label: "Masuk" },
  { id: "out", label: "Keluar" },
]

interface StockMovementsSheetProps {
  // null = closed.
  item: StockItem | null
  onOpenChange: (open: boolean) => void
  // Omitted = the role can't add stock.
  onAddStock?: (item: StockItem) => void
}

// The stock turnover of one item: how much came in and went out in total,
// and every movement (newest first), filterable to stock in / stock out.
export function StockMovementsSheet({ item, onOpenChange, onAddStock }: StockMovementsSheetProps) {
  return (
    <Sheet open={item != null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-4xl">
        {/* Keyed + mounted only while open, so page and filter start fresh per item. */}
        {item && <SheetBody key={`${item.source}-${item.id}`} item={item} onAddStock={onAddStock} />}
      </SheetContent>
    </Sheet>
  )
}

function SheetBody({ item, onAddStock }: { item: StockItem; onAddStock?: (item: StockItem) => void }) {
  const [page, setPage] = useState(1)
  const [direction, setDirection] = useState<DirectionFilter>("all")
  const apiDirection = direction === "all" ? undefined : direction

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["stock-movements", item.source, item.id, page, apiDirection ?? "all"],
    queryFn: () =>
      item.source === "ingredient"
        ? listIngredientStockMovements(item.id, page, PER_PAGE, apiDirection)
        : listMenuStockMovements(item.id, page, PER_PAGE, apiDirection),
  })

  const rows = (data?.items ?? []).map((row) =>
    item.source === "ingredient"
      ? normalizeIngredientMovement(row as IngredientStockMovement)
      : normalizeMenuMovement(row as MenuStockMovement)
  )
  const total = data?.total ?? 0

  return (
    <>
      <SheetHeader className="pr-14">
        <SheetTitle>Riwayat Stok — {item.name}</SheetTitle>
        <SheetDescription>
          Stok saat ini:{" "}
          {item.stock == null ? "belum diisi" : `${formatNumber(item.stock)} ${item.unit}`}
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={ArrowDownToLineIcon}
            label="Total masuk"
            value={data?.totalIn ?? 0}
            unit={item.unit}
            tone="in"
          />
          <SummaryCard
            icon={ArrowUpFromLineIcon}
            label="Total keluar"
            value={data?.totalOut ?? 0}
            unit={item.unit}
            tone="out"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter arah stok" className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={direction === filter.id}
                onClick={() => {
                  setDirection(filter.id)
                  setPage(1)
                }}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  direction === filter.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {onAddStock && (
            <Button className="h-10" onClick={() => onAddStock(item)}>
              <PlusIcon />
              Tambah Stok
            </Button>
          )}
        </div>

        <CrudTable
          columns={stockMovementColumns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          minWidth="min-w-[820px]"
          empty={{
            icon: HistoryIcon,
            title: direction === "all" ? "Belum ada catatan stok masuk dan keluar" : "Tidak ada catatan yang cocok",
            hint:
              direction === "all"
                ? "Belum ada penjualan, stok masuk, atau koreksi stok untuk barang ini."
                : "Ubah pilihan untuk melihat catatan lainnya.",
          }}
          footer={
            !isLoading &&
            total > 0 && (
              <TablePagination
                page={page}
                totalPages={data?.totalPages ?? 0}
                total={total}
                perPage={PER_PAGE}
                noun="pergerakan"
                onPageChange={setPage}
              />
            )
          }
        />
      </div>
    </>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: typeof HistoryIcon
  label: string
  value: number
  unit: string
  tone: "in" | "out"
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          tone === "in" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : "bg-destructive/10 text-destructive"
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="truncate text-lg font-bold text-foreground tabular-nums">
          {formatNumber(value)} <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </span>
      </div>
    </div>
  )
}
