import { CheckIcon, WifiIcon, XIcon } from "lucide-react"

import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import {
  OFFLINE_NEEDS_INTERNET,
  OFFLINE_NOTE,
  OFFLINE_WORKS,
} from "@/modules/public/landing/presentation/landing.content"

// Section 6 — the central differentiator, explained without overreach: what
// keeps working offline, what doesn't, and the one caveat (sync still needs
// a connection). No claims about automatic recovery or full offline mode.
export function OfflineSection() {
  return (
    <section className="w-full bg-neela-dark-surface py-20 text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Mode Offline, Dijelaskan Apa Adanya"
          eyebrowClassName="text-neela-blue-100"
          title="Apa yang tetap jalan, apa yang butuh internet"
          className="[&>h2]:text-white [&>p]:text-neela-blue-100"
        />

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl bg-neela-dark-surface-raised p-7">
            <div className="flex items-center gap-2 text-neela-success-soft">
              <CheckIcon className="size-5" aria-hidden />
              <h3 className="text-neela-label-lg text-white">Tetap jalan tanpa internet</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {OFFLINE_WORKS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-neela-body-md text-neela-blue-100">
                  <Icon className="size-4 shrink-0 text-neela-success-soft" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 p-7">
            <div className="flex items-center gap-2 text-white/70">
              <XIcon className="size-5" aria-hidden />
              <h3 className="text-neela-label-lg text-white">Butuh internet</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {OFFLINE_NEEDS_INTERNET.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-neela-body-md text-neela-blue-100">
                  <Icon className="size-4 shrink-0 text-white/60" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
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
