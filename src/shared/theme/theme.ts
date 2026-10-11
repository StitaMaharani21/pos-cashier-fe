import { useEffect, useSyncExternalStore } from "react"

export type ThemePreference = "light" | "dark" | "system"

// Same key as the inline script in index.html, which applies the class before
// first paint.
export const THEME_STORAGE_KEY = "neela-theme"

const listeners = new Set<() => void>()
const media = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    if (value === "light" || value === "dark" || value === "system") return value
  } catch {
    // storage blocked — fall through to the default
  }
  return "system"
}

let preference = readPreference()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  media?.addEventListener("change", listener)
  return () => {
    listeners.delete(listener)
    media?.removeEventListener("change", listener)
  }
}

export function setThemePreference(next: ThemePreference) {
  preference = next
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // keep the in-memory value for this session
  }
  emit()
}

function resolve(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") return media?.matches ? "dark" : "light"
  return pref
}

export function useThemePreference() {
  const pref = useSyncExternalStore(subscribe, () => preference)
  return { preference: pref, resolved: resolve(pref), setPreference: setThemePreference }
}

// The owner area (/app/*) is the only part of the app with a dark theme — the
// landing, self-order and login pages stay light — so the `dark` class on
// <html> follows the route, not just the stored preference. Also clears a class
// the index.html script set before a redirect out of /app (e.g. expired
// session -> /login).
export function useOwnerDarkMode(pathname: string) {
  const { resolved } = useThemePreference()
  const inOwnerArea = pathname === "/app" || pathname.startsWith("/app/")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", inOwnerArea && resolved === "dark")
  }, [inOwnerArea, resolved])
}

// Whether <html> currently carries `dark` — for things rendered outside the
// owner layout (e.g. the toaster) that need to match what's actually applied.
export function useAppliedTheme(): "light" | "dark" {
  return useSyncExternalStore(
    (listener) => {
      const observer = new MutationObserver(listener)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
      return () => observer.disconnect()
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light")
  )
}
