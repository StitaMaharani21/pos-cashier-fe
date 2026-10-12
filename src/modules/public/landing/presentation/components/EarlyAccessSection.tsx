import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { EARLY_ACCESS, EARLY_ACCESS_PERKS } from "@/modules/public/landing/presentation/landing.content"

// Section 10 — stands in for a testimonial section (no live customers yet):
// what joining early actually gets you, not fabricated social proof.
// LandingPage swaps in TestimonialSection once TESTIMONIALS has real entries.
export function EarlyAccessSection() {
  return (
    <section id="pilot" className="w-full scroll-mt-18 bg-white py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-14 px-4 md:px-6 lg:px-8">
        <SectionHeading className="max-w-xl" eyebrow={EARLY_ACCESS.eyebrow} title={EARLY_ACCESS.title} description={EARLY_ACCESS.description} />

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {EARLY_ACCESS_PERKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-neela-border bg-white p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-neela-primary-selected text-neela-primary-strong">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-neela-headline-sm text-neela-text">{title}</h3>
              <p className="text-neela-body-md text-neela-text-secondary">{body}</p>
            </div>
          ))}
        </div>

        <PrimaryCta
          withArrow
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-neela-brand px-7 text-neela-label-lg text-neela-on-brand outline-none transition-colors hover:bg-neela-primary-hover focus-visible:ring-2 focus-visible:ring-neela-brand focus-visible:ring-offset-2"
        />
      </div>
    </section>
  )
}
