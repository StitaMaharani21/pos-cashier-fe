import { MessageCircle } from "lucide-react"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { FINAL_CTA_LEAD, FINAL_CTA_TITLE, WHATSAPP_CTA_LABEL } from "@/modules/public/landing/presentation/landing.content"
import { waLink } from "@/modules/public/shared/contact"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

// Section 12 — a concise close, not a second hero. Two conversion paths,
// no repeat of the full hero pitch.
export function FinalCtaSection() {
  const isOwner = useIsOwnerSession()

  return (
    <section id="kontak" className="w-full scroll-mt-18 bg-neela-dark-surface py-16 text-white">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-neela-headline-xl-mobile font-bold tracking-tight md:text-neela-headline-xl">
            {FINAL_CTA_TITLE}
          </h2>

          <p className="max-w-xl text-neela-body-lg text-neela-blue-100">
            {isOwner ? FINAL_CTA_LEAD.owner : FINAL_CTA_LEAD.visitor}
          </p>

          <div className="flex w-full flex-col items-stretch gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
            <PrimaryCta
              withArrow
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-neela-label-lg text-neela-primary-strong outline-none transition-colors hover:bg-neela-blue-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neela-dark-surface"
            />
            <a
              href={waLink("Halo Neela POS, saya tertarik tanya soal aplikasi kasir")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-7 text-neela-label-lg text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle className="size-5" aria-hidden />
              <span>{WHATSAPP_CTA_LABEL}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
