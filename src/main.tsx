import { registerSW } from "virtual:pwa-register"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import "leaflet/dist/leaflet.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerSW({
  immediate: true,
  onRegisteredSW() {
    console.log("PWA ready")
  },
})
