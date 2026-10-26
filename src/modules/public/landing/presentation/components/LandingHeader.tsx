import { ChevronDown, LayoutDashboard, User } from "lucide-react"
import { Link } from "react-router-dom"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { NAV_LINKS } from "@/modules/public/landing/presentation/landing.content"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

// Rendered inside the hero card (blue gradient), so it's transparent with
// light text and scrolls away with the hero rather than staying fixed.
export function LandingHeader() {
  const isOwner = useIsOwnerSession()
  const portalHref = isOwner ? "/app" : "/login"

  return (
    <header className="relative z-10">
      <div className="mx-auto flex h-18 max-w-[1400px] items-center justify-between gap-4 px-5 lg:px-8">
        <a href="#top" className="flex items-center gap-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-white">
          <NeelaWordmark tone="dark" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded text-neela-label-md text-white/90 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Below `lg`: native <details> dropdown (no JS state), same pattern as FAQSection */}
          <details className="group relative lg:hidden">
            <summary
              aria-label="Buka menu navigasi"
              className="flex h-10 cursor-pointer list-none items-center gap-1 rounded-full px-3 text-neela-label-md text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              Menu
              <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <nav className="absolute top-full right-0 mt-2 flex w-48 flex-col gap-1 rounded-xl border border-neela-border bg-white p-2 shadow-lg">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-neela-label-md text-neela-text outline-none transition-colors hover:bg-neela-surface-alt focus-visible:ring-2 focus-visible:ring-neela-brand"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </details>

          {!isOwner && (
            <Link
              to="/login"
              className="hidden items-center justify-center rounded-full px-3 py-2 text-neela-label-md text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              Masuk
            </Link>
          )}
          <PrimaryCta className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-center text-neela-label-md text-neela-brand outline-none transition-colors hover:bg-neela-surface-subtle focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neela-brand" />
          {/* Phone-only icon link, since "Masuk" is hidden below `sm` */}
          <Link
            to={portalHref}
            aria-label={isOwner ? "Buka Dashboard" : "Masuk"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white sm:hidden"
          >
            {isOwner ? <LayoutDashboard className="size-4" aria-hidden /> : <User className="size-4" aria-hidden />}
          </Link>
        </div>
      </div>
    </header>
  )
}
