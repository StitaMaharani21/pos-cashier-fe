import { ArrowLeftIcon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import type { GuestCart, GuestCartItem } from "@/modules/public/self-order/domain/self-order.types"
import { StateScreen } from "@/modules/public/self-order/presentation/components/StateScreen"
import { cartCount, groupCartItems } from "@/modules/public/self-order/presentation/self-order-helpers"
import { formatRupiah } from "@/shared/lib/utils"

interface CartScreenProps {
  cart: GuestCart
  busy: boolean
  isSubmitting: boolean
  onBack: () => void
  onStep: (item: GuestCartItem, direction: 1 | -1) => void
  onRemove: (item: GuestCartItem) => void
  onSubmit: () => void
}

export function CartScreen({ cart, busy, isSubmitting, onBack, onStep, onRemove, onSubmit }: CartScreenProps) {
  const groups = groupCartItems(cart.items)

  return (
    <>
      <div className="so-head">
        <button type="button" className="so-back" aria-label="Kembali ke menu" onClick={onBack}>
          <ArrowLeftIcon size={18} aria-hidden />
        </button>
        <h2>Keranjang</h2>
        <span className="so-chip-table">Meja {cart.table_number}</span>
      </div>

      {cart.items.length === 0 ? (
        <StateScreen
          title="Keranjang masih kosong"
          description="Yuk pilih menu favorit kamu dulu."
          icon={<ShoppingBagIcon aria-hidden />}
          actionLabel="Lihat Menu"
          onAction={onBack}
        />
      ) : (
        <>
          <div className="so-groups">
            {groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <div className="so-group-head">
                  <span className="dot" />
                  <span className="who">{group.label}</span>
                  <span className="cnt">({group.qty} item)</span>
                </div>
                {group.items.map((item) => (
                  <div key={item.id} className="so-cart-row">
                    <p className="name">{item.menu_name}</p>
                    {item.addons.length > 0 && <p className="meta">{item.addons.map((a) => a.name).join(", ")}</p>}
                    {item.notes && <p className="meta notes">"{item.notes}"</p>}
                    <div className="so-cart-foot">
                      <div className="so-stepper">
                        <button
                          type="button"
                          aria-label={`Kurangi ${item.menu_name}`}
                          disabled={busy}
                          onClick={() => onStep(item, -1)}
                        >
                          <MinusIcon aria-hidden />
                        </button>
                        <span className="n">{item.qty}</span>
                        <button
                          type="button"
                          aria-label={`Tambah ${item.menu_name}`}
                          disabled={busy}
                          onClick={() => onStep(item, 1)}
                        >
                          <PlusIcon aria-hidden />
                        </button>
                      </div>
                      <span className="sub">{formatRupiah(item.subtotal)}</span>
                      <button
                        type="button"
                        className="so-icon-btn"
                        aria-label={`Hapus ${item.menu_name}`}
                        disabled={busy}
                        onClick={() => onRemove(item)}
                      >
                        <Trash2Icon aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="so-group-subtotal">
                  Subtotal <b>{formatRupiah(group.subtotal)}</b>
                </div>
              </section>
            ))}
          </div>

          <div className="so-summary">
            <div className="so-sum-line">
              <span>{cartCount(cart.items)} item</span>
              <span>Subtotal {formatRupiah(cart.subtotal)}</span>
            </div>
            {cart.tax_amount > 0 && (
              <div className="so-sum-line">
                <span>Pajak ({cart.tax_percentage}%)</span>
                <span>{formatRupiah(cart.tax_amount)}</span>
              </div>
            )}
            <div className="so-sum-total">
              <span>Total</span>
              <b>{formatRupiah(cart.grand_total)}</b>
            </div>
            <button type="button" className="so-cta" disabled={isSubmitting || busy} onClick={onSubmit}>
              {isSubmitting ? "Mengirim…" : "Kirim ke Kasir"}
            </button>
          </div>
        </>
      )}
    </>
  )
}
