import type { GuestCartItem } from "@/modules/public/self-order/domain/self-order.types"

const NAME_KEY = "so:orderer-name"

// Remembers who is ordering on this phone so every add is tagged without
// retyping. sessionStorage can throw (private mode, blocked storage) — the
// page works without it.
export function readOrdererName(): string {
  try {
    return sessionStorage.getItem(NAME_KEY) ?? ""
  } catch {
    return ""
  }
}

export function writeOrdererName(name: string): void {
  try {
    sessionStorage.setItem(NAME_KEY, name)
  } catch {
    // Not persisted — fine.
  }
}

export function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

// "19:45" in the phone's own time zone.
export function formatClock(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":")
}

export interface CartGroup {
  label: string
  named: boolean
  items: GuestCartItem[]
  qty: number
  subtotal: number
}

// One group per orderer, in order of first appearance; unnamed items last.
export function groupCartItems(items: GuestCartItem[]): CartGroup[] {
  const groups = new Map<string, CartGroup>()
  for (const item of items) {
    const key = item.ordered_by.trim().toLowerCase()
    let group = groups.get(key)
    if (!group) {
      group = { label: item.ordered_by.trim() || "Tanpa nama", named: key !== "", items: [], qty: 0, subtotal: 0 }
      groups.set(key, group)
    }
    group.items.push(item)
    group.qty += item.qty
    group.subtotal += item.subtotal
  }
  return [...groups.values()].sort((a, b) => Number(b.named) - Number(a.named))
}

export function cartCount(items: GuestCartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

export function addonIdsOf(item: GuestCartItem): number[] {
  return item.addons.map((addon) => addon.addon_option_id)
}
