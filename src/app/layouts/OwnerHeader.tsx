import { BellIcon, KeyRoundIcon, RefreshCwIcon, UserIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { useAuthStore } from "@/shared/auth/store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

const TODAY_LABEL = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

// Shared chrome across every owner page — rendered once by OwnerLayout above
// <Outlet/>, not owned by any individual page. Matches the Figma "Top Header
// Bar": greeting + date on the left, sync/reload/notification/profile on
// the right. The sync status is decorative copy — this app has no real
// background-sync system to report on.
export function OwnerHeader() {
  const name = useAuthStore((state) => state.name) ?? "Owner"
  const email = useAuthStore((state) => state.email)

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          Selamat datang kembali <span aria-hidden>👋</span>
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{TODAY_LABEL}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-muted px-3.5 py-1.5 text-xs text-muted-foreground sm:flex">
          <RefreshCwIcon className="size-2.5" />
          Sinkronisasi 1 mnt lalu
        </span>

        <button
          type="button"
          aria-label="Muat ulang"
          className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground"
        >
          <RefreshCwIcon className="size-3.5" />
        </button>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground"
        >
          <BellIcon className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>

        <div className="h-6 w-px bg-border" />

        {/* Account menu — the only way into the change-password page, which
            deliberately has no sidebar entry. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu akun"
              className="flex items-center gap-2.5 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
                <UserIcon className="size-3.5" />
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{name}</p>
                {email && <p className="text-xs text-muted-foreground">{email}</p>}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
