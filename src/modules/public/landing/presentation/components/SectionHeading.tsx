import { cn } from "@/shared/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description: string
  eyebrowClassName?: string
  className?: string
}

// The centered eyebrow + headline + lead block every Stitch section opens with.
export function SectionHeading({
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-neela-primary",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto flex max-w-2xl flex-col items-center gap-2 text-center", className)}>
      <span className={cn("text-neela-label-md font-bold tracking-wider uppercase", eyebrowClassName)}>
        {eyebrow}
      </span>
      <h2 className="text-neela-headline-xl-mobile tracking-tight text-neela-on-primary-fixed md:text-neela-headline-xl">
        {title}
      </h2>
      <p className="text-neela-body-lg text-neela-on-surface-variant">{description}</p>
    </div>
  )
}
