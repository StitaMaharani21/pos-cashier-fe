import { Headset } from "lucide-react"
import { Link } from "react-router-dom"

import { FOOTER_COLUMNS, FOOTER_TAGLINE } from "@/modules/public/landing/presentation/landing.content"
import { COPYRIGHT_HOLDER, SUPPORT_HOURS, waLink } from "@/modules/public/shared/contact"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"

const LINK = "text-neela-blue-100 transition-colors hover:text-white"

// Privacy policy, terms of service, legal entity name, and office address
// are deliberately absent — none of those exist in this repo yet. See the
// implementation report rather than inventing them here.
export function LandingFooter() {
  return (
    <footer className="w-full bg-neela-dark-surface text-white">
      <div className="mx-auto max-w-[1280px] px-4 pt-16 pb-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-3 sm:col-span-2 lg:col-span-2">
            <NeelaWordmark tone="dark" />
            <p className="max-w-sm text-neela-body-sm text-neela-blue-100">{FOOTER_TAGLINE}</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
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
            <span className="text-neela-label-md tracking-wide text-white">Kontak</span>
            <ul className="flex flex-col gap-2 text-neela-body-sm">
              <li>
                <a
                  href={waLink("Halo Neela POS, saya butuh bantuan")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${LINK}`}
                >
                  <Headset className="size-4" aria-hidden />
                  WhatsApp {SUPPORT_HOURS}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-neela-body-sm text-neela-blue-100 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COPYRIGHT_HOLDER}.
          </p>
          {/* No privacy/terms pages exist yet — plain text rather than a
              dead link. Swap for real links once those pages are written. */}
          <div className="flex items-center gap-6">
            <span>Kebijakan Privasi</span>
            <span>Syarat &amp; Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
