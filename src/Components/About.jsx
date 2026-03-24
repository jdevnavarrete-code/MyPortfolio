import { useRef, useEffect, useState } from "react"
import flowerVideo from "../assets/videos/flower.mp4"

const FOCUS_LINE_RATIO = 0.38
const TRANSITION_ZONE = 240
const MAX_BLUR = 20
const TRANSLATE_Y_OFFSET = 14

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const FADE_ZONE = 18
const TRANSITION = `filter 0.22s ${EASE}, opacity 0.22s ${EASE}, transform 0.22s ${EASE}, mask 0.22s ${EASE}, -webkit-mask 0.22s ${EASE}`
const VIDEO_SCROLL_START_OFFSET_VH = 0.15
const VIDEO_MIN_RANGE_VH = 0.0

function ScrollRevealLine({
  children,
  alwaysSharp = false,
  style = {},
  nowrap = true,
  onProgressChange,
  /** Bloque del cierre del quote: justificado, última línea pegada a la derecha */
  endAlign = false,
}) {
  const lineRef = useRef(null)
  const [progress, setProgress] = useState(0)

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
  /* Misma máscara para todas las líneas (incl. endAlign): revelado izquierda → derecha */
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
        textAlign: endAlign ? "justify" : "left",
      }}
    >
      <span
        style={{
          /* block + 100% cuando hay salto de línea (nowrap false) o alineación derecha */
          display: endAlign || !nowrap ? "block" : "inline-block",
          width: endAlign || !nowrap ? "100%" : undefined,
          maxWidth: "100%",
          textAlign: endAlign ? "justify" : "left",
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

function BioParagraph({ visible = false }) {
  return (
    <div
      style={{
        marginTop: "clamp(2.5rem, 6vw, 5.5rem)",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(1.2rem, 1.25vw, 1.65rem)",
          color: "#fff",
          lineHeight: 1.75,
          letterSpacing: "0.01em",
          maxWidth: "38ch",
          textAlign: "left",
          hyphens: "auto",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          opacity: visible ? 0.7 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        My name is Jordy. i&apos;m a passionate creative who works closely with companies to help them unlock their full potential and solve specific business problems with effective and memorable design solutions.
      </p>
    </div>
  )
}

export default function About() {
  const flowerVideoRef = useRef(null)
  const aboutRef = useRef(null)
  const [quoteRevealed, setQuoteRevealed] = useState(false)

  // Scrub del vídeo con scroll normal (sin bloquear ni agregar espacio extra)
  useEffect(() => {
    const video = flowerVideoRef.current
    const about = aboutRef.current
    if (!video || !about) return
    let isSeeking = false
    let pendingTime = null

    const seekTo = (time) => {
      if (isSeeking) { pendingTime = time; return }
      isSeeking = true
      video.currentTime = time
    }

    const onSeeked = () => {
      isSeeking = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        seekTo(t)
      }
    }

    const onScroll = () => {
      if (!video.duration || isNaN(video.duration)) return
      const vh = window.innerHeight
      const aboutTop = about.offsetTop
      const scrollY = window.scrollY
      const start = aboutTop - vh * VIDEO_SCROLL_START_OFFSET_VH
      // Usa la altura real de About para asegurar que el video pueda completar sin espacio extra.
      const sectionRange = Math.max(1, about.offsetHeight - vh * 0.35)
      const minRange = vh * VIDEO_MIN_RANGE_VH
      const range = Math.max(minRange, sectionRange)
      const linear = Math.min(1, Math.max(0, (scrollY - start) / range))
      const smooth = linear * linear * (3 - 2 * linear) // smoothstep
      seekTo(smooth * video.duration)
    }

    video.pause()
    video.addEventListener("seeked", onSeeked)
    video.addEventListener("loadedmetadata", onScroll)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      video.removeEventListener("seeked", onSeeked)
      video.removeEventListener("loadedmetadata", onScroll)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      video.pause()
    }
  }, [])

  return (
    <section
      ref={aboutRef}
      id="about"
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#000",
      }}
    >
      {/* Primeras dos líneas del quote - fluyen con el scroll */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          padding: "8rem clamp(1.25rem, 4vw, 3rem) 0",
          boxSizing: "border-box",
          zIndex: 6,
        }}
      >
        <p
          style={{
            margin: 0,
            width: "100%",
            maxWidth: "100%",
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(3.8rem, 4.8vw, 8rem)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.25,
            textAlign: "left",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          <ScrollRevealLine nowrap={false}>
            &ldquo;as a <em style={{ fontFamily: "Times New Roman, serif", fontStyle: "italic", fontWeight: 400 }}>creative developer</em>,
            I design and build 
          </ScrollRevealLine>
          <ScrollRevealLine nowrap={false}>
          digital  products that connect ideas ,
          </ScrollRevealLine>
        </p>
      </div>

      {/* Video (65% ancho como antes) + tercer párrafo superpuesto arriba + bio */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          padding: "0 2rem 4rem 0",
          gap: "clamp(1.5rem, 3vw, 3rem)",
          minHeight: "100vh",
        }}
      >
        {/*
          Tercer bloque del quote: fuera del vídeo para que el borde derecho coincida
          con la columna de la bio (pegado al layout), no solo al borde del vídeo.
        */}
        {/* Flower video — alineado a la izquierda de la fila */}
        <div
          style={{
            flex: "0 0 52%",
            position: "relative",
            height: "68vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            marginLeft: "clamp(-8rem, -22vw, -3rem)",
          }}
        >
          <video
            ref={flowerVideoRef}
            className="about-flower-video"
            src={flowerVideo}
            playsInline
            preload="auto"
            style={{
              width: "100%",
              height: "68vh",
              objectFit: "cover",
              objectPosition: "left center",
              mixBlendMode: "screen",
            }}
          />
          {/* Sombra degradada negra abajo del video */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "45%",
              background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
          {/* Sombra degradada negra arriba del video */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "45%",
              background: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
          {/* Sombra degradada negra a la derecha del video */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "35%",
              background: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        </div>

        {/* Cierre del quote + bio centrada justo debajo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
            pointerEvents: "none",
            boxSizing: "border-box",
            maxWidth: "52%",
            padding: "2rem clamp(3.5rem, 8vw, 6.5rem) 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <div style={{ width: "100%", textAlign: "justify", textAlignLast: "right" }}>
            <p
              style={{
                margin: 0,
                width: "100%",
                fontFamily: "Arial, sans-serif",
                fontSize: "clamp(2.2rem, 4.2vw, 6.5rem)",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                overflowWrap: "break-word",
                wordBreak: "break-word",
                hyphens: "auto",
                textAlign: "justify",
                textAlignLast: "right",
              }}
            >
              <ScrollRevealLine
                nowrap={false}
                endAlign
                onProgressChange={(p) => setQuoteRevealed(p >= 0.99)}
              >
                solve real problems, and evolve in a{" "}
                <em
                  style={{
                    fontFamily: "Times New Roman, serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  fast-moving
                </em>{" "}
                world.&rdquo;
              </ScrollRevealLine>
            </p>
          </div>
          <BioParagraph visible={quoteRevealed} />
        </div>
      </div>
    </section>
  )
}
