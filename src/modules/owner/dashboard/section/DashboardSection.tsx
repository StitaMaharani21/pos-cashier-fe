import { KpiCardsGrid } from "@/modules/owner/dashboard/components/KpiCardsGrid"
import { LowStockCard } from "@/modules/owner/dashboard/components/LowStockCard"
import { OrderCompositionCard } from "@/modules/owner/dashboard/components/OrderCompositionCard"
import { PaymentMethodDonutCard } from "@/modules/owner/dashboard/components/PaymentMethodDonutCard"
import { PopularMenuTable } from "@/modules/owner/dashboard/components/PopularMenuTable"
import { SalesTrendCard } from "@/modules/owner/dashboard/components/SalesTrendCard"
import { TransactionLimitCard } from "@/modules/owner/dashboard/components/TransactionLimitCard"

export function DashboardSection() {
  return (
    <div className="flex flex-col gap-5">
      <TransactionLimitCard />

      <KpiCardsGrid />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <PopularMenuTable />
        <PaymentMethodDonutCard />
      </div>

      <SalesTrendCard />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LowStockCard />
        <OrderCompositionCard />
      </div>
    </div>
  )
}
