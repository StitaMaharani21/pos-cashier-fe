import { useEffect, useRef, useState, type DragEvent } from "react"
import { CameraIcon, Trash2Icon } from "lucide-react"

import { ACCEPTED_IMAGE_TYPES, imageFileError } from "@/shared/lib/image-file"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { UserAvatar } from "@/shared/ui/user-avatar"

interface AvatarPickerProps {
  // For the initials fallback.
  name: string
  // Current photo URL (edit) — shown until a new file is picked or removed.
  value?: string | null
  // A picked file, or null = "no photo" (removed / never set).
  onChange: (file: File | null) => void
  size?: "md" | "lg"
}

// Round profile-photo picker: click or drop an image on the circle, or use
// the buttons beside it. Same file limits as ImageDropzone.
export function AvatarPicker({ name, value, onChange, size = "md" }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const shown = preview ?? (removed ? null : value ?? null)

  function accept(file: File | undefined) {
    if (!file) return
    const invalid = imageFileError(file)
    setError(invalid)
    if (invalid) return
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setRemoved(false)
    onChange(file)
  }

  function remove() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setRemoved(true)
    setError(null)
    onChange(null)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragOver(false)
    accept(event.dataTransfer.files[0])
  }

  return (
    <div className={cn("flex items-center gap-4", size === "lg" && "flex-col text-center")}>
      <button
        type="button"
        aria-label={shown ? "Ganti foto profil" : "Unggah foto profil"}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "group relative shrink-0 rounded-full ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          dragOver && "ring-2 ring-primary",
          error && "ring-2 ring-destructive"
        )}
      >
        <UserAvatar name={name || "?"} src={shown} className={size === "lg" ? "size-36 text-3xl" : "size-20 text-xl"} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <CameraIcon className={size === "lg" ? "size-7" : "size-5"} />
        </span>
      </button>

      <div className={cn("flex flex-col gap-1.5", size === "lg" && "items-center")}>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <CameraIcon className="size-4" />
            {shown ? "Ganti foto" : "Unggah foto"}
          </Button>
          {shown && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={remove}>
              <Trash2Icon className="size-4" />
              Hapus
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP · maks 2MB · disarankan persegi</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

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
    </div>
  )
}
