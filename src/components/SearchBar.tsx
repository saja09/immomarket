import { useMemo, useState } from "react"
import {
  Search,
  Plus,
  SlidersHorizontal,
  MapPinned,
  LocateFixed,
  Heart,
} from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
}

const DISTRICTS = [
  "حي الأمل",
  "حي النهضة",
  "حي الفتح",
  "حي السعادة",
  "حي المسيرة",
  "وسط المدينة",
  "قرب السوق الأسبوعي",
  "قرب الطريق الوطنية",
  "قرب الطريق السيار",
]

export default function SearchBar({
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const [district, setDistrict] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const city = "سيدي علال البحراوي"

  const filterSummary = useMemo(() => {
    const parts: string[] = ["في سيدي علال البحراوي"]

    if (district) parts.push(`حي ${district}`)

    if (minPrice && maxPrice) {
      parts.push(`ما بين ${minPrice} و ${maxPrice} مليون`)
    } else if (minPrice) {
      parts.push(`فوق ${minPrice} مليون`)
    } else if (maxPrice) {
      parts.push(`حتى ${maxPrice} مليون`)
    }

    return parts.join(" ")
  }, [district, minPrice, maxPrice])

  function applyFilter() {
    onChange(filterSummary)
    setShowFilter(false)
    setOpen(false)
    setTimeout(() => onSearch(), 50)
  }

  function resetFilter() {
    setDistrict("")
    setMinPrice("")
    setMaxPrice("")
    onChange("")
  }

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
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setShowFilter(true)}
              onClick={() => setShowFilter(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch()
              }}
              type="text"
              placeholder="ابحث عن مدينة، حي، شقة..."
              className="h-12 w-full rounded-full bg-[#f8fafc] pr-5 pl-16 text-right text-[16px] font-medium text-[#06142f] outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white"
            />

            <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <button
                type="button"
                onClick={onSearch}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#06142f] text-white shadow-[0_10px_20px_rgba(6,20,47,0.18)] transition active:scale-95"
                aria-label="بحث"
              >
                <Search size={17} />
              </button>
            </div>
          </div>
        </div>

        {showFilter && (
          <div className="mt-4 rounded-[24px] bg-[#f8fafc] p-4 ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-[#06142f]">فلتر البحث</h3>
              <button
                type="button"
                onClick={() => setShowFilter(false)}
                className="rounded-full px-3 py-1 text-[13px] font-bold text-slate-500 ring-1 ring-slate-200"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-4 text-right">
              <div>
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  المدينة
                </label>
                <input
                  value={city}
                  readOnly
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[15px] font-bold text-[#06142f] ring-1 ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  الحي
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[15px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                >
                  <option value="">جميع الأحياء</option>
                  {DISTRICTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  الثمن بالمليون
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="من"
                    className="h-12 rounded-2xl bg-white px-4 text-right text-[15px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    className="h-12 rounded-2xl bg-white px-4 text-right text-[15px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={applyFilter}
                  className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-black text-white shadow-[0_10px_20px_rgba(6,20,47,0.18)]"
                >
                  تطبيق الفلتر
                </button>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="rounded-full bg-white px-4 py-3 text-[15px] font-black text-[#06142f] ring-1 ring-slate-200"
                >
                  مسح
                </button>
              </div>
            </div>
          </div>
        )}

        {open && (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setShowFilter(true)}
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
