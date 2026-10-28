import { ProblemRow } from "@/modules/public/landing/presentation/components/problem/ProblemRow"
import { useInView } from "@/modules/public/landing/presentation/components/problem/useInView"
import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"
import { cn } from "@/shared/lib/utils"

export function ProblemSection() {
  const { problems } = useLandingContent()
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    once: true,
  })

  return (
    <section id="masalah" className="w-full bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* HEADER (rata tengah) */}
        <div
          ref={headerRef}
          className={cn(
            "mx-auto max-w-2xl text-center transition-opacity duration-700 ease-out",
            headerInView ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-xs font-bold tracking-widest text-neela-brand uppercase sm:text-sm">
            {problems.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[48px]">
            {problems.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">
            {problems.description}
          </p>
        </div>

        {/* TIGA BARIS (dipisah garis tipis abu-abu) */}
        <div className="mt-14 divide-y divide-neutral-200 border-y border-neutral-200 lg:mt-20">
          {problems.items.map((item) => (
            <ProblemRow key={item.problem} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
