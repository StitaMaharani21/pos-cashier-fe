import { useRef, useState } from "react"
import { ImageIcon } from "lucide-react"

const MAX_LOGO_SIZE = 2 * 1024 * 1024
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + second).toUpperCase() || "?"
}

interface BusinessLogoCardProps {
  businessName: string
  logoUrl?: string | null
  // False until the settings row exists: the backend's PUT requires
  // name/address/phone, so a logo can't be saved on its own before the
  // "Informasi Bisnis" form has been saved once.
  canUpload: boolean
  isUploading: boolean
  onUpload: (file: File) => void
}

// Picking a file uploads it right away (PUT with the saved settings + the
// new logo) rather than waiting for the form's "Simpan Perubahan" — the card
// sits outside that form, matching the Figma layout.
export function BusinessLogoCard({
  businessName,
  logoUrl,
  canUpload,
  isUploading,
  onUpload,
}: BusinessLogoCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so picking the same file again after an error still fires onChange.
    event.target.value = ""
    if (!file) return

    // Same limits the backend enforces (business_setting_handler.go), checked
    // here first so the owner gets the message without a round trip.
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setError("Format harus PNG, JPG, atau WEBP")
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      setError("Ukuran logo maksimal 2MB")
      return
    }
    setError(null)
    onUpload(file)
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-[18px] border bg-card p-6">
      <div className="flex size-[88px] items-center justify-center overflow-hidden rounded-[20px] bg-primary/10">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-2xl font-extrabold text-primary">
            {businessName ? getInitials(businessName) : "?"}
          </span>
        )}
      </div>

      <p className="pt-2.5 text-center text-[15px] font-extrabold text-foreground">
        {businessName || "Nama Bisnis"}
      </p>
      <p className="pb-3 text-center text-xs text-muted-foreground">
        Logo tampil pada struk &amp; halaman kasir
      </p>

      <button
        type="button"
        disabled={!canUpload || isUploading}
        onClick={() => inputRef.current?.click()}
        title={canUpload ? undefined : "Simpan informasi bisnis terlebih dahulu"}
        className="flex items-center gap-2 rounded-[10px] border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ImageIcon className="size-3.5" />
        {isUploading ? "Mengunggah..." : "Ganti Logo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_LOGO_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="pt-1 text-center text-[11px] text-muted-foreground">
        {canUpload ? "PNG/JPG/WEBP, maks 2MB" : "Simpan informasi bisnis terlebih dahulu"}
      </p>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  )
}
