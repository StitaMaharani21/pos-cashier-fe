import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import type {
  IngredientStockMovement,
  MenuStockMovement,
} from "@/entities/stock-movement/model/stock-movement.types"
import {
  listAllIngredientsForPicker,
  listAllMenusForPicker,
  listIngredientStockMovements,
  listMenuStockMovements,
} from "@/modules/owner/stock-history/api/stock-history.service"
import { stockMovementColumns } from "@/modules/owner/stock-history/columns/stock-movement.columns"
import {
  StockHistoryFilters,
  type StockHistorySourceType,
} from "@/modules/owner/stock-history/components/StockHistoryFilters"
import {
  normalizeIngredientMovement,
  normalizeMenuMovement,
} from "@/modules/owner/stock-history/lib/normalize"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

const PER_PAGE = 20

export function StockHistorySection() {
  const [sourceType, setSourceType] = useState<StockHistorySourceType>("ingredient")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients", "all"],
    queryFn: listAllIngredientsForPicker,
  })
  const { data: menus = [] } = useQuery({
    queryKey: ["menus", "all"],
    queryFn: listAllMenusForPicker,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["stock-movements", sourceType, selectedId, page],
    queryFn: () =>
      sourceType === "ingredient"
        ? listIngredientStockMovements(selectedId ?? 0, page, PER_PAGE)
        : listMenuStockMovements(selectedId ?? 0, page, PER_PAGE),
    enabled: selectedId != null,
  })

  const rows = (data?.items ?? []).map((item) =>
    sourceType === "ingredient"
      ? normalizeIngredientMovement(item as IngredientStockMovement)
      : normalizeMenuMovement(item as MenuStockMovement)
  )
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  function handleSourceTypeChange(type: StockHistorySourceType) {
    setSourceType(type)
    setSelectedId(null)
    setPage(1)
  }

  function handleSelectedIdChange(id: number) {
    setSelectedId(id)
    setPage(1)
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, total)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Riwayat Stok</h1>
        <p className="text-sm text-muted-foreground">
          Pergerakan stok per bahan baku atau menu — penjualan otomatis maupun penyesuaian manual.
        </p>
      </div>

      <StockHistoryFilters
        sourceType={sourceType}
        onSourceTypeChange={handleSourceTypeChange}
        items={sourceType === "ingredient" ? ingredients : menus}
        selectedId={selectedId}
        onSelectedIdChange={handleSelectedIdChange}
      />

      <div className="rounded-[18px] border bg-card p-2">
        <CrudTable
          columns={stockMovementColumns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={selectedId != null && isLoading}
          emptyMessage={
            selectedId == null
              ? "Pilih bahan baku atau menu untuk melihat riwayat stoknya."
              : "Belum ada pergerakan stok untuk item ini."
          }
        />

        {selectedId != null && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Menampilkan {rangeStart}–{rangeEnd} dari {total} pergerakan
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
        )}
      </div>
    </div>
  )
}
