import { useState } from "react"
import {
  Search,
  Mic,
  Plus,
  SlidersHorizontal,
  MapPinned,
  LocateFixed,
  Heart,
} from "lucide-react"

export default function SearchBar() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mx-auto mt-6 max-w-md px-4">
      <div className="rounded-[28px] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f8fafc] text-[#06142f] shadow-sm ring-1 ring-slate-200 transition active:scale-95"
            aria-label="المزيد"
          >
            <Plus
              size={20}
              className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`}
            />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث عن مدينة، حي، شقة..."
              className="h-12 w-full rounded-full bg-[#f8fafc] pr-5 pl-24 text-right text-[16px] font-medium text-[#06142f] outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white"
            />

            <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#06142f] shadow-sm ring-1 ring-slate-200 transition active:scale-95"
                aria-label="البحث الصوتي"
              >
                <Mic size={17} />
              </button>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#06142f] text-white shadow-[0_10px_20px_rgba(6,20,47,0.18)] transition active:scale-95"
                aria-label="بحث"
              >
                <Search size={17} />
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-[#f8fafc] px-4 py-3 text-[14px] font-bold text-[#06142f] ring-1 ring-slate-200 transition hover:bg-white active:scale-[0.98]"
            >
              <SlidersHorizontal size={16} />
              الفلتر
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-[#f8fafc] px-4 py-3 text-[14px] font-bold text-[#06142f] ring-1 ring-slate-200 transition hover:bg-white active:scale-[0.98]"
            >
              <MapPinned size={16} />
              الخريطة
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-[#f8fafc] px-4 py-3 text-[14px] font-bold text-[#06142f] ring-1 ring-slate-200 transition hover:bg-white active:scale-[0.98]"
            >
              <LocateFixed size={16} />
              قريب مني
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-[#f8fafc] px-4 py-3 text-[14px] font-bold text-[#06142f] ring-1 ring-slate-200 transition hover:bg-white active:scale-[0.98]"
            >
              <Heart size={16} />
              المفضلة
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
