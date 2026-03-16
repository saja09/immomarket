import { useMemo, useState } from "react"
import { Search, MapPin, Heart } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  districts: string[]
  propertyTypes: string[]
  onOpenMap?: () => void
  currentUser?: any
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  districts,
  propertyTypes,
  onOpenMap = () => {},
  currentUser
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

      <div className="rounded-[28px] bg-white px-4 py-4 shadow ring-1 ring-slate-200">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={onOpenMap}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8fafc] text-[#06142f] ring-1 ring-slate-200"
          >
            <MapPin size={20} />
          </button>

          <div className="relative flex-1">

            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onClick={() => setShowFilter(true)}
              onFocus={() => setShowFilter(true)}
              type="text"
              placeholder="ابحث عن مدينة، حي، شقة..."
              className="h-12 w-full rounded-full bg-[#f8fafc] pr-5 pl-16 text-right outline-none ring-1 ring-slate-200"
            />

            <div className="absolute left-2 top-1/2 -translate-y-1/2">

              <button
                type="button"
                onClick={onSearch}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#06142f] text-white"
              >
                <Search size={17} />
              </button>

            </div>

          </div>

        </div>

        {showFilter && (

          <div className="mt-4 rounded-[24px] bg-[#f8fafc] p-4 ring-1 ring-slate-200">

            <div className="mb-4 flex items-center justify-between">

              <h3 className="text-[16px] font-black text-[#06142f]">
                فلتر البحث
              </h3>

              <button
                onClick={() => setShowFilter(false)}
                className="rounded-full px-3 py-1 text-[13px] font-bold text-slate-500 ring-1 ring-slate-200"
              >
                إغلاق
              </button>

            </div>

            {currentUser && (

              <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 font-bold">

                المفضلة
                <Heart size={18} />

              </button>

            )}

            <div className="grid grid-cols-2 gap-3 text-right">

              <div className="col-span-2">
                <label className="text-[13px] font-bold text-slate-500">
                  المدينة
                </label>

                <input
                  value={city}
                  readOnly
                  className="h-12 w-full rounded-2xl bg-white px-4 ring-1 ring-slate-200"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-500">
                  الحي
                </label>

                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 ring-1 ring-slate-200"
                >
                  <option value="">جميع الأحياء</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-500">
                  نوع العقار
                </label>

                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 ring-1 ring-slate-200"
                >
                  <option value="">جميع الأنواع</option>
                  {propertyTypes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-500">
                  الثمن من
                </label>

                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 ring-1 ring-slate-200"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-500">
                  الثمن إلى
                </label>

                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-white px-4 ring-1 ring-slate-200"
                />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3">

                <button
                  onClick={applyFilter}
                  className="rounded-full bg-[#06142f] py-3 font-bold text-white"
                >
                  تطبيق
                </button>

                <button
                  onClick={resetFilter}
                  className="rounded-full border border-slate-200 py-3 font-bold"
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
