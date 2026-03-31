import { useRef, useEffect, useState, useCallback } from "react"

import video1 from "../assets/videos/project7.mp4"
import farmaWebStill from "../assets/iamges/FarmaWeb.jpg"
import ecuaflowersStill from "../assets/iamges/ecuaflowers.jpg"
import minAppStill from "../assets/iamges/MIndApp.jpg"
import emergencyAppStill from "../assets/iamges/emergencyapp.jpg"
import VenusStill from "../assets/iamges/Venus.jpg"

export const CARDS_DATA = [
  { image: ecuaflowersStill, title: "ECUAFLOWERS APP ↗", role: "Front-end & Motion Developer", context: "Agency", stack: "React, Three.js, GSAP", year: "2024" },
  { image: minAppStill, title: "MIND APP ↗", role: "Product & UI Developer", context: "Product", stack: "React Native", year: "2024" },
  { image: emergencyAppStill, title: "EMERGENCY APP ↗", role: "Full-stack Developer", context: "Startup", stack: "React, Node.js", year: "2024" },
  { image: farmaWebStill, title: "FARMAWEB UTPL ↗", role: "Front-end & Back-end Developer", context: "Freelance", stack: "Wordpress", year: "2022" },
  { image: VenusStill, title: "FINANCE APP ↗", role: "Front-end & Motion Developer", context: "Agency", stack: "React, Three.js, GSAP", year: "2024" },
  { video: video1, title: "PREPAGADO HYUNDAI ↗", role: "Creative Developer", context: "In-house", stack: "Next.js, Framer Motion", year: "2023" },
  
]

/** Fondo Scene: negro #000 en CSS (.scene-section). Líneas / acento */
const SCENE_LINE = "rgb(198, 165, 106)"

/** Misma tipografía en lista y overlay (mayúsculas como la referencia) */
const ROW_TITLE_TYPO = {
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: "clamp(1.65rem, 4vw, 3.45rem)",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  textDecoration: "none",
  display: "block",
  lineHeight: 1.2,
}

/** Encabezado de sección — tipografía en .scene-featured-heading (Cabinet Grotesk 500) */
const SECTION_HEADING_TYPO = {
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 0.92,
  margin: 0,
  textAlign: "left",
  fontSize: "clamp(3.5rem, 14vw, 10.5rem)",
}

export default function Scene({ followsKeySkills = false } = {}) {
  const sectionRef = useRef(null)
  const rowRefs = useRef([])
  const videoRef = useRef(null)
  /** Posición del puntero: al hacer scroll el DOM se mueve bajo el cursor sin mouseenter → hay que comprobar rect en scroll */
  const pointerRef = useRef({ x: 0, y: 0, has: false })
  const [hoverIndex, setHoverIndex] = useState(null)
  const [sectionVisible, setSectionVisible] = useState(false)

  const isSceneMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  /** Centro vertical (viewport px) de la fila con hover: el vídeo se alinea ahí */
  const [videoCenterY, setVideoCenterY] = useState(null)

  /** Vídeo y resaltado solo cuando el puntero está encima de esa fila (hit-test, no solo eventos de ratón) */
  const videoVisible = sectionVisible && hoverIndex !== null
  const hoveredProject = hoverIndex !== null ? CARDS_DATA[hoverIndex] : null

  const pickRowUnderPointer = useCallback(() => {
    if (!sectionVisible) {
      setHoverIndex((p) => (p === null ? p : null))
      return
    }
    const pt = pointerRef.current
    if (!pt.has) return
    const { x, y } = pt
    let hit = null
    for (let i = 0; i < CARDS_DATA.length; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        hit = i
        break
      }
    }
    setHoverIndex((prev) => (prev === hit ? prev : hit))
  }, [sectionVisible])

  /** Móvil / touch: solo texto hasta que el scroll sitúe el foco en la lista; entonces multimedia por fila (como hover en desktop) */
  const pickRowAtViewportFocus = useCallback(() => {
    const sectionEl = sectionRef.current
    const vh = window.innerHeight || 1
    if (!sectionEl || !sectionVisible) {
      setHoverIndex((p) => (p === null ? p : null))
      return
    }
    const sr = sectionEl.getBoundingClientRect()
    /** Fuera de la sección: no mostrar overlay */
    if (sr.bottom <= vh * 0.02 || sr.top >= vh * 0.98) {
      setHoverIndex(null)
      return
    }

    const focusY = vh * 0.4
    const firstEl = rowRefs.current[0]
    const lastEl = rowRefs.current[CARDS_DATA.length - 1]
    if (!firstEl || !lastEl) return

    const firstR = firstEl.getBoundingClientRect()
    const lastR = lastEl.getBoundingClientRect()

    let hit = null
    /** Intro (FEATURED + copy): mismas filas de texto visibles, sin overlay de multimedia */
    if (focusY < firstR.top) {
      hit = null
    } else if (focusY > lastR.bottom) {
      /** Ya pasó la lista: ocultar como al salir del hover en desktop */
      hit = null
    } else {
      let contained = null
      let bestIdx = null
      let bestDist = Infinity
      for (let i = 0; i < CARDS_DATA.length; i++) {
        const el = rowRefs.current[i]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (focusY >= r.top && focusY <= r.bottom) {
          contained = i
          break
        }
        const mid = (r.top + r.bottom) / 2
        const d = Math.abs(mid - focusY)
        if (d < bestDist) {
          bestDist = d
          bestIdx = i
        }
      }
      hit = contained != null ? contained : bestIdx
    }

    setHoverIndex((prev) => (prev === hit ? prev : hit))
  }, [sectionVisible])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    /** El vídeo no aparece con un borde mínimo de Scene: hace falta que la sección haya entrado de verdad en vista */
    const THRESHOLDS = [0, 0.05, 0.1, 0.12, 0.15, 0.2, 0.3, 0.45, 0.6, 0.75, 1]
    const observerOpts =
      window.matchMedia("(max-width: 768px)").matches
        ? { threshold: THRESHOLDS, rootMargin: "80px 0px" }
        : { threshold: THRESHOLDS }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const r = entry.boundingClientRect
        const vh = window.innerHeight || 1
        const mobile = window.matchMedia("(max-width: 768px)").matches
        if (mobile) {
          /** Móvil: basta con solape real con el viewport (la ratio a menudo mantiene la sección “invisible”) */
          setSectionVisible(
            entry.isIntersecting &&
              r.bottom > vh * 0.03 &&
              r.top < vh * 0.97
          )
        } else {
          const hasEnoughOfSection = entry.intersectionRatio >= 0.12
          const sectionHasStarted = r.top < vh * 0.7
          setSectionVisible(
            entry.isIntersecting && hasEnoughOfSection && sectionHasStarted
          )
        }
      },
      observerOpts
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /** mousemove + scroll: misma lógica hit-test (scroll sin mover ratón no dispara mouseenter) */
  useEffect(() => {
    let ticking = false
    const schedulePick = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (window.matchMedia("(max-width: 768px)").matches) {
          pickRowAtViewportFocus()
        } else {
          pickRowUnderPointer()
        }
      })
    }
    const onMove = (e) => {
      pointerRef.current = { x: e.clientX, y: e.clientY, has: true }
      schedulePick()
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("scroll", schedulePick, { passive: true, capture: true })
    window.addEventListener("resize", schedulePick, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("scroll", schedulePick, { capture: true })
      window.removeEventListener("resize", schedulePick)
    }
  }, [pickRowUnderPointer, pickRowAtViewportFocus])

  useEffect(() => {
    if (!sectionVisible) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 768px)").matches) {
          pickRowAtViewportFocus()
        } else {
          pickRowUnderPointer()
        }
      })
    })
    return () => cancelAnimationFrame(id)
  }, [sectionVisible, pickRowUnderPointer, pickRowAtViewportFocus])

  useEffect(() => {
    const v = videoRef.current
    if (!sectionVisible || hoverIndex === null) {
      if (v) v.pause()
      return
    }
    const item = CARDS_DATA[hoverIndex]
    if (!item) return
    if (item.image) {
      if (v) {
        v.pause()
        v.removeAttribute("src")
        v.load()
      }
      return
    }
    if (!v || !item.video) return
    v.src = item.video
    v.load()
    const play = () => v.play().catch(() => {})
    v.addEventListener("loadeddata", play)
    play()
    return () => v.removeEventListener("loadeddata", play)
  }, [hoverIndex, sectionVisible])

  const syncVideoToRow = useCallback(() => {
    if (!sectionVisible || hoverIndex === null) return
    const el = rowRefs.current[hoverIndex]
    if (!el) return
    const r = el.getBoundingClientRect()
    setVideoCenterY(r.top + r.height / 2)
  }, [hoverIndex, sectionVisible])

  useEffect(() => {
    if (!sectionVisible || hoverIndex === null) {
      setVideoCenterY(null)
      return
    }
    syncVideoToRow()
    const rafId = requestAnimationFrame(syncVideoToRow)
    window.addEventListener("scroll", syncVideoToRow, { passive: true })
    window.addEventListener("resize", syncVideoToRow)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", syncVideoToRow)
      window.removeEventListener("resize", syncVideoToRow)
    }
  }, [sectionVisible, hoverIndex, syncVideoToRow])

  return (
    <section
      ref={sectionRef}
      className="scene-section"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        paddingTop: followsKeySkills
          ? "clamp(2rem, 6vh, 4rem)"
          : "clamp(7rem, 28vh, 16rem)",
        paddingBottom: "clamp(7rem, 28vh, 16rem)",
        paddingLeft: "clamp(1.5rem, 5vw, 1.5rem)",
        paddingRight: "clamp(1.5rem, 5vw, 1.5rem)",
        boxSizing: "border-box",
      }}
    >
      {/* Vídeo + título en el mismo stack: el blend debe mezclar con el vídeo (si el texto va por encima de la lista sola, muchos navegadores solo ven negro → texto blanco plano). zIndex > lista; pointer-events none para seguir haciendo hover en filas. */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: videoCenterY != null ? `${videoCenterY}px` : "50%",
          transform: "translate(-50%, -50%)",
          /* Rectángulo tipo 16:9, más grande que el cuadrado anterior */
          width: "min(92vw, min(1200px, 100vw - 2rem))",
          aspectRatio: "16 / 9",
          zIndex: 4,
          pointerEvents: "none",
          overflow: "visible",
          opacity: videoVisible ? 1 : 0,
          visibility: videoVisible ? "visible" : "hidden",
          transition:
            "opacity 0.28s ease, visibility 0.28s ease, top 0.09s ease-out",
        }}
        aria-hidden={!videoVisible}
      >
        <div
          key={hoverIndex == null ? "scene-video-idle" : hoverIndex}
          className={hoverIndex != null ? "scene-video-enter-scale" : undefined}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "2px",
              overflow: "hidden",
              boxShadow: videoVisible ? "0 28px 90px rgba(0, 0, 0, 0.45)" : "none",
            }}
          >
            {hoveredProject?.image ? (
              <img
                src={hoveredProject.image}
                alt={`${hoveredProject.title.replace(/\s*↗\s*$/, "")} — preview`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  opacity: 1,
                }}
              />
            ) : (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  opacity: 1,
                }}
              />
            )}
          </div>
          {/* Capa a todo el ancho para alinear con la fila; el texto hace difference con el vídeo (centro) y con lo que hay detrás (laterales) */}
          {videoVisible && hoveredProject && (
            <div
              className="scene-blend-title-wrap"
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                height: "100%",
                width: "100vw",
                marginLeft: "-50vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6vw",
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
              aria-hidden
            >
              <span
                className="scene-blend-title"
                style={{
                  ...ROW_TITLE_TYPO,
                  maxWidth: "100%",
                  textAlign: "center",
                  color: "#ffffff",
                  mixBlendMode: "difference",
                  WebkitMixBlendMode: "difference",
                }}
              >
                {hoveredProject.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista + hero: hero ocupa 100vh; filas debajo */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          paddingBottom: "clamp(4rem, 10vh, 6.5rem)",
          boxSizing: "border-box",
        }}
      >
        {/* Hero 100vh: título + Stage/Current arriba; descripción justo debajo; hueco flexible abajo */}
        <div
          className="scene-intro-hero"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            boxSizing: "border-box",
            paddingTop: "clamp(1.75rem, 4vh, 3rem)",
            paddingBottom: "clamp(1.75rem, 4vh, 3rem)",
            paddingLeft: "clamp(1.25rem, 5vw, 2.5rem)",
            paddingRight: "clamp(1.25rem, 5vw, 2.5rem)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "clamp(1rem, 3vw, 2rem)",
              width: "100%",
            }}
          >
            <h2 className="scene-featured-heading" style={SECTION_HEADING_TYPO}>
              <span style={{ display: "block" }}>
                FEATURED
             
              </span>
              <span style={{ display: "block" }}>PROJECTS.</span>
            </h2>
            <div
              style={{
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: "clamp(0.7rem, 1.35vw, 0.82rem)",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.45,
                textAlign: "right",
                flexShrink: 0,
                paddingTop: "0.35em",
              }}
            >
              Stage
              <br />
              Current
            </div>
          </div>
          {/* Texto pegado al título (arriba); el flex de abajo rellena el resto del 100vh */}
          <div
            style={{
              maxWidth: "min(68ch, 100%)",
              alignSelf: "flex-start",
              marginTop: "clamp(7rem, 32vh, 20rem)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: "clamp(0.92rem, 1.65vw, 1.12rem)",
                fontWeight: 400,
                lineHeight: 1.65,
                letterSpacing: "0.02em",
                color: "rgba(255,255,255,0.92)",
                textAlign: "left",
                hyphens: "auto",
                overflowWrap: "break-word",
                wordBreak: "break-word",
              }}
            >
              A curated selection of recent work across product, web, and interactive
              experiences—where design meets development. Built with attention to detail,
              clarity in every decision, and close collaboration with teams to deliver
              meaningful, high-impact results.
            </p>
          </div>
          <div style={{ flex: 1, minHeight: 0 }} aria-hidden />
        </div>

        <div
          className="scene-rows-wrap"
          style={{ paddingTop: "clamp(1.5rem, 5vh, 3rem)" }}
          onMouseLeave={() => {
            if (isSceneMobile()) return
            pointerRef.current = { ...pointerRef.current, has: false }
            setHoverIndex(null)
          }}
        >
        {CARDS_DATA.map((item, i) => {
          const rowHighlight = hoverIndex === i
          const hideListTitle = videoVisible && i === hoverIndex
          return (
            <div
              key={item.title}
              ref={(el) => { rowRefs.current[i] = el }}
              className="scene-project-row"
              style={{
                width: "100%",
                borderTop: i === 0 ? `1px solid ${SCENE_LINE}` : undefined,
                borderBottom: `1px solid ${SCENE_LINE}`,
                boxSizing: "border-box",
                cursor: "default",
              }}
            >
              <div
                style={{
                  maxWidth: "min(56rem, 100%)",
                  margin: "0 auto",
                  padding:
                    "clamp(0.65rem, 1.4vh, 1rem) clamp(1.25rem, 5vw, 2.5rem) clamp(1.35rem, 3.2vh, 2.25rem)",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-hidden={hideListTitle}
                  style={{
                    ...ROW_TITLE_TYPO,
                    color: rowHighlight
                      ? "color-mix(in srgb, var(--_offbeat---color-accent-main) 72%, white)"
                      : "var(--_offbeat---color-accent-main)",
                    transition: "color 0.25s ease, opacity 0.3s ease, visibility 0.3s ease",
                    opacity: hideListTitle ? 0 : 1,
                    visibility: hideListTitle ? "hidden" : "visible",
                  }}
                >
                  {item.title}
                </a>
              </div>
            </div>
          )
        })}
          <div className="scene-mobile-scroll-pad" aria-hidden />
        </div>
      </div>
    </section>
  )
}
