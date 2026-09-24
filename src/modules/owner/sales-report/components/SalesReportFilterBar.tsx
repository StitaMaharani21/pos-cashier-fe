import { SearchIcon } from "lucide-react"

import type { Cashier } from "@/entities/cashier/model/cashier.types"
import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.types"
import { DATE_PRESET_OPTIONS, type DatePreset } from "@/modules/owner/sales-report/lib/date-presets"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

const ALL_CASHIERS = "all-cashiers"
const ALL_PAYMENT_METHODS = "all-payment-methods"

interface SalesReportFilterBarProps {
  preset: DatePreset
  onPresetChange: (preset: DatePreset) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
  cashiers: Cashier[]
  cashierId: number | undefined
  onCashierIdChange: (id: number | undefined) => void
  paymentMethods: PaymentMethod[]
  paymentMethodId: number | undefined
  onPaymentMethodIdChange: (id: number | undefined) => void
  search: string
  onSearchChange: (value: string) => void
}

// Filters ONLY the "Rincian Transaksi" table below — the KPI cards and
// trend chart above read fixed-window dashboard endpoints that don't accept
// a date range, so this bar is deliberately scoped to the table alone.
export function SalesReportFilterBar({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  cashiers,
  cashierId,
  onCashierIdChange,
  paymentMethods,
  paymentMethodId,
  onPaymentMethodIdChange,
  search,
  onSearchChange,
}: SalesReportFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex gap-2">
        {DATE_PRESET_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={preset === option.value ? "default" : "outline"}
            onClick={() => onPresetChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={customStart}
          max={customEnd || undefined}
          onChange={(event) => onCustomStartChange(event.target.value)}
          className={cn(
            "h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            preset === "custom" && "border-primary"
          )}
        />
        <span className="text-sm text-muted-foreground">–</span>
        <input
          type="date"
          value={customEnd}
          min={customStart || undefined}
          onChange={(event) => onCustomEndChange(event.target.value)}
          className={cn(
            "h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            preset === "custom" && "border-primary"
          )}
        />
      </div>

      <Select
        value={cashierId != null ? String(cashierId) : ALL_CASHIERS}
        onValueChange={(value) =>
          onCashierIdChange(value === ALL_CASHIERS ? undefined : Number(value))
        }
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

      <Select
        value={paymentMethodId != null ? String(paymentMethodId) : ALL_PAYMENT_METHODS}
        onValueChange={(value) =>
          onPaymentMethodIdChange(value === ALL_PAYMENT_METHODS ? undefined : Number(value))
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Semua Metode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_PAYMENT_METHODS}>Semua Metode</SelectItem>
          {paymentMethods.map((method) => (
            <SelectItem key={method.id} value={String(method.id)}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative min-w-[220px] flex-1">
        <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari No. Order..."
          className="pl-9"
        />
      </div>
    </div>
  )
}
