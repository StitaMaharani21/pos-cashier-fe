import { format } from "date-fns"

import { RefundRequestStatusBadge } from "@/modules/owner/refund-approval/components/RefundRequestStatusBadge"
import { useOrderRefundRequests } from "@/modules/owner/refund-approval/refund-approval.queries"
import { formatRupiah } from "@/shared/lib/utils"

function formatWhen(value?: string): string {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy HH:mm")
}

// "Pengajuan Refund" block of the transaction detail: who asked, why, and what the owner
// decided. Renders nothing for an order that never had a request.
export function OrderRefundRequests({ orderId }: { orderId: number }) {
  const { data: requests = [] } = useOrderRefundRequests(orderId)
  if (requests.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">Pengajuan Refund ({requests.length})</h3>
      <ul className="flex flex-col gap-2">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-foreground">{request.request_no}</span>
              <RefundRequestStatusBadge status={request.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatWhen(request.created_at)} · {request.requested_by_name || "Kasir"} · Alasan: {request.reason}
            </p>
            <p className="text-xs text-muted-foreground">
              {request.items.map((item) => `${item.menu_name} ×${item.qty}`).join(", ")} · perkiraan{" "}
              {formatRupiah(request.total_amount)}
            </p>
            {request.status !== "pending" && (request.decision_note || request.decided_at) && (
              <p className="text-xs text-muted-foreground">
                {request.status === "rejected" ? "Ditolak" : request.status === "approved" ? "Disetujui" : "Dibatalkan"}{" "}
                {formatWhen(request.decided_at)}
                {request.decision_note ? ` · ${request.decision_note}` : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
