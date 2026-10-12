import { Check } from "lucide-react"

import { useInView } from "@/modules/public/landing/presentation/components/problem/useInView"
import type { ProblemSolution } from "@/modules/public/landing/presentation/landing.content"
import { cn } from "@/shared/lib/utils"

export function ProblemRow({ item }: { item: ProblemSolution }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1, once: true })

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 items-start gap-4 py-10 transition-opacity duration-700 ease-out md:grid-cols-12 md:gap-8 md:py-12 lg:gap-12 lg:py-14",
        inView ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Mobile: Masalah (kecil, abu-abu) di atas. Desktop: Kolom kiri (ukuran sedang, abu-abu, dicoret/muted) */}
      <div className="md:col-span-5">
        <p className="text-sm font-medium text-neutral-400 line-through decoration-neutral-300 md:text-base lg:text-lg">
          {item.problem}
        </p>
      </div>

      {/* Mobile: Solusi di bawah. Desktop: Kolom kanan (hitam, tebal, ukuran lebih besar + penjelasan) */}
      <div className="md:col-span-7">
        <div className="flex items-start gap-3">
          <Check
            className="mt-1 size-5 shrink-0 stroke-[2.5] text-neela-brand"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl lg:text-2xl">
              {item.solution}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-neutral-600">
              {item.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
