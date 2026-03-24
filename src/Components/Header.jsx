import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const NAV_LINKS = [
  { label: "HOME", to: "/" },
  { label: "ABOUT", to: "/#about" },
  { label: "WORK", to: "/work" },
  { label: "CONTACT", to: "/#contact" },
]

// function LocationTime() {
//   const [time, setTime] = useState("")
//   useEffect(() => {
//     const fmt = () => {
//       const d = new Date()
//       const h = d.getHours() % 12 || 12
//       const m = String(d.getMinutes()).padStart(2, "0")
//       const ampm = d.getHours() >= 12 ? "PM" : "AM"
//       return `${h}:${m} ${ampm}`
//     }
//     setTime(fmt())
//     const id = setInterval(() => setTime(fmt()), 60000)
//     return () => clearInterval(id)
//   }, [])
//   return <>ECUADOR {time}</>
// }

export default function Header({ light = false }) {
  const navColor = "#000000"
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "2rem 4rem",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: 50,
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      {/* <div style={{ color: "#fff", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
        <LocationTime />
      </div> */}
      <nav style={{ display: "flex", gap: "2rem" }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            style={{
              color: navColor,
              fontFamily: "Arial, sans-serif",
              textDecoration: "none",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
