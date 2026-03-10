import { Link } from "react-router-dom"
import type { Property } from "../../data/properties"

type Props = {
  property: Property
}

export default function PropertyListItem({ property }: Props) {
  return (
    <article className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="h-[290px] w-full object-cover md:h-[360px]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-5 py-3 text-lg font-black text-slate-950 shadow">
            {property.featured ? "Featured" : "New"}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-slate-950/95 px-5 py-3 text-lg font-bold text-white shadow">
            {property.city}
          </span>
        </div>

        <div className="absolute bottom-4 left-4">
          <span className="text-xl font-medium text-white">
            {property.district}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[2.1rem] font-black leading-tight tracking-tight text-slate-950 md:text-[2.4rem]">
              {property.title}
            </h3>
            <p className="mt-2 text-2xl text-slate-400 md:text-[2rem]">
              {property.district} - {property.city}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-blue-50 px-5 py-3 text-lg font-extrabold text-blue-700">
            للبيع
          </span>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-[3rem] font-black tracking-tight text-blue-600 md:text-[3.6rem]">
            {property.price}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-[22px] bg-slate-50 px-3 py-6 text-center">
            <div className="text-[3rem] font-black text-slate-950">{property.beds}</div>
            <div className="mt-2 text-xl text-slate-500">غرف</div>
          </div>

          <div className="rounded-[22px] bg-slate-50 px-3 py-6 text-center">
            <div className="text-[3rem] font-black text-slate-950">{property.baths}</div>
            <div className="mt-2 text-xl text-slate-500">حمام</div>
          </div>

          <div className="rounded-[22px] bg-slate-50 px-3 py-6 text-center">
            <div className="text-[3rem] font-black text-slate-950">{property.area}</div>
            <div className="mt-2 text-xl text-slate-500">المساحة</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-2xl font-bold text-slate-950 transition hover:bg-slate-50">
            حفظ
          </button>

          <Link
            to={`/property/${property.id}`}
            className="rounded-[22px] bg-slate-950 px-5 py-5 text-center text-2xl font-black text-white transition hover:bg-slate-800"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </article>
  )
}
