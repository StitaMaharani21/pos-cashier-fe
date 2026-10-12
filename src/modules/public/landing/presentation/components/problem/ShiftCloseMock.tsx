import { Check, TriangleAlert } from "lucide-react"
import { useId, useState } from "react"

import { rp } from "@/modules/public/landing/presentation/components/problem/format"
import { Chip, MockCard, MockHead, MockHint, MockTitle } from "@/modules/public/landing/presentation/components/problem/mock-ui"
import { cn } from "@/shared/lib/utils"

const SYSTEM_CASH = 1250000
const MAX_DIGITS = 9

const dotted = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

type Tone = "none" | "short" | "over" | "match"

const BAND_TONES: Record<Tone, string> = {
  none: "bg-neela-surface-alt ring-neela-border",
  short: "bg-neela-danger/5 ring-neela-danger/15",
  over: "bg-neela-warning-bg ring-neela-warning/35",
  match: "bg-neela-success-bg ring-neela-success/25",
}

const AMOUNT_TONES: Record<Tone, string> = {
  none: "text-neela-text-muted",
  short: "text-neela-danger",
  over: "text-neela-warning-text",
  match: "text-neela-success-text",
}

function describeDifference(digits: string): { tone: Tone; amount: string; tag: string } {
  if (!digits) return { tone: "none", amount: "–", tag: "Isi kas fisik" }
  const diff = Number(digits) - SYSTEM_CASH
  if (diff === 0) return { tone: "match", amount: "Rp0", tag: "Cocok" }
  if (diff < 0) return { tone: "short", amount: `-${rp(diff)}`, tag: "Perlu dicek" }
  return { tone: "over", amount: `+${rp(diff)}`, tag: "Uang lebih, cek ulang" }
}

// Product mock for "kas dan stok tidak cocok": the shift-close card with a
// live difference calculator, plus the Pro stock reconciliation strip.
export function ShiftCloseMock() {
  const inputId = useId()
  const [digits, setDigits] = useState("1230000")
  const { tone, amount, tag } = describeDifference(digits)

  return (
    <div className="flex w-full flex-col items-center gap-3.5">
      <MockCard>
        <MockHead>
          <MockTitle title="Tutup shift" subtitle="Shift siang · Dewi · 08:00 – 16:00" />
          <Chip tone="slate">Kasir</Chip>
        </MockHead>

        <div className="px-3.5 pt-1 pb-3.5">
          <div className="flex items-center justify-between gap-3 border-b border-neela-border py-3">
            <span className="font-medium text-neela-text-secondary">Kas sistem</span>
            <span className="text-neela-label-lg font-bold tabular-nums">{rp(SYSTEM_CASH)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-neela-border py-3">
            <label htmlFor={inputId} className="min-w-0 font-medium text-neela-text-secondary">
              Kas fisik
              <span className="block text-neela-body-sm text-neela-text-muted">Uang yang dihitung kasir</span>
            </label>
            <span className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-neela-blue-100 bg-white px-2.5 py-1.5 font-semibold text-neela-text-muted transition-[border-color,box-shadow] focus-within:border-neela-brand focus-within:ring-3 focus-within:ring-neela-blue-100">
              Rp
              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={dotted(digits)}
                onChange={(event) => setDigits(event.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS))}
                className="w-26 bg-transparent text-right text-neela-label-lg font-bold text-neela-text tabular-nums outline-none"
              />
            </span>
          </div>

          <div
            className={cn(
              "mt-3.5 flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 ring-1 transition-colors duration-300 ring-inset",
              BAND_TONES[tone]
            )}
          >
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <span className="font-semibold text-neela-text-secondary">Selisih</span>
              <Chip
                tone={tone === "match" ? "green" : tone === "none" ? "slate" : "amber"}
                className="transition-colors duration-300"
              >
                {tone === "match" ? (
                  <Check className="size-3.5" aria-hidden />
                ) : tone !== "none" ? (
                  <TriangleAlert className="size-3.5" aria-hidden />
                ) : null}
                {tag}
              </Chip>
            </div>
            <span
              className={cn(
                "text-right text-2xl font-extrabold tracking-tight tabular-nums transition-colors duration-300",
                AMOUNT_TONES[tone]
              )}
            >
              {amount}
            </span>
          </div>
        </div>

        <MockHead className="border-t border-b-0 bg-neela-surface-subtle">
          <div className="flex items-center gap-2">
            <p className="font-bold">Rekonsiliasi stok</p>
            <span className="rounded-md bg-neela-dark-surface px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-white">
              PRO
            </span>
          </div>
          <p className="text-neela-body-sm font-medium text-neela-text-muted">Per bahan baku</p>
        </MockHead>
        <div className="flex items-center justify-between gap-3 border-t border-neela-border px-3.5 py-2.5">
          <MockTitle title="Susu UHT" subtitle="Sistem 12 L · Fisik 11 L" />
          <Chip tone="red">-1 L</Chip>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-neela-border px-3.5 py-2.5">
          <MockTitle title="Biji kopi arabika" subtitle="Sistem 8,5 kg · Fisik 8,5 kg" />
          <Chip tone="green">
            <Check className="size-3.5" aria-hidden />
            Cocok
          </Chip>
        </div>
      </MockCard>
      <MockHint>Ubah angka kas fisik, selisih langsung dihitung.</MockHint>
    </div>
  )
}
