import "leaflet/dist/leaflet.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import AdminApp from "./admin/AdminApp.tsx"

const pathname = window.location.pathname
const isAdminRoute = pathname === "/admin-panel-simo"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
)
