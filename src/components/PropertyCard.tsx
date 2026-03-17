import { MapPin, Ruler, Building2 } from "lucide-react"

export default function PropertyCard({ property, onOpen }) {
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
          className="h-[230px] w-full object-cover"
        />
      </button>

      <div className="p-5 text-right">
        <h3 className="text-[21px] font-extrabold text-[#06142f]">
          {property.title}
        </h3>

        <p className="mt-2 text-[14px] text-slate-500">
          {property.city} - {property.district}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[16px] bg-slate-50 p-3 text-center">
            <Ruler size={18} className="mx-auto mb-1 text-slate-500" />
            <p className="text-[12px] text-slate-400">المساحة</p>
            <p className="font-bold">{property.area} m²</p>
          </div>

          <div className="rounded-[16px] bg-slate-50 p-3 text-center">
            <Building2 size={18} className="mx-auto mb-1 text-slate-500" />
            <p className="text-[12px] text-slate-400">المدينة</p>
            <p className="font-bold">{property.city}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpen(property)}
            className="rounded-full bg-[#06142f] px-5 py-2 text-white"
          >
            التفاصيل
          </button>

          <div className="text-right">
            <p className="text-[12px] text-slate-400">السعر</p>
            <p className="text-[22px] font-bold text-blue-600">
              {property.price}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
