import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import PropertiesListPage from "../pages/PropertiesListPage"

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<PropertiesListPage />} />
    </Routes>
  )
}
