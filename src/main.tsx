import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import App from "./App"
import AdminApp from "./admin/AdminApp"
import AdminLogin from "./admin/AdminLogin"
import "./index.css"

// حماية الداشبورد
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) return <Navigate to="/admin-login" replace />;
  return children;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* صفحة الزوار (السيت اللي فيه 15 عقار و جيمني) */}
        <Route path="/*" element={<App />} />
        
        {/* صفحة دخول الإدارة */}
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* لوحة التحكم (Admin Dashboard) */}
        <Route 
          path="/admin-dashboard/*" 
          element={
            <ProtectedRoute>
              <AdminApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
