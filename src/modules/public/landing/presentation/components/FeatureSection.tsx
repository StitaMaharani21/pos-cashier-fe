import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { MINI_FEATURES, PILLARS } from "@/modules/public/landing/presentation/landing.content"

export function FeatureSection() {
  return (
    <section id="fitur" className="w-full scroll-mt-20 bg-neela-surface py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Keunggulan Neela"
          title="Dibuat untuk Jam Sibuk di Kasir"
          description="Kasir dan barista melayani tamu dalam hitungan detik."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between gap-8 rounded-2xl bg-neela-surface-container-lowest p-8 shadow-md md:p-12"
              >
                <div className="flex flex-col gap-4">
                  <div className={`flex size-14 items-center justify-center rounded-xl ${pillar.iconClassName}`}>
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-neela-headline-md text-neela-on-surface">{pillar.title}</h3>
                  <p className={`text-neela-label-md font-semibold ${pillar.taglineClassName}`}>
                    {pillar.tagline}
                  </p>
                  <p className="text-neela-body-md text-neela-on-surface-variant">{pillar.body}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-neela-surface-container px-2 py-1 text-neela-label-sm text-neela-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-md bg-neela-tertiary-container/15 px-2 py-1 text-neela-label-sm font-bold text-neela-tertiary">
                    {pillar.highlightTag}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div id="keunggulan" className="grid scroll-mt-28 grid-cols-1 gap-4 pt-4 md:grid-cols-3">
          {MINI_FEATURES.map(({ icon: Icon, title, body, badge }) => (
            <div key={title} className="flex items-start gap-4 rounded-xl bg-neela-surface-container-low p-6">
              <div className="shrink-0 rounded-lg bg-neela-primary-container p-2 text-neela-on-primary-container">
                <Icon className="size-6" />
              </div>
              <div>
                <h4 className="mb-1 text-neela-label-lg text-neela-on-surface">
                  {title}
                  {badge && (
                    <span className="ml-2 inline-block rounded-full bg-neela-primary-fixed px-2 py-0.5 align-middle text-[11px] font-bold text-neela-primary">
                      {badge}
                    </span>
                  )}
                </h4>
                <p className="text-neela-body-sm text-neela-on-surface-variant">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
