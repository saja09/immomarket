import { useEffect, useMemo, useState } from "react"

type Props = {
  equippedKitchen: boolean
  setEquippedKitchen: (value: boolean) => void
  nearMosque: boolean
  setNearMosque: (value: boolean) => void
  nearSchool: boolean
  setNearSchool: (value: boolean) => void
  amenitiesText: string
  setAmenitiesText: (value: string) => void
}

const STORAGE_KEY = "immomarket_feature_options"

const DEFAULT_OPTIONS = [
  "مطبخ مجهز",
  "قرب المسجد",
  "قرب المدرسة",
]

export default function AdminFeatures({
  equippedKitchen,
  setEquippedKitchen,
  nearMosque,
  setNearMosque,
  nearSchool,
  setNearSchool,
  amenitiesText,
  setAmenitiesText,
}: Props) {
  const [featureOptions, setFeatureOptions] = useState<string[]>(DEFAULT_OPTIONS)
  const [newFeature, setNewFeature] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return

      const cleaned = parsed
        .map((item) => String(item || "").trim())
        .filter(Boolean)

      if (cleaned.length) {
        setFeatureOptions(Array.from(new Set([...DEFAULT_OPTIONS, ...cleaned])))
      }
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(featureOptions))
  }, [featureOptions])

  const selectedAmenities = useMemo(() => {
    return amenitiesText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }, [amenitiesText])

  const isChecked = (label: string) => {
    if (label === "مطبخ مجهز") return equippedKitchen
    if (label === "قرب المسجد") return nearMosque
    if (label === "قرب المدرسة") return nearSchool
    return selectedAmenities.includes(label)
  }

  const syncAmenities = (items: string[]) => {
    setAmenitiesText(Array.from(new Set(items)).join("\n"))
  }

  const toggleFeature = (label: string) => {
    if (label === "مطبخ مجهز") {
      setEquippedKitchen(!equippedKitchen)
      return
    }

    if (label === "قرب المسجد") {
      setNearMosque(!nearMosque)
      return
    }

    if (label === "قرب المدرسة") {
      setNearSchool(!nearSchool)
      return
    }

    if (selectedAmenities.includes(label)) {
      syncAmenities(selectedAmenities.filter((item) => item !== label))
    } else {
      syncAmenities([...selectedAmenities, label])
    }
  }

  const addFeature = () => {
    const value = newFeature.trim()
    if (!value) return

    if (!featureOptions.includes(value)) {
      setFeatureOptions((prev) => [...prev, value])
    }

    if (!selectedAmenities.includes(value)) {
      syncAmenities([...selectedAmenities, value])
    }

    setNewFeature("")
  }

  return (
    <div className="mt-6 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[13px] font-bold text-slate-500">مميزات العقار</p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={addFeature}
          className="rounded-full bg-[#06142f] px-4 py-2 text-[13px] font-bold text-white"
        >
          إضافة
        </button>

        <input
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          placeholder="اكتب مميزة جديدة..."
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-right text-[14px] outline-none"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {featureOptions.map((item) => (
          <label
            key={item}
            className="flex items-center justify-end gap-3 rounded-[18px] bg-slate-50 px-4 py-4"
          >
            <span className="text-[13px] font-bold text-[#06142f]">{item}</span>
            <input
              type="checkbox"
              checked={isChecked(item)}
              onChange={() => toggleFeature(item)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
