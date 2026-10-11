import { useLocation } from "react-router-dom"

import { useOwnerDarkMode } from "@/shared/theme/theme"

// Rendered once inside <BrowserRouter>; applies the dark class by route.
export function ThemeScope() {
  useOwnerDarkMode(useLocation().pathname)
  return null
}
