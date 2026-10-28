import { Check, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

import { rp } from "@/modules/public/landing/presentation/components/problem/format"
import { Chip, MockCard, MockHead, MockTitle, type ChipTone } from "@/modules/public/landing/presentation/components/problem/mock-ui"
import { useInView } from "@/modules/public/landing/presentation/components/problem/useInView"
import { cn } from "@/shared/lib/utils"

type Phase = "offline" | "syncing" | "synced"

const ORDERS = [
  { id: "#0412", name: "Es Kopi Susu ×2", time: "14:02", amount: 46000 },
  { id: "#0413", name: "Nasi Goreng Spesial", time: "14:06", amount: 38000 },
  { id: "#0414", name: "Roti Bakar + Teh", time: "14:11", amount: 32000 },
]

const OFFLINE_HOLD_MS = 4200
const SYNCED_HOLD_MS = 4600
const SYNC_STEP_MS = 650

const STATUS: Record<Phase, { tone: ChipTone; caption: string }> = {
  offline: { tone: "amber", caption: "Pesanan tunai disimpan di perangkat kasir." },
  syncing: { tone: "blue", caption: "Data terkirim otomatis, tanpa mengetik ulang." },
  synced: { tone: "green", caption: "3 pesanan sudah masuk ke server." },
}

// Product mock for "internet putus": a cashier screen that is offline with
// three cash orders queued, then reconnects and syncs them. Loops while on
// screen until the visitor takes over with the two buttons below it.
export function OfflineSyncMock() {
  const [phase, setPhase] = useState<Phase>("offline")
  const [done, setDone] = useState(0)
  const [auto, setAuto] = useState(true)
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.6 })

  // syncing: tick the queue off one order at a time, then settle on "synced".
  useEffect(() => {
    if (phase !== "syncing") return
    const timer = setTimeout(
      () => (done >= ORDERS.length ? setPhase("synced") : setDone((d) => d + 1)),
      done >= ORDERS.length ? 250 : SYNC_STEP_MS
    )
    return () => clearTimeout(timer)
  }, [phase, done])

  // auto-play: offline → syncing → synced → offline, only while visible.
  useEffect(() => {
    if (!auto || !inView || phase === "syncing") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setTimeout(
      () => {
        setDone(0)
        setPhase(phase === "offline" ? "syncing" : "offline")
      },
      phase === "offline" ? OFFLINE_HOLD_MS : SYNCED_HOLD_MS
    )
    return () => clearTimeout(timer)
  }, [auto, inView, phase])

  const choose = (next: "offline" | "syncing") => {
    setAuto(false)
    setDone(0)
    setPhase(next)
  }

  const status = STATUS[phase]
  const chipLabel =
    phase === "offline" ? "3 pesanan menunggu dikirim" : phase === "syncing" ? `Mengirim ke pusat data… ${done}/3` : "Sudah terkirim"
  const netLabel = phase === "offline" ? "Mode offline" : phase === "syncing" ? "Internet kembali" : "Online"

  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-3.5">
      <MockCard>
        <MockHead>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-neela-brand text-neela-body-md font-extrabold text-white">
              N
            </span>
            <MockTitle title="Neela POS" subtitle="Kasir · Dewi" />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-neela-label-sm font-bold whitespace-nowrap transition-colors duration-300",
              phase === "offline" && "bg-neela-dark-surface text-white",
              phase === "syncing" && "bg-neela-blue-100/60 text-neela-blue-700 ring-1 ring-neela-blue-100 ring-inset",
              phase === "synced" && "bg-neela-success-bg text-neela-success-text ring-1 ring-neela-success/25 ring-inset"
            )}
          >
            {phase === "offline" ? <WifiOff className="size-3.5" aria-hidden /> : <Wifi className="size-3.5" aria-hidden />}
            {netLabel}
          </span>
        </MockHead>

        <div className="flex flex-col gap-1.5 px-3.5 py-3">
          <Chip tone={status.tone} className="self-start py-1 text-neela-label-md transition-colors duration-300">
            {phase === "offline" && <Clock className="size-3.5" aria-hidden />}
            {phase === "syncing" && <RefreshCw className="size-3.5 animate-spin" aria-hidden />}
            {phase === "synced" && <Check className="size-3.5" aria-hidden />}
            {chipLabel}
          </Chip>
          <p className="text-neela-body-sm text-neela-text-muted">{status.caption}</p>
        </div>

        <ul>
          {ORDERS.map((order, index) => {
            const synced = phase === "synced" || (phase === "syncing" && index < done)
            return (
              <li
                key={order.id}
                className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2.5 border-t border-neela-border px-3.5 py-2.5"
              >
                <span
                  className={cn(
                    "flex size-6.5 items-center justify-center rounded-full transition-[background-color,color,scale] duration-300",
                    synced
                      ? "scale-105 bg-neela-success-bg text-neela-success-text"
                      : "bg-neela-warning-bg text-neela-warning-text"
                  )}
                >
                  {synced ? <Check className="size-3.5" aria-hidden /> : <Clock className="size-3.5" aria-hidden />}
                </span>
                <div className="min-w-0">
                  <p className="font-bold">
                    {order.id} · {order.name}
                  </p>
                  <p className="text-neela-body-sm font-medium text-neela-text-muted">{order.time} · Tunai</p>
                </div>
                <span className="font-bold tabular-nums">{rp(order.amount)}</span>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-neela-border bg-neela-surface-subtle px-3.5 py-2.5 text-neela-body-sm font-medium text-neela-text-muted">
          <span className="inline-flex items-center gap-1.5 font-semibold text-neela-text-secondary">
            <span className="size-1.75 rounded-full bg-neela-brand" aria-hidden />
            Shift berjalan · 2j 14m
          </span>
          <span>Tanpa mengetik ulang</span>
        </div>
      </MockCard>

      <div
        role="group"
        aria-label="Contoh kondisi internet"
        className="inline-flex gap-0.5 rounded-full bg-white p-0.75 shadow-[0_0_0_1px_var(--color-neela-border),0_4px_10px_-6px_rgb(17_24_39/0.25)]"
      >
        {(
          [
            { id: "offline", label: "Offline", pressed: phase === "offline" },
            { id: "syncing", label: "Internet kembali", pressed: phase !== "offline" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.pressed}
            onClick={() => choose(option.id)}
            className={cn(
              "min-h-9 cursor-pointer rounded-full px-4 text-neela-label-md font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neela-brand",
              option.pressed ? "bg-neela-brand text-white" : "text-neela-text-secondary hover:bg-neela-blue-100/60"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
