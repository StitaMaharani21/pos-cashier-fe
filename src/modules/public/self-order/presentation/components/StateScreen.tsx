import type { ReactNode } from "react"
import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

interface StateScreenProps {
  title: string
  description: string
  // "stamp" renders the red "Tidak Berlaku" rubber stamp instead of the icon.
  stamp?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  footnote?: string
}

// Full-height message used for loading, a dead session and fatal errors.
export function StateScreen({ title, description, stamp, icon, actionLabel, onAction, footnote }: StateScreenProps) {
  return (
    <div className="so-state" role="status">
      {stamp ? <div className="so-void-stamp">{stamp}</div> : (icon ?? <TriangleAlertIcon aria-hidden />)}
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="so-cta compact" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {footnote && <span className="so-footnote">{footnote}</span>}
    </div>
  )
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <StateScreen
      title={label}
      description="Sebentar ya…"
      icon={<LoaderCircleIcon aria-hidden className="animate-spin" />}
    />
  )
}
