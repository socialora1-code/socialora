import { useRef, useState } from 'react'

export function useStudioCopy() {
  const [lastCopy, setLastCopy] = useState({ key: '', message: '' })
  const request = useRef(0)

  async function copy(key: string, text: string) {
    const current = ++request.current
    let succeeded = false
    try {
      await navigator.clipboard.writeText(text)
      succeeded = true
    } catch {
      if (request.current !== current) return false
      const active = document.activeElement
      const field = document.createElement('textarea')
      field.value = text
      field.style.position = 'fixed'
      field.style.insetInlineStart = '-9999px'
      document.body.appendChild(field)
      try {
        field.select()
        succeeded = document.execCommand('copy')
      } catch {
        succeeded = false
      } finally {
        field.remove()
        if (active instanceof HTMLElement) active.focus()
      }
    }
    if (request.current !== current) return false
    setLastCopy({ key: succeeded ? key : '', message: succeeded ? 'Copied to clipboard.' : 'Copy failed. Select the text to copy it manually.' })
    return succeeded
  }

  function clearCopy() {
    request.current++
    setLastCopy({ key: '', message: '' })
  }

  return { lastCopy, copy, clearCopy }
}
