import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HistoryIcon } from "lucide-react"

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
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { PageHeader } from "@/shared/ui/page-header"
import { TablePagination } from "@/shared/ui/table-pagination"

const PER_PAGE = TABLE_PER_PAGE

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

  const { data, isLoading, isError, refetch } = useQuery({
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Riwayat Stok"
        description="Pergerakan stok per bahan baku atau menu — penjualan otomatis maupun penyesuaian manual."
      />

      <StockHistoryFilters
        sourceType={sourceType}
        onSourceTypeChange={handleSourceTypeChange}
        items={sourceType === "ingredient" ? ingredients : menus}
        selectedId={selectedId}
        onSelectedIdChange={handleSelectedIdChange}
      />

      <CrudTable
        columns={stockMovementColumns}
        rows={rows}
        getRowId={(row) => row.id}
        isLoading={selectedId != null && isLoading}
        isError={isError}
        onRetry={() => refetch()}
        minWidth="min-w-[900px]"
        empty={
          selectedId == null
            ? { icon: HistoryIcon, title: "Pilih item terlebih dahulu", hint: "Pilih bahan baku atau menu untuk melihat riwayat stoknya." }
            : { icon: HistoryIcon, title: "Belum ada pergerakan stok", hint: "Belum ada penjualan atau penyesuaian untuk item ini." }
        }
        footer={
          selectedId != null &&
          total > 0 && (
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              perPage={PER_PAGE}
              noun="pergerakan"
              onPageChange={setPage}
            />
          )
        }
      />
    </div>
  )
}
