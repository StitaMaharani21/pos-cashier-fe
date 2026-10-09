import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import {
  FEATURE_NOT_IN_PLAN,
  getPaymentGateway,
  PAYMENT_GATEWAY_QUERY_KEY,
  PAYMENT_METHODS_QUERY_KEY,
  removePaymentGateway,
} from "@/modules/owner/payment-gateway/api/payment-gateway.service"
import { GatewayStatusCard } from "@/modules/owner/payment-gateway/components/GatewayStatusCard"
import { ServerKeyForm } from "@/modules/owner/payment-gateway/components/ServerKeyForm"
import { CrudServiceError } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"

const STEPS = [
  "Daftar atau masuk ke dashboard Midtrans.",
  "Salin Server Key (kunci rahasia) dari menu Settings → Access Keys.",
  "Tempel di formulir ini lalu simpan.",
  "Metode \"QRIS Midtrans\" muncul di kasir dan halaman pesan dari meja.",
]

// Reached only when the plan has `online_payment` (Pro+): routeAccess.ts gates
// the route and the sidebar item on it, so Starter owners see the lock/upsell
// instead of this page.
export function PaymentGatewaySection() {
  const queryClient = useQueryClient()
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)

  const { data: status, isPending, isError, refetch } = useQuery({
    queryKey: PAYMENT_GATEWAY_QUERY_KEY,
    queryFn: getPaymentGateway,
  })

  const disconnect = useMutation({
    mutationFn: removePaymentGateway,
    onSuccess: () => {
      toast.success("Midtrans diputuskan. Metode \"QRIS Midtrans\" dinonaktifkan.")
      setConfirmingDisconnect(false)
      queryClient.invalidateQueries({ queryKey: PAYMENT_GATEWAY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY })
    },
    onError: (error) => {
      setConfirmingDisconnect(false)
      // The upsell modal is already open (api client interceptor).
      if (error instanceof CrudServiceError && error.code === FEATURE_NOT_IN_PLAN) return
      toast.error(error instanceof CrudServiceError ? error.message : "Gagal memutuskan Midtrans")
    },
  })

  if (isPending) {
    return <div className="h-96 animate-pulse rounded-[18px] border bg-muted/40" />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat pengaturan pembayaran online.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pembayaran Online</h1>
        <p className="text-sm text-muted-foreground">
          Terima pembayaran QRIS Midtrans langsung ke akun Midtrans toko Anda.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="min-w-[320px] flex-[1.5] rounded-[18px] border bg-card px-7 py-6">
          <ServerKeyForm connected={status.configured} />
        </div>

        <div className="flex min-w-[280px] flex-1 flex-col gap-5">
          <GatewayStatusCard status={status} onDisconnect={() => setConfirmingDisconnect(true)} />

          {!status.configured && (
            <div className="rounded-[18px] border bg-card px-6 py-5">
              <h2 className="text-base font-extrabold text-foreground">Cara Menghubungkan</h2>
              <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
                {STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {status.configured && (
            <p className="text-xs text-muted-foreground">
              Metode "QRIS Midtrans" dikelola otomatis dan tidak bisa diubah manual. Lihat statusnya
              di{" "}
              <Link to="/app/payment-method" className="font-semibold text-primary underline">
                Metode Pembayaran
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDisconnect}
        onOpenChange={setConfirmingDisconnect}
        title="Putuskan Midtrans?"
        description='Pelanggan tidak bisa lagi membayar pesanan lewat QRIS online dan metode "QRIS Midtrans" dinonaktifkan. Kunci rahasia akan dihapus; transaksi yang sudah berjalan tetap tercatat.'
        confirmLabel="Putuskan"
        pendingLabel="Memutuskan..."
        isPending={disconnect.isPending}
        onConfirm={() => disconnect.mutate()}
      />
    </div>
  )
}
