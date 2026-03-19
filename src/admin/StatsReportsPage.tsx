type PropertyStatus = "available" | "negotiation" | "reserved" | "sold"
type MessageStatus = "unread" | "followed" | "archived"
type MessageType = "booking" | "inquiry"

type AdminPropertyLite = {
  id: number
  title: string
  city: string
  district: string
  status: PropertyStatus
  featured?: boolean
  hidden?: boolean
  viewsCount?: number
  favoriteCount?: number
  ownerName?: string
  sellerName?: string
}

type LeadLite = {
  id: number
  source: string
  status: string
  propertyTitle: string
  createdAt: string
}

type VisitLite = {
  id: number
  status: string
  propertyTitle: string
  visitDate: string
  createdAt: string
}

type MessageLite = {
  id: number
  senderName: string
  messageType: MessageType
  status: MessageStatus
  propertyTitle: string
  createdAt: string
}

type AdLite = {
  id: number
  name: string
  platform: string
  propertyTitle: string
  budgetDh: number
  visitsCount: number
  leadsCount: number
}

function formatDh(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value || 0)} DH`
}

function formatDateTime(value: string) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleString("fr-FR")
  } catch {
    return value
  }
}

function csvEscape(value: string | number) {
  const text = String(value ?? "")
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] print:shadow-none print:border print:border-slate-200">
      <div className="text-right">
        <p className="text-[11px] font-black text-slate-400">Admin View</p>
        <h2 className="mt-1 text-[22px] font-black text-[#06142f] lg:text-[26px]">{title}</h2>
        <p className="mt-1 text-[12px] font-bold text-slate-500 lg:text-[13px]">{subtitle}</p>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string
  value: string | number
  note: string
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] print:shadow-none">
      <p className="text-[11px] font-black text-slate-400">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-[26px] font-black leading-none text-[#06142f]">{value}</p>
        <p className="text-[11px] font-bold text-slate-500">{note}</p>
      </div>
    </div>
  )
}

function InfoList({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] print:shadow-none print:border print:border-slate-200">
      <h3 className="text-[18px] font-black text-[#06142f]">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-[12px] font-bold text-slate-500">لا توجد معطيات كافية بعد.</p>
        ) : (
          items.map((item) => (
            <p key={item} className="text-[12px] font-bold text-slate-600">
              • {item}
            </p>
          ))
        )}
      </div>
    </div>
  )
}

export default function StatsReportsPage({
  properties,
  leads,
  visits,
  messages,
  ads,
}: {
  properties: AdminPropertyLite[]
  leads: LeadLite[]
  visits: VisitLite[]
  messages: MessageLite[]
  ads: AdLite[]
}) {
  const totalProperties = properties.length
  const availableProperties = properties.filter((item) => item.status === "available").length
  const soldProperties = properties.filter((item) => item.status === "sold").length
  const featuredProperties = properties.filter((item) => item.featured).length
  const hiddenProperties = properties.filter((item) => item.hidden).length

  const bookingMessages = messages.filter((item) => item.messageType === "booking").length
  const inquiryMessages = messages.filter((item) => item.messageType === "inquiry").length
  const unreadMessages = messages.filter((item) => item.status === "unread").length

  const totalAdBudget = ads.reduce((sum, item) => sum + Number(item.budgetDh || 0), 0)
  const totalAdVisits = ads.reduce((sum, item) => sum + Number(item.visitsCount || 0), 0)
  const totalAdLeads = ads.reduce((sum, item) => sum + Number(item.leadsCount || 0), 0)

  const mostViewed = [...properties]
    .sort((a, b) => Number(b.viewsCount || 0) - Number(a.viewsCount || 0))
    .slice(0, 5)
    .map((item) => `${item.title} • ${item.viewsCount || 0} مشاهدة`)

  const mostFavorited = [...properties]
    .sort((a, b) => Number(b.favoriteCount || 0) - Number(a.favoriteCount || 0))
    .slice(0, 5)
    .map((item) => `${item.title} • ${item.favoriteCount || 0} مفضلة`)

  const strongestAds = [...ads]
    .sort((a, b) => Number(b.leadsCount || 0) - Number(a.leadsCount || 0))
    .slice(0, 5)
    .map((item) => `${item.name} • ${item.leadsCount || 0} طلب`)

  const weakAds = [...ads]
    .filter((item) => Number(item.budgetDh || 0) > 0)
    .sort((a, b) => {
      const aScore = Number(a.leadsCount || 0) - Number(a.budgetDh || 0) / 100
      const bScore = Number(b.leadsCount || 0) - Number(b.budgetDh || 0) / 100
      return aScore - bScore
    })
    .slice(0, 5)
    .map((item) => `${item.name} • ${formatDh(item.budgetDh)} • ${item.leadsCount || 0} طلب`)

  const topOwners = Object.entries(
    properties.reduce<Record<string, number>>((acc, item) => {
      const key = item.ownerName?.trim() || "بدون مالك"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} • ${count} عقار`)

  const topSellers = Object.entries(
    properties.reduce<Record<string, number>>((acc, item) => {
      const key = item.sellerName?.trim() || "بدون بائع"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} • ${count} عقار`)

  const sourceStats = Object.entries(
    leads.reduce<Record<string, number>>((acc, item) => {
      const key = item.source?.trim() || "غير معروف"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, count]) => `${source} • ${count} طلب`)

  function handleExportCsv() {
    const rows: Array<Array<string | number>> = [
      ["ImmoMarket Admin Report", new Date().toLocaleString("fr-FR")],
      [],
      ["القسم", "المؤشر", "القيمة"],
      ["العقارات", "إجمالي العقارات", totalProperties],
      ["العقارات", "العقارات المتاحة", availableProperties],
      ["العقارات", "العقارات المباعة", soldProperties],
      ["العقارات", "العقارات المميزة", featuredProperties],
      ["العقارات", "العقارات المخفية", hiddenProperties],
      ["الطلبات", "إجمالي الطلبات", leads.length],
      ["الزيارات", "إجمالي الزيارات", visits.length],
      ["الرسائل", "الرسائل غير المقروءة", unreadMessages],
      ["الرسائل", "رسائل الحجز", bookingMessages],
      ["الرسائل", "رسائل الاستفسار", inquiryMessages],
      ["الإشهارات", "ميزانية الإشهار", totalAdBudget],
      ["الإشهارات", "زيارات الإعلانات", totalAdVisits],
      ["الإشهارات", "طلبات الإعلانات", totalAdLeads],
      [],
      ["العقارات الأكثر مشاهدة"],
      ["العقار", "المشاهدات"],
      ...[...properties]
        .sort((a, b) => Number(b.viewsCount || 0) - Number(a.viewsCount || 0))
        .slice(0, 10)
        .map((item) => [item.title, Number(item.viewsCount || 0)]),
      [],
      ["العقارات الأكثر مفضلة"],
      ["العقار", "المفضلة"],
      ...[...properties]
        .sort((a, b) => Number(b.favoriteCount || 0) - Number(a.favoriteCount || 0))
        .slice(0, 10)
        .map((item) => [item.title, Number(item.favoriteCount || 0)]),
      [],
      ["الإشهارات"],
      ["الحملة", "المنصة", "العقار", "الميزانية", "الزيارات", "الطلبات"],
      ...ads.map((item) => [
        item.name,
        item.platform,
        item.propertyTitle || "المنصة كاملة",
        item.budgetDh,
        item.visitsCount,
        item.leadsCount,
      ]),
      [],
      ["الرسائل"],
      ["الاسم", "النوع", "الحالة", "العقار", "التاريخ"],
      ...messages.map((item) => [
        item.senderName,
        item.messageType === "booking" ? "حجز" : "استفسار",
        item.status,
        item.propertyTitle || "—",
        formatDateTime(item.createdAt),
      ]),
    ]

    downloadCsv(`immomarket-report-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  function handlePrintPdf() {
    window.print()
  }

  return (
    <div className="space-y-4 print:space-y-3">
      <PageHeader
        title="الإحصائيات والتقارير"
        subtitle="إحصائيات شاملة على العقارات والطلبات والزيارات والرسائل والإشهارات"
      />

      <div className="flex flex-wrap justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-full bg-emerald-600 px-5 py-3 text-[14px] font-bold text-white shadow"
        >
          تحميل Excel / CSV
        </button>

        <button
          type="button"
          onClick={handlePrintPdf}
          className="rounded-full bg-[#06142f] px-5 py-3 text-[14px] font-bold text-white shadow"
        >
          طباعة / حفظ PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="العقارات" value={totalProperties} note="كل العقارات" />
        <StatCard title="المتاحة" value={availableProperties} note="جاهزة" />
        <StatCard title="المباعة" value={soldProperties} note="مباعة" />
        <StatCard title="المميزة" value={featuredProperties} note="Featured" />
        <StatCard title="المخفية" value={hiddenProperties} note="غير ظاهرة" />
        <StatCard title="الطلبات" value={leads.length} note="الزبناء" />
        <StatCard title="الزيارات" value={visits.length} note="المتابعة" />
        <StatCard title="الرسائل غير المقروءة" value={unreadMessages} note="Need follow-up" />
        <StatCard title="رسائل الحجز" value={bookingMessages} note="أولوية" />
        <StatCard title="رسائل الاستفسار" value={inquiryMessages} note="استفسارات" />
        <StatCard title="ميزانية الإشهار" value={formatDh(totalAdBudget)} note="الإجمالي" />
        <StatCard title="طلبات الإعلانات" value={totalAdLeads} note="من الإشهارات" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InfoList title="العقارات الأكثر مشاهدة" items={mostViewed} />
        <InfoList title="العقارات الأكثر حفظاً في المفضلة" items={mostFavorited} />
        <InfoList title="أفضل الإشهارات" items={strongestAds} />
        <InfoList title="إشهارات تحتاج مراجعة" items={weakAds} />
        <InfoList title="أكثر الملاك نشاطاً" items={topOwners} />
        <InfoList title="أكثر البائعين نشاطاً" items={topSellers} />
        <InfoList title="مصادر الطلبات" items={sourceStats} />
        <InfoList
          title="ملخص سريع"
          items={[
            `إجمالي زيارات الإشهارات: ${totalAdVisits}`,
            `إجمالي طلبات الإشهارات: ${totalAdLeads}`,
            `إجمالي الرسائل: ${messages.length}`,
            `إجمالي الزيارات الميدانية: ${visits.length}`,
          ]}
        />
      </div>

      <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] print:shadow-none print:border print:border-slate-200">
        <h3 className="text-[18px] font-black text-[#06142f]">مهم</h3>
        <p className="mt-3 text-[13px] font-bold leading-7 text-slate-600">
          دابا ولى عندك تصدير مباشر من صفحة الإحصائيات:
          تحميل CSV باش يفتح عندك فـ Excel،
          أو طباعة الصفحة / حفظها PDF من المتصفح.
        </p>
      </div>
    </div>
  )
}
