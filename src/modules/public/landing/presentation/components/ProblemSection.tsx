import { TriangleAlert } from "lucide-react"

import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { PAIN_POINTS } from "@/modules/public/landing/presentation/landing.content"

export function ProblemSection() {
  return (
    <section className="w-full bg-neela-surface-container-low py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kendala Operasional Nyata"
          eyebrowClassName="text-neela-error"
          title="Masalah Kasir Klasik yang Bikin Omset Bocor dan Tamu Kecewa"
          description="Solusi untuk kendala kasir yang sering bikin omset bocor saat jam sibuk."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PAIN_POINTS.map(({ icon: Icon, title, body, impact }) => (
            <div
              key={title}
              className="flex flex-col justify-between gap-6 rounded-2xl bg-neela-surface-container-lowest p-8 shadow-md"
            >
              <div className="flex flex-col gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-neela-error-container text-neela-error">
                  <Icon className="size-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-neela-headline-md text-neela-on-surface">{title}</h3>
                  <p className="text-neela-body-md text-neela-on-surface-variant">{body}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-neela-error-container/40 p-4 text-neela-label-sm text-neela-on-error-container">
                <TriangleAlert className="size-[18px] shrink-0 text-neela-error" />
                <span>
                  <strong>Dampak:</strong> {impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
