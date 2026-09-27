import { useEffect, useMemo, useState } from "react"

import type { PaymentMethod, PaymentMethodType } from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import {
  CardConfigPanel,
  ChannelConfigPanel,
  QrisConfigPanel,
} from "@/modules/owner/payment-method/components/ConfigPanels"
import {
  initialDraft,
  isDraftDirty,
  surchargeError,
  type MethodDraft,
} from "@/modules/owner/payment-method/components/method-draft"
import { TYPE_META } from "@/modules/owner/payment-method/constants/payment-type-meta"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Switch } from "@/shared/ui/switch"

interface MethodDetailPanelProps {
  type: PaymentMethodType
  name: string
  description: string
  method: PaymentMethod | undefined
  channels: PaymentChannel[]
  active: boolean
  toggling: boolean
  isSaving: boolean
  onToggle: (next: boolean) => void
  onSave: (draft: MethodDraft) => void
  onCancel: () => void
  onDirtyChange: (dirty: boolean) => void
}

// Right-hand panel: settings of the selected method. Edits are a local
// draft saved with "Simpan Perubahan"; the "Aktifkan metode ini" switch
// saves immediately (same as the list's switch). Remounted (keyed) per
// method and on "Batal", which is what resets the draft.
export function MethodDetailPanel({
  type,
  name,
  description,
  method,
  channels,
  active,
  toggling,
  isSaving,
  onToggle,
  onSave,
  onCancel,
  onDirtyChange,
}: MethodDetailPanelProps) {
  const initial = useMemo(() => initialDraft(type, method, channels), [type, method, channels])
  const [draft, setDraft] = useState<MethodDraft>(initial)
  const dirty = isDraftDirty(draft, initial)
  const surchargeProblem = type === "card" ? surchargeError(draft.surcharge) : null
  const hasSettings = type !== "cash"

  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])

  const meta = TYPE_META[type]
  const Icon = meta.icon
  const change = (update: (draft: MethodDraft) => Partial<MethodDraft>) =>
    setDraft((current) => ({ ...current, ...update(current) }))

  return (
    <div className="flex flex-col rounded-2xl border bg-card">
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", meta.tile)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          Aktifkan metode ini
          <Switch
            checked={active}
            disabled={toggling}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-emerald-500"
          />
        </label>
      </div>

      <div className="px-6 py-6">
        {type === "card" && <CardConfigPanel draft={draft} onChange={change} surchargeError={surchargeProblem} />}
        {(type === "transfer" || type === "ewallet") && (
          <ChannelConfigPanel type={type} channels={channels} draft={draft} onChange={change} />
        )}
        {type === "qris" && <QrisConfigPanel draft={draft} onChange={change} imageUrl={method?.image_url} />}
        {!hasSettings && (
          <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
            Tidak ada pengaturan tambahan untuk pembayaran tunai.
          </p>
        )}
      </div>

      {hasSettings && (
        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          <span className="flex items-center gap-2 text-xs">
            {dirty && (
              <>
                <span aria-hidden className="size-2 rounded-full bg-amber-500" />
                <span className="text-amber-600">Ada perubahan belum disimpan</span>
              </>
            )}
          </span>
          <div className="flex gap-2.5">
            <Button type="button" variant="outline" disabled={!dirty || isSaving} onClick={onCancel}>
              Batal
            </Button>
            <Button
              type="button"
              disabled={!dirty || isSaving || surchargeProblem !== null}
              onClick={() => onSave(draft)}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
