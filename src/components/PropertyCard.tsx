import { Building2, MapPin, Ruler } from "lucide-react"

export default function PropertyCard({ property }) {
  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_16px_35px_rgba(0,0,0,0.08)]">

      <img
        src={property.image}
        className="h-[210px] w-full object-cover"
      />

      <div className="p-5 text-right">

        <h3 className="text-[20px] font-extrabold text-[#06142f]">
          {property.title}
        </h3>

        <div className="mt-4 grid grid-cols-3 gap-3">

          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Building2 size={18} className="mx-auto mb-1" />
            <p className="text-[13px] font-bold">
              {property.city}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <MapPin size={18} className="mx-auto mb-1" />
            <p className="text-[13px] font-bold">
              {property.district}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Ruler size={18} className="mx-auto mb-1" />
            <p className="text-[13px] font-bold">
              {property.area} m²
            </p>
          </div>

        </div>

        <div className="mt-5 flex items-center justify-between">

          <button className="rounded-full bg-[#06142f] px-5 py-2 text-[14px] font-bold text-white">
            التفاصيل
          </button>

          <p className="text-[26px] font-black text-[#2563eb]">
            {property.price}
          </p>

        </div>

      </div>

    </article>
  )
}
