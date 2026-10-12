import { MessageCircle } from "lucide-react"

import { HeroShowcase } from "@/modules/public/landing/presentation/components/HeroShowcase"
import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { HERO_BADGE, HERO_HEADLINE, HERO_SUBHEAD, WHATSAPP_CTA_LABEL } from "@/modules/public/landing/presentation/landing.content"
import { waLink } from "@/modules/public/shared/contact"

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-10 pb-16 sm:pt-14 sm:pb-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start gap-5 lg:col-span-6">
            <span className="inline-flex items-center rounded-full bg-neela-surface-subtle px-3.5 py-1 text-neela-label-sm text-neela-brand">
              {HERO_BADGE}
            </span>

            <h1 className="text-neela-display-hero-mobile tracking-tight text-neela-text lg:text-neela-display-hero">
              {HERO_HEADLINE}
            </h1>

            <p className="max-w-xl text-neela-body-lg text-neela-text-secondary">{HERO_SUBHEAD}</p>

            <div className="flex w-full flex-col items-stretch gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
              <PrimaryCta
                withArrow
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-neela-brand px-7 text-neela-label-lg text-neela-on-brand outline-none transition-colors hover:bg-neela-primary-hover focus-visible:ring-2 focus-visible:ring-neela-brand focus-visible:ring-offset-2"
              />
              <a
                href={waLink("Halo Neela POS, saya ingin konsultasi soal aplikasi kasir")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-neela-border bg-white px-6 text-neela-label-lg text-neela-text outline-none transition-colors hover:border-neela-brand/40 hover:bg-neela-surface-alt focus-visible:ring-2 focus-visible:ring-neela-brand"
              >
                <MessageCircle className="size-5 text-neela-success" aria-hidden />
                <span>{WHATSAPP_CTA_LABEL}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <HeroShowcase />
          </div>
        </div>
      </div>
    </section>
  )
}
