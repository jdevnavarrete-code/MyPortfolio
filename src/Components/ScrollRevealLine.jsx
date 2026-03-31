import { useRef, useEffect, useState } from "react"

const FOCUS_LINE_RATIO = 0.38
const TRANSITION_ZONE = 240
const MAX_BLUR = 20
const TRANSLATE_Y_OFFSET = 14

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const FADE_ZONE = 18
const TRANSITION = `filter 0.22s ${EASE}, opacity 0.22s ${EASE}, transform 0.22s ${EASE}, mask 0.22s ${EASE}, -webkit-mask 0.22s ${EASE}`

/**
 * Revelado al scroll (máscara + blur + opacidad) — mismo comportamiento que el quote en About.
 * @param {"left" | "center" | "right"} align — alineación del texto cuando no es endAlign
 */
export default function ScrollRevealLine({
  children,
  alwaysSharp = false,
  style = {},
  nowrap = true,
  onProgressChange,
  /** Bloque del cierre del quote: justificado, última línea pegada a la derecha */
  endAlign = false,
  align = "left",
}) {
  const lineRef = useRef(null)
  const [progress, setProgress] = useState(0)

  const textAlignOuter = endAlign ? "justify" : align

  useEffect(() => {
    const el = lineRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const lineCenter = rect.top + rect.height / 2
      const focusLine = window.innerHeight * FOCUS_LINE_RATIO

      let p
      if (alwaysSharp || lineCenter <= focusLine) {
        p = 1
      } else {
        const distanceBelow = lineCenter - focusLine
        p = Math.max(0, 1 - distanceBelow / TRANSITION_ZONE)
      }
      setProgress(p)
      onProgressChange?.(p)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [alwaysSharp, onProgressChange])

  const blur = MAX_BLUR * (1 - progress)
  const opacity = progress
  const translateY = TRANSLATE_Y_OFFSET * (1 - progress)
  const edge = progress * 100
  const fadeStart = Math.max(0, edge - FADE_ZONE)
  const fadeEnd = Math.min(100, edge + FADE_ZONE)
  const maskImage =
    progress <= 0.01
      ? "linear-gradient(to right, transparent 0%, transparent 100%)"
      : progress >= 0.99
        ? "linear-gradient(to right, black 0%, black 100%)"
        : `linear-gradient(to right, black 0%, black ${fadeStart}%, transparent ${fadeEnd}%)`
  const webkitMaskImage = maskImage

  return (
    <span
      ref={lineRef}
      style={{
        display: "block",
        width: "100%",
        textAlign: textAlignOuter,
      }}
    >
      <span
        style={{
          display: endAlign || !nowrap ? "block" : "inline-block",
          width: endAlign || !nowrap ? "100%" : undefined,
          maxWidth: "100%",
          textAlign: textAlignOuter,
          textAlignLast: endAlign ? "right" : undefined,
          boxSizing: "border-box",
          WebkitMaskImage: webkitMaskImage,
          WebkitMaskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "0 0",
          maskImage,
          maskSize: "100% 100%",
          maskRepeat: "no-repeat",
          maskPosition: "0 0",
          filter: `blur(${blur}px)`,
          opacity,
          transform: `translateY(${translateY}px)`,
          transition: TRANSITION,
          whiteSpace: nowrap ? "nowrap" : "normal",
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  )
}
