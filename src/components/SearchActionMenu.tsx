import { useEffect, useRef, useState } from "react"
import { SlidersHorizontal, Map } from "lucide-react"

type SearchActionMenuProps = {
  onOpenFilters: () => void
  onOpenMap: () => void
}

export default function SearchActionMenu({
  onOpenFilters,
  onOpenMap,
}: SearchActionMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white text-[#06142f] shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition hover:scale-[1.02]"
        aria-label="فتح خيارات البحث"
      >
        <SlidersHorizontal size={24} />
      </button>

      {open && (
        <div className="absolute left-0 top-[72px] z-50 w-44 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onOpenFilters()
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-right text-[14px] font-bold text-[#06142f] transition hover:bg-slate-50"
          >
            <span>الفلاتر</span>
            <SlidersHorizontal size={18} />
          </button>

          <div className="h-px bg-slate-100" />

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onOpenMap()
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-right text-[14px] font-bold text-[#06142f] transition hover:bg-slate-50"
          >
            <span>الخريطة</span>
            <Map size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
