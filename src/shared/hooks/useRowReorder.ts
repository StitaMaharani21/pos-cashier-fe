import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react"

interface UseRowReorderOptions<T> {
  rows: T[]
  getId: (row: T) => number
  // Called once per finished drag (or keyboard move) with the rows' ids in
  // their new order — only when the order actually changed.
  onReorder: (ids: number[]) => void
  enabled?: boolean
}

// Drag-to-reorder for table rows with native HTML5 drag & drop (no extra
// dependency). A row only becomes draggable while its handle is pressed, so
// clicking switches/buttons in the row never starts a drag. The new order is
// shown optimistically until `rows` changes (the refetch after saving); call
// `reset()` to drop it (e.g. when saving failed). Keyboard: focus the handle,
// ArrowUp/ArrowDown moves the row one place.
export function useRowReorder<T>({ rows, getId, onReorder, enabled = true }: UseRowReorderOptions<T>) {
  const ids = rows.map(getId)
  const idsKey = ids.join(",")
  const [override, setOverride] = useState<number[] | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [armedId, setArmedId] = useState<number | null>(null)
  const latest = useRef<number[] | null>(null)

  // Fresh data from the server replaces any optimistic order.
  useEffect(() => {
    setOverride(null)
    latest.current = null
  }, [idsKey])

  const order = override ?? ids
  const byId = new Map(rows.map((row) => [getId(row), row]))
  const orderedRows = order.map((id) => byId.get(id)).filter((row): row is T => row !== undefined)

  function moved(list: number[], from: number, to: number): number[] {
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  }

  function show(next: number[]) {
    latest.current = next
    setOverride(next)
  }

  function commit(next: number[]) {
    if (next.join(",") !== idsKey) onReorder(next)
  }

  function rowProps(id: number) {
    return {
      draggable: enabled && armedId === id,
      "data-dragging": draggingId === id ? "" : undefined,
      onDragStart: (event: DragEvent) => {
        setDraggingId(id)
        latest.current = order
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(id))
      },
      onDragOver: (event: DragEvent) => {
        if (draggingId === null) return
        event.preventDefault()
        if (draggingId === id) return
        const current = latest.current ?? order
        const from = current.indexOf(draggingId)
        const to = current.indexOf(id)
        if (from !== -1 && to !== -1 && from !== to) show(moved(current, from, to))
      },
      onDrop: (event: DragEvent) => event.preventDefault(),
      onDragEnd: () => {
        setDraggingId(null)
        setArmedId(null)
        if (latest.current) commit(latest.current)
      },
    }
  }

  function handleProps(id: number) {
    return {
      disabled: !enabled,
      onPointerDown: () => setArmedId(id),
      onPointerUp: () => setArmedId(null),
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
        event.preventDefault()
        const from = order.indexOf(id)
        const to = event.key === "ArrowUp" ? from - 1 : from + 1
        if (from === -1 || to < 0 || to >= order.length) return
        const next = moved(order, from, to)
        show(next)
        commit(next)
      },
    }
  }

  function reset() {
    setOverride(null)
    latest.current = null
  }

  return { orderedRows, rowProps, handleProps, reset }
}
