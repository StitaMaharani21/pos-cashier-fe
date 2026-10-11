import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { queryClient } from "@/shared/api/queryClient"
import { useAppliedTheme } from "@/shared/theme/theme"

export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useAppliedTheme()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" theme={theme} />
    </QueryClientProvider>
  )
}
