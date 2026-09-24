import { CircleCheck, MessageCircle, Rocket } from "lucide-react"

import { HeroShowcase } from "@/modules/public/landing/presentation/components/HeroShowcase"
import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { HERO_TRUST_SIGNALS } from "@/modules/public/landing/presentation/landing.content"
import { waLink } from "@/modules/public/shared/contact"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neela-surface-container-low via-neela-surface to-neela-surface pt-12 pb-24">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-neela-primary-container/10 blur-3xl" />
      <div className="pointer-events-none absolute top-72 -left-32 size-80 rounded-full bg-neela-secondary-container/20 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-neela-surface-container-high px-4 py-1 text-neela-label-sm text-neela-primary shadow-sm">
              <Rocket className="size-4 text-neela-primary-container" />
              <span>Dibuat Khusus untuk Kafe &amp; Restoran di Indonesia</span>
            </div>

            <h1 className="text-neela-display-hero-mobile tracking-tight text-neela-on-primary-fixed lg:text-neela-display-hero">
              Jualan Tetap Lancar <span className="text-neela-primary-container">Tanpa Takut</span>{" "}
              Internet Putus.
            </h1>

            <p className="max-w-xl text-neela-body-lg text-neela-on-surface-variant lg:text-neela-body-xl">
              Kasir cloud offline-first: tetap jualan saat WiFi mati, sinkron otomatis saat
              online.
            </p>

            <div className="flex w-full flex-col items-stretch gap-4 pt-1 sm:w-auto sm:flex-row sm:items-center">
              <PrimaryCta
                withArrow
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary-container px-8 py-3.5 text-neela-label-lg text-neela-on-primary shadow-lg shadow-neela-primary-container/30 transition-all hover:bg-neela-primary active:scale-[0.98]"
              />
              <a
                href={waLink("Halo Neela POS, saya ingin jadwalkan demo langsung")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-surface-container-lowest px-6 py-3.5 text-neela-label-lg text-neela-on-surface shadow-md transition-all hover:bg-neela-surface-container-low"
              >
                <MessageCircle className="size-5 text-neela-tertiary" />
                <span>Jadwalkan Demo Langsung</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-neela-label-sm text-neela-on-surface-variant">
              {HERO_TRUST_SIGNALS.map((signal, index) => (
                <span key={signal} className="inline-flex items-center gap-1.5 text-neela-on-surface">
                  {index > 0 && (
                    <span aria-hidden className="mr-2.5 text-neela-outline-variant">
                      •
                    </span>
                  )}
                  <CircleCheck className="size-[18px] fill-neela-tertiary-container text-neela-surface-container-lowest" />
                  {signal}
                </span>
              ))}
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
