import { SlidersHorizontal, MapPin, Heart, Locate } from "lucide-react"

type Props = {
  onFilter: () => void
  onMap: () => void
}

export default function SearchMenu({ onFilter, onMap }: Props) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">

      <button
        onClick={onFilter}
        className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-4 text-[15px] font-bold text-[#06142f]"
      >
        الفلتر
        <SlidersHorizontal size={18} />
      </button>

      <button
        onClick={onMap}
        className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-4 text-[15px] font-bold text-[#06142f]"
      >
        الخريطة
        <MapPin size={18} />
      </button>

      <button
        className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-4 text-[15px] font-bold text-[#06142f]"
      >
        قريب مني
        <Locate size={18} />
      </button>

      <button
        className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-4 text-[15px] font-bold text-[#06142f]"
      >
        المفضلة
        <Heart size={18} />
      </button>

    </div>
  )
}
