import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useCartActions, useGuestCart } from "@/modules/public/self-order/application/useGuestCart"
import { useGuestMenu } from "@/modules/public/self-order/application/useGuestMenu"
import { useCheckout, useOrderStatus } from "@/modules/public/self-order/application/useOrderFlow"
import type {
  GuestCartItem,
  GuestMenu,
  GuestOrder,
  GuestSession,
} from "@/modules/public/self-order/domain/self-order.types"
import { guestErrorMessage, isSessionGone } from "@/modules/public/self-order/infrastructure/guest-client"
import { CartScreen } from "@/modules/public/self-order/presentation/components/CartScreen"
import { ConfirmScreen } from "@/modules/public/self-order/presentation/components/ConfirmScreen"
import { ItemSheet, type ItemSheetValues } from "@/modules/public/self-order/presentation/components/ItemSheet"
import { LandingScreen } from "@/modules/public/self-order/presentation/components/LandingScreen"
import { MenuScreen } from "@/modules/public/self-order/presentation/components/MenuScreen"
import { StateScreen } from "@/modules/public/self-order/presentation/components/StateScreen"
import {
  addonIdsOf,
  readOrdererName,
  writeOrdererName,
} from "@/modules/public/self-order/presentation/self-order-helpers"

export type Screen = "landing" | "menu" | "cart" | "confirm"

interface SelfOrderAppProps {
  storeCode: string
  session: GuestSession
  // Re-resolves the QR for a fresh cart ("Pesan lagi"). The page swaps this
  // component out while it loads, so no local state needs resetting here.
  onNewSession: () => void
  initialScreen: Screen
}

// The four screens of the table-order flow around one shared cart. The cart
// lives on the server (every phone at the table sees it); this component only
// keeps what is local to this phone: the screen, the open sheet, the name.
export function SelfOrderApp({ storeCode, session, onNewSession, initialScreen }: SelfOrderAppProps) {
  const ctx = useMemo(
    () => ({ storeCode, guestToken: session.guest_session_token }),
    [storeCode, session.guest_session_token]
  )
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [sheetMenu, setSheetMenu] = useState<GuestMenu | null>(null)
  const [sheetError, setSheetError] = useState<string | null>(null)
  const [name, setName] = useState(readOrdererName)
  const [placed, setPlaced] = useState<{ order: GuestOrder; items: GuestCartItem[] } | null>(null)
  const [gone, setGone] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const menu = useGuestMenu(storeCode)
  const cartQuery = useGuestCart(ctx, session.cart, placed == null)
  const cart = cartQuery.data
  const actions = useCartActions(ctx, session.cart.id)
  const checkout = useCheckout(ctx, session.cart.id)
  const orderQuery = useOrderStatus(ctx, placed?.order.id ?? null)

  // The table session ends on its own clock; check it without a request.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])
  const expired = new Date(session.expired_at).getTime() <= now

  const busy = actions.add.isPending || actions.update.isPending || actions.remove.isPending

  function fail(error: unknown) {
    if (isSessionGone(error)) setGone(true)
    else toast.error(guestErrorMessage(error))
  }

  function remember(orderedBy: string) {
    const trimmed = orderedBy.trim()
    if (!trimmed) return
    setName(trimmed)
    writeOrdererName(trimmed)
  }

  // Once the order is placed the cart is done (the server stops serving it), so
  // neither a dead cart nor the session clock should replace the order's status.
  if (!placed && (expired || gone || (cartQuery.error && isSessionGone(cartQuery.error)))) {
    return (
      <StateScreen
        stamp="Sesi Berakhir"
        title="Sesi meja sudah tidak aktif"
        description="Sesi QR meja ini sudah berakhir atau ditutup oleh kasir. Pesanan tidak bisa ditambahkan lagi."
        footnote="Panggil staff dan minta scan ulang QR meja"
      />
    )
  }

  // Another phone at the table already sent the shared cart.
  if (cart.status !== "active" && !placed) {
    return (
      <StateScreen
        title="Pesanan meja ini sudah dikirim"
        description="Teman semeja kamu sudah mengirim pesanan ke kasir. Mau tambah pesanan lagi?"
        actionLabel="Pesan lagi"
        onAction={onNewSession}
      />
    )
  }

  function addItem(target: GuestMenu, values: ItemSheetValues) {
    actions.add.mutate(
      {
        menu_id: target.id,
        qty: values.qty,
        notes: values.notes,
        ordered_by: values.orderedBy,
        addon_option_ids: values.addonOptionIds,
      },
      {
        onSuccess: () => {
          remember(values.orderedBy)
          setSheetMenu(null)
          setSheetError(null)
          toast.success(`${target.name} ditambahkan ke keranjang`)
        },
        onError: (error) => {
          if (isSessionGone(error)) setGone(true)
          else setSheetError(guestErrorMessage(error))
        },
      }
    )
  }

  function quickAdd(target: GuestMenu) {
    actions.add.mutate(
      { menu_id: target.id, qty: 1, notes: "", ordered_by: name, addon_option_ids: [] },
      { onSuccess: () => toast.success(`${target.name} ditambahkan ke keranjang`), onError: fail }
    )
  }

  function stepItem(item: GuestCartItem, direction: 1 | -1) {
    const qty = item.qty + direction
    if (qty <= 0) {
      actions.remove.mutate(item.id, { onError: fail })
      return
    }
    actions.update.mutate(
      {
        itemId: item.id,
        payload: { qty, notes: item.notes, ordered_by: item.ordered_by, addon_option_ids: addonIdsOf(item) },
      },
      { onError: fail }
    )
  }

  function removeItem(item: GuestCartItem) {
    actions.remove.mutate(item.id, {
      onSuccess: () => toast(`${item.menu_name} dihapus dari keranjang`),
      onError: fail,
    })
  }

  function submitCart() {
    const items = cart.items
    checkout.mutate(
      { guest_name: name, notes: "" },
      {
        onSuccess: (order) => {
          setPlaced({ order, items })
          setScreen("confirm")
        },
        onError: fail,
      }
    )
  }

  return (
    <>
      {screen === "landing" && <LandingScreen session={session} onStart={() => setScreen("menu")} />}

      {screen === "menu" && (
        <MenuScreen
          tableNumber={session.table_number}
          menus={menu.menus}
          categories={menu.categories}
          isLoading={menu.isLoading}
          isError={menu.isError}
          onRetry={() => menu.refetch()}
          cartItems={cart.items}
          cartTotal={cart.grand_total}
          ordererName={name}
          busy={busy}
          onOpenMenu={(target) => {
            setSheetError(null)
            setSheetMenu(target)
          }}
          onQuickAdd={quickAdd}
          onStep={(_, row, direction) => row && stepItem(row, direction)}
          onOpenCart={() => setScreen("cart")}
        />
      )}

      {screen === "cart" && (
        <CartScreen
          cart={cart}
          busy={busy}
          isSubmitting={checkout.isPending}
          onBack={() => setScreen("menu")}
          onStep={stepItem}
          onRemove={removeItem}
          onSubmit={submitCart}
        />
      )}

      {screen === "confirm" && placed && (
        <ConfirmScreen
          tableNumber={session.table_number}
          order={orderQuery.data ?? placed.order}
          items={placed.items}
          onNewOrder={onNewSession}
        />
      )}

      {sheetMenu && (
        <ItemSheet
          menu={sheetMenu}
          initialName={name}
          isSubmitting={actions.add.isPending}
          error={sheetError}
          onSubmit={(values) => addItem(sheetMenu, values)}
          onClose={() => setSheetMenu(null)}
        />
      )}
    </>
  )
}
