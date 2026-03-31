import Scene from "../Components/Scene"
import Contact from "../Components/Contact"
import Header from "../Components/Header"

export default function WorkPage() {
  return (
    <div style={{ background: "#000000" }}>
      <Header light />
      <div
        style={{
          paddingTop: "8rem",
          position: "relative",
          zIndex: 20,
          background: "#000000",
        }}
      >
        <Scene />
      </div>
      <Contact />
    </div>
  )
}
