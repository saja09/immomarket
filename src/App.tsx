import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  MapPin,
  Phone,
  Ruler,
  ArrowRight,
  MessageCircle,
  User,
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
  price: string
  image: string
  description: string
}

type SavedUser = {
  fullName: string
  identifier: string
  password: string
}

const properties: Property[] = [
  {
    id: 1,
    title: "فيلا فاخرة بإطلالة مفتوحة",
    city: "الرباط",
    district: "حي الرياض",
    area: 320,
    price: "2,500,000 DH",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    description:
      "فيلا راقية بتصميم عصري، تشطيبات ممتازة، وإضاءة طبيعية قوية، وقريبة من مختلف الخدمات الأساسية.",
  },
  {
    id: 2,
    title: "شقة للبيع بتصميم عصري",
    city: "سلا",
    district: "بطانة",
    area: 96,
    price: "850,000 DH",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    description:
      "شقة حديثة ومريحة، مناسبة للسكن العائلي، بتوزيع داخلي ممتاز وموقع قريب من المرافق الضرورية.",
  },
  {
    id: 3,
    title: "شقة اقتصادية ومناسبة",
    city: "الخميسات",
    district: "وسط المدينة",
    area: 74,
    price: "540,000 DH",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    description:
      "شقة اقتصادية مناسبة للسكن أو الاستثمار، في حي هادئ وبقرب وسائل النقل والمحلات.",
  },
]

function normalizeArabic(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
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
  const userInitial =
    currentUser?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"

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
          <h1 className="text-[30px] font-black tracking-tight text-[#06142f]">
            ImmoMarket
          </h1>

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
  onOpen,
}: {
  property: Property
  onOpen: (property: Property) => void
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <button
        type="button"
        onClick={() => onOpen(property)}
        className="block w-full text-right"
      >
        <img
          src={property.image}
          alt={property.title}
          className="h-[230px] w-full object-cover transition active:scale-[0.99]"
        />
      </button>

      <div className="p-5 text-right">
        <h3 className="text-[21px] font-extrabold leading-snug text-[#06142f]">
          {property.title}
        </h3>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
            <Ruler size={18} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[11px] font-bold text-slate-400">المساحة</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">
              {property.area} m²
            </p>
          </div>

          <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
            <MapPin size={18} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[11px] font-bold text-slate-400">الحي</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">
              {property.district}
            </p>
          </div>

          <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
            <Building2 size={18} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[11px] font-bold text-slate-400">المدينة</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">
              {property.city}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpen(property)}
            className="rounded-full bg-[#06142f] px-5 py-3 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(6,20,47,0.14)]"
          >
            التفاصيل
          </button>

          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400">السعر</p>
            <p className="text-[28px] font-black leading-none text-[#2563eb]">
              {property.price}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

function PropertyDetails({
  property,
  onBack,
}: {
  property: Property
  onBack: () => void
}) {
  return (
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
        <img
          src={property.image}
          alt={property.title}
          className="h-[260px] w-full object-cover"
        />

        <div className="p-5 text-right">
          <h2 className="text-[28px] font-black leading-tight text-[#06142f]">
            {property.title}
          </h2>

          <p className="mt-3 text-[34px] font-black text-[#2563eb]">
            {property.price}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
              <Ruler size={18} className="mx-auto mb-2 text-slate-500" />
              <p className="text-[11px] font-bold text-slate-400">المساحة</p>
              <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">
                {property.area} m²
              </p>
            </div>

            <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
              <MapPin size={18} className="mx-auto mb-2 text-slate-500" />
              <p className="text-[11px] font-bold text-slate-400">الحي</p>
              <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">
                {property.district}
              </p>
            </div>

            <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
              <Building2 size={18} className="mx-auto mb-2 text-slate-500" />
              <p className="text-[11px] font-bold text-slate-400">المدينة</p>
              <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">
                {property.city}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
            <p className="text-[13px] font-bold text-slate-400">الوصف</p>
            <p className="mt-2 text-[16px] leading-8 text-[#06142f]">
              {property.description}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/212678927276"
              className="flex items-center justify-center gap-2 rounded-full bg-[#22c55e] px-4 py-3 text-[15px] font-bold text-white"
            >
              <MessageCircle size={18} />
              واتساب
            </a>

            <a
              href="tel:+212678927276"
              className="flex items-center justify-center gap-2 rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
            >
              <Phone size={18} />
              اتصال
            </a>
          </div>
        </div>
      </article>
    </main>
  )
}

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [currentPage, setCurrentPage] = useState<"home" | "login" | "profile">("home")
  const [currentUser, setCurrentUser] = useState<SavedUser | null>(null)
  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("immomarket_current_user")
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem("immomarket_current_user")
      }
    }
  }, [])

  const handleAuthSuccess = (user: SavedUser) => {
    setCurrentUser(user)
    localStorage.setItem("immomarket_current_user", JSON.stringify(user))
    setCurrentPage("home")
  }

  const handleSearch = () => {
    setAppliedQuery(query.trim())
    setSelectedProperty(null)
  }

  const filteredProperties = useMemo(() => {
    if (!appliedQuery.trim()) return properties

    const normalizedQuery = normalizeArabic(appliedQuery)

    return properties.filter((property) => {
      const searchableText = normalizeArabic(
        [
          property.title,
          property.city,
          property.district,
          property.description,
          property.area.toString(),
          property.price,
        ].join(" ")
      )

      return searchableText.includes(normalizedQuery)
    })
  }, [appliedQuery])

  if (currentPage === "login") {
    return (
      <Login
        onBack={() => setCurrentPage("home")}
        onAuthSuccess={handleAuthSuccess}
      />
    )
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
          onBack={() => setSelectedProperty(null)}
        />
      ) : (
        <>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
          />

          <main className="mx-auto mt-8 max-w-md px-4 pb-16">
            <h2 className="mb-5 text-right text-[34px] font-black tracking-tight text-[#06142f]">
              العقارات المتوفرة
            </h2>

            {appliedQuery && (
              <p className="mb-4 text-right text-[14px] font-bold text-slate-500">
                نتائج البحث عن: {appliedQuery}
              </p>
            )}

            {filteredProperties.length === 0 ? (
              <div className="rounded-[24px] bg-white p-6 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-[18px] font-black text-[#06142f]">
                  لا توجد عقارات مطابقة
                </p>
                <p className="mt-2 text-[14px] font-bold text-slate-500">
                  حاول بكلمات أخرى مثل: الرباط، شقة، سلا، حي الرياض...
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
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
