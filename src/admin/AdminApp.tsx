import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import AdminLogin from "./AdminLogin"

type AdminSection =
  | "dashboard"
  | "properties"
  | "add-property"
  | "leads"
  | "visits"
  | "ads"
  | "controls"
  | "messages"
  | "sold"

type PropertyStatus = "available" | "negotiation" | "reserved" | "sold"

type AdminProperty = {
  id: number
  title: string
  city: string
  district: string
  area: number
  priceDh: number
  supportDh: number
  rooms: number
  bathrooms: number
  kitchens: number
  description: string
  amenities: string[]
  equippedKitchen: boolean
  nearMosque: boolean
  nearSchool: boolean
  image: string
  gallery: string[]
  video: string
  lat: string
  lng: string
  status: PropertyStatus
  hidden: boolean
  featured: boolean
  createdAt: string
}

type SidebarItem = {
  key: AdminSection
  title: string
  short: string
}

const STORAGE_KEY = "immomarket_admin_properties"

const sidebarItems: SidebarItem[] = [
  { key: "dashboard", title: "Dashboard", short: "الرئيسية" },
  { key: "add-property", title: "إضافة عقار", short: "جديد" },
  { key: "properties", title: "العقارات", short: "الإدارة" },
  { key: "leads", title: "الطلبات", short: "الزبناء" },
  { key: "visits", title: "الزيارات", short: "المتابعة" },
  { key: "ads", title: "الإشهارات", short: "الحملات" },
  { key: "messages", title: "الرسائل", short: "التواصل" },
  { key: "sold", title: "المباعة", short: "الأرشيف" },
  { key: "controls", title: "التحكم", short: "الواجهة" },
]

function formatDh(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} DH`
}

function statusLabel(status: PropertyStatus) {
  if (status === "available") return "متاح"
  if (status === "negotiation") return "تفاوض"
  if (status === "reserved") return "محجوز"
  return "مباع"
}

function safeReadProperties(): AdminProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProperties(list: AdminProperty[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function DesktopSidebar({
  section,
  onNavigate,
  onLogout,
}: {
  section: AdminSection
  onNavigate: (value: AdminSection) => void
  onLogout: () => void
}) {
  return (
    <aside className="hidden lg:flex lg:min-h-[calc(100vh-2rem)] lg:flex-col lg:rounded-[28px] lg:bg-[#06142f] lg:p-4 lg:text-white lg:shadow-[0_18px_45px_rgba(6,20,47,0.18)]">
      <div className="rounded-[22px] bg-white/10 p-4 text-right">
        <p className="text-[11px] font-bold text-slate-200">لوحة الإدارة</p>
        <h1 className="mt-2 text-[24px] font-black leading-tight">ImmoMarket</h1>
        <p className="mt-1 text-[12px] font-bold text-slate-300">Admin Panel</p>
      </div>

      <div className="mt-4 space-y-2">
        {sidebarItems.map((item) => {
          const active = section === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`w-full rounded-[16px] px-4 py-3 text-right transition ${
                active ? "bg-white text-[#06142f]" : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <p className="text-[15px] font-black">{item.title}</p>
              <p className={`mt-1 text-[11px] font-bold ${active ? "text-slate-500" : "text-slate-300"}`}>
                {item.short}
              </p>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto rounded-[16px] bg-white/10 px-4 py-3 text-[14px] font-black text-white"
      >
        تسجيل الخروج
      </button>
    </aside>
  )
}

function MobileHeader({
  section,
  onNavigate,
  onLogout,
}: {
  section: AdminSection
  onNavigate: (value: AdminSection) => void
  onLogout: () => void
}) {
  return (
    <div className="space-y-3 lg:hidden">
      <div className="rounded-[22px] bg-[#06142f] px-4 py-4 text-white shadow-[0_12px_30px_rgba(6,20,47,0.16)]">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold"
          >
            خروج
          </button>

          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-300">لوحة الإدارة</p>
            <h1 className="mt-1 text-[24px] font-black">ImmoMarket</h1>
            <p className="text-[12px] font-bold text-slate-300">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.05)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {sidebarItems.map((item) => {
            const active = section === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`shrink-0 rounded-[16px] px-4 py-3 text-right transition ${
                  active ? "bg-[#06142f] text-white" : "bg-slate-100 text-[#06142f]"
                }`}
              >
                <p className="text-[13px] font-black">{item.title}</p>
                <p className={`mt-1 text-[10px] font-bold ${active ? "text-slate-200" : "text-slate-500"}`}>
                  {item.short}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="text-right">
        <p className="text-[11px] font-black text-slate-400">Admin View</p>
        <h2 className="mt-1 text-[22px] font-black text-[#06142f] lg:text-[26px]">{title}</h2>
        <p className="mt-1 text-[12px] font-bold text-slate-500 lg:text-[13px]">{subtitle}</p>
      </div>
    </div>
  )
}

function CompactStatCard({
  title,
  value,
  note,
  onClick,
}: {
  title: string
  value: string | number
  note: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
    >
      <p className="text-[11px] font-black text-slate-400">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-[24px] font-black leading-none text-[#06142f] lg:text-[28px]">{value}</p>
        <p className="text-[11px] font-bold text-slate-500">{note}</p>
      </div>
    </button>
  )
}

function ModuleMiniCard({
  title,
  desc,
  onClick,
}: {
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
    >
      <p className="text-[16px] font-black text-[#06142f]">{title}</p>
      <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">{desc}</p>
    </button>
  )
}

function InfoBox({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <h3 className="text-[18px] font-black text-[#06142f]">{title}</h3>
      <div className="mt-3 space-y-2 text-[12px] font-bold text-slate-600">
        {items.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-right text-[12px] font-black text-slate-500">{children}</p>
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
    />
  )
}

function Select({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-right outline-none focus:border-[#06142f] ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function Dashboard({
  onNavigate,
  properties,
}: {
  onNavigate: (value: AdminSection) => void
  properties: AdminProperty[]
}) {
  const total = properties.length
  const sold = properties.filter((p) => p.status === "sold").length
  const hidden = properties.filter((p) => p.hidden).length
  const featured = properties.filter((p) => p.featured).length
  const available = properties.filter((p) => p.status === "available").length
  const latest = properties.slice(0, 4)

  const stats = [
    { title: "العقارات", value: total, note: "كل العقارات", section: "properties" as AdminSection },
    { title: "المتاحة", value: available, note: "جاهزة", section: "properties" as AdminSection },
    { title: "المباعة", value: sold, note: "أرشيف البيع", section: "sold" as AdminSection },
    { title: "المخفية", value: hidden, note: "غير ظاهرة", section: "properties" as AdminSection },
    { title: "المميزة", value: featured, note: "Featured", section: "properties" as AdminSection },
    { title: "الإشهارات", value: 0, note: "الحملات", section: "ads" as AdminSection },
  ]

  const modules = [
    { title: "إضافة عقار", desc: "إدخال عقار جديد مباشرة.", section: "add-property" as AdminSection },
    { title: "إدارة العقارات", desc: "تعديل وحذف وإظهار وإخفاء.", section: "properties" as AdminSection },
    { title: "الطلبات", desc: "معرفة الزبناء المهتمين.", section: "leads" as AdminSection },
    { title: "الإشهارات", desc: "تحليل الحملات والنتائج.", section: "ads" as AdminSection },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="رؤية مضغوطة ومريحة للإحصائيات والنتائج" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {stats.map((item) => (
          <CompactStatCard
            key={item.title}
            title={item.title}
            value={item.value}
            note={item.note}
            onClick={() => onNavigate(item.section)}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-3 text-right">
            <h3 className="text-[19px] font-black text-[#06142f]">نتائج المشروع</h3>
            <p className="mt-1 text-[12px] font-bold text-slate-500">ملخص سريع ديال الحالة الحالية</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
              <p className="text-[11px] font-black text-slate-400">حالة المشروع</p>
              <p className="mt-2 text-[17px] font-black text-[#06142f]">
                {total > 0 ? "النظام بدا كيتعمر" : "جاهز لإضافة أول العقارات"}
              </p>
              <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                لوحة الإدارة خدامة، ودابا خاص تعمير البيانات الحقيقية.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
              <p className="text-[11px] font-black text-slate-400">الأولوية</p>
              <p className="mt-2 text-[17px] font-black text-[#06142f]">إضافة العقارات</p>
              <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                دخل العقارات أولاً، ومن بعد نربط التتبع والطلبات والإشهارات.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
              <p className="text-[11px] font-black text-slate-400">من بعد</p>
              <p className="mt-2 text-[17px] font-black text-[#06142f]">الأداء والتحويل</p>
              <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                غادي نزيدو مصادر الزوار والطلبات والزيارات لكل عقار.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
              <p className="text-[11px] font-black text-slate-400">الهدف</p>
              <p className="mt-2 text-[17px] font-black text-[#06142f]">لوحة عملية</p>
              <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                تعرف بسرعة شنو متاح، شنو مباع، وشنو يحتاج متابعة.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InfoBox
            title="الوصول السريع"
            items={["إضافة عقار جديد", "فتح إدارة العقارات", "مراجعة الطلبات", "تحليل الإشهارات"]}
          />

          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 text-right">
              <h3 className="text-[18px] font-black text-[#06142f]">آخر العقارات</h3>
              <p className="mt-1 text-[12px] font-bold text-slate-500">آخر ما تمت إضافته</p>
            </div>

            {latest.length === 0 ? (
              <p className="text-right text-[12px] font-bold text-slate-500">مازال ما كاين حتى عقار.</p>
            ) : (
              <div className="space-y-2">
                {latest.map((property) => (
                  <div key={property.id} className="rounded-[16px] bg-slate-50 px-4 py-3 text-right">
                    <p className="text-[14px] font-black text-[#06142f]">{property.title}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      {property.district} • {property.area}m²
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="mb-3 text-right">
          <h3 className="text-[19px] font-black text-[#06142f]">الموديولات الرئيسية</h3>
          <p className="mt-1 text-[12px] font-bold text-slate-500">بطاقات صغيرة للتنقل السريع</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((item) => (
            <ModuleMiniCard
              key={item.title}
              title={item.title}
              desc={item.desc}
              onClick={() => onNavigate(item.section)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function AddPropertyPage({
  onAdd,
  editingProperty,
  onCancelEdit,
}: {
  onAdd: (property: Omit<AdminProperty, "id" | "createdAt">, editingId?: number) => void
  editingProperty: AdminProperty | null
  onCancelEdit: () => void
}) {
  const [title, setTitle] = useState("")
  const [city, setCity] = useState("سيدي علال البحراوي")
  const [district, setDistrict] = useState("")
  const [area, setArea] = useState("")
  const [priceDh, setPriceDh] = useState("")
  const [supportDh, setSupportDh] = useState("0")
  const [rooms, setRooms] = useState("2")
  const [bathrooms, setBathrooms] = useState("1")
  const [kitchens, setKitchens] = useState("1")
  const [description, setDescription] = useState("")
  const [amenitiesText, setAmenitiesText] = useState("")
  const [equippedKitchen, setEquippedKitchen] = useState(false)
  const [nearMosque, setNearMosque] = useState(false)
  const [nearSchool, setNearSchool] = useState(false)
  const [image, setImage] = useState("")
  const [gallery, setGallery] = useState<string[]>([])
  const [video, setVideo] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [status, setStatus] = useState<PropertyStatus>("available")
  const [featured, setFeatured] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!editingProperty) {
      resetForm()
      return
    }

    setTitle(editingProperty.title)
    setCity(editingProperty.city)
    setDistrict(editingProperty.district)
    setArea(String(editingProperty.area))
    setPriceDh(String(editingProperty.priceDh))
    setSupportDh(String(editingProperty.supportDh))
    setRooms(String(editingProperty.rooms))
    setBathrooms(String(editingProperty.bathrooms))
    setKitchens(String(editingProperty.kitchens))
    setDescription(editingProperty.description)
    setAmenitiesText((editingProperty.amenities || []).join("\n"))
    setEquippedKitchen(!!editingProperty.equippedKitchen)
    setNearMosque(!!editingProperty.nearMosque)
    setNearSchool(!!editingProperty.nearSchool)
    setImage(editingProperty.image)
    setGallery(editingProperty.gallery || [])
    setVideo(editingProperty.video)
    setLat(editingProperty.lat)
    setLng(editingProperty.lng)
    setStatus(editingProperty.status)
    setFeatured(editingProperty.featured)
    setHidden(editingProperty.hidden)
    setMessage("")
    setActiveIndex(0)
  }, [editingProperty])

  function resetForm() {
    setTitle("")
    setCity("سيدي علال البحراوي")
    setDistrict("")
    setArea("")
    setPriceDh("")
    setSupportDh("0")
    setRooms("2")
    setBathrooms("1")
    setKitchens("1")
    setDescription("")
    setAmenitiesText("")
    setEquippedKitchen(false)
    setNearMosque(false)
    setNearSchool(false)
    setImage("")
    setGallery([])
    setVideo("")
    setLat("")
    setLng("")
    setStatus("available")
    setFeatured(false)
    setHidden(false)
    setMessage("")
    setActiveIndex(0)
  }

  async function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingMain(true)
      setMessage("جاري تجهيز الصورة الرئيسية...")
      const dataUrl = await fileToDataUrl(file)
      setImage(dataUrl)
      if (!gallery.length) {
        setGallery([dataUrl])
      }
      setActiveIndex(0)
      setMessage("تم تجهيز الصورة الرئيسية بنجاح.")
    } catch {
      setMessage("وقع خطأ فرفع الصورة الرئيسية.")
    } finally {
      setUploadingMain(false)
    }
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    try {
      setUploadingGallery(true)
      setMessage("جاري تجهيز صور gallery...")

      const results = await Promise.allSettled(files.map((file) => fileToDataUrl(file)))
      const ok = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value)

      const failed = results.length - ok.length

      if (!ok.length) {
        setMessage("فشل تجهيز الصور المختارة. جرب عدد أقل أو صور بحجم أصغر.")
        return
      }

      const nextGallery = [...gallery, ...ok]
      setGallery(nextGallery)

      if (!image && nextGallery[0]) {
        setImage(nextGallery[0])
      }

      if (failed > 0) {
        setMessage(`وقع خطأ فرفع ${failed} من الصور، والباقي ترفع مزيان.`)
      } else {
        setMessage(`تم تجهيز ${ok.length} صورة بنجاح.`)
      }
    } catch {
      setMessage("وقع خطأ فرفع بعض صور gallery.")
    } finally {
      setUploadingGallery(false)
    }
  }

  function handleRemoveGalleryImage(index: number) {
    const next = gallery.filter((_, i) => i !== index)
    const removed = gallery[index]
    setGallery(next)

    if (image === removed) {
      setImage(next[0] || "")
      setActiveIndex(0)
    } else if (activeIndex >= next.length) {
      setActiveIndex(Math.max(0, next.length - 1))
    }
  }

  function handlePickAsMain(index: number) {
    const selected = gallery[index]
    if (!selected) return
    setImage(selected)
    setActiveIndex(index)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!title.trim() || !district.trim() || !area || !priceDh) {
      setMessage("عمر العنوان والحي والمساحة والثمن.")
      return
    }

    if (!image.trim()) {
      setMessage("خاصك تضيف الصورة الرئيسية قبل الحفظ.")
      return
    }

    onAdd(
      {
        title: title.trim(),
        city: city.trim(),
        district: district.trim(),
        area: Number(area),
        priceDh: Number(priceDh),
        supportDh: Number(supportDh || 0),
        rooms: Number(rooms),
        bathrooms: Number(bathrooms),
        kitchens: Number(kitchens),
description: description.trim(),
amenities: amenitiesText
  .split(/[\n,]/)
  .map((item) => item.trim())
  .filter(Boolean),
equippedKitchen: equippedKitchen,
nearMosque: nearMosque,
nearSchool: nearSchool,
image: image.trim(),
gallery: gallery.length > 0 ? gallery : [image.trim()],
        video: video.trim(),
        lat: lat.trim(),
        lng: lng.trim(),
        status,
        hidden,
        featured,
      },
      editingProperty?.id
    )

    setMessage(editingProperty ? "تم تعديل العقار بنجاح." : "تمت إضافة العقار بنجاح.")
    resetForm()
    onCancelEdit()
  }

  const finalPrice = Math.max(0, Number(priceDh || 0) - Number(supportDh || 0))
  const activeImage = image || gallery[activeIndex] || ""

  return (
    <div className="space-y-4">
      <PageHeader
        title={editingProperty ? "تعديل العقار" : "إضافة عقار"}
        subtitle="نفس دزين صفحة تفاصيل العقار ولكن قابلة للتعديل"
      />

      <main className="mx-auto max-w-md">
        <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="relative h-[280px] w-full overflow-hidden bg-slate-100">
            {activeImage ? (
              <img
                src={activeImage}
                alt={title || "preview"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[14px] font-bold text-slate-500">
                اختار الصورة الرئيسية
              </div>
            )}
          </div>

          <div className="px-4 pb-1 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer rounded-full bg-[#2563eb] px-4 py-3 text-center text-[14px] font-bold text-white shadow">
                {uploadingMain ? "جاري تجهيز الصورة..." : "تغيير الصورة الرئيسية"}
                <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
              </label>

              <label className="cursor-pointer rounded-full bg-[#06142f] px-4 py-3 text-center text-[14px] font-bold text-white shadow">
                {uploadingGallery ? "جاري تجهيز الصور..." : "إضافة صور gallery"}
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
              </label>
            </div>

            {gallery.length > 0 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((img, index) => {
                  const isActive = image === img
                  return (
                    <div key={index} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePickAsMain(index)}
                        className={`overflow-hidden rounded-[18px] ring-2 transition-all ${
                          isActive ? "ring-[#06142f]" : "ring-transparent opacity-80"
                        }`}
                      >
                        <img src={img} alt={`gallery-${index}`} className="h-20 w-24 object-cover" />
                      </button>

                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handlePickAsMain(index)}
                          className="flex-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-[#06142f]"
                        >
                          رئيسية
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="flex-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="p-5 pt-3 text-right">
            <Input value={title} onChange={setTitle} placeholder="عنوان العقار" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input value={city} onChange={setCity} placeholder="المدينة" />
              <Input value={district} onChange={setDistrict} placeholder="الحي" />
            </div>

            <div className="mt-4 rounded-[20px] bg-[#f8fafc] p-4 ring-1 ring-slate-200 text-center">
              <p className="text-[13px] font-bold text-slate-400">الثمن الأصلي</p>
              <input
                type="number"
                value={priceDh}
                onChange={(e) => setPriceDh(e.target.value)}
                placeholder="الثمن"
                className="mt-2 w-full bg-transparent text-center text-[34px] font-black tracking-tight text-[#2563eb] outline-none"
              />

              <div className="mt-3">
                <p className="mb-2 text-[12px] font-bold text-slate-500">الدعم السكني</p>
                <Select
                  value={supportDh}
                  onChange={setSupportDh}
                  options={[
                    { value: "0", label: "بلا دعم" },
                    { value: "70000", label: "دعم 7 مليون" },
                    { value: "100000", label: "دعم 10 مليون" },
                  ]}
                />
              </div>

              <p className="mt-3 text-[14px] font-black text-green-700">
                الثمن بعد الدعم: {formatDh(finalPrice)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">المساحة</p>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">الحي</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{district || "—"}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">المدينة</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{city || "—"}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">الغرف</p>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">الحمامات</p>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">المطابخ</p>
                <input
                  type="number"
                  value={kitchens}
                  onChange={(e) => setKitchens(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[13px] font-bold text-slate-400">الوصف</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف العقار..."
                className="mt-2 min-h-[120px] w-full bg-transparent text-[16px] leading-8 text-[#06142f] outline-none"
              />
            </div>
<div className="mt-4 rounded-[18px] bg-white p-4 ring-1 ring-slate-200">
  <p className="mb-3 text-[13px] font-bold text-slate-500">مميزات العقار</p>

  <div className="grid grid-cols-2 gap-3">

    <label className="flex items-center justify-end gap-3 rounded-[16px] bg-slate-50 px-4 py-3">
      <span className="text-[13px] font-bold text-[#06142f]">مطبخ مجهز</span>
      <input
        type="checkbox"
        checked={equippedKitchen}
        onChange={(e) => setEquippedKitchen(e.target.checked)}
      />
    </label>

    <label className="flex items-center justify-end gap-3 rounded-[16px] bg-slate-50 px-4 py-3">
      <span className="text-[13px] font-bold text-[#06142f]">قرب المسجد</span>
      <input
        type="checkbox"
        checked={nearMosque}
        onChange={(e) => setNearMosque(e.target.checked)}
      />
    </label>

    <label className="flex items-center justify-end gap-3 rounded-[16px] bg-slate-50 px-4 py-3">
      <span className="text-[13px] font-bold text-[#06142f]">قرب المدرسة</span>
      <input
        type="checkbox"
        checked={nearSchool}
        onChange={(e) => setNearSchool(e.target.checked)}
      />
    </label>

  </div>
</div>

            <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[13px] font-bold text-slate-400">الموقع والحالة</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Input value={lat} onChange={setLat} placeholder="Latitude" />
                <Input value={lng} onChange={setLng} placeholder="Longitude" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Select
                  value={status}
                  onChange={(v) => setStatus(v as PropertyStatus)}
                  options={[
                    { value: "available", label: "متاح" },
                    { value: "negotiation", label: "تفاوض" },
                    { value: "reserved", label: "محجوز" },
                    { value: "sold", label: "مباع" },
                  ]}
                />
                <Input value={video} onChange={setVideo} placeholder="رابط الفيديو" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="flex items-center justify-end gap-3 rounded-[16px] bg-white px-4 py-3">
                  <span className="text-[13px] font-bold text-[#06142f]">عقار مميز</span>
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                </label>

                <label className="flex items-center justify-end gap-3 rounded-[16px] bg-white px-4 py-3">
                  <span className="text-[13px] font-bold text-[#06142f]">إخفاء العقار</span>
                  <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                </label>
              </div>
            </div>

            {message ? (
              <p className="mt-4 text-right text-[12px] font-bold text-[#2563eb]">{message}</p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              {editingProperty ? (
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    onCancelEdit()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingProperty ? "حفظ التعديل" : "حفظ العقار"}
              </button>
            </div>
          </form>
        </article>
      </main>
    </div>
  )
}

function PropertiesPage({
  properties,
  onDelete,
  onToggleHidden,
  onToggleFeatured,
  onChangeStatus,
  onEdit,
}: {
  properties: AdminProperty[]
  onDelete: (id: number) => void
  onToggleHidden: (id: number) => void
  onToggleFeatured: (id: number) => void
  onChangeStatus: (id: number, status: PropertyStatus) => void
  onEdit: (property: AdminProperty) => void
}) {
  return (
    <div className="space-y-4">
      <PageHeader title="إدارة العقارات" subtitle="تحكم كامل في العقارات المضافة" />

      <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        {properties.length === 0 ? (
          <p className="text-right text-[13px] font-bold text-slate-500">
            مازال ما كاين حتى عقار. زيد أول عقار من صفحة "إضافة عقار".
          </p>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => {
              const finalPrice = Math.max(0, property.priceDh - property.supportDh)

              return (
                <div key={property.id} className="rounded-[18px] border border-slate-200 bg-[#fcfcfd] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(property)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleHidden(property.id)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]"
                      >
                        {property.hidden ? "إظهار" : "إخفاء"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleFeatured(property.id)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]"
                      >
                        {property.featured ? "إلغاء التمييز" : "تمييز"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(property.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{property.title}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {property.city} • {property.district}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-6">
                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">المساحة</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{property.area}m²</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الثمن</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{formatDh(property.priceDh)}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الدعم</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{formatDh(property.supportDh)}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">بعد الدعم</p>
                      <p className="mt-1 text-[14px] font-black text-[#2563eb]">{formatDh(finalPrice)}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الغرف</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{property.rooms}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الحمامات</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{property.bathrooms}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <Select
                      value={property.status}
                      onChange={(v) => onChangeStatus(property.id, v as PropertyStatus)}
                      options={[
                        { value: "available", label: "متاح" },
                        { value: "negotiation", label: "تفاوض" },
                        { value: "reserved", label: "محجوز" },
                        { value: "sold", label: "مباع" },
                      ]}
                      className="max-w-[220px]"
                    />

                    <div className="flex flex-wrap justify-end gap-2 text-right">
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        {statusLabel(property.status)}
                      </span>

                      {property.hidden ? (
                        <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                          مخفي
                        </span>
                      ) : null}

                      {property.featured ? (
                        <span className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700">
                          مميز
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {property.description || property.image || property.video ? (
                    <div className="mt-3 rounded-[14px] bg-white px-4 py-3 text-right">
                      {property.description ? (
                        <>
                          <p className="text-[10px] font-black text-slate-400">الوصف</p>
                          <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{property.description}</p>
                        </>
                      ) : null}

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        {property.image ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            صورة رئيسية
                          </span>
                        ) : null}

                        {property.gallery.length > 0 ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            {property.gallery.length} صور
                          </span>
                        ) : null}

                        {property.video ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            فيديو
                          </span>
                        ) : null}

                        {property.lat && property.lng ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            خريطة
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AdsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="الإشهارات"
        subtitle="تحليل الإشهارات التي تقوم بها أنت للترويج للعقارات أو للمنصة"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <InfoBox
          title="شنو كنقصد بهاد الصفحة"
          items={[
            "الحملات الإعلانية اللي نتا كتدير بفلوسك",
            "مثلاً Facebook Ads أو Instagram Ads أو Google Ads",
            "كل حملة تكون مرتبطة بعقار معين أو بالمنصة",
            "الهدف هو تعرف واش الإشهار ناجح أو لا",
          ]}
        />

        <InfoBox
          title="شنو غادي نزيدو من بعد"
          items={["اسم الحملة", "العقار المرتبط", "المنصة", "الميزانية", "الزيارات", "الطلبات", "النتيجة النهائية"]}
        />
      </div>

      <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <h3 className="text-[18px] font-black text-[#06142f]">مهم</h3>
        <p className="mt-3 text-[13px] font-bold leading-7 text-slate-600">
          فهاد المرحلة صفحة الإشهارات مخصصة للإشهارات ديالك نتا، ماشي إشهارات المشتركين.
          إلا من بعد درنا نظام اشتراكات وإعلانات للمشتركين، نزيدو Module خاص بهم بوحدو.
        </p>
      </div>
    </div>
  )
}

function PlaceholderPage({
  title,
  subtitle,
  itemsLeft,
  itemsRight,
}: {
  title: string
  subtitle: string
  itemsLeft: string[]
  itemsRight: string[]
}) {
  return (
    <div className="space-y-4">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-4 xl:grid-cols-2">
        <InfoBox title="محتوى الصفحة" items={itemsLeft} />
        <InfoBox title="شنو غادي يفيدك هنا" items={itemsRight} />
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("immomarket_admin") === "true")
  const [section, setSection] = useState<AdminSection>("dashboard")
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null)

  useEffect(() => {
    setProperties(safeReadProperties())
  }, [])

  function updateProperties(next: AdminProperty[]) {
    setProperties(next)
    saveProperties(next)
  }

  function handleAddProperty(property: Omit<AdminProperty, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      const next = properties.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...property,
            }
          : item
      )
      updateProperties(next)
      setSection("properties")
      return
    }

    const nextItem: AdminProperty = {
      ...property,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }

    updateProperties([nextItem, ...properties])
    setSection("properties")
  }

  function handleDelete(id: number) {
    updateProperties(properties.filter((item) => item.id !== id))
  }

  function handleToggleHidden(id: number) {
    updateProperties(properties.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item)))
  }

  function handleToggleFeatured(id: number) {
    updateProperties(properties.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)))
  }

  function handleChangeStatus(id: number, status: PropertyStatus) {
    updateProperties(properties.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  function handleEdit(property: AdminProperty) {
    setEditingProperty(property)
    setSection("add-property")
  }

  function handleCancelEdit() {
    setEditingProperty(null)
  }

  function handleLogin() {
    setIsAdmin(true)
    setSection("dashboard")
  }

  function handleLogout() {
    localStorage.removeItem("immomarket_admin")
    localStorage.removeItem("immomarket_admin_email")
    setIsAdmin(false)
    setSection("dashboard")
  }

  const content = useMemo(() => {
    switch (section) {
      case "dashboard":
        return <Dashboard onNavigate={setSection} properties={properties} />

      case "add-property":
        return (
          <AddPropertyPage
            onAdd={handleAddProperty}
            editingProperty={editingProperty}
            onCancelEdit={handleCancelEdit}
          />
        )

      case "properties":
        return (
          <PropertiesPage
            properties={properties}
            onDelete={handleDelete}
            onToggleHidden={handleToggleHidden}
            onToggleFeatured={handleToggleFeatured}
            onChangeStatus={handleChangeStatus}
            onEdit={handleEdit}
          />
        )

      case "ads":
        return <AdsPage />

      case "leads":
        return (
          <PlaceholderPage
            title="الطلبات"
            subtitle="الزبناء المهتمون ومصادرهم"
            itemsLeft={["اسم الزبون", "رقم الهاتف", "العقار المهتم به", "مصدر الزبون", "حالة المتابعة"]}
            itemsRight={["معرفة منين جا كل زبون", "تحديد الأولويات", "تنظيم المتابعة"]}
          />
        )

      case "visits":
        return (
          <PlaceholderPage
            title="الزيارات"
            subtitle="نتائج الزيارات حسب العقار والمصدر"
            itemsLeft={["العقار", "اسم الزبون", "المصدر", "تاريخ الزيارة", "النتيجة"]}
            itemsRight={["معرفة شكون زار فعلاً", "معرفة شنو المصدر اللي كيجيب زيارة", "تقييم جودة المتابعة"]}
          />
        )

      case "messages":
        return (
          <PlaceholderPage
            title="الرسائل"
            subtitle="تنظيم التواصل والردود"
            itemsLeft={["رسائل الزبناء", "العقار المرتبط", "المصدر", "الحالة"]}
            itemsRight={["تنظيم التواصل", "عدم ضياع الرسائل", "ربط الرسالة بالعقار الصحيح"]}
          />
        )

      case "sold":
        return (
          <PlaceholderPage
            title="العقارات المباعة"
            subtitle="أرشيف وتتبع النتائج"
            itemsLeft={["العقارات المباعة", "تاريخ البيع", "مدة البقاء في الموقع", "عدد الطلبات"]}
            itemsRight={["الاحتفاظ بتاريخ البيع", "تحليل النتائج السابقة", "الرجوع للبيانات عند الحاجة"]}
          />
        )

      case "controls":
        return (
          <PlaceholderPage
            title="التحكم في الواجهة"
            subtitle="إظهار وإخفاء عناصر الموقع"
            itemsLeft={["الخريطة", "المفضلة", "واتساب", "AR / VR", "العقارات المباعة"]}
            itemsRight={["التحكم في تجربة المستخدم", "تفعيل أو تعطيل الخصائص", "تبسيط الواجهة"]}
          />
        )

      default:
        return <Dashboard onNavigate={setSection} properties={properties} />
    }
  }, [section, properties, editingProperty])

  if (!isAdmin) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[#f3f5fb]" dir="rtl">
      <div className="mx-auto max-w-[1500px] p-3 lg:p-4">
        <MobileHeader section={section} onNavigate={setSection} onLogout={handleLogout} />

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <DesktopSidebar section={section} onNavigate={setSection} onLogout={handleLogout} />
          <main>{content}</main>
        </div>
      </div>
    </div>
  )
}
