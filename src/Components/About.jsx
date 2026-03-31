import { useRef, useEffect, useState } from "react"
import jordyPhoto from "../assets/iamges/test1.jpg"
import ScrollRevealLine from "./ScrollRevealLine"

function BioParagraph({ visible = false }) {
  return (
    <div
      className="about-bio"
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
  const aboutRef = useRef(null)
  const aboutPhotoMediaRef = useRef(null)
  const aboutPhotoImgRef = useRef(null)
  const aboutPhotoParallaxYRef = useRef(0)
  const [quoteRevealed, setQuoteRevealed] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const sync = () => setIsMobileLayout(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return

    let rafId = 0
    aboutPhotoParallaxYRef.current = 0

    const tick = () => {
      rafId = 0
      const media = aboutPhotoMediaRef.current
      const img = aboutPhotoImgRef.current
      if (!media || !img) return

      const vh = window.innerHeight || 1
      const rect = media.getBoundingClientRect()
      const mid = (rect.top + rect.height / 2 - vh / 2) / vh
      const mobile = window.matchMedia("(max-width: 768px)").matches
      const range = mobile ? 320 : 560
      const max = mobile ? 240 : 380
      const scale = mobile ? 1.22 : 1.35
      const targetY = Math.max(-max, Math.min(max, mid * range))

      const smooth = mobile ? 0.022 : 0.014
      let y = aboutPhotoParallaxYRef.current
      y += (targetY - y) * smooth
      aboutPhotoParallaxYRef.current = y

      img.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`

      if (Math.abs(targetY - y) > 0.018) {
        rafId = requestAnimationFrame(tick)
      }
    }

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(rafId)
      aboutPhotoParallaxYRef.current = 0
      const img = aboutPhotoImgRef.current
      if (img) img.style.transform = ""
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
        className="about-quote-lead"
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
          className="about-quote-lead-text"
          style={{
            margin: 0,
            width: "100%",
            maxWidth: "100%",
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(3.8rem, 4.8vw, 8rem)",
            fontWeight: 500,
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

      {/* Foto + cierre quote + bio — móvil: cierre → imagen → bio (order en CSS) */}
      <div
        className="about-flower-row"
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
        {/* Foto — desktop: columna izquierda; móvil: ancho completo */}
        <div
          ref={aboutPhotoMediaRef}
          className="about-flower-media"
          style={{
            flex: "0 0 52%",
            position: "relative",
            height: "auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginLeft: "clamp(-8rem, -22vw, -3rem)",
            overflow: "hidden",
          }}
        >
          <img
            ref={aboutPhotoImgRef}
            className="about-flower-video about-about-photo-parallax"
            src={jordyPhoto}
            alt="Jordy"
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectPosition: "center top",
            }}
          />
          {/* Solo borde inferior: funde la foto con el negro (sin viñeta arriba) */}
          <div
            className="about-photo-edge-fade"
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--portfolio-edge-fade-bottom)",
              pointerEvents: "none",
              zIndex: 5,
            }}
            aria-hidden
          />
        </div>

        {/* Cierre del quote + bio — móvil: .about-flower-copy display:contents para reordenar */}
        <div
          className="about-flower-copy"
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
          <div
            className="about-flower-quote-inner"
            style={{ width: "100%", textAlign: "justify", textAlignLast: "right" }}
          >
            <p
              style={{
                margin: 0,
                width: "100%",
                fontFamily: "Arial, sans-serif",
                fontSize: "clamp(3.8rem, 4.8vw, 8rem)",
                fontWeight: 500,
                color: "#fff",
                lineHeight: 1.25,
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
          <div className="about-flower-bio">
            <BioParagraph visible={isMobileLayout || quoteRevealed} />
          </div>
        </div>
      </div>
    </section>
  )
}
