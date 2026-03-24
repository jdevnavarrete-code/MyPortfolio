import { useEffect, useRef } from "react"

/**
 * Cursor global: círculo rojo clásico + mix-blend-mode difference (inversión).
 * Crece un poco sobre enlaces, botones y elementos con cursor pointer.
 * Solo con puntero fino (ratón / trackpad), no en táctil.
 */

const EXPAND_SCALE = 1.38

function isInteractiveUnderCursor(el) {
  if (!el || !(el instanceof Element)) return false
  if (el.closest("[data-no-cursor-expand]")) return false

  const byTag = el.closest(
    'a[href], button, [role="button"], [role="link"], [role="tab"], select, summary, area[href], label'
  )
  if (byTag) return true

  const input = el.closest("input")
  if (input) {
    const t = (input.type || "text").toLowerCase()
    return ["submit", "button", "reset", "checkbox", "radio", "file", "image"].includes(t)
  }

  let n = el
  for (let i = 0; i < 10 && n; i++) {
    const c = window.getComputedStyle(n).cursor
    if (c === "pointer" || c === "grab") return true
    n = n.parentElement
  }
  return false
}

export default function CustomCursor() {
  const wrapperRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)")
    if (!mq.matches) return

    const root = document.documentElement
    root.classList.add("custom-cursor-active")

    const wrap = wrapperRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return

    let raf = 0
    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        wrap.style.opacity = "1"
        wrap.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
        const under = document.elementFromPoint(e.clientX, e.clientY)
        const expand = isInteractiveUnderCursor(under)
        inner.style.transform = `scale(${expand ? EXPAND_SCALE : 1})`
      })
    }

    const onLeave = () => {
      wrap.style.opacity = "0"
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseleave", onLeave)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) wrap.style.opacity = "0"
    })

    return () => {
      root.classList.remove("custom-cursor-active")
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
    return null
  }

  return (
    <div
      ref={wrapperRef}
      className="custom-cursor-wrap"
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 2147483647,
        opacity: 0,
        willChange: "transform, opacity",
        transition: "opacity 0.12s ease",
        /* En el wrapper: el grupo completo hace difference con el fondo (el hijo con transform no aísla el blend) */
        mixBlendMode: "difference",
        WebkitMixBlendMode: "difference",
      }}
    >
      <div
        ref={innerRef}
        className="custom-cursor-dot"
        style={{
          width: "clamp(12px, 1.9vmin, 17px)",
          height: "clamp(12px, 1.9vmin, 17px)",
          borderRadius: "50%",
          background: "#e02020",
          transform: "scale(1)",
          transformOrigin: "center center",
          transition: "transform 0.18s ease-out",
          willChange: "transform",
        }}
      />
    </div>
  )
}
