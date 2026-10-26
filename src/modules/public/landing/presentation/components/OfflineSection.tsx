import { CheckIcon, WifiIcon, XIcon } from "lucide-react"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import {
  OFFLINE_NEEDS_INTERNET,
  OFFLINE_NOTE,
  OFFLINE_WORKS,
  WHATSAPP_CTA_LABEL,
} from "@/modules/public/landing/presentation/landing.content"
import { waLink } from "@/modules/public/shared/contact"

// Section 6 — the central differentiator, explained without overreach: what
// keeps working offline, what doesn't, and the one caveat (sync still needs
// a connection). No claims about automatic recovery or full offline mode.
//
// Layout: two-card comparison on a dark band — the muted translucent card is
// the limitation ("butuh internet"), the white card is the highlight.
export function OfflineSection() {
  return (
    <section className="w-full bg-neela-dark-surface py-20 text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Mode Offline, Dijelaskan Apa Adanya"
          eyebrowClassName="text-neela-blue-100"
          title="Apa yang tetap jalan, apa yang butuh internet"
          className="[&>h2]:text-white [&>h2]:text-balance"
        />

        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="order-last flex flex-col gap-5 rounded-xl bg-white/12 p-7 sm:order-first">
            <h3 className="text-neela-headline-sm font-medium text-white">Butuh internet</h3>
            <ul className="flex flex-col gap-3">
              {OFFLINE_NEEDS_INTERNET.map(({ label }) => (
                <li key={label} className="flex items-center gap-3 text-neela-body-md text-white">
                  <XIcon className="size-4 shrink-0 text-white/70" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Halo Neela POS, saya ingin konsultasi soal aplikasi kasir")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex h-11 items-center justify-center rounded-md border border-white/60 px-5 text-neela-label-md text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              {WHATSAPP_CTA_LABEL}
            </a>
          </div>

          <div className="flex flex-col gap-5 rounded-xl bg-white p-7 text-neela-text">
            <div className="flex items-center gap-2">
              <h3 className="text-neela-headline-sm font-medium">Tetap jalan tanpa internet</h3>
              <span className="rounded bg-neela-amber-500 px-1.5 py-0.5 text-[0.625rem] leading-none font-bold tracking-wide text-white uppercase">
                Offline
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {OFFLINE_WORKS.map(({ label }) => (
                <li key={label} className="flex items-center gap-3 text-neela-body-md">
                  <CheckIcon className="size-4 shrink-0 text-neela-success" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
            <PrimaryCta className="mt-auto inline-flex h-11 items-center justify-center rounded-md bg-neela-brand px-5 text-neela-label-md text-neela-on-brand outline-none transition-colors hover:bg-neela-primary-hover focus-visible:ring-2 focus-visible:ring-neela-brand focus-visible:ring-offset-2" />
          </div>
        </div>

        <p className="mx-auto flex max-w-2xl items-start gap-2 text-center text-neela-body-sm text-neela-blue-100">
          <WifiIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{OFFLINE_NOTE}</span>
        </p>
      </div>
    </section>
  )
}
