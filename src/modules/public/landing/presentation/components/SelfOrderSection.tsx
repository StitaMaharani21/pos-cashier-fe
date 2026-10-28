import { CheckIcon, QrCode, Smartphone } from "lucide-react"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

// Section 8 — self-order QR as a concrete reason to upgrade to Pro. No
// screenshot asset exists for this screen, so the visual is a restrained,
// clearly-illustrative panel (device + QR glyph), not a faked app screen.
export function SelfOrderSection() {
  const isOwner = useIsOwnerSession()
  const { selfOrder } = useLandingContent()

  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-3xl bg-neela-surface-subtle p-8 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div className="flex flex-col items-start gap-4">
            <span className="rounded-full bg-neela-primary-selected px-3 py-1 text-neela-label-sm text-neela-primary-strong">
              {selfOrder.eyebrow}
            </span>
            <h2 className="text-neela-headline-xl-mobile tracking-tight text-neela-text md:text-neela-headline-xl">
              {selfOrder.title}
            </h2>
            <p className="max-w-md text-neela-body-lg text-neela-text-secondary">{selfOrder.body}</p>

            <ul className="flex flex-col gap-2.5 pt-1">
              {selfOrder.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-neela-body-md text-neela-text">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-neela-brand" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>

            {!isOwner && (
              <PrimaryCta
                withArrow
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neela-brand px-6 text-neela-label-lg text-neela-on-brand outline-none transition-colors hover:bg-neela-primary-hover focus-visible:ring-2 focus-visible:ring-neela-brand focus-visible:ring-offset-2"
              />
            )}
          </div>

          {/* Illustrative, not a screenshot — a phone + QR glyph, honest
              about being a visual explanation rather than a captured screen. */}
          <div aria-hidden className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center">
            <div className="absolute flex size-44 items-center justify-center rounded-3xl bg-white shadow-xl">
              <QrCode className="size-24 text-neela-primary-strong" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex size-20 items-center justify-center rounded-2xl bg-neela-brand text-white shadow-lg">
              <Smartphone className="size-9" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
