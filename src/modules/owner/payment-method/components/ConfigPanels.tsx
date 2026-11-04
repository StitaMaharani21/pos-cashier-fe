import { PencilIcon, PlusIcon, PowerOffIcon } from "lucide-react"

import type {
  CardType,
  PaymentMethodType,
} from "@/entities/payment-method/model/payment-method.types"
import type { CardBank } from "@/entities/card-bank/model/card-bank.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import { CARD_TYPE_OPTIONS } from "@/modules/owner/payment-method/constants/payment-providers"
import {
  surchargeError as surchargeErrorOf,
  type MethodDraft,
} from "@/modules/owner/payment-method/components/method-draft"
import { OptionChip } from "@/modules/owner/payment-method/components/OptionChip"
import { Button } from "@/shared/ui/button"
import { LabelWithInfo } from "@/shared/ui/info-tip"
import { ImageUpload } from "@/shared/ui/image-upload"
import { NumberInput } from "@/shared/ui/number-input"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
      {action}
    </div>
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
  cardBanks,
}: PanelProps & { surchargeError: string | null; cardBanks: CardBank[] }) {
  const acceptsCard = draft.cardTypes.length > 0
  const acceptsDebit = draft.cardTypes.includes("debit")
  const acceptsCredit = draft.cardTypes.includes("credit")

  function setRate(bank: string, kind: "debit" | "credit", value: string) {
    onChange((d) => ({
      cardBankRates: {
        ...d.cardBankRates,
        [bank]: { ...(d.cardBankRates[bank] ?? { debit: "", credit: "" }), [kind]: value },
      },
    }))
  }

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
          Anda boleh memilih salah satu atau keduanya.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t pt-6">
        <LabelWithInfo
          infoLabel="MDR Default"
          info={
            <>
              <p>
                MDR adalah potongan dari bank ke toko, bukan tambahan bayar untuk pelanggan. Pelanggan tetap membayar
                total pesanan.
              </p>
              <p>
                MDR Default dipakai bila bank penerbit kartu tidak punya tarif sendiri di tabel bawah, atau kasir tidak
                memilih bank penerbit.
              </p>
            </>
          }
        >
          <label htmlFor="mdr-default" className="text-sm font-semibold text-foreground">
            MDR Default
          </label>
        </LabelWithInfo>
        <div className="relative max-w-48">
          <NumberInput
            id="mdr-default"
            decimals={2}
            max={100}
            group={false}
            placeholder="0"
            value={draft.surcharge}
            disabled={!acceptsCard}
            aria-invalid={surchargeError ? true : undefined}
            onValueChange={(value) => onChange(() => ({ surcharge: value }))}
            className="pr-8"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">%</span>
        </div>
        {surchargeError ? (
          <p className="text-xs text-destructive">{surchargeError}</p>
        ) : (
          !acceptsCard && (
            <p className="text-xs text-muted-foreground italic">Pilih minimal satu jenis kartu untuk mengatur MDR.</p>
          )
        )}
      </div>

      <div className="flex flex-col gap-3 border-t pt-6">
        <LabelWithInfo
          infoLabel="MDR per bank penerbit"
          info={
            <>
              <p>
                MDR mengikuti <span className="font-semibold text-foreground">bank yang menerbitkan kartu pelanggan</span>
                , bukan bank milik toko. Kasir memilih bank penerbit saat pembayaran kartu.
              </p>
              <p>
                Kosongkan kolom untuk memakai MDR Default
                {draft.surcharge ? ` (${draft.surcharge}%)` : ""}. Isi 0 bila bank itu tidak dikenai MDR. Tarif debit dan
                kredit diatur sendiri-sendiri.
              </p>
            </>
          }
        >
          <SectionLabel>MDR per Bank Penerbit Kartu</SectionLabel>
        </LabelWithInfo>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-2.5">Bank</th>
                <th className="px-4 py-2.5">Debit</th>
                <th className="px-4 py-2.5">Kredit</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cardBanks.map((bank) => {
                const rate = draft.cardBankRates[bank.bank] ?? { debit: "", credit: "" }
                const hasOwnRate = rate.debit.trim() !== "" || rate.credit.trim() !== ""
                const cells: { kind: "debit" | "credit"; label: string; enabled: boolean }[] = [
                  { kind: "debit", label: "Debit", enabled: acceptsDebit },
                  { kind: "credit", label: "Kredit", enabled: acceptsCredit },
                ]
                return (
                  <tr key={bank.bank}>
                    <td className="px-4 py-3 font-medium text-foreground">{bank.bank}</td>
                    {cells.map(({ kind, label, enabled }) => {
                      const value = rate[kind]
                      const problem = surchargeErrorOf(value)
                      return (
                        <td key={kind} className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="relative w-28">
                              <NumberInput
                                aria-label={`MDR ${label} ${bank.bank}`}
                                decimals={2}
                                max={100}
                                group={false}
                                placeholder="Default"
                                value={value}
                                disabled={!enabled}
                                aria-invalid={problem ? true : undefined}
                                onValueChange={(next) => setRate(bank.bank, kind, next)}
                                className="pr-8"
                              />
                              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                %
                              </span>
                            </div>
                            {problem && <p className="text-xs text-destructive">{problem}</p>}
                          </div>
                        </td>
                      )
                    })}
                    <td className="px-4 py-3">
                      <span
                        className={
                          hasOwnRate
                            ? "inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-strong"
                            : "inline-flex rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {hasOwnRate ? "Tarif khusus" : "Pakai MDR Default"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface ChannelPanelProps {
  type: Extract<PaymentMethodType, "transfer" | "ewallet">
  // Active channels of this panel's type, in display order.
  accounts: PaymentChannel[]
  onAdd: () => void
  onEdit: (channel: PaymentChannel) => void
  onRemove: (channel: PaymentChannel) => void
  // Nothing left in the provider list to add.
  addDisabled: boolean
}

export function ChannelConfigPanel({ type, accounts, onAdd, onEdit, onRemove, addDisabled }: ChannelPanelProps) {
  const isBank = type === "transfer"
  const label = isBank ? "Bank" : "E-Wallet"

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel
        action={
          <Button type="button" size="sm" disabled={addDisabled} onClick={onAdd}>
            <PlusIcon />
            Tambah {label}
          </Button>
        }
      >
        {isBank ? "Bank yang digunakan toko" : "E-wallet yang digunakan toko"}
      </SectionLabel>
      <p className="-mt-1 text-xs text-muted-foreground">
        {isBank
          ? "Pelanggan yang ingin transfer akan diarahkan ke rekening di bawah. Kasir bisa menunjukkan nomor rekening dan nama pemilik ke pelanggan."
          : "Pelanggan yang ingin membayar lewat e-wallet akan diarahkan ke nomor di bawah. Kasir bisa menunjukkan nomor HP dan nama pemilik ke pelanggan."}
      </p>
      {accounts.length === 0 ? (
        <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
          {isBank
            ? 'Belum ada bank. Klik "Tambah Bank" untuk menambahkan rekening toko.'
            : 'Belum ada e-wallet. Klik "Tambah E-Wallet" untuk menambahkan akun toko.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-2.5">{label}</th>
                <th className="px-4 py-2.5">{isBank ? "Nomor rekening" : "Nomor HP"}</th>
                <th className="px-4 py-2.5">Atas nama</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{account.name}</td>
                  <td className="px-4 py-3 tabular-nums">{account.account_number || "-"}</td>
                  <td className="px-4 py-3">{account.account_name || "-"}</td>
                  <td className="px-4 py-3">
                    <RowActions>
                      <RowActionButton icon={PencilIcon} label={`Ubah ${account.name}`} onClick={() => onEdit(account)} />
                      <RowActionButton
                        icon={PowerOffIcon}
                        tone="danger"
                        label={`Nonaktifkan ${account.name}`}
                        onClick={() => onRemove(account)}
                      />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
