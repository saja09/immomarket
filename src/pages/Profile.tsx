import { ArrowRight, LogOut, User, Settings2, Volume2 } from "lucide-react"
import { useEffect, useState } from "react"

type SavedUser = {
  fullName: string
  identifier: string
  password: string
}

type ProfileProps = {
  user: SavedUser
  onBack: () => void
  onLogout: () => void
}

export default function Profile({ user, onBack, onLogout }: ProfileProps) {
  const [voiceLang, setVoiceLang] = useState(localStorage.getItem("voice_lang") || "ar-MA")
  const [voiceName, setVoiceName] = useState(localStorage.getItem("voice_name") || "")
  const [voiceRate, setVoiceRate] = useState(Number(localStorage.getItem("voice_rate") || "0.92"))
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      const list = window.speechSynthesis?.getVoices?.() || []
      setVoices(list)
    }

    loadVoices()
    window.speechSynthesis?.addEventListener?.("voiceschanged", loadVoices)

    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices)
    }
  }, [])

  const filteredVoices = voices.filter((voice) => {
    const lang = voice.lang?.toLowerCase() || ""
    if (voiceLang === "ar-MA") return lang.startsWith("ar")
    if (voiceLang === "ar") return lang.startsWith("ar")
    if (voiceLang === "fr") return lang.startsWith("fr")
    if (voiceLang === "en") return lang.startsWith("en")
    return true
  })

  function saveVoiceSettings() {
    localStorage.setItem("voice_lang", voiceLang)
    localStorage.setItem("voice_name", voiceName)
    localStorage.setItem("voice_rate", String(voiceRate))
    alert("تم حفظ إعدادات الصوت")
  }

  function testVoice() {
    if (!("speechSynthesis" in window)) return

    const text =
      voiceLang === "fr"
        ? "Bonjour, ceci est un test de voix."
        : voiceLang === "en"
        ? "Hello, this is a voice test."
        : "السلام عليكم، هذا اختبار للصوت."

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceLang
    utterance.rate = voiceRate

    const selectedVoice = voices.find((v) => v.name === voiceName)
    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang || voiceLang
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-bold text-[#06142f] shadow"
      >
        <ArrowRight size={16} />
        رجوع
      </button>

      <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#06142f] text-white shadow">
            <User size={40} />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-[28px] font-black text-[#06142f]">{user.fullName}</h2>
          <p className="mt-2 text-[16px] font-medium text-slate-500">{user.identifier}</p>
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-50 p-4 text-right">
          <div className="mb-4">
            <p className="text-[13px] font-bold text-slate-400">الاسم</p>
            <p className="mt-1 text-[18px] font-extrabold text-[#06142f]">{user.fullName}</p>
          </div>

          <div>
            <p className="text-[13px] font-bold text-slate-400">المعرف</p>
            <p className="mt-1 text-[18px] font-extrabold text-[#06142f]">{user.identifier}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-50 p-4 text-right">
          <div className="mb-4 flex items-center justify-end gap-2">
            <Settings2 size={22} className="text-[#06142f]" />
            <h3 className="text-[24px] font-black text-[#06142f]">إعدادات الصوت</h3>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-[14px] font-bold text-slate-500">اللغة</label>
            <select
              value={voiceLang}
              onChange={(e) => {
                setVoiceLang(e.target.value)
                setVoiceName("")
              }}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[16px] font-bold text-[#06142f] outline-none"
            >
              <option value="ar-MA">العربية المغربية</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-[14px] font-bold text-slate-500">الصوت</label>
            <select
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[16px] font-bold text-[#06142f] outline-none"
            >
              <option value="">اختيار تلقائي</option>
              {filteredVoices.map((voice) => (
                <option key={voice.name + voice.lang} value={voice.name}>
                  {voice.name} - {voice.lang}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="mb-2 block text-[14px] font-bold text-slate-500">
              السرعة: {voiceRate.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.75"
              max="1.15"
              step="0.01"
              value={voiceRate}
              onChange={(e) => setVoiceRate(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={testVoice}
              className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold text-[#06142f]"
            >
              <Volume2 size={18} />
              تجربة الصوت
            </button>

            <button
              type="button"
              onClick={saveVoiceSettings}
              className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#06142f] px-4 py-4 text-[18px] font-bold text-white"
        >
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </section>
    </main>
  )
}
