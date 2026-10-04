import type { Device } from "@/entities/device/model/device.types"

export type DeviceState = "bound" | "pending" | "expired" | "revoked"

// PENDING past its pairing_expires_at is shown as expired — the QR can't be
// claimed any more.
export function deviceState(device: Device, now = Date.now()): DeviceState {
  switch (device.status) {
    case "BOUND":
      return "bound"
    case "REVOKED":
      return "revoked"
    default:
      return device.pairing_expires_at && new Date(device.pairing_expires_at).getTime() <= now ? "expired" : "pending"
  }
}

export const DEVICE_STATE_META: Record<DeviceState, { label: string; className: string; dot: string }> = {
  bound: {
    label: "Terhubung",
    className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Menunggu scan",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  expired: { label: "Kedaluwarsa", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
  revoked: {
    label: "Dicabut",
    className: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    dot: "bg-red-500",
  },
}

export const DEVICE_FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "bound", label: "Terhubung" },
  { value: "pending", label: "Menunggu scan" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "revoked", label: "Dicabut" },
]
