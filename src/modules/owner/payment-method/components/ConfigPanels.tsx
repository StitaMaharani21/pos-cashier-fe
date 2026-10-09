import { CreditCardIcon, InfoIcon, WalletCardsIcon } from "lucide-react"

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
import { InitialBadge, OptionCard } from "@/modules/owner/payment-method/components/OptionCard"
import { ImageUpload } from "@/shared/ui/image-upload"
import { Input } from "@/shared/ui/input"

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-xs font-bold tracking-wide text-foreground uppercase">{children}</h3>
      {action}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
      <InfoIcon className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
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
        <SectionLabel>Tipe kartu yang diterima</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CARD_TYPE_OPTIONS.map((option) => {
            const Icon = option.value === "debit" ? WalletCardsIcon : CreditCardIcon
            return (
              <OptionCard
                key={option.value}
                layout="row"
                label={option.label}
                checked={draft.cardTypes.includes(option.value)}
                onToggle={() => onChange((d) => ({ cardTypes: toggle<CardType>(d.cardTypes, option.value) }))}
                leading={<Icon className="size-5 text-primary" />}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel
          action={
            <span className="flex items-center gap-3 text-xs">
              <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onChange(() => ({ cardNetworks: allNetworks }))}>
                Pilih semua
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => onChange(() => ({ cardNetworks: [] }))}>
                Hapus pilihan
              </button>
            </span>
          }
        >
          Jaringan kartu yang diterima
        </SectionLabel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CARD_NETWORK_OPTIONS.map((option) => {
            const checked = draft.cardNetworks.includes(option.value)
            return (
              <OptionCard
                key={option.value}
                label={option.label}
                checked={checked}
                onToggle={() => onChange((d) => ({ cardNetworks: toggle<CardNetwork>(d.cardNetworks, option.value) }))}
                leading={<InitialBadge label={option.label} active={checked} />}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="credit-surcharge" className="text-xs font-bold tracking-wide text-foreground uppercase">
          Biaya tambahan kartu kredit (%)
        </label>
        <div className="relative">
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
          <p className="text-xs text-muted-foreground">
            {acceptsCredit
              ? "Ditambahkan ke total saat pelanggan bayar pakai kartu kredit. Kosongkan jika tidak ada biaya tambahan."
              : "Aktifkan Kartu Kredit untuk mengatur biaya tambahan."}
          </p>
        )}
      </div>

      <Hint>Saat pelanggan bayar pakai kartu, kasir memilih bank dari mesin kartu (EDC) yang dipakai. Daftar banknya diatur di Transfer Bank.</Hint>
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
  const setAll = (value: boolean) =>
    onChange(() => ({ channels: Object.fromEntries(keys.map((key) => [key, value])) }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionLabel
          action={
            <span className="flex items-center gap-3 text-xs">
              <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setAll(true)}>
                Pilih semua
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setAll(false)}>
                Hapus pilihan
              </button>
            </span>
          }
        >
          {isBank ? "Bank yang diterima" : "E-wallet yang diterima"}
        </SectionLabel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {options.map((option) => {
            const key = channelKey(option.name)
            const checked = draft.channels[key] ?? false
            return (
              <OptionCard
                key={key}
                label={option.name}
                checked={checked}
                onToggle={() => onChange((d) => ({ channels: { ...d.channels, [key]: !(d.channels[key] ?? false) } }))}
                leading={<InitialBadge label={option.name} active={checked} />}
              />
            )
          })}
        </div>
      </div>
      <Hint>
        {isBank
          ? "Kasir memilih bank tujuan saat pelanggan transfer. Daftar bank ini juga dipakai untuk pembayaran kartu."
          : "Kasir memilih e-wallet yang dipakai pelanggan saat membayar."}
      </Hint>
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
