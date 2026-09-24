import { Star } from "lucide-react"

import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { TESTIMONIALS } from "@/modules/public/landing/presentation/landing.content"

// Brief's Opsi B — rendered only once TESTIMONIALS holds real, owner-approved
// quotes (LandingPage shows EarlyAccessSection until then).
export function TestimonialSection() {
  return (
    <section id="testimoni" className="w-full scroll-mt-20 bg-neela-surface py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 md:px-6 lg:px-8">
        <SectionHeading
          className="max-w-xl"
          eyebrow="Testimoni Merchant"
          title="Cerita Nyata dari Para Pemilik Kafe di Jabodetabek"
          description="Cerita nyata pemilik kafe menghadapi jam sibuk tanpa panik."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item) => {
            const MetricIcon = item.metricIcon
            return (
              <figure
                key={item.name}
                className="flex flex-col justify-between gap-6 rounded-2xl bg-neela-surface-container-lowest p-8 shadow-md"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1 text-amber-500" aria-label="5 dari 5 bintang">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} className="size-5 fill-current" />
                    ))}
                  </div>
                  <div
                    className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-bold ${item.metricClassName}`}
                  >
                    <MetricIcon className="size-4" />
                    <span>{item.metric}</span>
                  </div>
                  <blockquote className="text-neela-body-md text-neela-on-surface italic">
                    "{item.quote}"
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3 pt-2">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full font-bold ${item.avatarClassName}`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-neela-label-md font-bold text-neela-on-surface">{item.name}</p>
                    <p className="text-neela-body-sm text-neela-on-surface-variant">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
