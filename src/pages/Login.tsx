import { useState } from "react"
import { ArrowRight, Facebook, Globe, Instagram } from "lucide-react"

export default function Login({ onBack }: { onBack: () => void }) {

  const [mode,setMode] = useState<"login" | "register">("login")

  return (
    <main className="min-h-screen bg-[#f3f5fb] px-4 pb-10 pt-4 text-[#06142f]" dir="rtl">

      <div className="mx-auto max-w-md">

        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-bold shadow"
        >
          <ArrowRight size={16}/>
          رجوع
        </button>

        <section className="rounded-[30px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">

          <h1 className="text-right text-[30px] font-black">

            {mode === "login" ? "الدخول إلى حسابك" : "إنشاء حساب جديد"}

          </h1>

          <p className="mt-2 text-right text-[14px] text-slate-500">

            {mode === "login"
              ? "سجل الدخول أو أنشئ حساب جديد للمتابعة"
              : "أنشئ حسابك للبدء في استخدام المنصة"}

          </p>


          <div className="mt-6 space-y-3">

            {mode === "register" && (
              <input
                placeholder="الاسم الكامل"
                className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none"
              />
            )}

            <input
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

            {mode === "login" ? (

              <>
                <button
                  type="button"
                  onClick={()=>setMode("register")}
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
              </>

            ) : (

              <>
                <button
                  type="button"
                  onClick={()=>setMode("login")}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold"
                >
                  لدي حساب
                </button>

                <button
                  type="button"
                  className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
                >
                  إنشاء الحساب
                </button>
              </>

            )}

          </div>


          <div className="mt-6">

            <p className="mb-3 text-right text-[13px] font-bold text-slate-400">
              أو الدخول عبر
            </p>

            <div className="grid gap-3">

              <button className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold">
                <Globe size={18}/>
                Google
              </button>

              <button className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold">
                <Facebook size={18}/>
                Facebook
              </button>

              <button className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold">
                <Instagram size={18}/>
                Instagram
              </button>

              <button className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold">
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
