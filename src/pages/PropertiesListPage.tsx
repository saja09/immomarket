import { properties } from "../data/properties"
import PropertyListItem from "../components/property/PropertyListItem"

const filters = ["الكل", "حصري", "فلل", "شقق", "استثمار", "جاهز للسكن"]
const sorts = ["الأحدث", "الأرخص", "الأغلى", "الأقرب", "الأفضل"]

export default function PropertiesListPage() {
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-blue-700">
                Properties
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                جميع العقارات
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-500">
                تصفح العقارات بشكل عمودي وواضح، مع معلومات كاملة وصور قوية تساعد الزبون
                ياخذ قرار من أول نظرة.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
                <input
                  type="text"
                  placeholder="ابحث عن مدينة، حي، نوع عقار..."
                  className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />

                <select className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-lg font-medium text-slate-900 outline-none">
                  <option>جميع المدن</option>
                  <option>سيدي علال البحراوي</option>
                  <option>الرباط</option>
                  <option>سلا</option>
                  <option>تمارة</option>
                </select>

                <select className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-lg font-medium text-slate-900 outline-none">
                  <option>جميع الأنواع</option>
                  <option>Appartement</option>
                  <option>Villa</option>
                  <option>Maison</option>
                </select>

                <button className="rounded-[20px] bg-slate-950 px-8 py-4 text-lg font-black text-white transition hover:bg-slate-800">
                  بحث
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                {filters.map((item) => (
                  <button
                    key={item}
                    className={`rounded-full px-5 py-3 text-base font-bold transition ${
                      item === "الكل"
                        ? "bg-slate-950 text-white shadow-md"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-500">ترتيب حسب</span>
                <select className="rounded-full border border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-800 outline-none">
                  {sorts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-bold text-slate-700">
            {properties.length} عقارات متوفرة
          </p>
          <button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            عرض على الخريطة
          </button>
        </div>

        <div className="space-y-6">
          {properties.map((property) => (
            <PropertyListItem key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  )
}
