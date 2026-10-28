import { useEffect, useState } from "react"
import {
  ChevronDownIcon,
  FolderIcon,
  LayoutGridIcon,
  LockIcon,
  LogOutIcon,
  type LucideIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PercentIcon,
  ScrollTextIcon,
  SettingsIcon,
} from "lucide-react"
import { NavLink, Outlet, useLocation } from "react-router-dom"

import { OwnerHeader } from "@/app/layouts/OwnerHeader"
import { routeAccess } from "@/app/router/routeAccess"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { UpsellModal } from "@/shared/access/UpsellModal"
import { upsellStore } from "@/shared/access/upsellStore"
import { useAuthStore } from "@/shared/auth/store"
import { cn } from "@/shared/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet"

const DASHBOARD_ITEM = { to: "/app", label: "Beranda", icon: LayoutGridIcon }

// Grouping/labels mirror the Figma sidenav (SideNavBar shared component).
// "Meja" isn't shown in that particular screen, but it's an existing,
// working feature — kept here under Master Data rather than dropped.
const NAV_GROUPS = [
  {
    label: "Data Toko",
    icon: FolderIcon,
    items: [
      // Kategori Menu + Menu + Tambahan are tabs of this one page.
      { to: "/app/menu", label: "Menu" },
      { to: "/app/ingredient", label: "Bahan Baku" },
      { to: "/app/payment-method", label: "Metode Pembayaran" },
      { to: "/app/order-type", label: "Jenis Pesanan" },
      { to: "/app/table", label: "Meja" },
    ],
  },
  {
    label: "Diskon",
    icon: PercentIcon,
    items: [
      { to: "/app/voucher", label: "Voucher" },
      { to: "/app/discount-auto", label: "Diskon Otomatis" },
    ],
  },
  {
    label: "Laporan",
    icon: ScrollTextIcon,
    items: [
      { to: "/app/financial-report", label: "Laporan Keuangan" },
      { to: "/app/cash-report", label: "Laporan Kas" },
      { to: "/app/stock-history", label: "Riwayat Stok" },
      { to: "/app/stock-reconciliation", label: "Cocokkan Stok" },
    ],
  },
  {
    label: "Pengaturan",
    icon: SettingsIcon,
    items: [
      { to: "/app/profile", label: "Profil" },
      { to: "/app/business-settings", label: "Info Toko & Paket" },
      // Cashier accounts + devices belong with the business, not master data.
      { to: "/app/users", label: "Kasir & Perangkat" },
      { to: "/app/payment-gateway", label: "Terima Bayar Online" },
    ],
  },
]

// routeAccess is keyed the same way <Route path="..."> is (no leading
// "/app/"), so this strips that prefix to look a nav item's `to` up in it.
function accessRuleFor(to: string) {
  return routeAccess[to.replace(/^\/app\/?/, "")] ?? {}
}

type ItemState = "open" | "locked" | "hidden"

function useItemState() {
  const { featureState, can } = useCapabilities()

  return (to: string): ItemState => {
    const { feature, module } = accessRuleFor(to)
    const state = featureState(feature)
    if (state === "hidden") return "hidden"
    if (state === "locked") return "locked"
    return can(module, "view") ? "open" : "hidden"
  }
}

// Shared by every row in the sidebar so the hit area clears the 44px touch
// minimum on the mobile drawer while staying compact on the desktop rail.
const ROW_BASE =
  "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
const ROW_ACTIVE = "bg-primary/15 text-foreground shadow-sm"
const ROW_IDLE = "text-muted-foreground hover:bg-muted hover:text-foreground"
const SUB_ROW_BASE =
  "flex min-h-9 items-center rounded-md px-2 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"

// Dashboard is the single top-level item (not inside a collapsible
// NAV_GROUPS entry). Kept as its own component so it goes through the same
// ItemState branches (locked/hidden) as the grouped items.
function TopLevelNavItem({
  item,
  collapsed,
  state,
  onLockedClick,
  onNavigate,
}: {
  item: { to: string; label: string; icon: LucideIcon }
  collapsed: boolean
  state: ItemState
  onLockedClick: () => void
  onNavigate: () => void
}) {
  if (state === "hidden") return null

  const isLocked = state === "locked"

  return (
    <NavLink
      to={item.to}
      end={item.to === "/app"}
      title={collapsed ? item.label : undefined}
      onClick={
        isLocked
          ? (event) => {
              event.preventDefault()
              onLockedClick()
            }
          : onNavigate
      }
      className={({ isActive }) =>
        cn(
          ROW_BASE,
          "justify-between",
          collapsed && "justify-center px-0",
          isLocked ? "text-muted-foreground/60 hover:bg-muted" : isActive ? ROW_ACTIVE : ROW_IDLE
        )
      }
    >
      <span className="flex items-center gap-3">
        <item.icon className="size-4 shrink-0" aria-hidden />
        {!collapsed && item.label}
      </span>
      {isLocked && <LockIcon className="size-3 shrink-0" aria-hidden />}
    </NavLink>
  )
}

export function OwnerLayout() {
  // Desktop-only rail collapse. Below `lg` the sidebar is an off-canvas
  // drawer instead, driven by `mobileOpen`.
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_GROUPS.map((group) => [group.label, true]))
  )
  const logout = useAuthStore((state) => state.logout)
  const { upgradeHint, isLoading } = useCapabilities()
  const stateOf = useItemState()
  const { pathname } = useLocation()

  // Navigating closes the drawer. Escape, the focus trap and the body scroll
  // lock come from the Sheet (Radix Dialog) the drawer is built on.
  useEffect(() => setMobileOpen(false), [pathname])

  function toggleGroup(label: string) {
    setOpenGroups((state) => ({ ...state, [label]: !state[label] }))
  }

  function openUpsell(to: string) {
    const { feature } = accessRuleFor(to)
    if (feature) upsellStore.open(feature, upgradeHint(feature))
  }

  function renderNavItem(
    item: { to: string; label: string },
    state: ItemState,
    options: { indent?: boolean } = {}
  ) {
    if (state === "hidden") return null

    if (state === "locked") {
      return (
        <button
          key={item.to}
          type="button"
          onClick={() => openUpsell(item.to)}
          className={cn(
            "justify-between text-left text-muted-foreground/60",
            options.indent ? SUB_ROW_BASE : cn(ROW_BASE, "hover:bg-muted")
          )}
        >
          <span className={cn(!options.indent && "flex items-center gap-3")}>{item.label}</span>
          <LockIcon className="ml-auto size-3 shrink-0" aria-hidden />
        </button>
      )
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/app"}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          options.indent
            ? cn(
                SUB_ROW_BASE,
                isActive
                  ? "bg-primary/10 font-semibold text-primary-strong"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            : cn(ROW_BASE, isActive ? ROW_ACTIVE : ROW_IDLE)
        }
      >
        {item.label}
      </NavLink>
    )
  }

  // One nav tree, rendered into both the desktop rail and the mobile drawer.
  // `showLabels` is false only for the collapsed desktop rail.
  const navTree = (showLabels: boolean) =>
    isLoading ? (
      <SidebarSkeleton />
    ) : (
      <nav aria-label="Menu utama" className="flex flex-col gap-1.5">
        <TopLevelNavItem
          item={DASHBOARD_ITEM}
          collapsed={!showLabels}
          state={stateOf(DASHBOARD_ITEM.to)}
          onLockedClick={() => openUpsell(DASHBOARD_ITEM.to)}
          onNavigate={() => setMobileOpen(false)}
        />

        {NAV_GROUPS.map((group) => {
          const items = group.items
            .map((item) => ({ item, state: stateOf(item.to) }))
            .filter(({ state }) => state !== "hidden")

          if (items.length === 0) return null

          // A collapsed rail has no room for sub-items, so the group header
          // stops being a disclosure there and the items render as icons-only
          // would be meaningless — the rail shows the group label on hover
          // via `title` and the items stay reachable once expanded.
          if (!showLabels) {
            return (
              <button
                key={group.label}
                type="button"
                title={group.label}
                aria-label={`${group.label} — perluas menu samping untuk membuka`}
                onClick={() => setCollapsed(false)}
                className={cn(ROW_BASE, ROW_IDLE, "justify-center px-0")}
              >
                <group.icon className="size-4 shrink-0" aria-hidden />
              </button>
            )
          }

          const isOpen = openGroups[group.label] ?? true

          return (
            <div key={group.label} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={isOpen}
                className={cn(ROW_BASE, ROW_IDLE, "justify-between font-medium")}
              >
                <span className="flex items-center gap-3">
                  <group.icon className="size-4 shrink-0" aria-hidden />
                  {group.label}
                </span>
                <ChevronDownIcon
                  aria-hidden
                  className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && (
                <div className="flex flex-col gap-0.5 pl-7">
                  {items.map(({ item, state }) => renderNavItem(item, state, { indent: true }))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    )

  const logoutButton = (showLabels: boolean) => (
    <button
      type="button"
      onClick={logout}
      title={showLabels ? undefined : "Keluar"}
      aria-label={showLabels ? undefined : "Keluar"}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive",
        !showLabels && "justify-center px-0"
      )}
    >
      <LogOutIcon className="size-4 shrink-0" aria-hidden />
      {showLabels && "Keluar"}
    </button>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Lewati ke konten utama
      </a>

      {/* Desktop rail — hidden below `lg`, where the drawer takes over. */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col justify-between overflow-y-auto border-r bg-card p-4 transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex flex-col">
          <div className="mb-6 flex items-center justify-between px-1">
            {!collapsed && (
              <span className="text-2xl font-extrabold tracking-tight text-primary-strong">Neela</span>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Perluas menu samping" : "Ciutkan menu samping"}
              aria-expanded={!collapsed}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? (
                <PanelLeftOpenIcon className="size-4" aria-hidden />
              ) : (
                <PanelLeftCloseIcon className="size-4" aria-hidden />
              )}
            </button>
          </div>

          {navTree(!collapsed)}
        </div>

        <div className="mt-6 border-t pt-4">{logoutButton(!collapsed)}</div>
      </aside>

      {/* Mobile/tablet drawer — the same nav tree, in a Sheet. */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 max-w-[85vw] bg-card lg:hidden"
          aria-label="Menu navigasi"
        >
          <SheetHeader className="border-b-0 pb-2">
            <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary-strong">
              Neela
            </SheetTitle>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-4 pb-4">
            {navTree(true)}
            <div className="mt-6 border-t pt-4">{logoutButton(true)}</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* min-w-0: a wide table scrolls inside its card instead of pushing
          the whole page sideways. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-card/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8 xl:px-12">
          <OwnerHeader
            menuButton={
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka menu navigasi"
                aria-expanded={mobileOpen}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              >
                <MenuIcon className="size-5" aria-hidden />
              </button>
            }
          />
        </header>
        <main id="konten-utama" className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <UpsellModal />
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}
