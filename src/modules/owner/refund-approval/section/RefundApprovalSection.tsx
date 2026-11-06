import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckIcon, ClipboardCheckIcon, XIcon } from "lucide-react"

import type { RefundRequest, RefundRequestStatus } from "@/entities/refund-request/model/refund-request.types"
import { refundRequestColumns } from "@/modules/owner/refund-approval/columns/refund-request.columns"
import { RefundDecisionDialog, type RefundDecision } from "@/modules/owner/refund-approval/components/RefundDecisionDialog"
import {
  REFUND_REQUEST_PAGE_SIZE,
  usePendingRefundRequestCount,
  useRefundRequests,
} from "@/modules/owner/refund-approval/refund-approval.queries"
import type { CrudColumn } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { PageHeader } from "@/shared/ui/page-header"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"
import { TablePagination } from "@/shared/ui/table-pagination"

type Tab = "pending" | "approved" | "rejected" | "all"

const TAB_IDS: Tab[] = ["pending", "approved", "rejected", "all"]

// /app/refund-approval — "Persetujuan Refund": refunds the cashiers asked for. Nothing
// (cash, stock, order status) changes until the owner approves; a rejection needs a note.
// ?tab= picks the status (default: Menunggu).
export function RefundApprovalSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get("tab")
  const tab: Tab = TAB_IDS.includes(rawTab as Tab) ? (rawTab as Tab) : "pending"
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState<{ request: RefundRequest; decision: RefundDecision } | null>(null)

  useEffect(() => setPage(1), [tab])

  const status: RefundRequestStatus | undefined = tab === "all" ? undefined : tab
  const { data, isLoading, isError, refetch } = useRefundRequests({ status, page })
  const { data: pendingCount = 0 } = usePendingRefundRequestCount()

  const tabs: PageTab<Tab>[] = [
    { id: "pending", label: "Menunggu", count: pendingCount },
    { id: "approved", label: "Disetujui" },
    { id: "rejected", label: "Ditolak" },
    { id: "all", label: "Semua" },
  ]

  function setTab(id: Tab) {
    const next = new URLSearchParams(searchParams)
    if (id === "pending") next.delete("tab")
    else next.set("tab", id)
    setSearchParams(next, { replace: true })
  }

  const columns = useMemo<CrudColumn<RefundRequest>[]>(
    () => [
      ...refundRequestColumns,
      {
        key: "actions",
        header: "Aksi",
        render: (row) =>
          row.status === "pending" ? (
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => setTarget({ request: row, decision: "approve" })}>
                <CheckIcon />
                Setujui
              </Button>
              <Button size="sm" variant="outline" onClick={() => setTarget({ request: row, decision: "reject" })}>
                <XIcon />
                Tolak
              </Button>
            </div>
          ) : null,
      },
    ],
    []
  )

  const rows = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Persetujuan Refund"
        description="Refund dari kasir menunggu persetujuan Anda. Uang dan stok baru berubah setelah disetujui."
      />

      <PageTabs label="Persetujuan Refund" tabs={tabs} active={tab} onChange={setTab} />

      <div role="tabpanel">
        <CrudTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          minWidth="min-w-[1100px]"
          empty={{
            icon: ClipboardCheckIcon,
            title: tab === "pending" ? "Tidak ada pengajuan yang menunggu" : "Belum ada pengajuan refund",
            hint: "Pengajuan dari kasir akan muncul di sini.",
          }}
          footer={
            data && data.total > 0 ? (
              <TablePagination
                page={data.page}
                totalPages={data.total_pages}
                total={data.total}
                perPage={REFUND_REQUEST_PAGE_SIZE}
                noun="pengajuan"
                onPageChange={setPage}
              />
            ) : undefined
          }
        />
      </div>

      <RefundDecisionDialog
        request={target?.request ?? null}
        decision={target?.decision ?? "approve"}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
      />
    </div>
  )
}
