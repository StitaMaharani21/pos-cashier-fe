import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, ExternalLinkIcon, PrinterIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

import type { Table } from "@/entities/table/model/table.types"
import { TABLE_QR_KEY, getTableQR, rotateTableQR } from "@/modules/owner/table/api/table.service"
import { printQrCards } from "@/modules/owner/table/lib/print-qr"
import { useAuthStore } from "@/shared/auth/store"
import { buildSelfOrderUrl } from "@/shared/lib/self-order-url"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { friendlyErrorMessage } from "@/shared/api/error-message"

interface TableQrDialogProps {
  table: Table | null
  // Shown on the printed card (Pengaturan Bisnis → nama bisnis); optional.
  storeName: string
  onOpenChange: (open: boolean) => void
}

// "QR" on a table row: the table's PERMANENT QR. Print it once and leave it on
// the table; it keeps working until the owner replaces it with "Ganti QR"
// (a lost or leaked sticker). Scanning it opens (or reuses) the table's order
// session on its own, so nobody has to "open" the table first.
export function TableQrDialog({ table, storeName, onOpenChange }: TableQrDialogProps) {
  return (
    <Dialog open={table != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Mounted only while open, so every open reads the current code. */}
        {table && <QrFlow key={table.id} table={table} storeName={storeName} />}
      </DialogContent>
    </Dialog>
  )
}

function errorText(error: unknown): string {
  return friendlyErrorMessage(error, "Gagal memuat QR meja")
}

function QrFlow({ table, storeName }: { table: Table; storeName: string }) {
  const queryClient = useQueryClient()
  const storeCode = useAuthStore((state) => state.store_code) ?? ""
  const [confirmingRotate, setConfirmingRotate] = useState(false)
  const tableId = table.id as number

  // Creates the code the first time it's asked for; afterwards it is stable.
  const qr = useQuery({
    queryKey: [...TABLE_QR_KEY, tableId],
    queryFn: () => getTableQR(tableId),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const rotate = useMutation({
    mutationFn: () => rotateTableQR(tableId),
    onSuccess: (next) => {
      queryClient.setQueryData([...TABLE_QR_KEY, tableId], next)
      // The list carries the code too (used by "Cetak semua QR").
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      setConfirmingRotate(false)
      toast.success("QR diganti. Cetak ulang QR untuk meja ini.")
    },
    onError: (error) => {
      setConfirmingRotate(false)
      toast.error(errorText(error))
    },
  })

  const url = qr.data ? buildSelfOrderUrl(storeCode, qr.data.qr_code) : ""

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Tautan disalin")
    } catch {
      toast.error("Gagal menyalin tautan")
    }
  }

  function print() {
    if (!printQrCards([{ number: table.number ?? "", url }], storeName)) {
      toast.error("Jendela cetak diblokir peramban. Izinkan pop-up lalu coba lagi.")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">QR Meja {table.number}</DialogTitle>
        <DialogDescription>
          QR ini permanen: cetak sekali dan taruh di meja. Pelanggan tinggal memindai QR ini untuk melihat menu dan memesan dari HP mereka.
        </DialogDescription>
      </DialogHeader>

      {qr.isPending && (
        <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
          <RefreshCwIcon className="size-6 animate-spin" />
          Menyiapkan QR…
        </div>
      )}

      {qr.isError && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlertIcon className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">{errorText(qr.error)}</p>
          <Button variant="outline" onClick={() => qr.refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      {qr.data && (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl border bg-white p-4">
              <QRCodeSVG value={url} size={216} marginSize={0} level="M" aria-label={`QR meja ${table.number}`} />
            </div>
            {/* A phone can't open the owner's own machine through localhost. */}
            {isLocalHost(url) && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-700">
                QR ini memakai alamat yang hanya bisa dibuka dari komputer ini, jadi HP pelanggan tidak akan bisa
                membukanya. Hubungi tim Neela sebelum mencetak.
              </p>
            )}
            <code className="max-w-full break-all rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {url}
            </code>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            <Button variant="outline" onClick={copyLink}>
              <CopyIcon />
              Salin tautan
            </Button>
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noreferrer">
                <ExternalLinkIcon />
                Buka
              </a>
            </Button>
            <Button onClick={print}>
              <PrinterIcon />
              Cetak
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 border-t pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              QR hilang atau sudah menyebar ke orang yang tidak seharusnya? Ganti QR — yang lama langsung berhenti
              berlaku.
            </p>
            <Button variant="outline" size="sm" onClick={() => setConfirmingRotate(true)}>
              <RefreshCwIcon />
              Ganti QR
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmingRotate}
        onOpenChange={setConfirmingRotate}
        title="Ganti QR meja ini?"
        description={`QR Meja ${table.number} yang sudah dicetak akan berhenti berlaku, dan pelanggan yang sedang memesan dengan QR lama tidak bisa melanjutkan pesanannya. Anda perlu mencetak dan menempel QR yang baru.`}
        confirmLabel="Ganti QR"
        pendingLabel="Mengganti..."
        isPending={rotate.isPending}
        onConfirm={() => rotate.mutate()}
      />
    </div>
  )
}

function isLocalHost(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost")
  } catch {
    return false
  }
}
