import { CookieIcon, CoffeeIcon, CupSodaIcon, IceCreamConeIcon, SoupIcon, UtensilsCrossedIcon } from "lucide-react"

import type { GuestMenu } from "@/modules/public/self-order/domain/self-order.types"

// Menus without a photo get a Neela-coloured tile with an icon guessed from
// the category name (same idea as the prototype's per-category tiles).
const TILE_COLORS = [
  "var(--color-neela-primary-container)",
  "var(--color-neela-tertiary-container)",
  "var(--color-neela-secondary)",
  "var(--color-neela-on-primary-fixed-variant)",
  "var(--color-neela-tertiary)",
  "var(--color-neela-inverse-surface)",
]

function iconFor(categoryName: string) {
  const name = categoryName.toLowerCase()
  if (/(kopi|coffee|espresso)/.test(name)) return CoffeeIcon
  if (/(minum|drink|teh|tea|jus|juice|non)/.test(name)) return CupSodaIcon
  if (/(dessert|es krim|ice|manis)/.test(name)) return IceCreamConeIcon
  if (/(snack|cemil|camilan|ringan)/.test(name)) return CookieIcon
  if (/(berat|nasi|mie|main|makan)/.test(name)) return SoupIcon
  return UtensilsCrossedIcon
}

export function MenuThumb({ menu, className }: { menu: GuestMenu; className: string }) {
  const Icon = iconFor(menu.category_name ?? "")
  return (
    <div className={className} style={{ background: TILE_COLORS[menu.category_id % TILE_COLORS.length] }}>
      {menu.image_url ? <img src={menu.image_url} alt="" loading="lazy" /> : <Icon aria-hidden />}
    </div>
  )
}
