import { SparklesIcon } from "lucide-react"

// Plain-language recap of the draft at the bottom of the drawer.
export function SummaryBanner({ title = "Ringkasan", lines }: { title?: string; lines: string[] }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
        <SparklesIcon className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 text-sm">
        <p className="font-bold">{title}</p>
        {lines.map((line) => (
          <p key={line} className="text-emerald-800 dark:text-emerald-200">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
