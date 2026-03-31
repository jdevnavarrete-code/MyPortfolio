import Hero from "../Components/Hero"
import About from "../Components/About"
import KeySkills from "../Components/KeySkills"
import Scene from "../Components/Scene"
import Contact from "../Components/Contact"

export default function HomePage() {
  return (
    <div style={{ background: "#000" }}>
      <Hero />
      <About />
      <KeySkills />
      <div
        id="work"
        style={{ position: "relative", zIndex: 20, background: "#000000" }}
      >
        <Scene followsKeySkills />
      </div>
      {/* Sin margen negativo: evita que Contact suba bajo Scene (z-index 20) y tape el título */}
      <Contact />
    </div>
  )
}
