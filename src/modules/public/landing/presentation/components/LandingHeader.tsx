import { ChevronDown, LayoutDashboard, User } from "lucide-react"
import { Link } from "react-router-dom"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { NAV_LINKS } from "@/modules/public/landing/presentation/landing.content"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

export function LandingHeader() {
  const isOwner = useIsOwnerSession()
  const portalHref = isOwner ? "/app" : "/login"

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neela-border bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-neela-brand"
        >
          <NeelaWordmark />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded text-neela-label-md text-neela-text-secondary outline-none transition-colors hover:text-neela-text focus-visible:ring-2 focus-visible:ring-neela-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Below `lg` the nav links above are hidden — this native
              <details> dropdown (no JS beyond the browser's own disclosure
              behavior, same pattern as FAQSection) is how they stay
              reachable on tablet and phone. */}
          <details className="group relative lg:hidden">
            <summary
              aria-label="Buka menu navigasi"
              className="flex h-10 cursor-pointer list-none items-center gap-1 rounded-lg px-2.5 text-neela-label-md text-neela-text outline-none transition-colors hover:bg-neela-surface-alt focus-visible:ring-2 focus-visible:ring-neela-brand"
            >
              Menu
              <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <nav className="absolute top-full left-0 mt-2 flex w-48 flex-col gap-1 rounded-xl border border-neela-border bg-white p-2 shadow-lg">
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

          {/* Visitors only — for a logged-in owner the primary CTA below
              already reads "Buka Dashboard". */}
          {!isOwner && (
            <Link
              to="/login"
              className="hidden items-center justify-center rounded-lg px-3 py-2 text-neela-label-md text-neela-text outline-none transition-colors hover:text-neela-brand focus-visible:ring-2 focus-visible:ring-neela-brand sm:inline-flex"
            >
              Masuk
            </Link>
          )}
          <PrimaryCta className="inline-flex h-10 items-center justify-center rounded-lg bg-neela-brand px-5 text-center text-neela-label-md text-neela-on-brand outline-none transition-colors hover:bg-neela-primary-hover focus-visible:ring-2 focus-visible:ring-neela-brand focus-visible:ring-offset-2" />
          {/* The only way in on phones, where "Masuk" is hidden below `sm`. */}
          <Link
            to={portalHref}
            aria-label={isOwner ? "Buka Dashboard" : "Masuk"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neela-surface-alt text-neela-text outline-none transition-colors hover:bg-neela-border focus-visible:ring-2 focus-visible:ring-neela-brand sm:hidden"
          >
            {isOwner ? <LayoutDashboard className="size-4" aria-hidden /> : <User className="size-4" aria-hidden />}
          </Link>
        </div>
      </div>
    </header>
  )
}
