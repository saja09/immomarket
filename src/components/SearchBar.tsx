import { useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  districts: string[]
  propertyTypes: string[]
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  districts,
  propertyTypes,
}: SearchBarProps) {
  const [showFilter, setShowFilter] = useState(false)
  const [district, setDistrict] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [supportType, setSupportType] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const city = "سيدي علال البحراوي"

  const filterQuery = useMemo(() => {
    const parts: string[] = []

    if (propertyType) parts.push(propertyType)
    parts.push(`في ${city}`)
    if (district) parts.push(`حي ${district}`)

    if (minPrice && maxPrice) {
      parts.push(`ما بين ${minPrice} و ${maxPrice} مليون`)
    } else if (minPrice) {
      parts.push(`فوق ${minPrice} مليون`)
    } else if (maxPrice) {
      parts.push(`حتى ${maxPrice} مليون`)
    }

    if (supportType === "100000") parts.push("دعم 10 مليون")
    if (supportType === "70000") parts.push("دعم 7 مليون")
    if (supportType === "0") parts.push("بلا دعم")

    return parts.join(" ")
  }, [city, district, propertyType, supportType, minPrice, maxPrice])

  function applyFilter() {
    onChange(filterQuery)
    setShowFilter(false)
    setTimeout(() => onSearch(), 50)
  }

  function resetFilter() {
    setDistrict("")
    setPropertyType("")
    setSupportType("")
    setMinPrice("")
    setMaxPrice("")
    onChange("")
    setTimeout(() => onSearch(), 50)
  }

  return (
    <section className="mx-auto mt-6 max-w-md px-4">
      <div className="rounded-[28px] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilter((v) => !v)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f8fafc] text-[#06142f] shadow-sm ring-1 ring-slate-200 transition active:scale-95"
            aria-label="الفلتر"
          >
            <SlidersHorizontal size={20} />
          </button>

          <div className="relative flex-1">
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onClick={() => setShowFilter(true)}
              onFocus={() => setShowFilter(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch()
              }}
              type="text"
              placeholder="ابحث عن عقار..."
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

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="col-span-2">
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
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[14px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                >
                  <option value="">جميع الأحياء</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  نوع العقار
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[14px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                >
                  <option value="">جميع الأنواع</option>
                  {propertyTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  الثمن من
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="بالمليون"
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[14px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  الثمن إلى
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="بالمليون"
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[14px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-2 block text-[13px] font-black text-slate-500">
                  الدعم
                </label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 text-right text-[14px] font-bold text-[#06142f] outline-none ring-1 ring-slate-200"
                >
                  <option value="">جميع العقارات</option>
                  <option value="100000">دعم 10 مليون</option>
                  <option value="70000">دعم 7 مليون</option>
                  <option value="0">بلا دعم</option>
                </select>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={applyFilter}
                  className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-black text-white shadow-[0_10px_20px_rgba(6,20,47,0.18)]"
                >
                  تطبيق
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
      </div>
    </section>
  )
}
