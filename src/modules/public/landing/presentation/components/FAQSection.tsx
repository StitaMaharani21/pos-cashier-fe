import { ChevronDown } from "lucide-react"

import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { FAQ_ITEMS } from "@/modules/public/landing/presentation/landing.content"

// Section 11 — native <details>/<summary>: keyboard-operable, screen-reader
// friendly, and needs no client-side JS for what's static content.
export function FAQSection() {
  return (
    <section id="faq" className="w-full scroll-mt-18 bg-white py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Pertanyaan yang sering ditanyakan"
          description="Belum ketemu jawabannya? Hubungi kami lewat WhatsApp."
        />

        <div className="flex flex-col divide-y divide-neela-border rounded-2xl border border-neela-border">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <details key={question} className="group p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-neela-label-lg text-neela-text outline-none focus-visible:ring-2 focus-visible:ring-neela-brand">
                {question}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-neela-text-muted transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-neela-body-md text-neela-text-secondary">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
