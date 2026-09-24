import { Headset } from "lucide-react"

import { FOOTER_COLUMNS, FOOTER_TAGLINE } from "@/modules/public/landing/presentation/landing.content"
import { COPYRIGHT_HOLDER, SUPPORT_HOURS, waLink } from "@/modules/public/shared/contact"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"

const LINK = "transition-colors hover:text-neela-on-primary"

// Deliberately absent until they're real (see the landing brief): the office
// address, the legal entity name, and the QRIS/regulatory compliance badge
// from the Stitch design.
export function LandingFooter() {
  return (
    <footer className="w-full bg-neela-on-primary-fixed text-neela-primary-fixed">
      <div className="mx-auto max-w-[1280px] px-4 pt-24 pb-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col items-start gap-4 lg:col-span-4">
            <NeelaWordmark tone="dark" />
            <p className="max-w-sm text-neela-body-md">{FOOTER_TAGLINE}</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className={`flex flex-col gap-3 ${column.span}`}>
              <span className="text-neela-label-lg tracking-wide text-neela-on-primary">{column.title}</span>
              <ul className="flex flex-col gap-2 text-neela-body-md">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={LINK}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-3 lg:col-span-3">
            <span className="text-neela-label-lg tracking-wide text-neela-on-primary">Dukungan &amp; Kontak</span>
            <ul className="flex flex-col gap-2 text-neela-body-md">
              <li>
                <a
                  href={waLink("Halo Neela POS, saya butuh bantuan")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 ${LINK}`}
                >
                  <Headset className="size-4 text-neela-tertiary-fixed" />
                  Bantuan WhatsApp {SUPPORT_HOURS}
                </a>
              </li>
              <li>
                <a
                  href={waLink("Halo Neela POS, saya ingin tanya soal printer & hardware")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Panduan Printer &amp; Hardware
                </a>
              </li>
              <li>
                <a
                  href={waLink("Halo Neela POS, saya ingin bicara dengan tim sales")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Kontak Sales Jakarta
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-neela-body-sm text-neela-outline-variant sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COPYRIGHT_HOLDER}. Dibuat untuk F&amp;B Indonesia.
          </p>
          {/* No privacy/terms pages exist yet — plain text rather than the
              Stitch export's dead `href="#"` links. Swap for <Link>s once
              those pages are written. */}
          <div className="flex items-center gap-6">
            <span>Kebijakan Privasi</span>
            <span>Syarat &amp; Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
