import { useState } from "react"

import { StockAdjustForm } from "@/modules/owner/stock-history/components/StockAdjustForm"
import { StockInForm } from "@/modules/owner/stock-history/components/StockInForm"
import type { StockItem } from "@/modules/owner/stock-history/lib/stock-item"
import { cn, formatNumber } from "@/shared/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

type Mode = "in" | "adjust"

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "in", label: "Stok Masuk", hint: "Barang datang atau stok awal." },
  { id: "adjust", label: "Koreksi", hint: "Perbaiki angka stok naik atau turun." },
]

interface StockChangeDialogProps {
  // null = closed.
  item: StockItem | null
  onOpenChange: (open: boolean) => void
}

// The ONE place stock is changed ("Ubah Stok") for a bahan baku and for a menu
// counted per item: "Stok Masuk" for goods received (and a new item's first
// stock), "Koreksi" for fixing the figure with a reason. Menu and bahan baku
// forms only show stock read-only and point here.
export function StockChangeDialog({ item, onOpenChange }: StockChangeDialogProps) {
  return (
    <Dialog open={item != null} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so every open starts on "Stok Masuk" with fresh forms. */}
        {item && <StockChangeBody item={item} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function StockChangeBody({ item, onDone }: { item: StockItem; onDone: () => void }) {
  const [mode, setMode] = useState<Mode>("in")
  const active = MODES.find((entry) => entry.id === mode) ?? MODES[0]

  return (
    <>
      <DialogHeader>
        <DialogTitle>Ubah Stok — {item.name}</DialogTitle>
        <DialogDescription>
          Stok saat ini: {item.stock == null ? "belum diisi" : `${formatNumber(item.stock)} ${item.unit}`}
        </DialogDescription>
      </DialogHeader>

      <div role="group" aria-label="Jenis perubahan stok" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {MODES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={mode === entry.id}
            onClick={() => setMode(entry.id)}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              mode === entry.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{active.hint}</p>

      {/* Keyed by mode so each form starts clean when switching. */}
      {mode === "in" ? <StockInForm key="in" item={item} onDone={onDone} /> : <StockAdjustForm key="adjust" item={item} onDone={onDone} />}
    </>
  )
}
