import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import App from "./App"
import AdminApp from "./admin/AdminApp"
import AdminLogin from "./admin/AdminLogin"
import "./index.css"

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) return <Navigate to="/admin-login" replace />;
  return children;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard/*" element={<ProtectedRoute><AdminApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
