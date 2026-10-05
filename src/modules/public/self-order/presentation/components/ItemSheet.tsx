import { useEffect, useState } from "react"
import { MinusIcon, PlusIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import type { GuestAddonGroup, GuestMenu } from "@/modules/public/self-order/domain/self-order.types"
import { MenuThumb } from "@/modules/public/self-order/presentation/components/MenuThumb"
import { formatRupiah } from "@/shared/lib/utils"

export interface ItemSheetValues {
  qty: number
  notes: string
  orderedBy: string
  addonOptionIds: number[]
}

interface ItemSheetProps {
  menu: GuestMenu
  initialName: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: ItemSheetValues) => void
  onClose: () => void
}

export function ItemSheet({ menu, initialName, isSubmitting, error, onSubmit, onClose }: ItemSheetProps) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState("")
  const [name, setName] = useState(initialName)
  const [picked, setPicked] = useState<number[]>([])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const addonTotal = menu.addon_groups
    .flatMap((group) => group.options)
    .filter((option) => picked.includes(option.id))
    .reduce((sum, option) => sum + option.price, 0)
  const lineTotal = (menu.final_price + addonTotal) * qty
  const missingRequired = menu.addon_groups.some(
    (group) => group.is_required && !group.options.some((option) => picked.includes(option.id))
  )

  function togglePick(group: GuestAddonGroup, optionId: number) {
    setPicked((current) => {
      if (current.includes(optionId)) return current.filter((id) => id !== optionId)
      const inGroup = group.options.map((option) => option.id)
      const chosenHere = current.filter((id) => inGroup.includes(id))
      // One choice (or a full group) swaps the oldest pick instead of blocking.
      if (group.max_select <= 1) return [...current.filter((id) => !inGroup.includes(id)), optionId]
      if (chosenHere.length >= group.max_select) {
        return [...current.filter((id) => id !== chosenHere[0]), optionId]
      }
      return [...current, optionId]
    })
  }

  return (
    <div className="so-backdrop" onClick={onClose}>
      <div
        className="so-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={menu.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="so-close" aria-label="Tutup" onClick={onClose}>
          <XIcon aria-hidden />
        </button>
        <div className="so-handle" />
        <MenuThumb menu={menu} className="so-sheet-thumb" />
        <h3>{menu.name}</h3>
        <p className="desc">{menu.description}</p>

        {error && (
          <div className="so-error" role="alert">
            <TriangleAlertIcon aria-hidden />
            <div>{error}</div>
          </div>
        )}

        {menu.addon_groups.map((group) => (
          <div key={group.id} className="so-field" role="group" aria-label={group.name}>
            <span className="lbl">
              {group.name}
              {group.is_required ? " · wajib dipilih" : " · opsional"}
            </span>
            {group.options.map((option) => (
              <label key={option.id} className="so-opt">
                <span>
                  <input
                    type={group.max_select <= 1 ? "radio" : "checkbox"}
                    name={`addon-${group.id}`}
                    checked={picked.includes(option.id)}
                    // Radios can't be unchecked by clicking — the click handler
                    // lets an optional group be cleared again.
                    onChange={() => undefined}
                    onClick={() => togglePick(group, option.id)}
                  />
                  {option.name}
                </span>
                {option.price > 0 && <span className="price">+{formatRupiah(option.price)}</span>}
              </label>
            ))}
          </div>
        ))}

        <div className="so-field">
          <span className="lbl">Jumlah</span>
          <div className="so-row">
            <div className="so-stepper lg">
              <button type="button" aria-label="Kurangi" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <MinusIcon aria-hidden />
              </button>
              <span className="n">{qty}</span>
              <button type="button" aria-label="Tambah" onClick={() => setQty((q) => q + 1)}>
                <PlusIcon aria-hidden />
              </button>
            </div>
            <span className="so-price" style={{ fontSize: 16 }}>
              {formatRupiah(lineTotal)}
            </span>
          </div>
        </div>

        <div className="so-field">
          <label htmlFor="so-notes">Catatan (opsional)</label>
          <textarea
            id="so-notes"
            rows={2}
            placeholder="mis. less sugar, tanpa es"
            value={notes}
            maxLength={200}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="so-field">
          <label htmlFor="so-name">Nama pemesan (opsional)</label>
          <input
            id="so-name"
            type="text"
            placeholder="mis. Andi"
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="hint">Supaya kelihatan pesanan ini punya siapa saat keranjang berisi pesanan campuran.</div>
        </div>

        <button
          type="button"
          className="so-submit"
          disabled={isSubmitting || missingRequired}
          onClick={() => onSubmit({ qty, notes: notes.trim(), orderedBy: name.trim(), addonOptionIds: picked })}
        >
          <span>{isSubmitting ? "Menambahkan…" : missingRequired ? "Pilih opsi wajib dulu" : "Tambah ke keranjang"}</span>
          <span>{formatRupiah(lineTotal)}</span>
        </button>
      </div>
    </div>
  )
}
