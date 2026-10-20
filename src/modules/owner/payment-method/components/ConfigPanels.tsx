import type {
  CardType,
  PaymentMethodType,
} from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import { CARD_TYPE_OPTIONS } from "@/modules/owner/payment-method/constants/payment-providers"
import {
  accountNumberError,
  channelKey,
  channelOptions,
  surchargeError as surchargeErrorOf,
  type ChannelAccount,
  type MethodDraft,
} from "@/modules/owner/payment-method/components/method-draft"
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

export function CardConfigPanel({
  draft,
  onChange,
  surchargeError,
  channels,
}: PanelProps & { surchargeError: string | null; channels: PaymentChannel[] }) {
  const acceptsCard = draft.cardTypes.length > 0
  // The banks the store accepts (the same list as Transfer Bank).
  const banks = channels.filter((channel) => channel.type === "bank" && channel.status === "active")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionLabel>Jenis Kartu</SectionLabel>
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
        <p className="text-xs text-muted-foreground">
          Admin dapat mengaktifkan salah satu atau kedua jenis kartu sekaligus.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t pt-6">
        <label htmlFor="mdr-default" className="text-sm font-semibold text-foreground">
          MDR Default
        </label>
        <p className="text-xs text-muted-foreground">
          Digunakan sebagai tarif default jika tidak terdapat konfigurasi khusus.
        </p>
        <div className="relative max-w-48">
          <Input
            id="mdr-default"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            placeholder="0"
            value={draft.surcharge}
            disabled={!acceptsCard}
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
          <p className="text-xs text-muted-foreground italic">
            {acceptsCard
              ? "Catatan: MDR merupakan biaya pemrosesan merchant (Merchant Discount Rate), bukan biaya tambahan pelanggan."
              : "Pilih minimal satu jenis kartu untuk mengatur MDR."}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t pt-6">
        <SectionLabel>Override MDR berdasarkan Bank</SectionLabel>
        <p className="-mt-1 text-xs text-muted-foreground">
          Gunakan tarif khusus untuk bank tertentu. Jika dikosongkan, sistem akan menggunakan MDR Default
          {draft.surcharge ? ` (${draft.surcharge}%)` : ""}.
        </p>
        {banks.length === 0 ? (
          <p className="rounded-xl bg-muted/50 px-4 py-4 text-sm text-muted-foreground">
            Belum ada bank toko yang aktif. Aktifkan bank di pengaturan Transfer Bank, lalu atur MDR-nya di sini.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5">Bank</th>
                  <th className="px-4 py-2.5">MDR</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {banks.map((bank) => {
                  const key = channelKey(bank.name ?? "")
                  const value = draft.bankSurcharges[key] ?? ""
                  const problem = surchargeErrorOf(value)
                  const isOverride = value.trim() !== ""
                  return (
                    <tr key={bank.id}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <label htmlFor={`bank-mdr-${bank.id}`}>{bank.name}</label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="relative w-32">
                            <Input
                              id={`bank-mdr-${bank.id}`}
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={100}
                              step="0.01"
                              placeholder="Default"
                              value={value}
                              disabled={!acceptsCard}
                              aria-invalid={problem ? true : undefined}
                              onChange={(event) => {
                                const next = event.target.value
                                onChange((d) => ({ bankSurcharges: { ...d.bankSurcharges, [key]: next } }))
                              }}
                              className="pr-8"
                            />
                            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                              %
                            </span>
                          </div>
                          {problem && <p className="text-xs text-destructive">{problem}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isOverride
                              ? "inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-strong"
                              : "inline-flex rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {isOverride ? "Override" : "Menggunakan default"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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

  const selected = options.filter((option) => draft.channels[channelKey(option.name)] ?? false)
  const setAccount = (key: string, patch: Partial<ChannelAccount>) =>
    onChange((d) => ({
      channelAccounts: {
        ...d.channelAccounts,
        [key]: { ...(d.channelAccounts[key] ?? { number: "", name: "" }), ...patch },
      },
    }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionLabel action={<SelectAllToggle allSelected={allSelected} onChange={setAll} />}>
          {isBank ? "Bank yang digunakan toko" : "E-wallet yang digunakan toko"}
        </SectionLabel>
        <p className="-mt-1 text-xs text-muted-foreground">
          {isBank
            ? "Pilih bank yang dimiliki toko ini. Pelanggan yang ingin transfer akan diarahkan ke rekening di bawah."
            : "Pilih e-wallet yang dimiliki toko ini. Pelanggan yang ingin membayar lewat e-wallet akan diarahkan ke nomor di bawah."}
        </p>
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

      <div className="flex flex-col gap-3 border-t pt-6">
        <SectionLabel>{isBank ? "Nomor rekening" : "Nomor HP e-wallet"}</SectionLabel>
        <p className="-mt-1 text-xs text-muted-foreground">
          {isBank
            ? "Opsional. Kasir bisa menunjukkan nomor rekening dan nama pemilik ini ke pelanggan."
            : "Opsional. Kasir bisa menunjukkan nomor HP dan nama pemilik ini ke pelanggan."}
        </p>
        {selected.length === 0 ? (
          <p className="rounded-xl bg-muted/50 px-4 py-4 text-sm text-muted-foreground">
            {isBank
              ? "Pilih minimal satu bank di atas untuk mengisi nomor rekeningnya."
              : "Pilih minimal satu e-wallet di atas untuk mengisi nomor HP-nya."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5">{isBank ? "Bank" : "E-wallet"}</th>
                  <th className="px-4 py-2.5">{isBank ? "Nomor rekening" : "Nomor HP"}</th>
                  <th className="px-4 py-2.5">Atas nama</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selected.map((option) => {
                  const key = channelKey(option.name)
                  const account = draft.channelAccounts[key] ?? { number: "", name: "" }
                  const problem = accountNumberError(account.number)
                  return (
                    <tr key={key}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <label htmlFor={`account-number-${key}`}>{option.name}</label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Input
                            id={`account-number-${key}`}
                            inputMode="tel"
                            maxLength={50}
                            placeholder={isBank ? "mis. 123 456 7890" : "mis. 0812 3456 7890"}
                            value={account.number}
                            aria-invalid={problem ? true : undefined}
                            onChange={(event) => setAccount(key, { number: event.target.value })}
                            className="min-w-44"
                          />
                          {problem && <p className="text-xs text-destructive">{problem}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          aria-label={`Atas nama ${option.name}`}
                          maxLength={100}
                          placeholder="Nama pemilik"
                          value={account.name}
                          onChange={(event) => setAccount(key, { name: event.target.value })}
                          className="min-w-44"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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
