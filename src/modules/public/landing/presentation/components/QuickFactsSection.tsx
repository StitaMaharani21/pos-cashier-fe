import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"

// Section 3 — compact, scannable product facts a visitor needs before
// reading further (platform, printing, what's offline). No marketing
// adjectives, just facts.
export function QuickFactsSection() {
  const { quickFacts } = useLandingContent()

  return (
    <section className="w-full border-y border-neela-border bg-neela-surface-alt py-10">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {quickFacts.map(({ icon: Icon, label, body }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-neela-brand shadow-sm">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-neela-label-lg text-neela-text">{label}</h3>
                <p className="text-neela-body-sm text-neela-text-secondary">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
