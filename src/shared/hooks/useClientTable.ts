import { useState } from "react"

export const TABLE_PER_PAGE = 10

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
]

interface UseClientTableOptions<T> {
  rows: T[]
  // Text the search box matches against (lower-cased, `includes`).
  searchText: (row: T) => string
  // Value compared to the filter (e.g. row.status); omit for no filter.
  filterValue?: (row: T) => string | undefined
  perPage?: number
}

// Search + one "Status"-style filter + paging for lists the backend returns
// in one go (categories, vouchers, cashiers, ...). Changing the search or
// filter jumps back to page 1.
export function useClientTable<T>({ rows, searchText, filterValue, perPage = TABLE_PER_PAGE }: UseClientTableOptions<T>) {
  const [search, setSearchState] = useState("")
  const [filter, setFilterState] = useState("all")
  const [page, setPage] = useState(1)

  const term = search.trim().toLowerCase()
  // Plain filter per render — these lists are a few hundred rows at most.
  const filtered = rows.filter(
    (row) =>
      (filter === "all" || filterValue?.(row) === filter) &&
      (!term || searchText(row).toLowerCase().includes(term))
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, totalPages)

  return {
    search,
    setSearch: (value: string) => {
      setSearchState(value)
      setPage(1)
    },
    filter,
    setFilter: (value: string) => {
      setFilterState(value)
      setPage(1)
    },
    reset: () => {
      setSearchState("")
      setFilterState("all")
      setPage(1)
    },
    filtering: term !== "" || filter !== "all",
    page: currentPage,
    setPage,
    perPage,
    total: filtered.length,
    totalPages,
    pageRows: filtered.slice((currentPage - 1) * perPage, currentPage * perPage),
  }
}
