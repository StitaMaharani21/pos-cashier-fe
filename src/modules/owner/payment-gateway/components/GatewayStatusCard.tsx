import { CopyIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import type { PaymentGatewayStatus } from "@/entities/payment-gateway/model/payment-gateway.types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/ui/status-badge"

async function copyWebhookUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.success("Alamat notifikasi disalin")
  } catch {
    toast.error("Gagal menyalin. Salin alamatnya secara manual.")
  }
}

export function GatewayStatusCard({
  status,
  onDisconnect,
}: {
  status: PaymentGatewayStatus
  onDisconnect: () => void
}) {
  const { configured, is_active, key_last4, environment, notification_url } = status
  const sandbox = environment === "sandbox"

  return (
    <div className="flex flex-col gap-4 rounded-[18px] border bg-card px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Status Koneksi</h2>
          <p className="text-xs text-muted-foreground">Midtrans · QRIS</p>
        </div>
        {configured ? (
          <StatusBadge
            active={is_active}
            activeLabel="Terhubung"
            inactiveLabel="Nonaktif"
          />
        ) : (
          <StatusBadge active={false} inactiveLabel="Belum terhubung" />
        )}
      </div>

      {configured && (
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Kunci rahasia</dt>
          <dd className="font-mono font-semibold text-foreground">••••{key_last4}</dd>

          <dt className="text-muted-foreground">Mode akun</dt>
          <dd>
            <Badge variant={sandbox ? "secondary" : "default"}>
              {sandbox ? "Uji coba (Sandbox)" : "Asli (Production)"}
            </Badge>
          </dd>
        </dl>
      )}

      {configured && (
        <p className="text-xs text-muted-foreground">
          Sistem Neela saat ini berjalan di mode {sandbox ? "uji coba" : "asli"}, jadi gunakan kunci{" "}
          {sandbox ? "uji coba (diawali SB-Mid-server-)" : "asli (diawali Mid-server-)"}.
        </p>
      )}

      {configured && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Alamat Notifikasi Pembayaran (URL Webhook)</span>
          {notification_url ? (
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
                {notification_url}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Salin alamat notifikasi pembayaran"
                onClick={() => copyWebhookUrl(notification_url)}
              >
                <CopyIcon />
              </Button>
            </div>
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              Pembayaran online belum bisa dipakai pelanggan karena alamat notifikasi pembayaran belum
              siap. Hubungi tim Neela.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Alamat ini dipasang otomatis di setiap transaksi. Anda tidak perlu mengisinya di dashboard Midtrans.
          </p>
        </div>
      )}

      {!configured && (
        <p className="text-sm text-muted-foreground">
          Belum ada akun Midtrans yang terhubung. Selama belum terhubung, pelanggan tidak bisa
          membayar pesanan lewat QRIS online.
        </p>
      )}

      {configured && (
        <Button
          type="button"
          variant="outline"
          className="self-start text-destructive hover:text-destructive"
          onClick={onDisconnect}
        >
          Putuskan Midtrans
        </Button>
      )}
    </div>
  )
}
