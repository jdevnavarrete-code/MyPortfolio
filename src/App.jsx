import { useEffect, useLayoutEffect, useRef } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import HomePage from "./pages/HomePage"
import WorkPage from "./pages/WorkPage"
import CustomCursor from "./Components/CustomCursor"

function ScrollToHash({ lenisRef }) {
  const { pathname, hash } = useLocation()
  const isInitialLoad = useRef(true)

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }

    const scrollToTop = () => {
      const lenis = lenisRef.current
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" })
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
          const lenis = lenisRef.current
          if (lenis) lenis.scrollTo(el, { offset: 0 })
          else el.scrollIntoView({ behavior: "smooth" })
        })
      }
    } else {
      scrollToTop()
    }
  }, [pathname, hash, lenisRef])

  useEffect(() => {
    const onPageShow = (e) => {
      if (!e.persisted) return
      const lenis = lenisRef.current
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [lenisRef])

  return null
}

export default function App() {
  const lenisRef = useRef(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.045,
      wheelMultiplier: 0.88,
      touchMultiplier: 0.92,
      syncTouch: true,
      syncTouchLerp: 0.055,
    })
    lenisRef.current = lenis
    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <BrowserRouter>
      <CustomCursor />
      <ScrollToHash lenisRef={lenisRef} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
      </Routes>
    </BrowserRouter>
  )
}
