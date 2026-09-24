import { useEffect, useRef, useState } from "react"
import { ImageIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null) => void
  hint?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

// The dashed-border click-to-upload dropzone used by Menu and Payment
// Method's forms. Shows the existing image (edit mode) until a new file is
// picked, then previews that instead.
export function ImageUpload({
  value,
  onChange,
  hint = "PNG/JPG/WEBP, maks 2MB",
  placeholder = "Klik untuk unggah foto",
  className,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (preview) URL.revokeObjectURL(preview)
    setPreview(file ? URL.createObjectURL(file) : null)
    onChange(file)
  }

  const displayImage = preview ?? value ?? null

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-input p-6 text-center transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt=""
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
        <p className="text-xs text-muted-foreground">
          {placeholder}
          <br />
          {hint}
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  )
}
