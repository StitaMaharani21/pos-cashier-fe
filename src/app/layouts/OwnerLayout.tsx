import { useState } from "react"
import {
  ChevronDownIcon,
  FolderIcon,
  LayoutGridIcon,
  LockIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PercentIcon,
  ScrollTextIcon,
  SettingsIcon,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { OwnerHeader } from "@/app/layouts/OwnerHeader"
import { routeAccess } from "@/app/router/routeAccess"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { UpsellModal } from "@/shared/access/UpsellModal"
import { upsellStore } from "@/shared/access/upsellStore"
import { useAuthStore } from "@/shared/auth/store"
import { cn } from "@/shared/lib/utils"

const DASHBOARD_ITEM = { to: "/app", label: "Dashboard", icon: LayoutGridIcon }

// Grouping/labels mirror the Figma sidenav (SideNavBar shared component).
// "Meja" isn't shown in that particular screen, but it's an existing,
// working feature — kept here under Master Data rather than dropped.
const NAV_GROUPS = [
  {
    label: "Master Data",
    icon: FolderIcon,
    items: [
      { to: "/app/menu", label: "Produk" },
      { to: "/app/menu-category", label: "Kategori Produk" },
      { to: "/app/ingredient", label: "Bahan Baku" },
      { to: "/app/payment-method", label: "Metode Pembayaran" },
      { to: "/app/order-type", label: "Jenis Order" },
      { to: "/app/table", label: "Meja" },
      { to: "/app/users", label: "Pengguna" },
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
      { to: "/app/sales-report", label: "Laporan Penjualan" },
      { to: "/app/cash-report", label: "Laporan Kas" },
      { to: "/app/stock-history", label: "Riwayat Stok" },
      { to: "/app/stock-reconciliation", label: "Cek Selisih Stok" },
    ],
  },
  {
    label: "Pengaturan",
    icon: SettingsIcon,
    items: [
      { to: "/app/profile", label: "Profile" },
      { to: "/app/business-settings", label: "Bisnis" },
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

function DashboardNavItem({
  collapsed,
  state,
  onLockedClick,
}: {
  collapsed: boolean
  state: ItemState
  onLockedClick: () => void
}) {
  if (state === "hidden") return null

  const isLocked = state === "locked"

  return (
    <NavLink
      to={DASHBOARD_ITEM.to}
      end
      title={collapsed ? DASHBOARD_ITEM.label : undefined}
      onClick={
        isLocked
          ? (event) => {
              event.preventDefault()
              onLockedClick()
            }
          : undefined
      }
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold",
          collapsed && "justify-center px-0",
          isLocked
            ? "text-muted-foreground/60"
            : isActive
              ? "bg-primary/15 text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
        )
      }
    >
      <span className="flex items-center gap-3">
        <DASHBOARD_ITEM.icon className="size-4 shrink-0" />
        {!collapsed && DASHBOARD_ITEM.label}
      </span>
      {isLocked && <LockIcon className="size-3 shrink-0" />}
    </NavLink>
  )
}

export function OwnerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_GROUPS.map((group) => [group.label, true]))
  )
  const logout = useAuthStore((state) => state.logout)
  const { upgradeHint, isLoading } = useCapabilities()
  const stateOf = useItemState()

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
          title={collapsed ? item.label : undefined}
          className={cn(
            "flex items-center justify-between gap-2 rounded-md py-1.5 text-left text-xs text-muted-foreground/60",
            options.indent ? "pl-0" : "px-3.5 py-2.5 text-sm font-semibold",
            collapsed && !options.indent && "justify-center px-0"
          )}
        >
          <span className={cn(!options.indent && "flex items-center gap-3")}>
            {item.label}
          </span>
          <LockIcon className="size-3 shrink-0" />
        </button>
      )
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/app"}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          options.indent
            ? cn(
                "rounded-md py-1.5 text-xs",
                isActive ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              )
            : cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary/15 text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col justify-between overflow-y-auto border-r bg-card p-4 transition-[width] duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex flex-col">
          <div className="mb-8 flex items-center justify-between px-2">
            {!collapsed && (
              <span className="text-3xl font-bold tracking-wide text-primary">Neela</span>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? (
                <PanelLeftOpenIcon className="size-4" />
              ) : (
                <PanelLeftCloseIcon className="size-4" />
              )}
            </button>
          </div>

          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            <nav className="flex flex-col gap-1.5">
              <DashboardNavItem
                collapsed={collapsed}
                state={stateOf(DASHBOARD_ITEM.to)}
                onLockedClick={() => openUpsell(DASHBOARD_ITEM.to)}
              />

              {NAV_GROUPS.map((group) => {
                const items = group.items
                  .map((item) => ({ item, state: stateOf(item.to) }))
                  .filter(({ state }) => state !== "hidden")

                if (items.length === 0) return null

                return (
                  <div key={group.label} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      title={collapsed ? group.label : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <group.icon className="size-4 shrink-0" />
                        {!collapsed && group.label}
                      </span>
                      {!collapsed && (
                        <ChevronDownIcon
                          className={cn(
                            "size-3.5 transition-transform",
                            openGroups[group.label] && "rotate-180"
                          )}
                        />
                      )}
                    </button>

                    {!collapsed && openGroups[group.label] && (
                      <div className="flex flex-col gap-1 pl-9">
                        {items.map(({ item, state }) =>
                          renderNavItem(item, state, { indent: true })
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          )}
        </div>

        <div className="border-t pt-4">
          <button
            type="button"
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex w-full items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOutIcon className="size-4 shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-card/95 px-12 py-3.5 backdrop-blur-sm">
          <OwnerHeader />
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      <UpsellModal />
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-9 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}
