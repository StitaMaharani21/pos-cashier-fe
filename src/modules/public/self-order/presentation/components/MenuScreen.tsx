import { useState } from "react"
import { MinusIcon, PlusIcon, SearchIcon, TriangleAlertIcon } from "lucide-react"

import type { MenuCategory } from "@/modules/public/self-order/application/useGuestMenu"
import type { GuestCartItem, GuestMenu } from "@/modules/public/self-order/domain/self-order.types"
import { MenuThumb } from "@/modules/public/self-order/presentation/components/MenuThumb"
import { StateScreen } from "@/modules/public/self-order/presentation/components/StateScreen"
import { cartCount, sameName } from "@/modules/public/self-order/presentation/self-order-helpers"
import { formatRupiah } from "@/shared/lib/utils"

interface MenuScreenProps {
  tableNumber: string
  menus: GuestMenu[]
  categories: MenuCategory[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  cartItems: GuestCartItem[]
  cartTotal: number
  ordererName: string
  // A cart request is in flight — steppers wait for it.
  busy: boolean
  onOpenMenu: (menu: GuestMenu) => void
  onQuickAdd: (menu: GuestMenu) => void
  onStep: (menu: GuestMenu, row: GuestCartItem | undefined, direction: 1 | -1) => void
  onOpenCart: () => void
}

export function MenuScreen(props: MenuScreenProps) {
  const { tableNumber, menus, categories, isLoading, isError, onRetry, cartItems, cartTotal, ordererName } = props
  const [query, setQuery] = useState("")
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const activeCat = selectedCat ?? categories[0]?.id ?? null
  const search = query.trim().toLowerCase()

  // Searching looks across every category; chips only apply when it's empty.
  const visible = menus.filter((menu) =>
    search ? menu.name.toLowerCase().includes(search) : menu.category_id === activeCat
  )

  const count = cartCount(cartItems)

  return (
    <>
      <div className="so-head">
        <h2>Menu</h2>
        <span className="so-chip-table">Meja {tableNumber}</span>
      </div>

      {isError ? (
        <StateScreen
          title="Gagal memuat menu"
          description="Periksa koneksi internet kamu, lalu coba lagi."
          icon={<TriangleAlertIcon aria-hidden />}
          actionLabel="Coba lagi"
          onAction={onRetry}
        />
      ) : isLoading ? (
        <div className="so-list" aria-busy="true" aria-label="Memuat menu" style={{ paddingTop: 16 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="so-skel-card">
              <div className="so-skel so-skel-thumb" />
              <div className="so-skel-lines">
                <div className="so-skel" style={{ width: "70%" }} />
                <div className="so-skel" style={{ width: "95%" }} />
                <div className="so-skel" style={{ width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <label className="so-search">
            <SearchIcon aria-hidden />
            <input
              type="search"
              placeholder="Cari menu…"
              aria-label="Cari menu"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {!search && categories.length > 1 && (
            <div className="so-cats">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="so-cat"
                  aria-pressed={activeCat === category.id}
                  onClick={() => setSelectedCat(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          <div className="so-list">
            {visible.length === 0 ? (
              <StateScreen
                title={search ? "Tidak ditemukan" : "Belum ada menu"}
                description={search ? "Coba kata kunci lain." : "Menu belum tersedia. Tanyakan ke staff."}
                icon={<SearchIcon aria-hidden />}
              />
            ) : (
              visible.map((menu) => {
                // Only the plain row (no note, no add-ons) belongs to the
                // card's stepper; anything customised lives in the cart.
                const row = cartItems.find(
                  (item) =>
                    item.menu_id === menu.id &&
                    !item.notes &&
                    item.addons.length === 0 &&
                    sameName(item.ordered_by, ordererName)
                )
                return <MenuCard key={menu.id} menu={menu} row={row} {...props} />
              })
            )}
          </div>
        </>
      )}

      {count > 0 && (
        <button type="button" className="so-fab" onClick={props.onOpenCart}>
          <span className="l">
            <span className="count">{count}</span> Lihat Keranjang
          </span>
          <span className="total">{formatRupiah(cartTotal)}</span>
        </button>
      )}
    </>
  )
}

function MenuCard({
  menu,
  row,
  busy,
  onOpenMenu,
  onQuickAdd,
  onStep,
}: { menu: GuestMenu; row: GuestCartItem | undefined } & MenuScreenProps) {
  const out = !menu.is_available
  const hasDiscount = menu.final_price < menu.price
  // Menus with add-on choices can't be added blind — the sheet asks first.
  const needsSheet = menu.addon_groups.length > 0

  return (
    <div
      className={`so-card${out ? " dim" : ""}`}
      role="button"
      tabIndex={out ? -1 : 0}
      aria-disabled={out}
      onClick={() => !out && onOpenMenu(menu)}
      onKeyDown={(event) => {
        if (!out && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onOpenMenu(menu)
        }
      }}
    >
      <MenuThumb menu={menu} className="so-thumb" />
      <div className="so-card-body">
        <p className="name">
          {menu.name}
          {menu.discount && menu.discount.percent_off > 0 && (
            <span className="so-badge-off">-{menu.discount.percent_off}%</span>
          )}
        </p>
        <p className="desc">{menu.description}</p>
        <div className="so-card-foot">
          <span className="so-price">
            {hasDiscount && <s>{formatRupiah(menu.price)}</s>}
            {formatRupiah(menu.final_price)}
          </span>
          {out ? (
            <span className="so-badge-out">Habis</span>
          ) : row && !needsSheet ? (
            <div className="so-stepper" onClick={(event) => event.stopPropagation()}>
              <button type="button" aria-label={`Kurangi ${menu.name}`} disabled={busy} onClick={() => onStep(menu, row, -1)}>
                <MinusIcon aria-hidden />
              </button>
              <span className="n">{row.qty}</span>
              <button type="button" aria-label={`Tambah ${menu.name}`} disabled={busy} onClick={() => onStep(menu, row, 1)}>
                <PlusIcon aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="so-add"
              aria-label={`Tambah ${menu.name}`}
              disabled={busy}
              onClick={(event) => {
                event.stopPropagation()
                if (needsSheet) onOpenMenu(menu)
                else onQuickAdd(menu)
              }}
            >
              <PlusIcon aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
