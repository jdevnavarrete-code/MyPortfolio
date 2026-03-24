import Hero from "../Components/Hero"
import About from "../Components/About"
import Scene, { SCENE_BG } from "../Components/Scene"
import Contact from "../Components/Contact"

export default function HomePage() {
  return (
    <div style={{ background: "#000" }}>
      <Hero />
      <About />
      <div style={{ height: "24vh" }} />
      <div id="work" style={{ position: "relative", zIndex: 20, background: SCENE_BG }}>
        <Scene />
      </div>
      {/* Sin margen negativo: evita que Contact suba bajo Scene (z-index 20) y tape el título */}
      <Contact />
    </div>
  )
}
