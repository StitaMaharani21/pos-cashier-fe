import { useEffect, useRef, useState } from "react"

interface UseInViewOptions {
  threshold?: number
  // Stop observing after the first time the element is seen (scroll-in reveal).
  once?: boolean
}

// Whether the element is on screen. Effect-only (no window access during
// render) so the landing page stays SSR-portable; without IntersectionObserver
// it reports "in view" so nothing stays hidden.
export function useInView<T extends HTMLElement>({ threshold = 0.1, once = false }: UseInViewOptions = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (once && entry.isIntersecting) observer.disconnect()
      },
      { threshold, rootMargin: "0px 0px -4% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, inView }
}
