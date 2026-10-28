import { CheckIcon } from "lucide-react"

import type { LandingImage } from "@/modules/public/landing/application/landing-content"
import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"

function TourImages({ images, single }: { images: LandingImage[]; single: boolean }) {
  if (single) {
    const img = images[0]
    return (
      <img
        src={img.src}
        alt={img.alt}
        loading="lazy"
        width={img.width}
        height={img.height}
        className="h-full w-full rounded-lg object-cover object-left-top shadow-sm"
      />
    )
  }
  return (
    <div className="grid w-full grid-cols-2 items-center gap-2">
      {images.map((img) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          loading="lazy"
          width={img.width}
          height={img.height}
          className="w-full object-contain drop-shadow-md"
        />
      ))}
    </div>
  )
}

function TourCard({
  step,
  title,
  body,
  children,
}: {
  step: number
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-neela-border bg-white shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-neela-surface-subtle p-4">
        {children}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="flex size-7 items-center justify-center rounded-full bg-neela-brand text-neela-label-sm text-neela-on-brand">
          {step}
        </span>
        <h3 className="text-neela-headline-sm text-neela-text">{title}</h3>
        <p className="text-neela-body-md text-neela-text-secondary">{body}</p>
      </div>
    </article>
  )
}

// Section 5 — real app screens where a screenshot exists (cashier, payment,
// shift), as a three-card row; a plain list for screens that don't have a
// captured asset yet (never a fabricated mockup).
export function ProductTourSection() {
  const { tour } = useLandingContent()

  return (
    <section id="cara-kerja" className="w-full scroll-mt-18 bg-white py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow={tour.eyebrow}
          title={tour.title}
          description={tour.description}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TourCard step={1} title={tour.cashier.title} body={tour.cashier.body}>
            <TourImages images={tour.cashier.images} single />
          </TourCard>

          <TourCard step={2} title={tour.payment.title} body={tour.payment.body}>
            <TourImages images={tour.payment.images} single={false} />
          </TourCard>

          <TourCard step={3} title={tour.shift.title} body={tour.shift.body}>
            <TourImages images={tour.shift.images} single />
          </TourCard>
        </div>

        {/* No screenshot asset for these yet — a plain, honest list rather
            than a faked screen. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tour.other.map(({ title, body, badge }) => (
            <div key={title} className="flex flex-col gap-2 rounded-xl bg-neela-surface-alt p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neela-success-bg text-neela-success">
                  <CheckIcon className="size-3.5" aria-hidden />
                </span>
                <h4 className="text-neela-label-lg text-neela-text">{title}</h4>
                {badge && (
                  <span className="rounded-full bg-neela-primary-selected px-2 py-0.5 text-[11px] font-bold text-neela-primary-strong">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-neela-body-sm text-neela-text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
