import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CircleCheckIcon, CopyIcon, QrCodeIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

import type { PairingCode } from "@/entities/device/model/device.types"
import { DEVICES_KEY, generatePairingCode, listDevices } from "@/modules/owner/device/api/device.service"
import { buildPairingPayload, cashierApiUrl, isLocalOnlyUrl } from "@/modules/owner/device/lib/pairing-payload"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useAuthStore } from "@/shared/auth/store"
import { copyText } from "@/shared/lib/clipboard"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"

const NAME_MAX = 50
// How often the open dialog checks whether the QR was scanned.
const POLL_MS = 3000

interface PairingQrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// "+ Hubungkan Perangkat": name the device → QR (10 minutes) → the cashier
// app scans it and claims → this dialog sees the device turn BOUND.
export function PairingQrDialog({ open, onOpenChange }: PairingQrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent is fixed and vertically centred with no height cap, so the
          QR step (QR + copy rows + banner) is clipped on short windows. */}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        {/* Mounted only while open: every open starts from the name step. */}
        {open && <PairingFlow onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function PairingFlow({ onClose }: { onClose: () => void }) {
  const storeCode = useAuthStore((state) => state.store_code) ?? ""
  const [name, setName] = useState("")
  const [pairing, setPairing] = useState<PairingCode | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const generate = useMutation({
    mutationFn: () => generatePairingCode(name),
    onSuccess: (code) => {
      setPairing(code)
      setNow(Date.now())
    },
    onError: (error) => toast.error(error instanceof CrudServiceError ? error.message : "Gagal membuat QR"),
  })

  const expiresAt = pairing?.expires_at ? new Date(pairing.expires_at).getTime() : 0
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  const expired = pairing != null && secondsLeft === 0

  // Shares the list's cache, so the table behind updates too.
  const { data: devices = [] } = useQuery({
    queryKey: DEVICES_KEY,
    queryFn: listDevices,
    enabled: pairing != null,
    refetchInterval: pairing != null && !expired ? POLL_MS : false,
    // Keep checking while the owner is in another window (e.g. helping the
    // cashier on the device) — bounded by the QR's 10-minute lifetime.
    refetchIntervalInBackground: true,
  })
  const claimed = pairing != null && devices.some((device) => device.device_id === pairing.device_id && device.status === "BOUND")

  useEffect(() => {
    if (!pairing || claimed || expired) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [pairing, claimed, expired])

  const api = cashierApiUrl()
  const payload = pairing?.pairing_token ? buildPairingPayload(storeCode, pairing.pairing_token) : ""

  if (claimed) {
    const device = devices.find((item) => item.device_id === pairing?.device_id)
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CircleCheckIcon className="size-7" />
        </span>
        <DialogTitle className="text-xl font-bold">Perangkat terhubung</DialogTitle>
        <DialogDescription>
          {device?.name ? `"${device.name}"` : "Perangkat ini"} sekarang bisa dipakai kasir untuk login dengan PIN.
        </DialogDescription>
        <div className="mt-2 flex gap-2.5">
          <Button
            variant="outline"
            onClick={() => {
              setPairing(null)
              setName("")
            }}
          >
            Hubungkan lagi
          </Button>
          <Button onClick={onClose}>Selesai</Button>
        </div>
      </div>
    )
  }

  if (!pairing) {
    return (
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          generate.mutate()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Hubungkan Perangkat Kasir</DialogTitle>
          <DialogDescription>
            Hanya perangkat yang dipasangkan lewat QR ini yang bisa login kasir di toko Anda.
          </DialogDescription>
        </DialogHeader>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Nama perangkat</span>
          <div className="relative">
            <Input
              autoFocus
              value={name}
              maxLength={NAME_MAX}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Tablet Kasir Depan"
              className="h-11 pr-16"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
              {name.length}/{NAME_MAX}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Opsional — memudahkan mengenali perangkat di daftar.</span>
        </label>

        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={generate.isPending}>
            <QrCodeIcon />
            {generate.isPending ? "Membuat QR..." : "Buat QR"}
          </Button>
        </div>
      </form>
    )
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, "0")

  return (
    // min-w-0: DialogContent is a grid, whose items default to min-width:auto,
    // so the unbreakable pairing token would otherwise stretch the whole dialog.
    <div className="flex min-w-0 flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Pindai dari aplikasi kasir</DialogTitle>
        <DialogDescription>
          {name.trim() ? `${name.trim()} · ` : ""}Buka aplikasi kasir di perangkat baru, pilih <b>Pindai QR</b>, lalu arahkan
          kamera ke kode ini.
        </DialogDescription>
      </DialogHeader>

      <div className="relative mx-auto rounded-2xl border bg-white p-4">
        <QRCodeSVG value={payload} size={232} level="M" aria-label="QR pairing perangkat kasir" />
        {expired && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 text-center">
            <p className="font-semibold text-foreground">QR kedaluwarsa</p>
            <Button size="sm" disabled={generate.isPending} onClick={() => generate.mutate()}>
              <RefreshCwIcon />
              Buat QR baru
            </Button>
          </div>
        )}
      </div>

      {!expired && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
          </span>
          <span className="text-muted-foreground">Menunggu dipindai · berlaku</span>
          <span className="font-bold tabular-nums text-foreground">
            {minutes}:{seconds}
          </span>
        </div>
      )}

      {!expired && pairing.pairing_token && (
        <div className="flex flex-col gap-2">
          <CopyRow label="Store ID" value={storeCode} message="Store ID disalin" />
          <CopyRow label="Pairing Token" value={pairing.pairing_token} message="Pairing token disalin" />
          <p className="text-xs text-muted-foreground">Perangkat tanpa kamera: salin lalu tempel di app kasir.</p>
        </div>
      )}

      {isLocalOnlyUrl(api) && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            Alamat server di QR adalah <b>{api}</b> — perangkat kasir tidak bisa menjangkau localhost. Isi{" "}
            <code>VITE_CASHIER_API_URL</code> dengan alamat LAN/publik server.
          </span>
        </p>
      )}

      <div className="flex justify-between gap-2.5">
        <Button
          variant="ghost"
          disabled={expired}
          onClick={() =>
            copyText(payload)
              .then(() => toast.success("Kode pairing disalin"))
              .catch(() => toast.error("Gagal menyalin kode"))
          }
        >
          <CopyIcon />
          Salin kode lengkap
        </Button>
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  )
}

function CopyRow({ label, value, message }: { label: string; value: string; message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm break-all select-all">{value}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Salin ${label}`}
        onClick={() =>
          copyText(value)
            .then(() => toast.success(message))
            .catch(() => toast.error("Gagal menyalin"))
        }
      >
        <CopyIcon />
      </Button>
    </div>
  )
}
