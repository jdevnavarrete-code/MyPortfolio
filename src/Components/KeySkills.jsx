import { useRef, useEffect } from "react"
import ScrollRevealLine from "./ScrollRevealLine"
import flowerVideo from "../assets/videos/flower.mp4"

/** Igual que About (vídeo + scroll): inicio del recorrido y rango mínimo */
const VIDEO_SCROLL_START_OFFSET_VH = 0.15
const VIDEO_MIN_RANGE_VH = 0.0

const KEY_SKILLS_TITLE_STYLE = {
  fontFamily: '"Cabinet Grotesk", Inter, system-ui, sans-serif',
  fontWeight: 500,
  fontSize: "clamp(4.25rem, 18vw, 10rem)",
  lineHeight: 1.02,
  letterSpacing: "0.02em",
  color: "rgba(245, 240, 235, 0.96)",
  textTransform: "uppercase",
}

/* Mismos degradados que About — columna izquierda es fondo negro */
const FLOWER_GRADIENT_BOTTOM = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "45%",
  background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
  pointerEvents: "none",
  zIndex: 5,
}

const FLOWER_GRADIENT_TOP = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "45%",
  background: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
  pointerEvents: "none",
  zIndex: 5,
}

const FLOWER_GRADIENT_RIGHT = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  width: "35%",
  background: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 35%, transparent 100%)",
  pointerEvents: "none",
  zIndex: 5,
}

const SKILL_GROUPS = [
  {
    topic: "Capabilities",
    modules: ["Web Design", "Animation & Interaction", "Webflow", "AI"],
  },
  {
    topic: "Expertise",
    modules: [
      "Graphic Design",
      "Branding",
      "Presentation",
      "Social Media Design",
      "Art Direction",
      "Design Consulting",
      "Mentoring",
    ],
  },
  {
    topic: "My Inspiration",
    modules: ["Music", "Futurism & Retro Sci-Fi", "Cinema"],
  },
]

export default function KeySkills() {
  const skillsSectionRef = useRef(null)
  const flowerVideoRef = useRef(null)

  useEffect(() => {
    const video = flowerVideoRef.current
    const section = skillsSectionRef.current
    if (!video || !section) return
    let isSeeking = false
    let pendingTime = null

    const seekTo = (time) => {
      if (isSeeking) {
        pendingTime = time
        return
      }
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

    let rafScheduled = false
    const updateScrubFromScroll = () => {
      if (!video.duration || isNaN(video.duration)) return
      const vh = window.innerHeight || 1
      const scrollY = window.scrollY
      const rect = section.getBoundingClientRect()
      const sectionTop = scrollY + rect.top
      const start = sectionTop - vh * VIDEO_SCROLL_START_OFFSET_VH
      const sectionRange = Math.max(1, rect.height - vh * 0.32)
      const minRange = vh * VIDEO_MIN_RANGE_VH
      const range = Math.max(minRange, sectionRange)
      const linear = Math.min(1, Math.max(0, (scrollY - start) / range))
      const smooth = linear * linear * (3 - 2 * linear)
      seekTo(smooth * video.duration)
    }

    const onScroll = () => {
      if (rafScheduled) return
      rafScheduled = true
      requestAnimationFrame(() => {
        rafScheduled = false
        updateScrubFromScroll()
      })
    }

    video.pause()
    video.addEventListener("seeked", onSeeked)
    video.addEventListener("loadedmetadata", onScroll)
    video.addEventListener("loadeddata", onScroll)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.visualViewport?.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      video.removeEventListener("seeked", onSeeked)
      video.removeEventListener("loadedmetadata", onScroll)
      video.removeEventListener("loadeddata", onScroll)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.visualViewport?.removeEventListener("scroll", onScroll)
      video.pause()
    }
  }, [])

  return (
    <section
      ref={skillsSectionRef}
      id="skills"
      className="key-skills-section"
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div className="key-skills-inner">
        <p className="key-skills-eyebrow">(My areas of focus)</p>
        <div className="key-skills-heading-wrap">
          <ScrollRevealLine nowrap={false} align="center" style={KEY_SKILLS_TITLE_STYLE}>
            KEY SKILLS
          </ScrollRevealLine>
          <ScrollRevealLine nowrap={false} align="center" style={KEY_SKILLS_TITLE_STYLE}>
            & INTERESTS
          </ScrollRevealLine>
        </div>

        <div className="key-skills-grid">
          <div className="key-skills-media">
            <video
              ref={flowerVideoRef}
              className="key-skills-flower-video"
              src={flowerVideo}
              muted
              playsInline
              preload="auto"
              aria-label="Floral motion — scrubbed with scroll"
            />
            <div className="key-skills-flower-vignette" style={FLOWER_GRADIENT_BOTTOM} aria-hidden />
            <div className="key-skills-flower-vignette" style={FLOWER_GRADIENT_TOP} aria-hidden />
            <div className="key-skills-flower-vignette" style={FLOWER_GRADIENT_RIGHT} aria-hidden />
            <div
              className="key-skills-flower-vignette"
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--portfolio-edge-fade-left)",
                pointerEvents: "none",
                zIndex: 6,
              }}
              aria-hidden
            />
          </div>
          <div className="key-skills-panel">
            <div className="key-skills-topics">
              {SKILL_GROUPS.map((group) => (
                <div key={group.topic} className="key-skills-topic-row">
                  <p className="key-skills-topic-label">{group.topic}</p>
                  <ul className="key-skills-modules">
                    {group.modules.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
