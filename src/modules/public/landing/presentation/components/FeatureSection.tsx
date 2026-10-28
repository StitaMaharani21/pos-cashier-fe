import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"

// Section 7 — features organized around what's actually gated (Starter vs
// Pro, per pos-kasir-be's entitlement.go), plus supported platforms/devices.
// Not an arbitrary feature grid: the Starter/Pro split is the real gate.
export function FeatureSection() {
  const { features } = useLandingContent()

  return (
    <section id="fitur" className="w-full scroll-mt-18 bg-neela-surface-alt py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
        />

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-neela-border bg-white p-7">
            <h3 className="text-neela-label-lg text-neela-text">{features.starterTitle}</h3>
            <ul className="flex flex-col gap-3">
              {features.starter.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-neela-body-md text-neela-text">
                  <Icon className="size-4 shrink-0 text-neela-brand" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border-2 border-neela-brand bg-white p-7">
            <div className="flex items-center gap-2">
              <h3 className="text-neela-label-lg text-neela-text">{features.proTitle}</h3>
              <span className="rounded-full bg-neela-primary-selected px-2 py-0.5 text-[11px] font-bold text-neela-primary-strong">
                {features.proChip}
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {features.pro.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-neela-body-md text-neela-text">
                  <Icon className="size-4 shrink-0 text-neela-brand" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 border-t border-neela-border pt-10 sm:grid-cols-2">
          {features.platforms.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4 rounded-xl bg-white p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neela-primary-selected text-neela-primary-strong">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h4 className="text-neela-label-lg text-neela-text">{title}</h4>
                <p className="text-neela-body-sm text-neela-text-secondary">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
