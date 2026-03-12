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
  explanation: string[]
}

const properties: Property[] = [
  {
    id: 1,
    title: "شقة اقتصادية مناسبة",
    city: "سيدي علال البحراوي",
    district: "حي الأمل",
    area: 62,
    price: "430,000 DH",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    description: "شقة مناسبة للسكن الأول، قريبة من الخدمات اليومية وفي موقع هادئ.",
  },
  {
    id: 2,
    title: "شقة عائلية بتشطيب جيد",
    city: "سيدي علال البحراوي",
    district: "حي النهضة",
    area: 78,
    price: "520,000 DH",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    description: "شقة مريحة للعائلة، بتوزيع زوين وقريبة للطريق الوطنية.",
  },
  {
    id: 3,
    title: "شقة حديثة للبيع",
    city: "سيدي علال البحراوي",
    district: "حي الفتح",
    area: 84,
    price: "610,000 DH",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    description: "شقة حديثة بتصميم عملي وموقع مناسب للتنقل نحو الرباط والخميسات.",
  },
  {
    id: 4,
    title: "استوديو صغير للاستثمار",
    city: "سيدي علال البحراوي",
    district: "وسط المدينة",
    area: 46,
    price: "320,000 DH",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    description: "استوديو مناسب للاستثمار أو السكن الفردي، قريب من الحركة التجارية.",
  },
  {
    id: 5,
    title: "فيلا واسعة بواجهة مفتوحة",
    city: "سيدي علال البحراوي",
    district: "حي السعادة",
    area: 240,
    price: "1,450,000 DH",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    description: "فيلا مناسبة لعائلة كبيرة، جو هادئ وقرب من الطريق السيار.",
  },
  {
    id: 6,
    title: "منزل مستقل قرب السوق الأسبوعي",
    city: "سيدي علال البحراوي",
    district: "قرب السوق الأسبوعي",
    area: 132,
    price: "890,000 DH",
    image:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
    description: "منزل مستقل في موقع مطلوب، قريب للسوق الأسبوعي والخدمات.",
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
    .replace(/گ/g, "ك")
    .replace(/ڤ/g, "ف")
    .replace(/چ/g, "ج")
    .replace(/[^\u0600-\u06FF0-9a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
}

function formatDh(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} DH`
}

function priceStringToDh(price: string) {
  const digits = price.replace(/[^\d]/g, "")
  return Number(digits || 0)
}

function millionCentimesToDh(value: number) {
  return value * 10000
}

const cityAliases: Record<string, string[]> = {
  "سيدي علال البحراوي": [
    "سيدي علال البحراوي",
    "سيدي علال",
    "البحراوي",
    "sidi allal bahraoui",
    "sidi allal el bahraoui",
  ],
}

const districtAliases: Record<string, string[]> = {
  "حي الأمل": ["حي الأمل", "الامل", "حي الامل"],
  "حي النهضة": ["حي النهضة", "النهضة"],
  "حي الفتح": ["حي الفتح", "الفتح"],
  "حي السعادة": ["حي السعادة", "السعادة"],
  "حي المسيرة": ["حي المسيرة", "المسيرة"],
  "وسط المدينة": ["وسط المدينة", "المدينة", "الوسط"],
  "قرب السوق الأسبوعي": ["قرب السوق الأسبوعي", "السوق الأسبوعي", "قرب السوق"],
  "قرب الطريق الوطنية": ["قرب الطريق الوطنية", "الطريق الوطنية"],
  "قرب الطريق السيار": ["قرب الطريق السيار", "الطريق السيار"],
}

const propertyTypeAliases: Record<"شقة" | "فيلا" | "منزل" | "استوديو", string[]> = {
  شقة: ["شقة", "شقه", "شقق", "appartement", "apartment"],
  فيلا: ["فيلا", "villa"],
  منزل: ["منزل", "دار", "بيت", "house", "maison"],
  استوديو: ["استوديو", "ستوديو", "studio"],
}

const cheapWords = ["ارخص", "رخيص", "الهوتة", "اقتصادي", "ثمن مناسب"]
const luxuryWords = ["افخم", "فاخر", "ارقى", "راقي", "فخم"]
const bestWords = ["احسن", "افضل", "مزيان", "زوين"]

const stopWords = [
  "في",
  "ف",
  "فال",
  "من",
  "الى",
  "بين",
  "ما",
  "مابين",
  "المدينة",
  "الحي",
  "الثمن",
  "السعر",
  "مليون",
  "ملايين",
  "درهم",
  "dh",
  "متر",
  "مربع",
  "حتى",
  "فوق",
  "تحت",
]

function includesAny(normalizedQuery: string, words: string[]) {
  return words.some((word) => normalizedQuery.includes(normalizeArabic(word)))
}

function extractCanonicalValue(
  normalizedQuery: string,
  aliasesMap: Record<string, string[]>
) {
  for (const [canonical, aliases] of Object.entries(aliasesMap)) {
    for (const alias of aliases) {
      if (normalizedQuery.includes(normalizeArabic(alias))) {
        return canonical
      }
    }
  }
  return null
}

function parseSmartQuery(query: string): ParsedSearch {
  const normalized = normalizeArabic(query)
  const explanation: string[] = []

  let propertyType: "شقة" | "فيلا" | "منزل" | "استوديو" | null = null
  const detectedPropertyType = extractCanonicalValue(normalized, propertyTypeAliases)

  if (
    detectedPropertyType === "شقة" ||
    detectedPropertyType === "فيلا" ||
    detectedPropertyType === "منزل" ||
    detectedPropertyType === "استوديو"
  ) {
    propertyType = detectedPropertyType
    explanation.push(`نوع العقار: ${propertyType}`)
  }

  const city = extractCanonicalValue(normalized, cityAliases)
  if (city) explanation.push(`المدينة: ${city}`)

  const district = extractCanonicalValue(normalized, districtAliases)
  if (district) explanation.push(`الحي: ${district}`)

  let sortMode: SortMode = null
  if (includesAny(normalized, cheapWords)) {
    sortMode = "cheap"
    explanation.push("الترتيب: الأرخص أولاً")
  } else if (includesAny(normalized, luxuryWords)) {
    sortMode = "luxury"
    explanation.push("الترتيب: الأفخم / الأرقى أولاً")
  } else if (includesAny(normalized, bestWords)) {
    sortMode = "best"
    explanation.push("الترتيب: الأحسن أولاً")
  }

  let minPriceDh: number | null = null
  let maxPriceDh: number | null = null

  const betweenMillionMatch =
    normalized.match(/(?:ما ?بين|بين)\s*(\d+)\s*(?:و|الى|الي|حتى|-)\s*(\d+)\s*(?:مليون|ملايين)?/) ||
    normalized.match(/(\d+)\s*(?:و|الى|الي|حتى|-)\s*(\d+)\s*(?:مليون|ملايين)/)

  if (betweenMillionMatch) {
    const first = Number(betweenMillionMatch[1])
    const second = Number(betweenMillionMatch[2])
    minPriceDh = millionCentimesToDh(Math.min(first, second))
    maxPriceDh = millionCentimesToDh(Math.max(first, second))
    explanation.push(
      `الثمن: بين ${formatDh(minPriceDh)} و ${formatDh(maxPriceDh)}`
    )
  } else {
    const lessThanMillionMatch =
      normalized.match(/(?:اقل من|تحت|دون|حتى)\s*(\d+)\s*(?:مليون|ملايين)?/)
    const moreThanMillionMatch =
      normalized.match(/(?:اكثر من|فوق)\s*(\d+)\s*(?:مليون|ملايين)?/)

    if (lessThanMillionMatch) {
      maxPriceDh = millionCentimesToDh(Number(lessThanMillionMatch[1]))
      explanation.push(`الثمن الأقصى: ${formatDh(maxPriceDh)}`)
    } else if (moreThanMillionMatch) {
      minPriceDh = millionCentimesToDh(Number(moreThanMillionMatch[1]))
      explanation.push(`الثمن الأدنى: ${formatDh(minPriceDh)}`)
    }
  }

  return {
    raw: query,
    normalized,
    propertyType,
    city,
    district,
    minPriceDh,
    maxPriceDh,
    minArea: null,
    maxArea: null,
    sortMode,
    explanation,
  }
}

function filterPropertiesList(list: Property[], parsedSearch: ParsedSearch, rawQuery: string) {
  if (!rawQuery.trim()) return list

  const filtered = list.filter((property) => {
    const propertyPriceDh = priceStringToDh(property.price)
    const normalizedTitle = normalizeArabic(property.title)
    const normalizedCity = normalizeArabic(property.city)
    const normalizedDistrict = normalizeArabic(property.district)
    const normalizedDescription = normalizeArabic(property.description)

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

    if (parsedSearch.propertyType) {
      const aliases = propertyTypeAliases[parsedSearch.propertyType].map(normalizeArabic)
      const matchType = aliases.some(
        (alias) =>
          normalizedTitle.includes(alias) || normalizedDescription.includes(alias)
      )
      if (!matchType) return false
    }

    if (parsedSearch.city) {
      if (!normalizedCity.includes(normalizeArabic(parsedSearch.city))) return false
    }

    if (parsedSearch.district) {
      if (!normalizedDistrict.includes(normalizeArabic(parsedSearch.district))) return false
    }

    if (parsedSearch.minPriceDh !== null && propertyPriceDh < parsedSearch.minPriceDh) {
      return false
    }

    if (parsedSearch.maxPriceDh !== null && propertyPriceDh > parsedSearch.maxPriceDh) {
      return false
    }

    const tokens = parsedSearch.normalized
      .split(" ")
      .filter(Boolean)
      .filter((token) => !stopWords.includes(token) && !/^\d+$/.test(token))

    if (tokens.length > 0) {
      return tokens.every((token) => searchableText.includes(token))
    }

    return true
  })

  if (parsedSearch.sortMode === "cheap") {
    return [...filtered].sort((a, b) => priceStringToDh(a.price) - priceStringToDh(b.price))
  }

  if (parsedSearch.sortMode === "luxury") {
    return [...filtered].sort((a, b) => priceStringToDh(b.price) - priceStringToDh(a.price))
  }

  if (parsedSearch.sortMode === "best") {
    return [...filtered].sort((a, b) => b.area - a.area)
  }

  return filtered
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

  const parsedSearch = useMemo(() => parseSmartQuery(appliedQuery), [appliedQuery])

  const filteredProperties = useMemo(() => {
    return filterPropertiesList(properties, parsedSearch, appliedQuery)
  }, [parsedSearch, appliedQuery])

  const handleSearch = () => {
    setAppliedQuery(query.trim())
    setSelectedProperty(null)
  }

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

          <main className="mx-auto mt-5 max-w-md px-4 pb-16">
            <h2 className="mb-5 text-right text-[34px] font-black tracking-tight text-[#06142f]">
              العقارات المتوفرة
            </h2>

            {appliedQuery && (
              <div className="mb-4 rounded-[20px] bg-white p-4 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-[14px] font-black text-[#06142f]">
                  فهمت البحث هكذا:
                </p>

                {parsedSearch.explanation.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {parsedSearch.explanation.map((item, index) => (
                      <p key={index} className="text-[13px] font-bold text-slate-500">
                        • {item}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] font-bold text-slate-500">
                    نتائج البحث عن: {appliedQuery}
                  </p>
                )}
              </div>
            )}

            {filteredProperties.length === 0 ? (
              <div className="rounded-[24px] bg-white p-6 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-[18px] font-black text-[#06142f]">
                  لا توجد عقارات مطابقة
                </p>
                <p className="mt-2 text-[14px] font-bold text-slate-500">
                  بدل الحي أو وسع شوية الثمن، وغادي تبان ليك النتائج.
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
