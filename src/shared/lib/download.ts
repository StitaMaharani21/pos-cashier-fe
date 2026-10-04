// Triggers a browser "Save As" for an in-memory Blob (e.g. an xlsx export
// fetched via apiClient with responseType: "blob") — there's no <a href>
// to point at since the file only exists as a fetch response, so this
// creates one, clicks it, then cleans up both the DOM node and the object
// URL. No download helper existed anywhere in the codebase before this.
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
