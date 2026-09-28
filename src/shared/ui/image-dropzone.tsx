import { useEffect, useRef, useState, type DragEvent } from "react"
import { ImageUpIcon, UploadCloudIcon } from "lucide-react"

import { ACCEPTED_IMAGE_TYPES, imageFileError } from "@/shared/lib/image-file"
import { cn } from "@/shared/lib/utils"

interface ImageDropzoneProps {
  // Current image (edit mode) — shown until a new file is picked.
  value?: string | null
  onChange: (file: File) => void
  hint?: string
  error?: string | null
}

// "Tarik & lepas foto atau klik untuk unggah" — drag a file onto the box or
// click to browse. Same limits the backend enforces for menu images (jpeg /
// png / webp, ≤ 2MB), checked here first so the message is instant.
export function ImageDropzone({
  value,
  onChange,
  hint = "PNG, JPG, WEBP · maks 2MB",
  error,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function accept(file: File | undefined) {
    if (!file) return
    const invalid = imageFileError(file)
    setLocalError(invalid)
    if (invalid) return
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragOver(false)
    accept(event.dataTransfer.files[0])
  }

  const image = preview ?? value ?? null
  const shownError = localError ?? error

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        aria-invalid={shownError ? true : undefined}
        className={cn(
          "group relative flex min-h-44 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed bg-card p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          shownError && "border-destructive"
        )}
      >
        {image ? (
          <>
            <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
            <span className="relative flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ImageUpIcon className="size-4" />
              Ganti foto
            </span>
          </>
        ) : (
          <>
            <UploadCloudIcon className="size-7 text-primary" />
            <span className="text-sm text-foreground">
              Tarik &amp; lepas foto atau <span className="font-semibold text-primary">klik untuk unggah</span>
            </span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          accept(event.target.files?.[0])
          event.target.value = ""
        }}
      />
      {shownError && <p className="text-sm text-destructive">{shownError}</p>}
    </div>
  )
}
