import { useState, useRef, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../Components/Header"

import ecuaf1 from "../assets/iamges/Ecuaf1.webp"
import ecuaf2 from "../assets/iamges/Ecuaf2.png"
import ecuaf3 from "../assets/iamges/Ecuaf3.png"
import ecuaf4 from "../assets/iamges/Ecuaf4.jpg"
import ecuaf5 from "../assets/iamges/Ecuaf5.png"
import ecuaf5a from "../assets/iamges/Ecuaf5a.png"
import ecuaf6 from "../assets/iamges/Ecuaf6.png"
import ecuaf7 from "../assets/iamges/Ecuaf7.jpg"

const accent = "var(--_offbeat---color-accent-main)"
const body = {
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: "clamp(0.95rem, 1.35vw, 1.05rem)",
  lineHeight: 1.75,
  color: "rgba(255,255,255,0.88)",
  margin: 0,
}
const h2 = {
  fontFamily: '"Cabinet Grotesk", Inter, system-ui, sans-serif',
  fontWeight: 500,
  fontSize: "clamp(1.35rem, 3.2vw, 2rem)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#fff",
  marginTop: "clamp(3rem, 8vh, 5rem)",
  marginBottom: "1.25rem",
  paddingBottom: "0.65rem",
  borderBottom: "1px solid rgba(0, 0, 0, 0.65)",
}
const h3 = {
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: "clamp(0.82rem, 1.1vw, 0.95rem)",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.72)",
  marginTop: "1.75rem",
  marginBottom: "0.65rem",
}
const metaLabel = {
  margin: 0,
  fontFamily: "Inter, Arial, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(0.98rem, 1.5vw, 1.12rem)",
  color: "#fff",
  letterSpacing: "0.02em",
}

const metaValue = {
  marginTop: "0.35rem",
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: "clamp(1.08rem, 1.65vw, 1.22rem)",
  lineHeight: 1.55,
  color: "rgba(255,255,255,0.62)",
}

function MetaBlock({ title, children, compact = false }) {
  return (
    <div
      style={{
        marginBottom: compact
          ? "clamp(0.5rem, 1.2vh, 0.8rem)"
          : "clamp(1rem, 2vh, 1.35rem)",
      }}
    >
      <p style={metaLabel}>{title}</p>
      <div style={metaValue}>{children}</div>
    </div>
  )
}

const ul = {
  margin: "0.5rem 0 0",
  paddingLeft: "1.15rem",
  ...body,
}

const figureStyle = {
  margin: "clamp(4.5rem, 12vh, 7.5rem) 0",
}

const figureWrap = {
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow: "0 20px 70px rgba(0,0,0,0.4)",
}

function CaseStudyFigure({ src, alt, maxWidth, borderRadius }) {
  const innerWrap = {
    ...figureWrap,
    ...(maxWidth
      ? { maxWidth, marginLeft: "auto", marginRight: "auto" }
      : {}),
    ...(borderRadius != null ? { borderRadius } : {}),
  }
  return (
    <figure style={figureStyle}>
      <div style={innerWrap}>
        <img src={src} alt={alt} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
    </figure>
  )
}

const CAROUSEL_SLIDES = [
  { src: ecuaf4, alt: "EcuaFlowers — pantalla 1" },
  { src: ecuaf5, alt: "EcuaFlowers — pantalla 2" },
  { src: ecuaf5a, alt: "EcuaFlowers — wireframes en papel" },
  { src: ecuaf6, alt: "EcuaFlowers — storyboard UX (escenario comerciante y pedido)" },
]

const CAROUSEL_ICON_PREV = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const CAROUSEL_ICON_NEXT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function EcuafCarousel() {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(null)

  const go = useCallback((delta) => {
    setIndex((i) => (i + delta + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStartX.current = t ? t.clientX : null
  }

  const onTouchEnd = (e) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null) return
    const end = e.changedTouches[0]?.clientX
    if (end == null) return
    const dx = end - start
    if (Math.abs(dx) < 48) return
    if (dx < 0) go(1)
    else go(-1)
  }

  return (
    <div className="ecuaf-carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="ecuaf-carousel__stage">
        <div className="ecuaf-carousel__tilt">
          <div className="ecuaf-carousel__viewport">
            <div
              className="ecuaf-carousel__track"
              style={{
                width: `${CAROUSEL_SLIDES.length * 100}%`,
                transform: `translate3d(-${(index * 100) / CAROUSEL_SLIDES.length}%, 0, 0)`,
              }}
            >
              {CAROUSEL_SLIDES.map((slide) => (
                <div
                  key={slide.alt}
                  className="ecuaf-carousel__slide"
                  style={{ width: `${100 / CAROUSEL_SLIDES.length}%` }}
                >
                  <img src={slide.src} alt={slide.alt} draggable={false} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="ecuaf-carousel__nav ecuaf-carousel__nav--prev"
          aria-label="Vista anterior"
          onClick={() => go(-1)}
        >
          {CAROUSEL_ICON_PREV}
        </button>
        <button
          type="button"
          className="ecuaf-carousel__nav ecuaf-carousel__nav--next"
          aria-label="Vista siguiente"
          onClick={() => go(1)}
        >
          {CAROUSEL_ICON_NEXT}
        </button>
      </div>

      <div className="ecuaf-carousel__footer">
        <div className="ecuaf-carousel__counter" aria-live="polite">
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          {" / "}
          {String(CAROUSEL_SLIDES.length).padStart(2, "0")}
        </div>
        <div
          className="ecuaf-carousel__segments"
          role="tablist"
          aria-label="Seleccionar imagen del carrusel"
        >
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Imagen ${i + 1} de ${CAROUSEL_SLIDES.length}`}
              className={`ecuaf-carousel__segment${i === index ? " is-active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CaseStudyEcuaflowers() {
  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Header light />
      <article
        className="case-study-page"
        style={{
          position: "relative",
          zIndex: 2,
          margin: "0 auto",
        }}
      >


        <div className="case-study-hero">
          <header className="case-study-hero-heading">
            <p
              style={{
                margin: "0 0 clamp(0.45rem, 1.2vh, 0.65rem)",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: "clamp(0.68rem, 1vw, 0.76rem)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              Case study
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Cabinet Grotesk", Inter, system-ui, sans-serif',
                fontWeight: 500,
                fontSize: "clamp(4rem, 12vw, 8rem)",
                lineHeight: 1.02,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "#fff",
              }}
            >
              EcuaFlowers App
            </h1>
          </header>

          <div className="case-study-hero-visual">
            <div className="case-study-hero-image">
              <img
                src={ecuaf1}
                alt="EcuaFlowers — vista principal del proyecto"
              />
            </div>
            <div className="case-study-hero-fade" aria-hidden />
            <div className="case-study-hero-title-layer">
              <div className="case-study-hero-meta case-study-hero-meta--overlay">
                <div>
                  <MetaBlock compact title="Project type">
                    Case of study
                    <br />
                    Florícola sector
                    <br />
                    Ecuador
                  </MetaBlock>
                  <MetaBlock compact title="My role">
                    Product designer
                  </MetaBlock>
                  <MetaBlock compact title="Tools">
                    Figma
                    <br />
                    Adobe Photoshop
                    <br />
                    Adobe Illustrator
                  </MetaBlock>
                </div>
                <div>
                  <MetaBlock compact title="Contribution">
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "1.1rem",
                        listStyle: "disc",
                        fontFamily: "Inter, Arial, sans-serif",
                        fontSize: "inherit",
                        lineHeight: 1.55,
                        color: "inherit",
                      }}
                    >
                      <li>User interviews</li>
                      <li>Ideation</li>
                      <li>Paper prototype</li>
                      <li>High-fidelity prototype</li>
                      <li>Interaction design</li>
                    </ul>
                  </MetaBlock>
                  <MetaBlock compact title="Duration">
                    10 weeks (course project)
                    <br />
                    10 weeks (redesign)
                  </MetaBlock>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 style={h2}>Overview</h2>
          <h3 style={h3}>Background</h3>
          <p style={{ ...body, marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>The problem:</strong> traders and everyday buyers often lack time to purchase roses and find a reliable, quality product.
          </p>
          <p style={{ ...body, marginBottom: "1.5rem" }}>
            <strong style={{ color: "#fff" }}>The goal:</strong> design an app that lets users buy roses quickly, easily, and with confidence in product quality.
          </p>
          <p style={body}>
            EcuaFlowers is an application for purchasing roses in Ecuador—helping people buy their favorite flowers in a simple, digital way. It aims to leverage national production and benefit traders and suppliers.
          </p>
          <p style={{ ...body, marginTop: "1rem" }}>
            Responsibilities included interviews, paper and digital wireframing, low and high-fidelity prototyping, usability studies, accessibility considerations, and iterative refinement.
          </p>
        </section>

        <CaseStudyFigure
          src={ecuaf2}
          alt="EcuaFlowers — exploración visual y flujos"
          maxWidth="min(52rem, 94%)"
        />

        <section>
          <h2 style={h2}>User</h2>
          <h3 style={{ ...h3, marginTop: 0 }}>User research</h3>
          <p style={body}>
            Interviews and empathy maps clarified who the design serves and what they need. A primary group were merchants running flower shops; a recurring pain was lack of time to source roses. Many participants were also unaware of the variety available nationally—this app can help grow the industry.
          </p>
          <h3 style={h3}>Problem statement</h3>
          <p style={{ ...body, fontStyle: "italic", color: "rgba(255,255,255,0.82)" }}>
            María is a small merchant who needs a more efficient way to buy roses—she has many obligations and wants to save time.
          </p>
        </section>

        <CaseStudyFigure
          src={ecuaf3}
          alt="EcuaFlowers — investigación y prototipos"
          maxWidth="60%"
          borderRadius="clamp(18px, 3vw, 28px)"
        />

        <section>
          <h2 style={h2}>Design iteration</h2>
          <h3 style={{ ...h3, marginTop: 0 }}>Ideation</h3>
          <p style={body}>
            Paper iterations for each screen ensured that elements moving into digital wireframes addressed real pain points. On the home screen, priority went to categories, recommended products, and a bottom bar for core flows.
          </p>

          <EcuafCarousel />

          <h3 style={h3}>Wireframes</h3>
          <p style={body}>
            From the full wireframe set, a low-fidelity prototype connected the main flow: purchase and receipt of the flower order—ready for usability testing.
          </p>



          <h3 style={h3}>Usability study — findings</h3>
          <p style={{ ...body, marginBottom: "0.75rem" }}>
            <strong style={{ color: accent }}>01</strong> — Users want to buy and receive roses easily; find products quickly; and have a bulk purchase option.
          </p>
          <p style={body}>
            <strong style={{ color: accent }}>02</strong> — Too many purchase paths caused confusion; the flow needed a clear way to edit delivery details.
          </p>
          <CaseStudyFigure
            src={ecuaf7}
            alt="EcuaFlowers — wireframes"
            maxWidth="60%"
            borderRadius="clamp(18px, 3vw, 28px)"
          />
        </section>

        <section>
          <h2 style={h2}>Refining the design</h2>
          <h3 style={{ ...h3, marginTop: 0 }}>Mockups</h3>
          <p style={body}>
            Based on usability feedback, the standalone “store” section was removed in favor of a unified catalog to browse and buy products more clearly.
          </p>

          <h3 style={h3}>High-fidelity prototype</h3>
          <p style={body}>
            The final prototype tightened flows for purchasing and receiving orders, surfaced products faster, and supported options like product customization.
          </p>
          <h3 style={h3}>Accessibility</h3>
          <ul style={{ ...ul, listStyle: "decimal", paddingLeft: "1.35rem" }}>
            <li>Support undoing actions and correcting mistakes.</li>
            <li>Icons to reinforce navigation.</li>
            <li>Labels and descriptions so processes are easy to follow.</li>
          </ul>
        </section>

        <section>
          <h2 style={h2}>Going forward</h2>
          <h3 style={{ ...h3, marginTop: 0 }}>Takeaways</h3>
          <p style={body}>
            <strong style={{ color: "#fff" }}>Impact:</strong> the app addresses core needs with a clearer, more empowering flow for the flower industry.
          </p>
          <blockquote
            style={{
              ...body,
              margin: "1.25rem 0",
              paddingLeft: "1rem",
              borderLeft: `3px solid color-mix(in srgb, ${accent} 70%, transparent)`,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.78)",
            }}
          >
            “The tasks were easy to complete and the process felt quick—I would use this app to place my flower orders.”
            <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.9em", fontStyle: "normal", opacity: 0.75 }}>
              — Peer feedback
            </span>
          </blockquote>
          <p style={{ ...body, marginTop: "1rem" }}>
            <strong style={{ color: "#fff" }}>What I learned:</strong> first ideas are only the beginning—usability tests and interview notes shaped every iteration.
          </p>
          <h3 style={h3}>Next steps</h3>
          <ul style={{ ...ul, listStyle: "decimal", paddingLeft: "1.35rem" }}>
            <li>Run another study to validate assumptions and track performance over time.</li>
            <li>Research flower suppliers’ needs to optimize the experience for the full chain.</li>
          </ul>
        </section>
      </article>
    </div>
  )
}
