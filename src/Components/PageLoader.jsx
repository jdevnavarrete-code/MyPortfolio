import { useEffect, useState } from "react"
import { preloadPortfolioImages } from "../preloadAssets"

const FADE_MS = 720

export default function PageLoader({ children }) {
  const [assetsReady, setAssetsReady] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timeoutId

    ;(async () => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (reduce) {
        setProgress(1)
        setAssetsReady(true)
        requestAnimationFrame(() => setExiting(true))
        timeoutId = setTimeout(() => setRemoved(true), Math.min(FADE_MS, 220))
        return
      }

      await preloadPortfolioImages((p) => {
        if (!cancelled) setProgress(p)
      })

      if (cancelled) return
      setProgress(1)
      setAssetsReady(true)
      requestAnimationFrame(() => setExiting(true))
      timeoutId = setTimeout(() => setRemoved(true), FADE_MS)
    })()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      {assetsReady ? children : null}
      {!removed && (
        <div
          className="page-loader"
          aria-hidden={exiting}
          style={{
            opacity: exiting ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            pointerEvents: exiting ? "none" : "auto",
          }}
        >
          <div className="page-loader__inner">
            <div
              className="page-loader__track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <div className="page-loader__fill" style={{ transform: `scaleX(${progress})` }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
