import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  MapPin,
  Phone,
  Ruler,
  ArrowRight,
  MessageCircle,
  User,
  Bot,
  Volume2,
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
  الرباط: ["الرباط", "رباط", "rabat"],
  سلا: ["سلا", "sale", "salé"],
  الخميسات: ["الخميسات", "خميسات", "khemisset", "khemissat"],
}

const districtAliases: Record<string, string[]> = {
  "حي الرياض": ["حي الرياض", "الرياض", "hay riad", "riad"],
  بطانة: ["بطانة", "بطانه", "bettana"],
  "وسط المدينة": ["وسط المدينة", "وسط المدينه", "centre ville", "center"],
}

const propertyTypeAliases: Record<"شقة" | "فيلا" | "منزل" | "استوديو", string[]> = {
  شقة: ["شقة", "شقه", "شقق", "appartement", "apartment", "apt"],
  فيلا: ["فيلا", "villa", "villas"],
  منزل: ["دار", "منزل", "بيت", "maison", "house", "home"],
  استوديو: ["ستوديو", "استوديو", "studio"],
}

const cheapWords = [
  "ارخص",
  "رخيص",
  "رخيصة",
  "رخاص",
  "الهوتة",
  "هوتة",
  "الهوتات",
  "هوتات",
  "ثمن مناسب",
  "اقتصادي",
  "اقتصادية",
  "جيبلي الهوتات",
  "جيبلي الهوتات لعندك",
]

const luxuryWords = [
  "افخم",
  "فخم",
  "فاخر",
  "فاخرة",
  "ارقى",
  "راقي",
  "راقية",
  "طوب",
  "luxury",
  "premium",
]

const bestWords = [
  "احسن",
  "أفضل",
  "افضل",
  "مزيان",
  "زوين",
  "top",
  "ممتاز",
  "ممتازه",
]

const stopWords = [
  "اريد",
  "أريد",
  "ابحت",
  "أبحث",
  "ابحث",
  "بغيت",
  "بغينا",
  "عطيني",
  "عطي",
  "عرض",
  "عرضلي",
  "عرضليا",
  "اعرض",
  "اعرضلي",
  "اعرضليا",
  "وريني",
  "وري",
  "جيب",
  "جيبلي",
  "جيبليا",
  "دبر",
  "دبرلي",
  "دبرليا",
  "قلب",
  "قلبلي",
  "قلبليا",
  "كنقلب",
  "كنقلبو",
  "على",
  "في",
  "فال",
  "ف",
  "ديال",
  "ل",
  "لي",
  "ليا",
  "عندي",
  "شنو",
  "واش",
  "ما",
  "بين",
  "مابين",
  "الى",
  "الي",
  "حتى",
  "اقل",
  "اكثر",
  "من",
  "فوق",
  "تحت",
  "دون",
  "بحدود",
  "حدود",
  "تقريبا",
  "حوالي",
  "في حي",
  "حي",
  "مليون",
  "ملايين",
  "درهم",
  "dh",
  "متر",
  "مترمربع",
  "مربع",
  "سنتيم",
  "سنتيمات",
  "ميزانيتي",
  "الثمن",
  "السعر",
  "بثمن",
  "ارخص",
  "رخيص",
  "رخيصة",
  "الهوتة",
  "هوتة",
  "الهوتات",
  "هوتات",
  "افخم",
  "فخم",
  "فاخر",
  "فاخرة",
  "ارقى",
  "راقي",
  "راقية",
  "طوب",
  "احسن",
  "افضل",
  "أفضل",
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
      `الثمن: بين ${formatDh(minPriceDh)} و ${formatDh(maxPriceDh)} (تم التحويل من السنتيم)`
    )
  } else {
    const lessThanMillionMatch =
      normalized.match(/(?:اقل من|ما يفوتش|ما تفوتش|تحت|دون|بحدود|في حدود|حدود|تقريبا|حوالي)\s*(\d+)\s*(?:مليون|ملايين)?/)

    const moreThanMillionMatch =
      normalized.match(/(?:اكثر من|فوق|فوق من|ابتداء من|بدايه من)\s*(\d+)\s*(?:مليون|ملايين)?/)

    const exactMillionMatch =
      normalized.match(/(?:بثمن|الثمن|السعر)?\s*(\d+)\s*(?:مليون|ملايين)/)

    if (lessThanMillionMatch) {
      maxPriceDh = millionCentimesToDh(Number(lessThanMillionMatch[1]))
      explanation.push(`الثمن الأقصى: ${formatDh(maxPriceDh)} (تم التحويل من السنتيم)`)
    } else if (moreThanMillionMatch) {
      minPriceDh = millionCentimesToDh(Number(moreThanMillionMatch[1]))
      explanation.push(`الثمن الأدنى: ${formatDh(minPriceDh)} (تم التحويل من السنتيم)`)
    } else if (exactMillionMatch) {
      const exactDh = millionCentimesToDh(Number(exactMillionMatch[1]))
      minPriceDh = exactDh
      maxPriceDh = exactDh
      explanation.push(`الثمن: ${formatDh(exactDh)} (تم التحويل من السنتيم)`)
    }
  }

  let minArea: number | null = null
  let maxArea: number | null = null

  const betweenAreaMatch =
    normalized.match(/(?:ما ?بين|بين)\s*(\d+)\s*(?:و|الى|الي|حتى|-)\s*(\d+)\s*(?:متر|متر مربع|مربع)?/)

  if (betweenAreaMatch) {
    minArea = Math.min(Number(betweenAreaMatch[1]), Number(betweenAreaMatch[2]))
    maxArea = Math.max(Number(betweenAreaMatch[1]), Number(betweenAreaMatch[2]))
    explanation.push(`المساحة: بين ${minArea} و ${maxArea} متر`)
  } else {
    const exactAreaMatch = normalized.match(/(\d+)\s*(?:متر|متر مربع|مربع)/)
    const lessAreaMatch =
      normalized.match(/(?:اقل من|ما يفوتش|ما تفوتش|تحت|دون|بحدود|في حدود|حدود|تقريبا|حوالي)\s*(\d+)\s*(?:متر|متر مربع|مربع)/)
    const moreAreaMatch =
      normalized.match(/(?:اكثر من|فوق|فوق من|ابتداء من)\s*(\d+)\s*(?:متر|متر مربع|مربع)/)

    if (lessAreaMatch) {
      maxArea = Number(lessAreaMatch[1])
      explanation.push(`المساحة القصوى: ${maxArea} متر`)
    } else if (moreAreaMatch) {
      minArea = Number(moreAreaMatch[1])
      explanation.push(`المساحة الدنيا: ${minArea} متر`)
    } else if (exactAreaMatch) {
      maxArea = Number(exactAreaMatch[1])
      minArea = Math.max(0, maxArea - 40)
      explanation.push(`المساحة: بين ${minArea} و ${maxArea} متر`)
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
    minArea,
    maxArea,
    sortMode,
    explanation,
  }
}

function buildAssistantReply(parsed: ParsedSearch) {
  const missing: string[] = []

  if (!parsed.propertyType) missing.push("نوع العقار")
  if (!parsed.city && !parsed.district) missing.push("المدينة أو الحي")
  if (parsed.minPriceDh === null && parsed.maxPriceDh === null) missing.push("الثمن التقريبي")

  if (parsed.explanation.length === 0) {
    return "سمعتك، ولكن ما زلت ما فهمتش البحث بشكل كافي. قولي ليا شنو نوع العقار، المدينة أو الحي، والثمن التقريبي."
  }

  const understood = parsed.explanation.join("، ")

  if (missing.length === 0) {
    return `فهمت بلي كتقلب على ${understood}. إذا هذا هو المطلوب ضغط على زر البحث. وإذا لا، قول ليا شنو خاصني نصحح.`
  }

  return `فهمت مبدئياً: ${understood}. باش نعطيك نتائج أدق، زيد عطيني ${missing.join("، ")}.`
}

function speakArabic(text: string) {
  if (!("speechSynthesis" in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "ar-MA"
  utterance.rate = 0.95
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
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
  const [assistantMessage, setAssistantMessage] = useState(
    "أنا المساعد العقاري ديالك. قول ليا شنو باغي: شقة، فيلا، المدينة، الحي، والثمن التقريبي."
  )

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

  const handleVoiceResult = (text: string) => {
    const parsed = parseSmartQuery(text)
    const reply = buildAssistantReply(parsed)
    setAssistantMessage(reply)
    speakArabic(reply)

    const unknownPhrases = JSON.parse(
      localStorage.getItem("immomarket_unknown_phrases") || "[]"
    )

    if (parsed.explanation.length === 0) {
      const next = [...unknownPhrases, text].slice(-50)
      localStorage.setItem("immomarket_unknown_phrases", JSON.stringify(next))
    }
  }

  const parsedSearch = useMemo(() => parseSmartQuery(appliedQuery), [appliedQuery])

  const filteredProperties = useMemo(() => {
    if (!appliedQuery.trim()) return properties

    const filtered = properties.filter((property) => {
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
        if (!normalizedCity.includes(normalizeArabic(parsedSearch.city))) {
          return false
        }
      }

      if (parsedSearch.district) {
        if (!normalizedDistrict.includes(normalizeArabic(parsedSearch.district))) {
          return false
        }
      }

      if (parsedSearch.minPriceDh !== null && propertyPriceDh < parsedSearch.minPriceDh) {
        return false
      }

      if (parsedSearch.maxPriceDh !== null && propertyPriceDh > parsedSearch.maxPriceDh) {
        return false
      }

      if (parsedSearch.minArea !== null && property.area < parsedSearch.minArea) {
        return false
      }

      if (parsedSearch.maxArea !== null && property.area > parsedSearch.maxArea) {
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
      return [...filtered].sort((a, b) => {
        const priceDiff = priceStringToDh(b.price) - priceStringToDh(a.price)
        if (priceDiff !== 0) return priceDiff
        return b.area - a.area
      })
    }

    if (parsedSearch.sortMode === "best") {
      return [...filtered].sort((a, b) => {
        const scoreA = priceStringToDh(a.price) + a.area * 5000
        const scoreB = priceStringToDh(b.price) + b.area * 5000
        return scoreB - scoreA
      })
    }

    return filtered
  }, [appliedQuery, parsedSearch])

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
            onVoiceResult={handleVoiceResult}
          />

          <main className="mx-auto mt-5 max-w-md px-4 pb-16">
            <div className="mb-5 rounded-[24px] bg-white p-4 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="mb-2 flex items-center justify-end gap-2">
                <Volume2 size={18} className="text-slate-500" />
                <Bot size={18} className="text-[#06142f]" />
              </div>

              <p className="text-[15px] font-bold leading-8 text-[#06142f]">
                {assistantMessage}
              </p>
            </div>

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
                  حاول مثلاً: ارخص شقة، فيلا راقية فالرباط، شقة في حي الرياض، أو قول ليا المدينة والثمن.
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
