import { useQuery } from "@tanstack/react-query"

import {
  getIngredientReconciliation,
  getMenuReconciliation,
} from "@/modules/owner/stock-reconciliation/api/stock-reconciliation.service"
import { ReconciliationTable } from "@/modules/owner/stock-reconciliation/components/ReconciliationTable"
import { PageHeader } from "@/shared/ui/page-header"

export function StockReconciliationSection() {
  const { data: ingredientRows = [], isLoading: ingredientLoading } = useQuery({
    queryKey: ["stock-reconciliation", "ingredient"],
    queryFn: getIngredientReconciliation,
  })
  const { data: menuRows = [], isLoading: menuLoading } = useQuery({
    queryKey: ["stock-reconciliation", "menu"],
    queryFn: getMenuReconciliation,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cocokkan Stok"
        description="Cocokkan stok yang tertulis dengan stok hasil hitungan dari catatan stok masuk dan keluar. Kalau ada yang beda, berarti ada stok yang berubah tanpa tercatat di penjualan atau koreksi stok."
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Bahan Baku</h2>
        <ReconciliationTable rows={ingredientRows} isLoading={ingredientLoading} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Menu</h2>
        <ReconciliationTable rows={menuRows} isLoading={menuLoading} />
      </div>
    </div>
  )
}
