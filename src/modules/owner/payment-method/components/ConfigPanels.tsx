import type {
  CardNetwork,
  CardType,
  PaymentMethodType,
} from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import {
  CARD_NETWORK_OPTIONS,
  CARD_TYPE_OPTIONS,
} from "@/modules/owner/payment-method/constants/payment-providers"
import { channelKey, channelOptions, type MethodDraft } from "@/modules/owner/payment-method/components/method-draft"
import { OptionChip } from "@/modules/owner/payment-method/components/OptionChip"
import { ImageUpload } from "@/shared/ui/image-upload"
import { Input } from "@/shared/ui/input"

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
      {action}
    </div>
  )
}

// "Pilih semua" until everything is selected, then "Hapus semua".
function SelectAllToggle({ allSelected, onChange }: { allSelected: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      className="text-xs font-semibold text-primary-strong hover:underline"
      onClick={() => onChange(!allSelected)}
    >
      {allSelected ? "Hapus semua" : "Pilih semua"}
    </button>
  )
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

interface PanelProps {
  draft: MethodDraft
  // Takes an updater so rapid consecutive toggles each build on the latest
  // draft instead of the one this render closed over.
  onChange: (update: (draft: MethodDraft) => Partial<MethodDraft>) => void
}

export function CardConfigPanel({ draft, onChange, surchargeError }: PanelProps & { surchargeError: string | null }) {
  const allNetworks = CARD_NETWORK_OPTIONS.map((option) => option.value)
  const acceptsCredit = draft.cardTypes.includes("credit")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionLabel>Tipe kartu</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {CARD_TYPE_OPTIONS.map((option) => (
            <OptionChip
              key={option.value}
              label={option.label}
              checked={draft.cardTypes.includes(option.value)}
              onToggle={() => onChange((d) => ({ cardTypes: toggle<CardType>(d.cardTypes, option.value) }))}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel
          action={
            <SelectAllToggle
              allSelected={draft.cardNetworks.length === allNetworks.length}
              onChange={(next) => onChange(() => ({ cardNetworks: next ? allNetworks : [] }))}
            />
          }
        >
          Jaringan kartu
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {CARD_NETWORK_OPTIONS.map((option) => (
            <OptionChip
              key={option.value}
              label={option.label}
              checked={draft.cardNetworks.includes(option.value)}
              onToggle={() => onChange((d) => ({ cardNetworks: toggle<CardNetwork>(d.cardNetworks, option.value) }))}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="credit-surcharge" className="text-sm font-semibold text-foreground">
          Biaya tambahan kartu kredit (%)
        </label>
        <div className="relative max-w-40">
          <Input
            id="credit-surcharge"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.1"
            placeholder="0"
            value={draft.surcharge}
            disabled={!acceptsCredit}
            aria-invalid={surchargeError ? true : undefined}
            onChange={(event) => {
              const value = event.target.value
              onChange(() => ({ surcharge: value }))
            }}
            className="pr-8"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">%</span>
        </div>
        {surchargeError ? (
          <p className="text-xs text-destructive">{surchargeError}</p>
        ) : (
          !acceptsCredit && <p className="text-xs text-muted-foreground">Pilih tipe Kredit untuk mengatur biaya tambahan.</p>
        )}
      </div>
    </div>
  )
}

interface ChannelPanelProps extends PanelProps {
  type: PaymentMethodType
  channels: PaymentChannel[]
}

export function ChannelConfigPanel({ type, channels, draft, onChange }: ChannelPanelProps) {
  const options = channelOptions(type, channels)
  const isBank = type === "transfer"
  const keys = options.map((option) => channelKey(option.name))
  const allSelected = keys.length > 0 && keys.every((key) => draft.channels[key] ?? false)
  const setAll = (value: boolean) =>
    onChange(() => ({ channels: Object.fromEntries(keys.map((key) => [key, value])) }))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel action={<SelectAllToggle allSelected={allSelected} onChange={setAll} />}>
        {isBank ? "Bank yang diterima" : "E-wallet yang diterima"}
      </SectionLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const key = channelKey(option.name)
          return (
            <OptionChip
              key={key}
              label={option.name}
              checked={draft.channels[key] ?? false}
              onToggle={() => onChange((d) => ({ channels: { ...d.channels, [key]: !(d.channels[key] ?? false) } }))}
            />
          )
        })}
      </div>
    </div>
  )
}

export function QrisConfigPanel({ onChange, imageUrl }: PanelProps & { imageUrl?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Gambar QRIS toko</SectionLabel>
      {/* "Batal" remounts the whole detail panel, which clears a picked
          file's preview here too. */}
      <ImageUpload
        value={imageUrl}
        onChange={(file) => onChange(() => ({ qrisImage: file }))}
        placeholder="Klik untuk unggah gambar QRIS"
        hint="PNG/JPG/WEBP, maks 2MB — ditampilkan di kasir saat pelanggan pilih QRIS"
      />
    </div>
  )
}
