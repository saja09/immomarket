import { useState } from "react"
import {
  Search,
  Mic,
  MapPinned,
  SlidersHorizontal,
  Building2,
  MapPin,
  Ruler,
  UserRound,
  X,
  Mail,
  Lock,
  ArrowLeft,
} from "lucide-react"

type Property = {
  id: number
  title: string
  city: string
  district: string
  area: number
  price: string
  image: string
  featured?: boolean
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
    featured: true,
  },
]

function BrandHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <header className="border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-md px-4 py-5">
        <div className="rounded-[30px] border border-slate-200 bg-white px-4 py-4 shadow">

          <div className="flex items-center justify-between">

            <button
              onClick={onOpenAuth}
              className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-[#f8fafc] px-4 text-[13px] font-extrabold text-[#06142f]"
            >
              <UserRound size={16} />
              الدخول
            </button>

            <div className="flex items-center gap-3">

              <h1 className="text-[30px] font-black text-[#06142f]">
                ImmoMarket
              </h1>

              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#06142f] to-[#0a2b63]">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[16px] bg-white/10 text-[25px] font-black text-white">
                  IM
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </header>
  )
}

function AuthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 ${
          open ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 right-0 mx-auto max-w-md transform ${
          open ? "translate-y-0" : "-translate-y-full"
        } transition`}
      >
        <div className="m-4 rounded-[30px] bg-white p-5 shadow-xl">

          <div className="mb-4 flex justify-between items-center">

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border"
            >
              <X size={18} />
            </button>

            <h2 className="text-[22px] font-black">
              تسجيل الدخول
            </h2>

          </div>

          <div className="space-y-3">

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className="h-12 w-full rounded-xl border px-4 text-right"
            />

            <input
              type="password"
              placeholder="كلمة المرور"
              className="h-12 w-full rounded-xl border px-4 text-right"
            />

            <button className="h-12 w-full rounded-full bg-[#06142f] text-white font-bold">
              تسجيل الدخول
            </button>

            <div className="text-center pt-2">

              <span className="text-slate-500">
                ليس لديك حساب؟
              </span>

              <button className="mr-2 text-blue-600 font-bold">
                إنشاء حساب جديد
              </button>

            </div>

          </div>

        </div>
      </div>
    </>
  )
}

function SearchBar() {
  return (
    <section className="mx-auto max-w-md px-4 pt-5">
      <div className="rounded-[28px] border bg-white p-3 shadow">
        <div className="flex items-center gap-2">

          <button className="h-10 w-10 rounded-full bg-[#06142f] text-white flex items-center justify-center">
            <Search size={18} />
          </button>

          <input
            type="text"
            placeholder="ابحث عن مدينة"
            className="flex-1 h-10 rounded-full border px-4 text-right"
          />

          <button className="h-10 w-10 rounded-full border flex items-center justify-center">
            <Mic size={16} />
          </button>

          <button className="h-10 w-10 rounded-full border flex items-center justify-center">
            <MapPinned size={16} />
          </button>

          <button className="h-10 w-10 rounded-full border flex items-center justify-center">
            <SlidersHorizontal size={16} />
          </button>

        </div>
      </div>
    </section>
  )
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="rounded-[24px] bg-white shadow overflow-hidden">

      <img
        src={property.image}
        className="h-[200px] w-full object-cover"
      />

      <div className="p-4 text-right">

        <h3 className="text-[20px] font-bold">
          {property.title}
        </h3>

        <div className="mt-3 grid grid-cols-3 gap-2">

          <div className="bg-slate-50 p-3 rounded text-center">
            <Building2 size={16} />
            <p className="text-[12px]">{property.city}</p>
          </div>

          <div className="bg-slate-50 p-3 rounded text-center">
            <MapPin size={16} />
            <p className="text-[12px]">{property.district}</p>
          </div>

          <div className="bg-slate-50 p-3 rounded text-center">
            <Ruler size={16} />
            <p className="text-[12px]">{property.area} m²</p>
          </div>

        </div>

        <div className="mt-3 flex justify-between items-center">

          <p className="text-blue-600 font-black text-[20px]">
            {property.price}
          </p>

          <button className="rounded-full bg-[#06142f] px-4 py-2 text-white text-sm">
            التفاصيل
          </button>

        </div>

      </div>

    </article>
  )
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f3f5fb]" dir="rtl">

      <BrandHeader onOpenAuth={() => setAuthOpen(true)} />

      <AuthDrawer
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <SearchBar />

      <main className="mx-auto max-w-md px-4 pt-7">

        <h2 className="text-[28px] font-black text-right mb-5">
          العقارات المتوفرة
        </h2>

        <div className="grid gap-4">

          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}

        </div>

      </main>

    </div>
  )
}
