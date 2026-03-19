import { useEffect, useMemo, useRef, useState } from "react"
import {
  Building2,
  MapPin,
  Phone,
  Ruler,
  ArrowRight,
  MessageCircle,
  User,
  BedDouble,
  Bath,
  ChefHat,
} from "lucide-react"
import SearchBar from "./components/SearchBar"
import Login from "./pages/Login"
import Profile from "./pages/Profile"

type Property = {
  id: number
  title: string
  city: string
  district: string
  area: number
  rooms: number
  bathrooms: number
  kitchens: number
  price: string
  image: string
  gallery: string[]
  description: string
  amenities?: string[]
  equippedKitchen?: boolean
  nearMosque?: boolean
  nearSchool?: boolean
  supportDh?: number | null
}

type SavedUser = {
  fullName: string
  identifier: string
  password: string
}

type SortMode = "cheap" | "luxury" | "best" | null

type ParsedSearch = {
  raw: string
  normalized: string
  propertyType: "شقة" | "فيلا" | "منزل" | "استوديو" | null
  city: string | null
  district: string | null
  minPriceDh: number | null
  maxPriceDh: number | null
  maxArea: number | null
  minArea: number | null
  sortMode: SortMode
  supportDh: number | null
  explanation: string[]
}

const STORAGE_KEY = "immomarket_admin_properties"

const seedProperties: Property[] = [
  {
    id: 1,
    title: "شقة اقتصادية مناسبة",
    city: "سيدي علال البحراوي",
    district: "حي الأمل",
    area: 62,
    rooms: 2,
    bathrooms: 1,
    kitchens: 1,
    price: "430,000 DH",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    description: "شقة مناسبة للسكن الأول، قريبة من الخدمات اليومية وفي موقع هادئ.",
    amenities: ["حي هادئ", "قرب الخدمات اليومية"],
    equippedKitchen: true,
    nearMosque: true,
    nearSchool: true,
    supportDh: 100000,
  },
  {
    id: 2,
    title: "شقة عائلية بتشطيب جيد",
    city: "سيدي علال البحراوي",
    district: "حي النهضة",
    area: 78,
    rooms: 3,
    bathrooms: 2,
    kitchens: 1,
    price: "520,000 DH",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    description: "شقة مريحة للعائلة، بتوزيع زوين وقريبة للطريق الوطنية.",
    amenities: ["قرب الطريق الوطنية", "تشطيب جيد"],
    equippedKitchen: true,
    nearMosque: true,
    nearSchool: false,
    supportDh: 70000,
  },
]

function formatDh(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} DH`
}

function priceStringToDh(price: string) {
  const digits = price.replace(/[^\d]/g, "")
  return Number(digits || 0)
}

function getHousingSupportDh(supportDh: number | null | undefined) {
  if (supportDh === null || supportDh === undefined) return null
  const value = Number(supportDh)
  if (isNaN(value)) return null
  return value
}

function getNetPriceDh(priceDh: number, supportDh: number | null | undefined) {
  return Math.max(0, priceDh - Number(getHousingSupportDh(supportDh) || 0))
}

function normalizeArabic(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/گ/g, "ك")
    .replace(/ڤ/g, "ف")
    .replace(/چ/g, "ج")
    .replace(/[^\u0600-\u06FF0-9a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
}

function detectPropertyType(property: Property): "شقة" | "فيلا" | "منزل" | "استوديو" {
  const n = normalizeArabic(property.title + " " + property.description)
  if (n.includes("فيلا") || n.includes("villa")) return "فيلا"
  if (n.includes("استوديو") || n.includes("studio")) return "استوديو"
  if (n.includes("منزل") || n.includes("دار") || n.includes("بيت")) return "منزل"
  return "شقة"
}

function getPropertyFeatures(property: Property) {
  const items: string[] = []
  if (property.equippedKitchen) items.push("مطبخ مجهز")
  if (property.nearMosque) items.push("قرب المسجد")
  if (property.nearSchool) items.push("قرب المدرسة")
  if (property.amenities?.length) {
    property.amenities.forEach((item) => {
      if (item?.trim()) items.push(item.trim())
    })
  }
  return Array.from(new Set(items))
}

function getVisibleProperties(): Property[] {
  try {
    if (typeof window === "undefined") return seedProperties
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedProperties

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return seedProperties

    const visible = parsed.filter((item: any) => item && !item.hidden && item.status !== "sold")
    if (visible.length === 0) return seedProperties

    return visible.map((item: any, index: number) => {
      const fallback = seedProperties[index % seedProperties.length] || seedProperties[0]
      const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : []
      const image = item.image || gallery[0] || fallback.image
      const priceDh = Number(item.priceDh || item.price?.replace?.(/[^\d]/g, "") || 0)

      return {
        id: item.id ?? Date.now() + index,
        title: item.title || fallback.title,
        city: item.city || fallback.city,
        district: item.district || fallback.district,
        area: Number(item.area || fallback.area || 0),
        rooms: Number(item.rooms || fallback.rooms || 0),
        bathrooms: Number(item.bathrooms || fallback.bathrooms || 0),
        kitchens: Number(item.kitchens || fallback.kitchens || 0),
        price: `DH ${new Intl.NumberFormat("fr-FR").format(priceDh)}`,
        image,
        gallery: gallery.length ? gallery : [image],
        description: item.description || fallback.description,
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
        equippedKitchen: Boolean(item.equippedKitchen),
        nearMosque: Boolean(item.nearMosque),
        nearSchool: Boolean(item.nearSchool),
        supportDh: Number(item.supportDh || 0),
      }
    })
  } catch {
    return seedProperties
  }
}

function parseSmartQuery(query: string): ParsedSearch {
  return {
    raw: query,
    normalized: normalizeArabic(query),
    propertyType: null,
    city: null,
    district: null,
    minPriceDh: null,
    maxPriceDh: null,
    minArea: null,
    maxArea: null,
    sortMode: null,
    supportDh: null,
    explanation: [],
  }
}

function filterPropertiesList(list: Property[], _parsedSearch: ParsedSearch, rawQuery: string) {
  if (!rawQuery.trim()) return list
  const q = normalizeArabic(rawQuery)

  return list.filter((property) =>
    normalizeArabic(
      [
        property.title,
        property.city,
        property.district,
        property.description,
        ...(property.amenities || []),
      ].join(" ")
    ).includes(q)
  )
}

function Header({
  currentUser,
  onLogin,
  onProfile,
}: {
  currentUser: SavedUser | null
  onLogin: () => void
  onProfile: () => void
}) {
  const userInitial = currentUser?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"

  return (
    <header className="mx-auto mt-4 max-w-md px-4">
      <div className="flex items-center justify-between rounded-[28px] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        {currentUser ? (
          <button
            type="button"
            onClick={onProfile}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-[15px] font-bold text-[#06142f]"
          >
            <User size={16} />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#06142f] text-[14px] font-black text-white">
              {userInitial}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-[15px] font-bold text-[#06142f]"
          >
            <User size={18} />
            الدخول
          </button>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-[30px] font-black tracking-tight text-[#06142f]">ImmoMarket</h1>
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#06142f] to-[#0a2b63] shadow">
            <span className="text-[18px] font-black text-white">IM</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function PropertyCard({
  property,
  index,
  onOpen,
}: {
  property: Property
  index: number
  onOpen: (property: Property) => void
}) {
  const supportDh = getHousingSupportDh(property.supportDh)

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <button type="button" onClick={() => onOpen(property)} className="block w-full text-right">
        <div className="relative">
          <img
            src={property.image}
            alt={property.title}
            className="h-[230px] w-full object-cover transition active:scale-[0.99]"
          />
          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-black text-white backdrop-blur">
            العقار رقم {index + 1}
          </div>
        </div>
      </button>

      <div className="p-5 text-right">
        <h3 className="text-[21px] font-extrabold leading-snug text-[#06142f]">{property.title}</h3>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
            <Ruler size={18} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[11px] font-bold text-slate-400">المساحة</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.area} m²</p>
          </div>

          <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
            <MapPin size={18} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[11px] font-bold text-slate-400">الحي</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.district}</p>
          </div>

          <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
            <Building2 size={18} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[11px] font-bold text-slate-400">المدينة</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.city}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[20px] bg-[#f8fafc] p-4 text-center ring-1 ring-slate-200">
          <p className="text-[11px] font-bold text-slate-400">الثمن الأصلي</p>
          <p className="mt-2 text-[34px] font-black tracking-tight text-[#2563eb]">{property.price}</p>

          {supportDh !== null && supportDh > 0 && (
            <p className="mt-2 text-[13px] font-black text-green-700">قيمة الدعم: {formatDh(supportDh)}</p>
          )}
        </div>
      </div>
    </article>
  )
}

function PropertyDetails({
  property,
  propertyNumber,
  onBack,
}: {
  property: Property
  propertyNumber: number
  onBack: () => void
}) {
  const priceDh = priceStringToDh(property.price)
  const supportDh = getHousingSupportDh(property.supportDh)
  const netPriceDh = getNetPriceDh(priceDh, property.supportDh)
  const featureItems = getPropertyFeatures(property)

  const propertyLink =
    typeof window !== "undefined" ? window.location.href : "رابط العقار غير متوفر"

  const bookingWhatsappMessage = encodeURIComponent(`السلام عليكم، بغيت نطلب موعد للحجز / الزيارة بخصوص هذا العقار.

رقم العقار: ${propertyNumber}
رابط العقار: ${propertyLink}
الاسم:
اليوم المناسب:
الوقت المناسب:`)

  const inquiryWhatsappMessage = encodeURIComponent(`السلام عليكم، عندي استفسار بخصوص هذا العقار.

رقم العقار: ${propertyNumber}
رابط العقار: ${propertyLink}
الاستفسار:
الاسم:`)

  const gallery =
    property.gallery && property.gallery.length > 0 ? property.gallery : [property.image]

  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAR, setShowAR] = useState(false)
  const [showVR, setShowVR] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const lastTapRef = useRef(0)

  useEffect(() => {
    setActiveIndex(0)
    setIsFullscreen(false)
  }, [property])

  const activeImage = gallery[activeIndex] || property.image

  const goToIndex = (index: number) => {
    if (index < 0) {
      setActiveIndex(gallery.length - 1)
      return
    }
    if (index >= gallery.length) {
      setActiveIndex(0)
      return
    }
    setActiveIndex(index)
  }

  const goNext = () => goToIndex(activeIndex + 1)
  const goPrev = () => goToIndex(activeIndex - 1)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].clientX
    touchEndX.current = e.changedTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const distance = touchStartX.current - touchEndX.current
    const minSwipe = 45
    if (Math.abs(distance) > minSwipe) {
      if (distance > 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const handleImageTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 280) {
      setIsFullscreen((prev) => !prev)
    }
    lastTapRef.current = now
  }

  return (
    <>
      <main className="mx-auto max-w-md px-4 pb-16 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-bold text-[#06142f] shadow"
        >
          <ArrowRight size={16} />
          رجوع
        </button>

        <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div
            className="relative h-[280px] w-full overflow-hidden bg-slate-100 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleImageTap}
          >
            <img
              key={activeImage}
              src={activeImage}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out"
              draggable={false}
            />

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-[18px] font-black text-[#06142f] shadow backdrop-blur"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-[18px] font-black text-[#06142f] shadow backdrop-blur"
                >
                  ›
                </button>
              </>
            )}

            <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">
              {activeIndex + 1} / {gallery.length}
            </div>

            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-black text-white backdrop-blur">
              العقار رقم {propertyNumber}
            </div>
          </div>

          <div className="px-4 pb-1 pt-4">
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {gallery.map((img, index) => {
                const isActive = activeIndex === index
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`shrink-0 overflow-hidden rounded-[18px] ring-2 transition-all duration-300 ${
                      isActive ? "scale-[1.02] ring-[#06142f]" : "opacity-80 ring-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${property.title}-${index + 1}`}
                      className="h-20 w-24 object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-5 pt-3 text-right">
            <h2 className="text-[28px] font-black leading-tight text-[#06142f]">{property.title}</h2>

            <div className="mt-4 rounded-[20px] bg-[#f8fafc] p-4 text-center ring-1 ring-slate-200">
              <p className="text-[13px] font-bold text-slate-400">الثمن الأصلي</p>
              <p className="mt-2 text-[34px] font-black tracking-tight text-[#2563eb]">{property.price}</p>

              {supportDh !== null && supportDh > 0 && (
                <p className="mt-2 text-[15px] font-black text-green-700">قيمة الدعم: {formatDh(supportDh)}</p>
              )}

              {netPriceDh !== priceDh && (
                <p className="mt-2 text-[14px] font-black text-[#06142f]">
                  الثمن بعد الدعم: {formatDh(netPriceDh)}
                </p>
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <Ruler size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-400">المساحة</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.area} m²</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <MapPin size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-400">الحي</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.district}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <Building2 size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-400">المدينة</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.city}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <BedDouble size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-400">الغرف</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.rooms}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <Bath size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-400">الحمامات</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.bathrooms}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <ChefHat size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-400">المطابخ</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{property.kitchens}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[13px] font-bold text-slate-400">الوصف</p>
              <p className="mt-2 text-[16px] leading-8 text-[#06142f]">{property.description}</p>
            </div>

            {featureItems.length > 0 && (
              <div className="mt-6 rounded-[24px] border border-[#e4e7ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-5 text-right">
                  <h3 className="text-[28px] font-black leading-tight text-[#06142f]">مميزات</h3>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {featureItems.map((item) => (
                    <div key={item} className="flex items-center justify-end gap-3 text-right">
                      <span className="text-[17px] font-bold text-[#06142f]">{item}</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-600 text-[15px] font-black text-emerald-600">
                        ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[13px] font-bold text-slate-400">الموقع</p>

              <div className="mt-3 overflow-hidden rounded-[18px]">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${property.title} ${property.district} ${property.city} Morocco`
                  )}&z=15&output=embed`}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${property.title} ${property.district} ${property.city} Morocco`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center rounded-full bg-[#2563eb] px-4 py-3 text-[15px] font-bold text-white"
              >
                فتح في Google Maps
              </a>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
              <div className="mb-4 text-right">
                <p className="text-[12px] font-black text-slate-400">التواصل</p>
                <h3 className="mt-1 text-[22px] font-black text-[#06142f]">اختر طريقة التواصل</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/212771455703?text=${bookingWhatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[22px] bg-[#16a34a] p-4 text-white shadow-[0_14px_30px_rgba(22,163,74,0.22)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                      <MessageCircle size={22} />
                    </span>
                    <div className="text-right">
                      <p className="text-[16px] font-black">طلب موعد</p>
                      <p className="mt-1 text-[12px] font-bold text-white/85">حجز أو زيارة العقار</p>
                    </div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/212771455703?text=${inquiryWhatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[22px] bg-[#22c55e] p-4 text-white shadow-[0_14px_30px_rgba(34,197,94,0.20)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                      <MessageCircle size={22} />
                    </span>
                    <div className="text-right">
                      <p className="text-[16px] font-black">استفسار</p>
                      <p className="mt-1 text-[12px] font-bold text-white/85">اسأل على التفاصيل</p>
                    </div>
                  </div>
                </a>
              </div>

              <a
                href="tel:0771455703"
                className="mt-3 flex items-center justify-between rounded-[22px] bg-[#06142f] px-5 py-4 text-white shadow-[0_14px_30px_rgba(6,20,47,0.18)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Phone size={22} />
                </span>
                <div className="text-right">
                  <p className="text-[17px] font-black">اتصال مباشر</p>
                  <p className="mt-1 text-[12px] font-bold text-white/75">تواصل هاتفي سريع</p>
                </div>
              </a>
            </div>
          </div>
        </article>
      </main>

      {showAR && (
        <div className="fixed inset-0 z-[1000] bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setShowAR(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-2 text-[14px] font-bold text-white backdrop-blur"
          >
            إغلاق
          </button>

          <div className="flex h-full w-full items-center justify-center">
            <iframe
              src="https://modelviewer.dev/editor/"
              title="AR Viewer"
              className="h-[85vh] w-full rounded-[24px] border-0 bg-white"
              allow="camera; microphone; xr-spatial-tracking; accelerometer; gyroscope"
            />
          </div>
        </div>
      )}

      {showVR && (
        <div className="fixed inset-0 z-[1000] bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setShowVR(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-2 text-[14px] font-bold text-white backdrop-blur"
          >
            إغلاق
          </button>

          <div className="flex h-full w-full items-center justify-center">
            <iframe
              src="https://momento360.com/e/u/6c5e9e47e1b94f3fa6e7a7cbb18ce19b?utm_campaign=embed&utm_source=other&heading=-12.86&pitch=-4.37&field-of-view=75&size=medium"
              title="VR Tour"
              className="h-[85vh] w-full rounded-[24px] border-0 bg-white"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {isFullscreen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsFullscreen(false)
            }}
            className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-[14px] font-bold text-white backdrop-blur"
          >
            إغلاق
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-[22px] font-black text-white backdrop-blur"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-[22px] font-black text-white backdrop-blur"
              >
                ›
              </button>
            </>
          )}

          <img
            src={activeImage}
            alt={property.title}
            className="max-h-full max-w-full object-contain"
            onClick={handleImageTap}
            draggable={false}
          />
        </div>
      )}
    </>
  )
}

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [currentPage, setCurrentPage] = useState<"home" | "login" | "profile">("home")
  const [currentUser, setCurrentUser] = useState<SavedUser | null>(null)
  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [allProperties, setAllProperties] = useState<Property[]>(seedProperties)

  useEffect(() => {
    const raw = localStorage.getItem("immomarket_current_user")
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem("immomarket_current_user")
      }
    }
    setAllProperties(getVisibleProperties())
  }, [])

  const handleAuthSuccess = (user: SavedUser) => {
    setCurrentUser(user)
    localStorage.setItem("immomarket_current_user", JSON.stringify(user))
    setCurrentPage("home")
  }

  const parsedSearch = useMemo(() => parseSmartQuery(appliedQuery), [appliedQuery])

  const filteredProperties = useMemo(() => {
    return filterPropertiesList(allProperties, parsedSearch, appliedQuery)
  }, [allProperties, parsedSearch, appliedQuery])

  const availableDistricts = useMemo(() => {
    const onlyCity = allProperties
      .filter((property) => property.city === "سيدي علال البحراوي")
      .map((property) => property.district)

    return Array.from(new Set(onlyCity))
  }, [allProperties])

  const availablePropertyTypes = useMemo(() => {
    return Array.from(new Set(allProperties.map((property) => detectPropertyType(property))))
  }, [allProperties])

  const handleSearch = () => {
    setAppliedQuery(query.trim())
    setSelectedProperty(null)
  }

  const selectedPropertyNumber = selectedProperty
    ? Math.max(
        1,
        filteredProperties.findIndex((property) => property.id === selectedProperty.id) + 1
      )
    : 1

  if (currentPage === "login") {
    return <Login onBack={() => setCurrentPage("home")} onAuthSuccess={handleAuthSuccess} />
  }

  if (currentPage === "profile" && currentUser) {
    return (
      <Profile
        user={currentUser}
        onBack={() => setCurrentPage("home")}
        onLogout={() => {
          localStorage.removeItem("immomarket_current_user")
          setCurrentUser(null)
          setCurrentPage("home")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f5fb] text-[#06142f]" dir="rtl">
      <Header
        currentUser={currentUser}
        onLogin={() => setCurrentPage("login")}
        onProfile={() => setCurrentPage("profile")}
      />

      {selectedProperty ? (
        <PropertyDetails
          property={selectedProperty}
          propertyNumber={selectedPropertyNumber}
          onBack={() => setSelectedProperty(null)}
        />
      ) : (
        <>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            districts={availableDistricts}
            propertyTypes={availablePropertyTypes}
          />

          <main className="mx-auto mt-5 max-w-md px-4 pb-16">
            <h2 className="mb-5 text-right text-[34px] font-black tracking-tight text-[#06142f]">
              العقارات المتوفرة
            </h2>

            {appliedQuery && (
              <div className="mb-4 rounded-[20px] bg-white p-4 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-[14px] font-black text-[#06142f]">الفلاتر المطبقة:</p>
                <p className="mt-2 text-[13px] font-bold text-slate-500">{appliedQuery}</p>
              </div>
            )}

            {filteredProperties.length === 0 ? (
              <div className="rounded-[24px] bg-white p-6 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-[18px] font-black text-[#06142f]">لا توجد عقارات مطابقة</p>
                <p className="mt-2 text-[14px] font-bold text-slate-500">
                  بدل الحي أو وسع شوية الثمن أو غير نوع الدعم.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    onOpen={setSelectedProperty}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}
