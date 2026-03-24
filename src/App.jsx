import { useEffect, useLayoutEffect, useRef } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import WorkPage from "./pages/WorkPage"
import CustomCursor from "./Components/CustomCursor"

function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const isInitialLoad = useRef(true)

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }

    // En carga inicial o recarga: siempre empezar arriba, ignorar hash
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      scrollToTop()
      requestAnimationFrame(scrollToTop)
      setTimeout(scrollToTop, 100)
      setTimeout(scrollToTop, 300)
      return
    }

    // Navegación posterior: respetar hash si existe
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth" })
        })
      }
    } else {
      scrollToTop()
    }
  }, [pathname, hash])

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) scrollToTop()
    })
    return () => window.removeEventListener("pageshow", scrollToTop)
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
      </Routes>
    </BrowserRouter>
  )
}
