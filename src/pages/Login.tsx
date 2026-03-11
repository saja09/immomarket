import { ArrowRight, Facebook, Globe, Instagram } from "lucide-react"

export default function Login({ onBack }: { onBack: () => void }) {
  return (
    <main className="min-h-screen bg-[#f3f5fb] px-4 pb-10 pt-4 text-[#06142f]" dir="rtl">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-bold shadow"
        >
          <ArrowRight size={16} />
          رجوع
        </button>

        <section className="rounded-[30px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h1 className="text-right text-[30px] font-black">الدخول إلى حسابك</h1>
          <p className="mt-2 text-right text-[14px] text-slate-500">
            سجل الدخول أو أنشئ حساب جديد للمتابعة
          </p>

          <div className="mt-6 space-y-3">
            <input
              type="text"
              placeholder="البريد الإلكتروني أو رقم الهاتف"
              className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none"
            />

            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold"
            >
              إنشاء حساب جديد
            </button>

            <button
              type="button"
              className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
            >
              تسجيل الدخول
            </button>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-right text-[13px] font-bold text-slate-400">
              أو الدخول عبر
            </p>

            <div className="grid gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold"
              >
                <Globe size={18} />
                Google
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold"
              >
                <Facebook size={18} />
                Facebook
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold"
              >
                <Instagram size={18} />
                Instagram
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold"
              >
                <span className="text-[16px] font-black">♪</span>
                TikTok
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
