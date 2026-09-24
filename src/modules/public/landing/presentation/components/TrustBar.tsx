import {
  EARLY_ACCESS_TRUST,
  SOCIAL_PROOF,
} from "@/modules/public/landing/presentation/landing.content"

// Early-access framing until SOCIAL_PROOF holds real customer logos — see
// landing.content.ts.
export function TrustBar() {
  return (
    <section className="w-full bg-neela-surface-container-lowest py-8 shadow-sm">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-4 text-center md:px-6 lg:px-8">
        {SOCIAL_PROOF ? (
          <>
            <p className="text-neela-label-md font-medium text-neela-on-surface-variant">
              {SOCIAL_PROOF.headline}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-75 md:gap-12">
              {SOCIAL_PROOF.brands.map(({ name, icon: Icon, iconClassName }) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-neela-headline-sm font-bold tracking-tight text-neela-on-surface"
                >
                  <Icon className={`size-6 ${iconClassName}`} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="max-w-3xl text-neela-headline-sm text-neela-on-surface">
              {EARLY_ACCESS_TRUST.headline}
            </p>
            <p className="inline-flex items-center gap-2 text-neela-label-md text-neela-primary">
              <span className="size-2 animate-pulse rounded-full bg-neela-primary-container" />
              {EARLY_ACCESS_TRUST.subline}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
