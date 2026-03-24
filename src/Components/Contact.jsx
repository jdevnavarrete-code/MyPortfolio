import { useRef, useState, useEffect } from "react"

function Send3DButton({ onClick }) {
  const btnRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [pressed, setPressed] = useState(false)

  const handleMouseMove = (e) => {
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setTilt({ x: dy * -18, y: dx * 18 })
  }

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <div
      style={{
        perspective: "600px",
        display: "inline-block",
        alignSelf: "flex-end",
        flexShrink: 0,
      }}
    >
      <button
        ref={btnRef}
        type="submit"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          width: "clamp(90px, 10vw, 130px)",
          height: "clamp(90px, 10vw, 130px)",
          borderRadius: "50%",
          backgroundColor: "#e00",
          border: "none",
          cursor: "pointer",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)",
          color: "#fff",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${pressed ? 0.93 : 1})`,
          transition: pressed ? "transform 0.08s ease" : "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: pressed
            ? "0 2px 8px rgba(220,0,0,0.4)"
            : `0 8px 32px rgba(220,0,0,0.45), 0 ${4 - tilt.x * 0.15}px ${20 - tilt.x * 0.3}px rgba(0,0,0,0.5)`,
          willChange: "transform",
        }}
      >
        SEND
      </button>
    </div>
  )
}

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function RevealLine({ children, visible, delay = 0, style = {} }) {
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div
        style={{
          transform: visible ? "translateY(0)" : "translateY(110%)",
          transition: `transform 1.6s cubic-bezier(0.22,1,0.36,1)`,
          transitionDelay: `${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sent, setSent] = useState(false)
  const [sectionRef, visible] = useReveal()

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSent(true)
  }

  const inputStyle = {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    outline: "none",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
    padding: "0.6rem 0",
    width: "100%",
    caretColor: "#fff",
  }

  const titleStyle = {
    margin: 0,
    display: "block",
    fontSize: "clamp(3.5rem, 11vw, 14rem)",
    color: "#fff",
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "clamp(7rem, 28vh, 16rem)",
        paddingBottom: "clamp(7rem, 28vh, 16rem)",
        paddingLeft: "6vw",
        paddingRight: "6vw",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Title — each line masked independently */}
      <h2 style={{ margin: 0 }}>
        <RevealLine visible={visible} delay={0}>
          <span className="contact-title-display" style={titleStyle}>
            READY TO
          </span>
        </RevealLine>
        <RevealLine visible={visible} delay={0.2}>
          <span className="contact-title-display" style={titleStyle}>
            DISCUSS A
          </span>
        </RevealLine>
        <RevealLine visible={visible} delay={0.4}>
          <span className="contact-title-display" style={titleStyle}>
            PROJECT
          </span>
        </RevealLine>
      </h2>

      {/* Email */}
      <RevealLine visible={visible} delay={0.6} style={{ marginTop: "2.5rem" }}>
        <a
          href="mailto:jdev.navarrete@gmail.com"
          style={{
            display: "inline-block",
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(1rem, 2.2vw, 1.8rem)",
            fontWeight: 400,
            color: "#fff",
            textDecoration: "none",
            letterSpacing: "0.01em",
            opacity: 0.9,
          }}
        >
          jdev.navarrete@gmail.com
        </a>
      </RevealLine>

      {/* Divider */}
      <div
        style={{
          width: visible ? "100%" : "0%",
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.15)",
          margin: "2.5rem 0",
          transition: "width 1.6s cubic-bezier(0.22,1,0.36,1)",
          transitionDelay: "0.8s",
        }}
      />

      {/* Form */}
      {sent ? (
        <RevealLine visible={visible} delay={0.65}>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: "clamp(1.2rem, 2vw, 1.6rem)", color: "#fff", opacity: 0.85 }}>
            Message sent — i&apos;ll be in touch soon.
          </p>
        </RevealLine>
      ) : (
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1)",
          transitionDelay: "1s",
          }}
        >
          <form onSubmit={handleSubmit}>
            <p
              style={{
                margin: "0 0 1.5rem",
                fontFamily: "Arial, sans-serif",
                fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
                color: "#fff",
                opacity: 0.5,
                letterSpacing: "0.03em",
              }}
            >
              Stay in the loop with the latest releases, exclusive projects, and upcoming work.
            </p>

            <div style={{ display: "flex", gap: "3rem", marginBottom: "2rem" }}>
              <input style={inputStyle} type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} autoComplete="off" />
              <input style={inputStyle} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="off" />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "3rem" }}>
              <textarea
                style={{
                  ...inputStyle,
                  resize: "none",
                  height: "clamp(100px, 14vh, 160px)",
                  borderBottom: "none",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "0.8rem",
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                }}
                name="message"
                placeholder="Your message"
                value={form.message}
                onChange={handleChange}
              />
              <Send3DButton />
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
