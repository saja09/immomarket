type AdminDashboardProps = {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const cards = [
    { title: "العقارات", value: "0" },
    { title: "الطلبات", value: "0" },
    { title: "الزيارات", value: "0" },
    { title: "الإشهارات", value: "0" },
  ]

  return (
    <div className="min-h-screen bg-[#f3f5fb] p-4" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between rounded-[28px] bg-white px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-slate-100 px-4 py-2 text-[14px] font-bold text-[#06142f]"
          >
            تسجيل الخروج
          </button>

          <div className="text-right">
            <h1 className="text-[28px] font-black text-[#06142f]">لوحة إدارة ImmoMarket</h1>
            <p className="text-[13px] font-bold text-slate-500">
              البداية ديال الأدمن بانيل
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
            >
              <p className="text-right text-[13px] font-bold text-slate-400">{card.title}</p>
              <p className="mt-2 text-right text-[30px] font-black text-[#06142f]">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-right text-[20px] font-black text-[#06142f]">الموديولات الجاية</h2>
            <div className="mt-4 space-y-3 text-right text-[14px] font-bold text-slate-600">
              <p>• إضافة العقارات</p>
              <p>• إدارة العقارات</p>
              <p>• تتبع الطلبات والرسائل</p>
              <p>• تتبع الزيارات والمصادر</p>
              <p>• تتبع الإشهارات</p>
              <p>• التحكم الكامل في الواجهة</p>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-right text-[20px] font-black text-[#06142f]">الإجراءات السريعة</h2>
            <div className="mt-4 grid gap-3">
              <button className="rounded-[18px] bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white">
                إضافة عقار
              </button>
              <button className="rounded-[18px] bg-slate-100 px-4 py-3 text-[15px] font-bold text-[#06142f]">
                إدارة العقارات
              </button>
              <button className="rounded-[18px] bg-slate-100 px-4 py-3 text-[15px] font-bold text-[#06142f]">
                الإشهارات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
