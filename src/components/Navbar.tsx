import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-slate-950 text-2xl font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
            IM
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[1.9rem] leading-none font-black tracking-tight text-slate-950">
              ImmoMarket
            </h1>
            <p className="mt-1 truncate text-sm font-medium text-slate-500">
              Smart real estate experience
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/"
            className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            الرئيسية
          </Link>

          <Link
            to="/properties"
            className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            العقارات
          </Link>

          <button className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800">
            الخريطة
          </button>
        </div>
      </div>
    </header>
  )
}
