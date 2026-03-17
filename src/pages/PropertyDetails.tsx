export default function PropertyDetails({ property }) {
  return (
    <div className="p-4">

      <img
        src={property.image}
        className="w-full h-[250px] object-cover rounded-2xl"
      />

      <h2 className="text-[22px] font-bold mt-4 text-right">
        {property.title}
      </h2>

      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="bg-gray-100 p-3 rounded-xl">
          <p className="text-xs text-gray-400">المدينة</p>
          <p className="font-bold">{property.city}</p>
        </div>

        <div className="bg-gray-100 p-3 rounded-xl">
          <p className="text-xs text-gray-400">الحي</p>
          <p className="font-bold">{property.district}</p>
        </div>

        <div className="bg-gray-100 p-3 rounded-xl">
          <p className="text-xs text-gray-400">المساحة</p>
          <p className="font-bold">{property.area} m²</p>
        </div>
      </div>

      {/* السعر */}
      <div className="mt-5 rounded-2xl border p-4 text-right">

        <p className="text-sm text-gray-400">الثمن الأصلي</p>

        <p className="text-[24px] font-bold text-blue-600">
          {property.price}
        </p>

        <p className="text-green-600 mt-2">
          قيمة الدعم: {property.supportValue || "—"}
        </p>

      </div>

    </div>
  )
}
