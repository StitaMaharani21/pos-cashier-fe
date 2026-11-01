import type { QueryClient } from "@tanstack/react-query"

// Every list that shows a stock figure or its history. One place, so the stock
// dialog refreshes the same set whichever kind of change it saved.
export function invalidateStockQueries(queryClient: QueryClient) {
  for (const key of ["ingredients", "menus", "stock-movements", "stock-reconciliation"]) {
    queryClient.invalidateQueries({ queryKey: [key] })
  }
}
