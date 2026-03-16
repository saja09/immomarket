import { useState } from "react"

type AdminLoginProps = {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const adminEmail = "admin@immomarket.ma"
  const adminPassword = "simo123"

  function handleLogin() {
    if (email.trim() === adminEmail && password === adminPassword) {
      localStorage.setItem("immomarket_admin", "true")
      localStorage.setItem("immomarket_admin_email", adminEmail)
      setError("")
      onLogin()
      return
    }

    setError("معلومات الدخول غير صحيحة")
  }

  return (
    <div className="min-h-screen bg-[#f3f5fb] px-4 py-10" dir="rtl">
      <div className="mx-auto max-w-md rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <h1 className="text-right text-[28px] font-black text-[#06142f]">
          دخول الإدارة
        </h1>

        <p className="mt-2 text-right text-[14px] font-bold text-slate-500">
          صفحة خاصة بالأدمن فقط
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[18px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[18px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
          />

          {error ? (
            <p className="text-right text-[13px] font-bold text-red-600">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-[18px] bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
          >
            دخول
          </button>
        </div>
      </div>
    </div>
  )
}
