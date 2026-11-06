import { useState } from "react"
import { toast } from "sonner"

import type { RefundRequest } from "@/entities/refund-request/model/refund-request.types"
import { useApproveRefundRequest, useRejectRefundRequest } from "@/modules/owner/refund-approval/refund-approval.queries"
import { ApiError } from "@/shared/api/client"
import { friendlyErrorMessage } from "@/shared/api/error-message"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Textarea } from "@/shared/ui/textarea"

export type RefundDecision = "approve" | "reject"

interface RefundDecisionDialogProps {
  request: RefundRequest | null
  decision: RefundDecision
  onOpenChange: (open: boolean) => void
}

// Setujui / Tolak one pending request. Approving runs the refund right away (cash out of
// the running shift, optional stock restore), so the dialog spells out what will happen.
// A rejection needs a note, so the cashier knows why.
export function RefundDecisionDialog({ request, decision, onOpenChange }: RefundDecisionDialogProps) {
  const [note, setNote] = useState("")
  const approve = useApproveRefundRequest()
  const reject = useRejectRefundRequest()
  const isApprove = decision === "approve"
  const isPending = approve.isPending || reject.isPending
  const noteMissing = !isApprove && note.trim() === ""

  function close(open: boolean) {
    if (isPending) return
    if (!open) setNote("")
    onOpenChange(open)
  }

  function submit() {
    if (!request || noteMissing) return
    const mutation = isApprove ? approve : reject
    mutation.mutate(
      { id: request.id, note: note.trim() },
      {
        onSuccess: () => {
          toast.success(isApprove ? "Refund disetujui dan diproses" : "Pengajuan refund ditolak")
          setNote("")
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "NO_ACTIVE_SHIFT") {
            toast.error("Belum ada kasir yang sedang buka. Buka kasir dulu: uang refund keluar dari laci kasir yang berjalan.")
            return
          }
          if (error instanceof ApiError && error.code === "REFUND_REQUEST_NOT_PENDING") {
            toast.error("Pengajuan ini sudah diputuskan. Daftar akan dimuat ulang.")
            onOpenChange(false)
            return
          }
          toast.error(friendlyErrorMessage(error, "Gagal memproses pengajuan. Coba lagi."))
        },
      }
    )
  }

  return (
    <Dialog open={request !== null} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isApprove ? "Setujui Refund?" : "Tolak Pengajuan Refund?"}</DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Refund langsung diproses: uang kembali dikeluarkan dari laci kasir yang sedang buka."
              : "Pengajuan ditutup dan tidak ada uang atau stok yang berubah. Kasir akan melihat alasan penolakan."}
          </DialogDescription>
        </DialogHeader>

        {request && (
          <div className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border bg-muted/30 p-3">
              <dt className="text-muted-foreground">Pesanan</dt>
              <dd className="font-medium">{request.trx_no || request.order_no}</dd>
              <dt className="text-muted-foreground">Diajukan oleh</dt>
              <dd>{request.requested_by_name || "—"}</dd>
              <dt className="text-muted-foreground">Item</dt>
              <dd>{request.items.map((item) => `${item.menu_name} ×${item.qty}`).join(", ")}</dd>
              <dt className="text-muted-foreground">Perkiraan uang kembali</dt>
              <dd className="font-semibold tabular-nums">{formatRupiah(request.total_amount)}</dd>
              <dt className="text-muted-foreground">Stok</dt>
              <dd>{request.restore_stock ? "Dikembalikan (barang masih layak jual)" : "Tidak dikembalikan"}</dd>
              <dt className="text-muted-foreground">Alasan</dt>
              <dd>{request.reason}</dd>
            </dl>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="refund-decision-note" className="font-medium">
                {isApprove ? "Catatan (opsional)" : "Alasan penolakan"}
                {!isApprove && <span className="text-destructive"> *</span>}
              </label>
              <Textarea
                id="refund-decision-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={300}
                placeholder={isApprove ? "Mis. sudah dicek dengan pelanggan" : "Mis. makanan sudah dimakan habis"}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={() => close(false)}>
            Batal
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            disabled={isPending || noteMissing}
            onClick={submit}
          >
            {isPending ? "Memproses..." : isApprove ? "Setujui & Refund" : "Tolak Pengajuan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
