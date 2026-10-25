import { useEffect } from 'react'

export default function PwaSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => undefined)
    }
  }, [])
  return null
}
