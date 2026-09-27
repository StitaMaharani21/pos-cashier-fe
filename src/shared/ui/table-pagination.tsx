import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface TablePaginationProps {
  page: number
  totalPages: number
  total: number
  perPage: number
  // "kategori", "menu", ...
  noun: string
  onPageChange: (page: number) => void
}

// Up to 5 page numbers around the current page.
function visiblePages(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

// "Menampilkan 1-5 dari 5 menu" + ‹ 1 2 3 › footer of the master-data tables.
export function TablePagination({ page, totalPages, total, perPage, noun, onPageChange }: TablePaginationProps) {
  const pages = Math.max(totalPages, 1)
  const rangeStart = total === 0 ? 0 : (page - 1) * perPage + 1
  const rangeEnd = Math.min(page * perPage, total)
  const button = "flex size-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors"

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
      <span className="text-sm text-muted-foreground">
        Menampilkan {rangeStart}-{rangeEnd} dari {total} {noun}
      </span>
      <nav aria-label="Halaman" className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(button, "text-muted-foreground hover:bg-muted disabled:opacity-40")}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        {visiblePages(page, pages).map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPageChange(number)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              button,
              number === page
                ? "border-primary bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className={cn(button, "text-muted-foreground hover:bg-muted disabled:opacity-40")}
          aria-label="Halaman berikutnya"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </nav>
    </div>
  )
}
