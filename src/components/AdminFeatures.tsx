import { useState } from "react"

type Props = {
  value: string[]
  onChange: (features: string[]) => void
}

export default function AdminFeatures({ value, onChange }: Props) {
  const [input, setInput] = useState("")

  const addFeature = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const newFeatures = [...value, trimmed]
    onChange(newFeatures)
    setInput("")
  }

  const removeFeature = (index: number) => {
    const newFeatures = value.filter((_, i) => i !== index)
    onChange(newFeatures)
  }

  return (
    <div className="rounded-[24px] border border-[#dfe9e1] bg-[#f8fbf8] p-5">
      <h3 className="mb-4 text-[22px] font-black text-[#06142f] text-right">
        مميزات العقار
      </h3>

      {/* input */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={addFeature}
          className="rounded-full bg-[#06142f] px-4 py-2 text-white font-bold"
        >
          إضافة
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب ميزة (مثال: كراج، مصعد...)"
          className="flex-1 rounded-full border px-4 py-2 text-right"
        />
      </div>

      {/* list */}
      <div className="grid gap-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white px-4 py-3 rounded-[18px] border"
          >
            <button
              onClick={() => removeFeature(index)}
              className="text-red-500 font-bold"
            >
              حذف
            </button>

            <span className="font-bold text-[#06142f]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
