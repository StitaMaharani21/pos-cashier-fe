// `navigator.clipboard` only exists in secure contexts (HTTPS / localhost), so
// on a plain-http LAN address calling it throws a TypeError synchronously.
// Falls back to a hidden textarea + execCommand there.
export async function copyText(text: string): Promise<void> {
  if (window.isSecureContext && navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.top = "-9999px"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  try {
    textarea.select()
    if (!document.execCommand("copy")) throw new Error("copy command rejected")
  } finally {
    document.body.removeChild(textarea)
  }
}
