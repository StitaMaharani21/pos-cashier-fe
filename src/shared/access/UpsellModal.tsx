import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

import { contactLink, featureCopy, hintCopy } from "./upsellContent"
import { useUpsellStore } from "./upsellStore"

export function UpsellModal() {
  const feature = useUpsellStore((state) => state.feature)
  const hint = useUpsellStore((state) => state.hint)
  const close = useUpsellStore((state) => state.close)

  if (!feature || !hint) return null

  const copy = featureCopy[feature]
  const link = contactLink(feature, hint)

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-xs font-medium text-primary">{hintCopy[hint].badge}</span>
          <DialogTitle>{copy?.title ?? feature}</DialogTitle>
          <DialogDescription>{copy?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={close}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Nanti
          </button>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {hintCopy[hint].cta}
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
