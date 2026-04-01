import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import PageLoader from "./Components/PageLoader.jsx"

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual"
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PageLoader>
      <App />
    </PageLoader>
  </StrictMode>,
)
