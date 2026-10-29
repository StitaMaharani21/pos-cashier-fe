import logoColor from "@/assets/brand/neela-logo.svg"
import logoWhite from "@/assets/brand/neela-logo-white.svg"
import symbolColor from "@/assets/brand/neela-symbol.svg"
import { cn } from "@/shared/lib/utils"

// The Neela brand mark. Three artworks (design/brand/*.svg):
//   color  - symbol #0056D9 + black wordmark, for light backgrounds
//   white  - all white, for dark backgrounds (the blue hero gradient, the dark footer)
//   symbol - the "N" alone, for tight spaces
// "auto" follows the theme: color in light mode, white under `.dark` (the owner
// console). Size it with a height class (`h-8`); the width follows the artwork.
export type NeelaLogoVariant = "color" | "white" | "symbol" | "auto"

interface NeelaLogoProps {
  variant?: NeelaLogoVariant
  className?: string
}

const BASE = "block w-auto select-none"

export function NeelaLogo({ variant = "color", className }: NeelaLogoProps) {
  if (variant === "symbol") {
    return <img src={symbolColor} alt="Neela" width={222} height={304} className={cn(BASE, "h-8", className)} />
  }

  if (variant === "white") {
    return <img src={logoWhite} alt="Neela" width={1054} height={304} className={cn(BASE, "h-8", className)} />
  }

  if (variant === "auto") {
    return (
      <>
        <img src={logoColor} alt="Neela" width={1062} height={304} className={cn(BASE, "h-8 dark:hidden", className)} />
        <img src={logoWhite} alt="" aria-hidden width={1054} height={304} className={cn(BASE, "hidden h-8 dark:block", className)} />
      </>
    )
  }

  return <img src={logoColor} alt="Neela" width={1062} height={304} className={cn(BASE, "h-8", className)} />
}
