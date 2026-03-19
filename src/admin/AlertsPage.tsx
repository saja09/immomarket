import type { AdminNotificationItem } from "./notifications"

type AdminSection =
  | "dashboard"
  | "properties"
  | "add-property"
  | "owners"
  | "sellers"
  | "leads"
  | "visits"
  | "ads"
  | "controls"
  | "messages"
  | "sold"
  | "documents"
  | "stats-reports"

function priorityLabel(priority: AdminNotificationItem["priority"]) {
  if (priority === "urgent_booking") return "أولوية قصوى"
  if (priority === "booking") return "حجز"
  if (priority === "inquiry_due") return "استفسار مستعجل"
  if (priority === "inquiry") return "استفسار"
  return "عادي"
}

function sectionLabel(section: AdminNotificationItem["relatedSection"]) {
  if (section === "messages") return "الرسائل"
  if (section === "visits") return "الزيارات"
  if (section === "leads") return "الطلبات"
  if (section === "properties") return "العقارات"
  if (section === "ads") return "الإشهارات"
  if (section === "sold") return "المباعة"
  return "التقارير"
}

function priorityClasses(priority: AdminNotificationItem["priority"]) {
  if (priority === "urgent_booking") return "bg-rose-100 text-rose-700"
  if (priority === "booking") return "bg-emerald-100 text-emerald-700"
  if (priority === "inquiry_due") return "bg-amber-100 text-amber-700"
  if (priority === "inquiry") return "bg-sky-100 text-sky-700"
  return "bg-slate-100 text-slate-700"
}

function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="text-right">
        <p className="text-[11px] font-black text-slate-400">Admin View</p>
        <h2 className="mt-1 text-[22px] font-black text-[#06142f] lg:text-[26px]">{title}</h2>
        <p className="mt-1 text-[12px] font-bold text-slate-500 lg:text-[13px]">{subtitle}</p>
      </div>
    </div>
  )
}

export default function AlertsPage({
  alerts,
  onNavigate,
}: {
  alerts: AdminNotificationItem[]
  onNavigate: (section: AdminSection) => void
}) {
  const urgentCount = alerts.filter((item) => item.priority === "urgent_booking").length
  const dueCount = alerts.filter((item) => item.priority === "inquiry_due").length
  const propertyCount = alerts.filter((item) => item.relatedSection === "properties").length
  const adCount = alerts.filter((item) => item.relatedSection === "ads").length

  return (
    <div className="space-y-4">
      <PageHeader
        title="الإشعارات والتنبيهات"
        subtitle="ترتيب واضح للحجوزات المستعجلة والاستفسارات ومشاكل العقارات والإشهارات"
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-black text-slate-400">حجوزات مستعجلة</p>
          <p className="mt-2 text-[28px] font-black text-rose-700">{urgentCount}</p>
        </div>

        <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-black text-slate-400">استفسارات مستعجلة</p>
          <p className="mt-2 text-[28px] font-black text-amber-700">{dueCount}</p>
        </div>

        <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-black text-slate-400">مشاكل العقارات</p>
          <p className="mt-2 text-[28px] font-black text-[#06142f]">{propertyCount}</p>
        </div>

        <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-black text-slate-400">مشاكل الإشهارات</p>
          <p className="mt-2 text-[28px] font-black text-[#06142f]">{adCount}</p>
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        {alerts.length === 0 ? (
          <div className="rounded-[16px] bg-slate-50 px-4 py-5 text-right">
            <p className="text-[14px] font-bold text-slate-500">ما كاين حتى تنبيه مهم دابا.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.relatedSection as AdminSection)}
                className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-right transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black ${priorityClasses(item.priority)}`}
                    >
                      {priorityLabel(item.priority)}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#06142f] ring-1 ring-slate-200">
                      {sectionLabel(item.relatedSection)}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-[15px] font-black text-[#06142f]">{item.title}</p>
                    <p className="mt-1 text-[12px] font-bold text-slate-500">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
