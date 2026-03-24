import Scene, { SCENE_BG } from "../Components/Scene"
import Contact from "../Components/Contact"
import Header from "../Components/Header"

export default function WorkPage() {
  return (
    <div style={{ background: SCENE_BG }}>
      <Header light />
      <div style={{ paddingTop: "8rem", position: "relative", zIndex: 20, background: SCENE_BG }}>
        <Scene />
      </div>
      <Contact />
    </div>
  )
}
