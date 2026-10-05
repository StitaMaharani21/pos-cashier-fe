import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CopyIcon, ExternalLinkIcon, PrinterIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

import type { Table } from "@/entities/table/model/table.types"
import { openTableSession } from "@/modules/owner/table/api/table.service"
import { useAuthStore } from "@/shared/auth/store"
import { buildSelfOrderUrl } from "@/shared/lib/self-order-url"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

interface TableQrDialogProps {
  table: Table | null
  onOpenChange: (open: boolean) => void
}

// "QR" on a table row: opens the table's guest session and shows the QR a
// customer scans to order from their phone. The session (and so the QR) lasts
// 4 hours — it is shown on a screen or printed per service, not a permanent
// sticker.
export function TableQrDialog({ table, onOpenChange }: TableQrDialogProps) {
  return (
    <Dialog open={table != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Mounted only while open, so every open asks for a fresh session. */}
        {table && <QrFlow key={table.id} table={table} />}
      </DialogContent>
    </Dialog>
  )
}

function QrFlow({ table }: { table: Table }) {
  const storeCode = useAuthStore((state) => state.store_code) ?? ""
  const [attempt, setAttempt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const qrRef = useRef<HTMLDivElement>(null)

  // A query keyed by `attempt` rather than a mutation: StrictMode's dev
  // remount can't lose the response, and "Muat ulang" is just a new attempt.
  // Safe to repeat — the backend reuses the table's active session.
  const session = useQuery({
    queryKey: ["table-session", table.id, attempt],
    queryFn: () => openTableSession(table.id as number),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const url = session.data ? buildSelfOrderUrl(storeCode, session.data.qr_token) : ""
  const expiresAt = session.data ? new Date(session.data.expired_at).getTime() : 0
  const minutesLeft = Math.max(0, Math.ceil((expiresAt - now) / 60_000))
  const expired = session.data != null && minutesLeft === 0

  // Prints just the QR + table number in a throwaway window, not the console
  // page (sidebar and all) behind the dialog.
  function printQr() {
    const svg = qrRef.current?.innerHTML
    const win = window.open("", "_blank", "width=420,height=560")
    if (!svg || !win) {
      toast.error("Gagal membuka jendela cetak")
      return
    }
    win.document.write(
      `<!doctype html><title>QR Meja ${escapeHtml(table.number ?? "")}</title>` +
        `<body style="font-family:sans-serif;text-align:center;margin:32px">` +
        `<h1 style="margin:0 0 4px">Meja ${escapeHtml(table.number ?? "")}</h1>` +
        `<p style="margin:0 0 20px;color:#555">Scan untuk melihat menu &amp; memesan</p>` +
        `${svg.replace("<svg", '<svg width="280" height="280"')}</body>`
    )
    win.document.close()
    win.focus()
    win.print()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Tautan disalin")
    } catch {
      toast.error("Gagal menyalin tautan")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">QR Meja {table.number}</DialogTitle>
        <DialogDescription>Customer scan QR ini untuk melihat menu dan memesan dari HP mereka.</DialogDescription>
      </DialogHeader>

      {session.isPending && (
        <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
          <RefreshCwIcon className="size-6 animate-spin" />
          Menyiapkan QR…
        </div>
      )}

      {session.isError && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlertIcon className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            {errorText(session.error)}
          </p>
          <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            Coba lagi
          </Button>
        </div>
      )}

      {session.data && (
        <>
          <div className="flex flex-col items-center gap-3">
            <div ref={qrRef} className={`rounded-2xl border bg-white p-4 ${expired ? "opacity-40" : ""}`}>
              <QRCodeSVG value={url} size={216} marginSize={0} level="M" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {expired
                ? "QR sudah kedaluwarsa. Buat ulang untuk sesi baru."
                : `Berlaku ±${minutesLeft >= 60 ? `${Math.floor(minutesLeft / 60)} jam ${minutesLeft % 60} menit` : `${minutesLeft} menit`} lagi`}
            </p>
            {/* A phone can't open the owner's own machine through localhost. */}
            {isLocalHost(url) && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-700">
                Tautan ini memakai alamat lokal sehingga HP customer tidak bisa membukanya. Atur VITE_PUBLIC_APP_URL ke
                alamat yang bisa diakses dari HP.
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
            <Button variant="outline" onClick={printQr}>
              <PrinterIcon />
              Cetak
            </Button>
            <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
              <RefreshCwIcon />
              Muat ulang
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Gagal membuat QR meja"
}

function isLocalHost(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost")
  } catch {
    return false
  }
}
