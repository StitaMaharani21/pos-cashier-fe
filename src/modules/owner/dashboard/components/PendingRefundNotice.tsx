import { ClipboardCheckIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { usePendingRefundRequestCount } from "@/modules/owner/refund-approval/refund-approval.queries"

// Reminder above the dashboard cards while cashiers' refund requests wait for the
// owner. Hidden when there are none (or the count can't be read).
export function PendingRefundNotice() {
  const { data: count = 0 } = usePendingRefundRequestCount()
  if (count <= 0) return null

  return (
    <Link
      to="/app/refund-approval"
      className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors outline-none hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-ring dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
    >
      <ClipboardCheckIcon className="size-5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        <strong className="font-semibold">{count} pengajuan refund</strong> menunggu persetujuan Anda.
      </span>
      <span className="shrink-0 font-semibold underline">Tinjau</span>
    </Link>
  )
}
