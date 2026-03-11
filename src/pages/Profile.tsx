import { ArrowRight, LogOut, User } from "lucide-react"

type UserType = {
  fullName: string
  identifier: string
  password: string
}

export default function Profile({
  user,
  onBack,
  onLogout,
}: {
  user: UserType
  onBack: () => void
  onLogout: () => void
}) {
  return (
    <main className="min-h-screen bg-[#f3f5fb] px-4 pt-4 pb-10 text-[#06142f]" dir="rtl">
      <div className="mx-auto max-w-md">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-bold shadow"
        >
          <ArrowRight size={16} />
          رجوع
        </button>

        <section className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#06142f] text-white">
              <User size={34} />
            </div>

            <h2 className="mt-4 text-[26px] font-black">
              {user.fullName}
            </h2>

            <p className="mt-1 text-[14px] text-slate-500">
              {user.identifier}
            </p>
          </div>

          <div className="mt-8 rounded-[22px] bg-slate-50 p-4 text-right">
            <p className="text-[13px] font-bold text-slate-400">الاسم</p>
            <p className="mt-1 text-[18px] font-extrabold">{user.fullName}</p>

            <p className="mt-4 text-[13px] font-bold text-slate-400">البريد أو الهاتف</p>
            <p className="mt-1 text-[16px] font-bold">{user.identifier}</p>
          </div>

          <div className="mt-8">
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06142f] py-3 text-[15px] font-bold text-white"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
