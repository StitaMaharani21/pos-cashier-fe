import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useOrderSource } from "@/modules/owner/financial-report/financial-report.queries"
import { hintCopy } from "@/shared/access/upsellContent"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { LockedTile } from "@/shared/access/LockedTile"
import { Card } from "@/shared/ui/card"

const SLICE_COLORS = { qr: "#0042A3", manual: "#F59E0B" }

// pos-kasir-be has no self-serve checkout for plan changes (see
// upsellContent.ts's contactLink) — same WhatsApp-handoff idiom, but built
// inline rather than through contactLink(feature, hint) since "Sumber
// Order" is a plan-only gate with no corresponding entitlement.Feature on
// the backend (see OrderSourceTab's plan check below).
function upgradeWaLink(): string | undefined {
  const salesWa = import.meta.env.VITE_SALES_WA as string | undefined
  if (!salesWa) return undefined
  const text = "Halo Neela, saya ingin upgrade ke Pro untuk fitur Sumber Order di Laporan Keuangan."
  return `https://wa.me/${salesWa}?text=${encodeURIComponent(text)}`
}

// "Sumber Order" tab — Pro/Enterprise only. GET /reports/sales/order-source
// 403s for a Starter-plan store (internal/middleware's RequirePlan on the
// backend), so this mirrors that gate client side off
// useCapabilities().caps?.plan directly (not a Feature/hasFeature check —
// there's no entitlement.Feature for this, it's a bare plan tier gate) and
// skips firing the request at all when locked, rendering LockedTile
// scoped to just this div instead of the request ever going out. The tab
// itself still shows up in PageTabs; only its body is gated, so the rest
// of Laporan Keuangan stays usable for a Starter-plan owner who clicks it.
export function OrderSourceTab({ from, to }: { from: string; to: string }) {
  const { caps, isLoading: capsLoading } = useCapabilities()
  const isPro = caps?.plan === "pro" || caps?.plan === "enterprise"

  const query = useOrderSource({ from, to }, isPro)

  if (capsLoading) {
    return <div className="h-[280px] animate-pulse rounded-xl border bg-muted/40" />
  }

  if (!isPro) {
    const href = upgradeWaLink()
    return (
      <LockedTile
        badge={hintCopy.UPGRADE_PRO.badge}
        title="Sumber Order (QR vs Manual)"
        description="Lihat perbandingan order yang masuk lewat QR self-order pelanggan vs yang diinput manual oleh kasir. Upgrade ke paket Pro untuk membuka laporan ini."
        cta={href ? hintCopy.UPGRADE_PRO.cta : undefined}
        href={href}
      />
    )
  }

  if (query.isPending) {
    return <div className="h-[280px] animate-pulse rounded-xl border bg-muted/40" />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data sumber order"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const data = query.data

  if (data.total_order_count === 0) {
    return (
      <ReportStateCard
        title="Belum ada transaksi pada periode ini"
        hint="Coba pilih rentang tanggal yang lain."
      />
    )
  }

  const items = [
    { key: "qr", label: "QR Self-Order", count: data.qr_order_count, percentage: data.qr_order_percentage, color: SLICE_COLORS.qr },
    { key: "manual", label: "Input Manual", count: data.manual_order_count, percentage: data.manual_order_percentage, color: SLICE_COLORS.manual },
  ]

  return (
    <Card className="p-6">
      <h3 className="pb-4 text-sm font-semibold text-foreground">Order via QR Self-Order vs Manual</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="count"
                nameKey="label"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={2}
                stroke="none"
              >
                {items.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Total</span>
            <span className="text-base font-bold text-foreground">{data.total_order_count}</span>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-3">
          {items.map((item, index) => (
            <div key={item.key}>
              <div className="flex items-center gap-2">
                <span className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-sm font-semibold text-foreground">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="mt-0.5 pl-5 text-xs text-muted-foreground">{item.count} Order</p>
              {index < items.length - 1 && <div className="mt-3 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
