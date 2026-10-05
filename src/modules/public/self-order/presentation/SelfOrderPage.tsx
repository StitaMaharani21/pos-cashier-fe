import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { StoreIcon } from "lucide-react"

import { guestSessionKey, useGuestSession } from "@/modules/public/self-order/application/useGuestSession"
import { isSessionGone } from "@/modules/public/self-order/infrastructure/guest-client"
import { LoadingScreen, StateScreen } from "@/modules/public/self-order/presentation/components/StateScreen"
import { SelfOrderApp } from "@/modules/public/self-order/presentation/SelfOrderApp"
import { ApiError, NetworkError } from "@/shared/api/client"

import "@/modules/public/self-order/presentation/self-order.css"

// /pesan/:storeCode/:qrToken — what the table's QR opens. No login: the QR
// token becomes a guest session, and the page works on that.
export function SelfOrderPage() {
  const { storeCode = "", qrToken = "" } = useParams()
  const queryClient = useQueryClient()
  const session = useGuestSession(storeCode, qrToken)
  // After "Pesan lagi" the customer lands on the menu, not the welcome screen.
  const [returning, setReturning] = useState(false)

  const content = (() => {
    // Also covers "Pesan lagi": the previous cart is replaced while this runs.
    if (session.isFetching) return <LoadingScreen label="Menyiapkan meja…" />
    if (session.isError) return <SessionError error={session.error} onRetry={() => session.refetch()} />
    if (!session.data) return <LoadingScreen label="Menyiapkan meja…" />
    return (
      <SelfOrderApp
        key={session.data.cart.id}
        storeCode={storeCode}
        session={session.data}
        initialScreen={returning ? "menu" : "landing"}
        onNewSession={() => {
          setReturning(true)
          void queryClient.refetchQueries({ queryKey: guestSessionKey(storeCode, qrToken) })
        }}
      />
    )
  })()

  return (
    <div className="so-root">
      <div className="so-col">{content}</div>
    </div>
  )
}

function SessionError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  if (error instanceof NetworkError) {
    return (
      <StateScreen
        title="Tidak bisa terhubung"
        description="Periksa koneksi internet kamu, lalu coba lagi."
        actionLabel="Coba lagi"
        onAction={onRetry}
      />
    )
  }
  if (error instanceof ApiError) {
    if (error.code === "FEATURE_NOT_IN_PLAN") {
      return (
        <StateScreen
          title="Pesan dari meja belum tersedia"
          description="Toko ini belum mengaktifkan pemesanan lewat HP. Silakan pesan langsung ke kasir."
        />
      )
    }
    if (error.code === "UNKNOWN_STORE") {
      return (
        <StateScreen
          title="Toko tidak ditemukan"
          description="Tautan ini tidak valid. Scan ulang QR di meja kamu."
          icon={<StoreIcon aria-hidden />}
        />
      )
    }
    // No shift is open, so the shared cart can't be created yet.
    if (/shift/i.test(error.message)) {
      return (
        <StateScreen
          title="Kasir belum buka"
          description="Pemesanan baru bisa dimulai setelah kasir membuka kasir. Minta bantuan staff."
          actionLabel="Coba lagi"
          onAction={onRetry}
        />
      )
    }
    if (isSessionGone(error)) {
      return (
        <StateScreen
          stamp="Sesi Berakhir"
          title="QR meja ini tidak berlaku"
          description="Sesi QR meja ini sudah berakhir atau ditutup oleh kasir."
          footnote="Panggil staff dan minta scan ulang QR meja"
        />
      )
    }
    return (
      <StateScreen title="Gagal membuka meja" description={error.message} actionLabel="Coba lagi" onAction={onRetry} />
    )
  }
  return (
    <StateScreen
      title="Gagal membuka meja"
      description="Terjadi kesalahan. Coba lagi."
      actionLabel="Coba lagi"
      onAction={onRetry}
    />
  )
}
