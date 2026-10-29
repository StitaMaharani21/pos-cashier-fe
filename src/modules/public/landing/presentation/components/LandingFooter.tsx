import { Headset } from "lucide-react"
import { Link } from "react-router-dom"

import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"
import { waLink } from "@/modules/public/shared/contact"
import { NeelaLogo } from "@/shared/ui/neela-logo"

const LINK = "text-neela-blue-100 transition-colors hover:text-white"

// Privacy policy, terms of service, legal entity name, and office address
// are deliberately absent — none of those exist in this repo yet. See the
// implementation report rather than inventing them here.
export function LandingFooter() {
  const { footer, global, settings } = useLandingContent()

  return (
    <footer className="w-full bg-neela-dark-surface text-white">
      <div className="mx-auto max-w-[1280px] px-4 pt-16 pb-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-3 sm:col-span-2 lg:col-span-2">
            <NeelaLogo variant="white" className="h-8" />
            <p className="max-w-sm text-neela-body-sm text-neela-blue-100">{footer.tagline}</p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <span className="text-neela-label-md tracking-wide text-white">{column.title}</span>
              <ul className="flex flex-col gap-2 text-neela-body-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className={LINK}>
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className={LINK}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <span className="text-neela-label-md tracking-wide text-white">{footer.contactTitle}</span>
            <ul className="flex flex-col gap-2 text-neela-body-sm">
              <li>
                <a
                  href={waLink(global.wa.help, settings.salesWa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${LINK}`}
                >
                  <Headset className="size-4" aria-hidden />
                  {footer.contactWaLabel}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-neela-body-sm text-neela-blue-100 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.copyrightHolder}.
          </p>
          {/* No privacy/terms pages exist yet — plain text rather than a
              dead link. Swap for real links once those pages are written. */}
          <div className="flex items-center gap-6">
            <span>{footer.privacyLabel}</span>
            <span>{footer.termsLabel}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
