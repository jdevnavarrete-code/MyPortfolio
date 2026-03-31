import { useEffect, useState, useRef } from "react"
import Matter from "matter-js"
import Header from "./Header"
import bannerBg from "../assets/iamges/banner1.jpeg"

const CREAM = "#000000"

const LETTERS = "jordy".split("")
const SCALES = [1.14, 0.98, 1.08, 1.02, 1.16]

function FallingLetters() {
  const containerRef = useRef(null)
  const letterRefs = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cRect = container.getBoundingClientRect()
    const w = cRect.width
    const h = cRect.height

    // Medir tamaño real de cada letra ya renderizada en el DOM
    // Se aplica un factor de reducción para que el cuerpo físico coincida
    // con el área de tinta real (el bbox incluye espacio vacío alrededor del glifo)
    const PHYSICS_SCALE = 0.75
    const letterSizes = letterRefs.current.map((el) => {
      if (!el) return { w: 150, h: 200 }
      const r = el.getBoundingClientRect()
      return { w: r.width * PHYSICS_SCALE, h: r.height * PHYSICS_SCALE }
    })

    const { Engine, Runner, Bodies, Body, World, Events } = Matter
    const engine = Engine.create({ gravity: { x: 0, y: 2 } })
    const world = engine.world

    const bodies = LETTERS.map((_, i) => {
      const { w: bw, h: bh } = letterSizes[i]
      // Posición X completamente aleatoria dentro del contenedor
      const startX = bw / 2 + Math.random() * (w - bw)
      // Altura de caída aleatoria: algunas muy arriba, otras menos
      const startY = -(bh + Math.random() * h * 1.8)
      const b = Bodies.rectangle(startX, startY, bw, bh, {
        restitution: 0.25,
        friction: 0.5,
        frictionAir: 0.006,
        angle: (Math.random() - 0.5) * 1.2,
      })
      Body.setVelocity(b, { x: (Math.random() - 0.5) * 5, y: Math.random() * 2 })
      return b
    })

    World.add(world, bodies)

    // Piso justo al fondo del contenedor
    const ground = Bodies.rectangle(w / 2, h + 20, w * 3, 80, { isStatic: true, restitution: 0.2 })
    const wallL = Bodies.rectangle(-50, h / 2, 100, h * 3, { isStatic: true })
    const wallR = Bodies.rectangle(w + 50, h / 2, 100, h * 3, { isStatic: true })
    World.add(world, [ground, wallL, wallR])

    // Posición del mouse en coordenadas del contenedor (via window para mayor fiabilidad)
    const mousePos = { x: -9999, y: -9999 }
    const onMouseMove = (e) => {
      const r = container.getBoundingClientRect()
      mousePos.x = e.clientX - r.left
      mousePos.y = e.clientY - r.top

    }
    window.addEventListener("mousemove", onMouseMove)

    // Repulsión en cada tick — fuerza escalada por masa para que funcione independiente del tamaño
    const REPULSION_RADIUS = 200
    const REPULSION_STRENGTH = 0.06
    Events.on(engine, "beforeUpdate", () => {
      bodies.forEach((body) => {
        const dx = body.position.x - mousePos.x
        const dy = body.position.y - mousePos.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPULSION_RADIUS && dist > 1) {
          const factor = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH * body.mass
          Body.applyForce(body, body.position, {
            x: (dx / dist) * factor,
            y: (dy / dist) * factor,
          })
        }
      })
    })

    const runner = Runner.create()
    Runner.run(runner, engine)

    const syncToDom = () => {
      bodies.forEach((body, i) => {
        const el = letterRefs.current[i]
        if (!el) return
        const { w: bw, h: bh } = letterSizes[i]
        el.style.left = `${body.position.x - bw / 2}px`
        el.style.top = `${body.position.y - bh / 2}px`
        el.style.transform = `rotate(${(body.angle * 180) / Math.PI}deg)`
      })
    }

    Events.on(engine, "afterUpdate", syncToDom)

    // Mostrar letras al primer frame
    const t = setTimeout(() => {
      letterRefs.current.forEach((el) => el && (el.style.opacity = "1"))
    }, 50)

    return () => {
      clearTimeout(t)
      Runner.stop(runner)
      World.clear(world)
      Engine.clear(engine)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: "45%",
        bottom: 0,
        overflow: "visible",
        cursor: "none",
      }}
    >
      {LETTERS.map((letter, i) => (
        <span
          key={i}
          ref={(el) => { letterRefs.current[i] = el }}
          className={letter === "o" ? "hero-falling-letter hero-falling-letter-o" : "hero-falling-letter"}
          style={{
            position: "absolute",
            top: -9999,
            left: -9999,
            fontFamily: '"Times New Roman", Times, serif',
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(10rem, 22vw, 28rem)",
            color: letter === "o" ? "#a01010" : "#ffffff",
            lineHeight: 1,
            transformOrigin: "center center",
            textShadow: "0 2px 20px rgba(0,0,0,0.06)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}

export default function Hero() {
  const sectionRef = useRef(null)
  const [pastHero, setPastHero] = useState(false)
  const [blurPx, setBlurPx] = useState(0)
  const [bgOpacity, setBgOpacity] = useState(1)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const check = () => {
      const rect = section.getBoundingClientRect()
      document.body.classList.toggle("scrolled-past-hero", rect.bottom < 0)
      setPastHero(rect.bottom < 0)

      const h = window.innerHeight
      const progress = Math.min(1, Math.max(0, (1 - rect.bottom / h) * 2.5))
      setBlurPx(progress * 25)
      setBgOpacity(1 - progress * 0.9)
    }
    window.addEventListener("scroll", check, { passive: true })
    check()
    return () => window.removeEventListener("scroll", check)
  }, [])

  const socialLinkStyle = {
    color: "#ffffff",
    textDecoration: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.2em",
    opacity: 0.9,
  }

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: CREAM,
        fontFamily: "Suisse, Arial, sans-serif",
        paddingBottom: "8rem",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: `blur(${blurPx}px)`,
          opacity: bgOpacity,
          transition: "filter 0.15s ease-out, opacity 0.15s ease-out",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <Header light={pastHero} />

      <div
        className="hero-inner"
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "8rem 4rem 4rem",
          boxSizing: "border-box",
        }}
      >
        {/* Letras que caen y se apilan */}
        <FallingLetters />

        {/* Texto pegado a la derecha */}
        <div
          className="hero-copy"
          style={{
            marginLeft: "auto",
            width: "42%",
            paddingRight: "2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "right",
          }}
        >
          <p
            className="hero-eyebrow"
            style={{
              margin: 0,
              fontFamily: "Times New Roman, Times, serif",
              fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
              color: "rgba(255, 255, 255, 0.82)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.95,
            }}
          >
            (i am)
          </p>
          <h1
            className="hero-headline"
            style={{
              margin: "0.5rem 0 0",
              fontFamily: "Arial, sans-serif",
              fontSize: "clamp(4rem, 4.5vw, 5rem)",
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            A <em>creative developer</em> who builds immersive digital experiences.
          </h1>
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontFamily: "Arial, sans-serif",
              fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
            }}
          >
            <a href="linkedin.com/in/jordy-navarrete-590831264" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
              LinkedIn
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
              Github
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
              Dribbble
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
