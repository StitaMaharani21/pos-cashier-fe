import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"

// The hero's product visual: the cashier "Buat Pesanan" screen in a tablet
// bezel. The wrapper's fixed height crops the tablet's lower edge so it
// reads as rising from the bottom of the hero card.
export function HeroShowcase() {
  const { image } = useLandingContent().hero

  return (
    <div className="mx-auto h-[15rem] w-full max-w-[40rem] overflow-hidden px-4 sm:h-[20rem] lg:h-[24rem]">
      <div className="rounded-t-[2.25rem] bg-[#0b1020] p-2.5 shadow-[0_30px_60px_rgba(0,24,73,0.35)] sm:p-3.5">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          className="block w-full rounded-t-[1.5rem]"
        />
      </div>
    </div>
  )
}
