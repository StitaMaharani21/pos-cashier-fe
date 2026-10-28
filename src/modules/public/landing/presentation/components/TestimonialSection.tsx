import { Star } from "lucide-react"

import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"

// Rendered only once TESTIMONIALS holds real, owner-approved quotes
// (LandingPage shows EarlyAccessSection until then — see landing.content.ts).
export function TestimonialSection() {
  const { testimonials } = useLandingContent()

  return (
    <section id="testimoni" className="w-full scroll-mt-18 bg-white py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 md:px-6 lg:px-8">
        <SectionHeading
          className="max-w-xl"
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          description={testimonials.description}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.items.map((item) => {
            const MetricIcon = item.metricIcon
            return (
              <figure
                key={item.name}
                className="flex flex-col justify-between gap-6 rounded-2xl border border-neela-border bg-white p-7"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1 text-neela-warning" aria-label="5 dari 5 bintang">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} className="size-5 fill-current" aria-hidden />
                    ))}
                  </div>
                  <div
                    className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-bold ${item.metricClassName}`}
                  >
                    <MetricIcon className="size-4" aria-hidden />
                    <span>{item.metric}</span>
                  </div>
                  <blockquote className="text-neela-body-md text-neela-text italic">"{item.quote}"</blockquote>
                </div>
                <figcaption className="flex items-center gap-3 pt-2">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full font-bold ${item.avatarClassName}`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-neela-label-md font-bold text-neela-text">{item.name}</p>
                    <p className="text-neela-body-sm text-neela-text-secondary">{item.role}</p>
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
