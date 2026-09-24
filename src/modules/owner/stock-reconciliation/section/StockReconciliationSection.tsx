import { useQuery } from "@tanstack/react-query"

import {
  getIngredientReconciliation,
  getMenuReconciliation,
} from "@/modules/owner/stock-reconciliation/api/stock-reconciliation.service"
import { ReconciliationTable } from "@/modules/owner/stock-reconciliation/components/ReconciliationTable"

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
      <div>
        <h1 className="text-xl font-bold text-foreground">Cek Selisih Stok</h1>
        <p className="text-sm text-muted-foreground">
          Bandingkan stok di tabel master dengan stok hasil pergerakan terakhir — selisih berarti
          ada perubahan stok di luar jalur penyesuaian/penjualan normal.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Bahan Baku</h2>
        <div className="rounded-[18px] border bg-card p-2">
          <ReconciliationTable rows={ingredientRows} isLoading={ingredientLoading} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Menu</h2>
        <div className="rounded-[18px] border bg-card p-2">
          <ReconciliationTable rows={menuRows} isLoading={menuLoading} />
        </div>
      </div>
    </div>
  )
}
