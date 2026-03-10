import { Link } from "react-router-dom"
import { properties } from "../data/properties"

const quickFilters = ["الكل", "شقق", "فلل", "منازل", "استثمار", "جاهز للسكن"]

export default function Home() {
  const heroProperty = properties?.[0]

  return (
    <div className="bg-[#f3f5fb] min-h-screen">
      {heroProperty && (
        <section className="relative overflow-hidden">
          <div className="relative h-[720px] w-full">
            <img
              src={heroProperty.image}
              alt={heroProperty.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-[#06142f]/10 via-[#06142f]/35 to-[#06142f]/75" />

            <div className="absolute inset-x-0 bottom-16 z-20 px-4">
              <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/95 shadow-[0_18px_60px_rgba(5,16,44,0.18)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 px-5 py-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff] text-[#94a3b8] text-2xl">
                      ⌕
                    </div>

                    <input
                      type="text"
                      placeholder="عن مدينة، حي، شقة، فيلا"
                      className="h-14 flex-1 border-0 bg-transparent text-right text-[22px] font-semibold text-[#0b132b] outline-none placeholder:text-[#94a3b8]"
                    />

                    <button
                      type="button"
                      className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e7ebf3] bg-[#f8fafc] text-[#0b132b] shadow-sm text-2xl"
                    >
                      🎤
                    </button>

                    <button
                      type="button"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#020b2d] text-white shadow-[0_10px_24px_rgba(2,11,45,0.32)] text-2xl"
                    >
                      ⌕
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf1f6] bg-[#fbfcfe] px-5 py-4">
                    <span className="text-right text-[15px] font-semibold text-[#94a3b8]">
                      مثال: شقة فالرياض بين 80 و 100 متر
                    </span>

                    <Link
                      to="/map"
                      className="inline-flex items-center gap-2 rounded-full border border-[#d9dfeb] bg-white px-5 py-3 text-[18px] font-bold text-[#0b132b]"
                    >
                      الخريطة
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap gap-4">
          {quickFilters.map((item, index) => (
            <button
              key={item}
              className={`rounded-full border px-8 py-4 text-[22px] font-bold shadow-sm ${
                index === 0
                  ? "border-[#020b2d] bg-[#020b2d] text-white"
                  : "border-[#dde3ee] bg-white text-[#475569]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mb-8">
          <h2 className="text-[44px] font-black tracking-tight text-[#0b132b]">
            العقارات المتوفرة
          </h2>
        </div>

        <div className="space-y-8">
          {properties?.map((property) => (
            <div
              key={property.id}
              className="overflow-hidden rounded-[34px] border border-[#e8edf5] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-[320px] w-full object-cover"
                />

                <div className="absolute left-5 top-5 rounded-full bg-white px-5 py-2 text-[18px] font-bold text-[#0b132b] shadow">
                  {property.featured ? "مميز" : "جديد"}
                </div>

                <div className="absolute right-5 top-5 rounded-full bg-[#020b2d] px-5 py-2 text-[18px] font-bold text-white shadow">
                  {property.city}
                </div>

                <div className="absolute bottom-5 left-5 text-[18px] font-medium text-white drop-shadow">
                  {property.district}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="text-[28px] font-extrabold text-[#0b132b]">
                    {property.title}
                  </h3>

                  <span className="rounded-full bg-[#eef3ff] px-4 py-2 text-[18px] font-bold text-[#3169e7]">
                    للبيع
                  </span>
                </div>

                <p className="mb-4 text-[22px] font-medium text-[#8a97ab]">
                  {property.district} - {property.city}
                </p>

                <div className="mb-6 text-[34px] font-black text-[#3169e7]">
                  {property.price}
                </div>

                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="rounded-[22px] bg-[#f7f9fc] px-4 py-6 text-center">
                    <div className="text-[34px] font-black text-[#0b132b]">{property.beds}</div>
                    <div className="mt-2 text-[18px] font-medium text-[#8a97ab]">غرف</div>
                  </div>

                  <div className="rounded-[22px] bg-[#f7f9fc] px-4 py-6 text-center">
                    <div className="text-[34px] font-black text-[#0b132b]">{property.baths}</div>
                    <div className="mt-2 text-[18px] font-medium text-[#8a97ab]">حمام</div>
                  </div>

                  <div className="rounded-[22px] bg-[#f7f9fc] px-4 py-6 text-center">
                    <div className="text-[34px] font-black text-[#0b132b]">{property.area}</div>
                    <div className="mt-2 text-[18px] font-medium text-[#8a97ab]">المساحة</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="rounded-full border border-[#d7deea] bg-white px-6 py-4 text-[24px] font-bold text-[#0b132b]">
                    حفظ
                  </button>

                  <button className="rounded-full bg-[#020b2d] px-6 py-4 text-[24px] font-bold text-white shadow-[0_12px_30px_rgba(2,11,45,0.25)]">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
