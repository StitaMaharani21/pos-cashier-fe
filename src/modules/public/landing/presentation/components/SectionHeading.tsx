import { cn } from "@/shared/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  eyebrowClassName?: string
  align?: "center" | "left"
  className?: string
}

// The eyebrow + headline + lead block most sections open with.
export function SectionHeading({
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-neela-brand",
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-2",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className
      )}
    >
      <span className={cn("text-neela-label-md font-bold tracking-wider uppercase", eyebrowClassName)}>
        {eyebrow}
      </span>
      <h2 className="text-neela-headline-xl-mobile tracking-tight text-neela-text md:text-neela-headline-xl">
        {title}
      </h2>
      {description && <p className="text-neela-body-lg text-neela-text-secondary">{description}</p>}
    </div>
  )
}
