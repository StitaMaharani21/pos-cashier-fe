import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { EARLY_ACCESS_PERKS } from "@/modules/public/landing/presentation/landing.content"

// Stands in for the testimonial section (brief's Opsi A) while Neela has no
// live customers — value props for joining the pilot, not customer quotes.
// LandingPage swaps in TestimonialSection once TESTIMONIALS has real entries.
export function EarlyAccessSection() {
  return (
    <section id="pilot" className="w-full scroll-mt-20 bg-neela-surface py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 px-4 md:px-6 lg:px-8">
        <SectionHeading
          className="max-w-xl"
          eyebrow="Program Pilot"
          title="Jadi Bagian dari Toko Pilot Pertama Neela"
          description="Keuntungan bergabung lebih awal selama slot early access masih dibuka."
        />

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          {EARLY_ACCESS_PERKS.map(({ icon: Icon, iconClassName, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-2xl bg-neela-surface-container-lowest p-8 shadow-md"
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${iconClassName}`}>
                <Icon className="size-6" />
              </div>
              <h3 className="text-neela-headline-sm text-neela-on-surface">{title}</h3>
              <p className="text-neela-body-md text-neela-on-surface-variant">{body}</p>
            </div>
          ))}
        </div>

        <PrimaryCta
          withArrow
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary-container px-8 py-3.5 text-neela-label-lg text-neela-on-primary shadow-lg shadow-neela-primary-container/30 transition-all hover:bg-neela-primary active:scale-[0.98]"
        />
      </div>
    </section>
  )
}
