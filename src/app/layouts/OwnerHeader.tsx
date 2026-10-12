import type { ReactNode } from "react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import {
  CheckIcon,
  KeyRoundIcon,
  type LucideIcon,
  MonitorIcon,
  MoonIcon,
  RefreshCwIcon,
  SunIcon,
  UserIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { useAuthStore } from "@/shared/auth/store"
import { cn } from "@/shared/lib/utils"
import { type ThemePreference, useThemePreference } from "@/shared/theme/theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Terang", icon: SunIcon },
  { value: "dark", label: "Gelap", icon: MoonIcon },
  { value: "system", label: "Sistem", icon: MonitorIcon },
]

const TODAY_LABEL = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

// Shared chrome across every owner page — rendered once by OwnerLayout above
// <Outlet/>, not owned by any individual page: the greeting/date, a refresh
// control and the account menu.
//
// The greeting is a <p>, not an <h1>: each page renders its own <h1> through
// PageHeader, and two <h1>s per document left screen readers with no single
// page title. The decorative "Data diperbarui 1 mnt lalu" pill and the
// notification bell with its permanent unread dot were removed — neither had
// anything behind it, so both reported state that didn't exist. Refresh is
// now wired to the react-query cache and reports real in-flight state.
export function OwnerHeader({ menuButton }: { menuButton?: ReactNode }) {
  const name = useAuthStore((state) => state.name) ?? "Owner"
  const email = useAuthStore((state) => state.email)
  const { preference, setPreference } = useThemePreference()
  const queryClient = useQueryClient()
  const isFetching = useIsFetching() > 0

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {menuButton}
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
            Selamat datang kembali, {name}
          </p>
          <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{TODAY_LABEL}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries()}
          disabled={isFetching}
          aria-label="Muat ulang data halaman"
          title="Muat ulang data halaman"
          className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <RefreshCwIcon className={cn("size-4", isFetching && "animate-spin")} aria-hidden />
        </button>

        {/* Announces refresh completion without stealing focus. */}
        <span aria-live="polite" className="sr-only">
          {isFetching ? "Memuat data…" : ""}
        </span>

        <div aria-hidden className="hidden h-6 w-px bg-border sm:block" />

        {/* Account menu — the only way into the change-password page, which
            deliberately has no sidebar entry. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu akun"
              className="flex min-h-10 items-center gap-2.5 rounded-xl px-1 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-strong">
                <UserIcon className="size-4" aria-hidden />
              </span>
              <span className="hidden min-w-0 md:block">
                <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
                {email && (
                  <span className="block truncate text-xs text-muted-foreground">{email}</span>
                )}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="md:hidden">
              <span className="block truncate text-sm font-semibold">{name}</span>
              {email && (
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem asChild>
              <Link to="/app/profile">
                <UserIcon />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/change-password">
                <KeyRoundIcon />
                Ganti Password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Tampilan</DropdownMenuLabel>
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem key={value} onSelect={() => setPreference(value)}>
                <Icon />
                {label}
                {preference === value && <CheckIcon className="ml-auto text-primary-strong" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
