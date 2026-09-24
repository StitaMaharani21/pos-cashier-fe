import { LayoutDashboard, User } from "lucide-react"
import { Link } from "react-router-dom"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { NAV_LINKS } from "@/modules/public/landing/presentation/landing.content"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

export function LandingHeader() {
  const isOwner = useIsOwnerSession()
  const portalHref = isOwner ? "/app" : "/login"

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-neela-surface-container-lowest/90 shadow-[0_1px_8px_rgba(0,24,73,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2">
          <NeelaWordmark />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-neela-label-md text-neela-on-surface-variant transition-colors hover:text-neela-on-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Visitors only — for a logged-in owner the primary CTA below
              already reads "Buka Dashboard". */}
          {!isOwner && (
            <Link
              to="/login"
              className="hidden items-center justify-center px-4 py-2 text-neela-label-md text-neela-on-surface transition-colors hover:text-neela-primary-container sm:inline-flex"
            >
              Masuk Portal
            </Link>
          )}
          <PrimaryCta className="inline-flex items-center justify-center rounded-full bg-neela-primary-container px-6 py-2 text-center text-neela-label-md text-neela-on-primary-container shadow-[0_4px_14px_rgba(2,102,255,0.35)] transition-all hover:bg-neela-primary active:scale-[0.98]" />
          {/* Decorative in the Stitch design; wired to the portal here since
              "Masuk Portal" is hidden below `sm` — the only way in on phones. */}
          <Link
            to={portalHref}
            aria-label={isOwner ? "Buka Dashboard" : "Masuk Portal"}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neela-primary text-neela-on-primary"
          >
            {isOwner ? <LayoutDashboard className="size-4" /> : <User className="size-4" />}
          </Link>
        </div>
      </div>
    </header>
  )
}
