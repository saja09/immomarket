import { Routes, Route, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Building2, PlusCircle, LogOut, Menu } from "lucide-react"
import { useState } from "react"

export default function AdminApp() {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { path: "", label: "الرئيسية", icon: LayoutDashboard },
    { path: "properties", label: "إدارة العقارات", icon: Building2 },
    { path: "add-property", label: "إضافة عقار", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-right" dir="rtl">
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#06142f] text-white transition-all lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col p-6">
          <h1 className="text-xl font-black mb-10 border-b border-white/10 pb-4 italic">Dar DARK Pro</h1>
          <nav className="flex-1 space-y-2">
            {menu.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm ${location.pathname === "/admin-dashboard" + (item.path ? "/" + item.path : "") ? "bg-white text-[#06142f] shadow-lg" : "text-slate-400"}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </nav>
          <button onClick={() => { localStorage.clear(); window.location.href="/"; }} className="p-4 text-rose-400 font-bold border border-rose-500/20 rounded-2xl"><LogOut size={18} /> خروج</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><Menu /></button>
          <div className="font-black text-xs">لوحة التحكم • سيمو</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <Routes>
            <Route index element={<div className="p-20 text-center bg-white rounded-[40px] shadow-sm font-black text-xl">مرحباً سيمو فـ الداشبورد المستقرة ✅</div>} />
            <Route path="properties" element={<div className="p-20 text-center bg-white rounded-[40px] shadow-sm font-black text-xl">هنا إدارة العقارات</div>} />
            <Route path="add-property" element={<div className="p-20 text-center bg-white rounded-[40px] shadow-sm font-black text-xl">هنا إضافة عقار</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
