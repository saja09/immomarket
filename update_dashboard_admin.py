from pathlib import Path

path = Path("/data/data/com.termux/files/home/immomarket/src/admin/AdminApp.tsx")
text = path.read_text(encoding="utf-8")

start_marker = "function Dashboard({"
end_marker = "function AddPropertyPage({"

start = text.find(start_marker)
end = text.find(end_marker)

if start == -1 or end == -1 or end <= start:
    raise SystemExit("ماقدرتش نلقى بلوك Dashboard داخل AdminApp.tsx")

new_block = '''function Dashboard({
  onNavigate,
  properties,
  owners,
  sellers,
  leads,
  visits,
  messages,
  ads,
  reports,
  alerts,
}: {
  onNavigate: (value: AdminSection) => void
  properties: AdminProperty[]
  owners: Owner[]
  sellers: Seller[]
  leads: Lead[]
  visits: Visit[]
  messages: MessageItem[]
  ads: AdCampaign[]
  reports: AdminReportItem[]
  alerts: ReturnType<typeof sortByPriorityAndTime>
}) {
  const total = properties.length
  const sold = properties.filter((p) => p.status === "sold").length
  const available = properties.filter((p) => p.status === "available").length
  const reserved = properties.filter((p) => p.status === "reserved").length
  const featured = properties.filter((p) => p.featured).length
  const hidden = properties.filter((p) => p.hidden).length

  const latest = [...properties].slice(0, 4)
  const latestMessages = [...messages].slice(0, 5)
  const notifications = alerts.slice(0, 6)

  const urgentBookings = alerts.filter((item) => item.priority === "urgent_booking").length
  const dueInquiries = alerts.filter((item) => item.priority === "inquiry_due").length
  const propertyProblems = alerts.filter((item) => item.relatedSection === "properties").length
  const adProblems = alerts.filter((item) => item.relatedSection === "ads").length

  const mostViewed = [...properties]
    .sort((a, b) => Number(b.viewsCount || 0) - Number(a.viewsCount || 0))
    .slice(0, 5)

  const mostFavorited = [...properties]
    .sort((a, b) => Number(b.favoriteCount || 0) - Number(a.favoriteCount || 0))
    .slice(0, 5)

  const weakProperties = properties.filter(
    (item) =>
      !item.ownerName ||
      !item.sellerName ||
      (!item.propertyPhone && !item.propertyWhatsapp) ||
      !item.image ||
      !item.description ||
      item.description.trim().length < 25
  )

  const todayLabel = new Date().toLocaleDateString("fr-FR")

  const stats = [
    { title: "العقارات", value: total, note: "كل العقارات", section: "properties" as AdminSection },
    { title: "المتاحة", value: available, note: "جاهزة", section: "properties" as AdminSection },
    { title: "المباعة", value: sold, note: "أرشيف البيع", section: "sold" as AdminSection },
    { title: "المحجوزة", value: reserved, note: "قيد المتابعة", section: "properties" as AdminSection },
    { title: "الطلبات", value: leads.length, note: "الزبناء", section: "leads" as AdminSection },
    { title: "الزيارات", value: visits.length, note: "المتابعة", section: "visits" as AdminSection },
    { title: "الرسائل", value: messages.length, note: "التواصل", section: "messages" as AdminSection },
    { title: "الإشعارات", value: alerts.length, note: "التنبيهات", section: "alerts" as AdminSection },
  ]

  const modules = [
    { title: "إضافة عقار", desc: "إدخال عقار جديد مباشرة.", section: "add-property" as AdminSection },
    { title: "وثائق العقارات", desc: "رفع الوثائق وربطها بكل عقار.", section: "documents" as AdminSection },
    { title: "الإحصائيات والتقارير", desc: "رؤية شاملة للأداء والنتائج.", section: "stats-reports" as AdminSection },
    { title: "الرسائل", desc: "الحجوزات والاستفسارات بالأولوية.", section: "messages" as AdminSection },
    { title: "الإشعارات", desc: "الأولويات والمشاكل فبلاصة وحدة.", section: "alerts" as AdminSection },
    { title: "الإشهارات", desc: "مراجعة الحملات والميزانيات.", section: "ads" as AdminSection },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="رؤية أوضح للأداء، الأولويات، والعقارات اللي خاصها تدخل" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((item) => (
          <CompactStatCard
            key={item.title}
            title={item.title}
            value={item.value}
            note={item.note}
            onClick={() => onNavigate(item.section)}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 text-right">
              <p className="text-[11px] font-black text-slate-400">اليوم</p>
              <h3 className="mt-1 text-[22px] font-black text-[#06142f]">ملخص سريع</h3>
              <p className="mt-1 text-[12px] font-bold text-slate-500">{todayLabel}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
                <p className="text-[11px] font-black text-slate-400">الأولويات الحالية</p>
                <p className="mt-2 text-[18px] font-black text-[#06142f]">
                  {urgentBookings} حجوزات مستعجلة • {dueInquiries} استفسارات قريبة
                </p>
                <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                  الحجوزات عندها الأولوية القصوى، والاستفسارات القريبة من 24 ساعة خاصها متابعة سريعة.
                </p>
              </div>

              <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
                <p className="text-[11px] font-black text-slate-400">العقارات</p>
                <p className="mt-2 text-[18px] font-black text-[#06142f]">
                  {featured} مميزة • {hidden} مخفية
                </p>
                <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                  تقدر تمشي مباشرة لإدارة العقارات باش ترتب العرض وتراجع اللي ظاهر والمخفي.
                </p>
              </div>

              <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
                <p className="text-[11px] font-black text-slate-400">الملاك / البائعون</p>
                <p className="mt-2 text-[18px] font-black text-[#06142f]">
                  {owners.length} ملاك • {sellers.length} بائعين
                </p>
                <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                  الربط بين العقار والمالك والبائع دابا كيبان بسرعة من هاد اللوحة.
                </p>
              </div>

              <div className="rounded-[18px] bg-[#f8fafc] p-4 text-right">
                <p className="text-[11px] font-black text-slate-400">التقارير والوثائق</p>
                <p className="mt-2 text-[18px] font-black text-[#06142f]">
                  {reports.length} وثائق • {ads.length} حملات
                </p>
                <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">
                  الوثائق والحملات ولات مجمعة، وخصنا غير نزيدو الدقة فالتتبع اليومي.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onNavigate("alerts")}
                className="rounded-full bg-[#06142f] px-4 py-2 text-[12px] font-bold text-white"
              >
                فتح الإشعارات
              </button>

              <div className="text-right">
                <h3 className="text-[19px] font-black text-[#06142f]">الإشعارات والتنبيهات</h3>
                <p className="mt-1 text-[12px] font-bold text-slate-500">
                  الحجوزات أولاً، ثم الاستفسارات، ثم مشاكل العقارات والإشهارات
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <div className="rounded-[18px] bg-rose-50 p-4 text-right">
                <p className="text-[11px] font-black text-rose-500">حجوزات مستعجلة</p>
                <p className="mt-2 text-[28px] font-black text-rose-700">{urgentBookings}</p>
              </div>

              <div className="rounded-[18px] bg-amber-50 p-4 text-right">
                <p className="text-[11px] font-black text-amber-600">استفسارات مستعجلة</p>
                <p className="mt-2 text-[28px] font-black text-amber-700">{dueInquiries}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 p-4 text-right">
                <p className="text-[11px] font-black text-slate-500">مشاكل العقارات</p>
                <p className="mt-2 text-[28px] font-black text-[#06142f]">{propertyProblems}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 p-4 text-right">
                <p className="text-[11px] font-black text-slate-500">مشاكل الإشهارات</p>
                <p className="mt-2 text-[28px] font-black text-[#06142f]">{adProblems}</p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-[16px] bg-slate-50 px-4 py-4 text-right">
                <p className="text-[13px] font-bold text-slate-500">ما كاين حتى تنبيه مهم دابا.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.relatedSection as AdminSection)}
                    className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-right"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black ${
                            item.priority === "urgent_booking"
                              ? "bg-rose-100 text-rose-700"
                              : item.priority === "inquiry_due"
                              ? "bg-amber-100 text-amber-700"
                              : item.relatedSection === "properties"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-200 text-[#06142f]"
                          }`}
                        >
                          {messagePriorityLabel(item.priority)}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#06142f] ring-1 ring-slate-200">
                          {item.relatedSection === "properties"
                            ? "العقارات"
                            : item.relatedSection === "ads"
                            ? "الإشهارات"
                            : item.relatedSection === "messages"
                            ? "الرسائل"
                            : item.relatedSection === "visits"
                            ? "الزيارات"
                            : item.relatedSection === "leads"
                            ? "الطلبات"
                            : "القسم"}
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

        <div className="space-y-4">
          <InfoBox
            title="الوصول السريع"
            items={[
              "إضافة عقار جديد",
              "إضافة رسالة",
              "تحويل حجز إلى زيارة",
              "رفع وثيقة عقار",
              "فتح الإحصائيات والتقارير",
            ]}
          />

          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 text-right">
              <h3 className="text-[18px] font-black text-[#06142f]">آخر الرسائل</h3>
              <p className="mt-1 text-[12px] font-bold text-slate-500">آخر التواصلات اللي تسجلو</p>
            </div>

            {latestMessages.length === 0 ? (
              <p className="text-right text-[12px] font-bold text-slate-500">مازال ما كاين حتى رسالة.</p>
            ) : (
              <div className="space-y-2">
                {latestMessages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate("messages")}
                    className="w-full rounded-[16px] bg-slate-50 px-4 py-3 text-right"
                  >
                    <p className="text-[14px] font-black text-[#06142f]">{item.senderName}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      {messageTypeLabel(item.messageType)} • {item.propertyTitle || "بدون عقار"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 text-right">
              <h3 className="text-[18px] font-black text-[#06142f]">آخر العقارات</h3>
              <p className="mt-1 text-[12px] font-bold text-slate-500">آخر ما تمت إضافته</p>
            </div>

            {latest.length === 0 ? (
              <p className="text-right text-[12px] font-bold text-slate-500">مازال ما كاين حتى عقار.</p>
            ) : (
              <div className="space-y-2">
                {latest.map((property) => (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => onNavigate("properties")}
                    className="w-full rounded-[16px] bg-slate-50 px-4 py-3 text-right"
                  >
                    <p className="text-[14px] font-black text-[#06142f]">{property.title}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      {property.ownerName || "بدون مالك"} • {property.sellerName || "بدون بائع"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate("properties")}
              className="rounded-full bg-[#06142f] px-4 py-2 text-[12px] font-bold text-white"
            >
              فتح العقارات
            </button>

            <div className="text-right">
              <h3 className="text-[19px] font-black text-[#06142f]">العقارات الأكثر مشاهدة</h3>
              <p className="mt-1 text-[12px] font-bold text-slate-500">باش يبان ليك شكون خدام أحسن</p>
            </div>
          </div>

          {mostViewed.length === 0 ? (
            <div className="rounded-[16px] bg-slate-50 px-4 py-4 text-right">
              <p className="text-[13px] font-bold text-slate-500">مازال ما كاين حتى معطيات مشاهدة.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mostViewed.map((property, index) => (
                <div key={property.id} className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-right">
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#06142f] ring-1 ring-slate-200">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-[#06142f]">{property.title}</p>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {property.city} • {property.district}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                      المشاهدات: {property.viewsCount || 0}
                    </span>
                    <span className="rounded-full bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">
                      المفضلة: {property.favoriteCount || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate("properties")}
              className="rounded-full bg-[#06142f] px-4 py-2 text-[12px] font-bold text-white"
            >
              مراجعة العقارات
            </button>

            <div className="text-right">
              <h3 className="text-[19px] font-black text-[#06142f]">عقارات تحتاج تدخل</h3>
              <p className="mt-1 text-[12px] font-bold text-slate-500">ناقص فيها ربط أو وصف أو وسيلة تواصل</p>
            </div>
          </div>

          {weakProperties.length === 0 ? (
            <div className="rounded-[16px] bg-slate-50 px-4 py-4 text-right">
              <p className="text-[13px] font-bold text-slate-500">مزيان، دابا ما كاين حتى عقار ناقص بشكل واضح.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakProperties.slice(0, 6).map((property) => (
                <div key={property.id} className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-right">
                  <p className="text-[15px] font-black text-[#06142f]">{property.title}</p>
                  <p className="mt-1 text-[12px] font-bold text-slate-500">
                    {property.city} • {property.district}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {!property.ownerName ? (
                      <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">بلا مالك</span>
                    ) : null}
                    {!property.sellerName ? (
                      <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">بلا بائع</span>
                    ) : null}
                    {!property.propertyPhone && !property.propertyWhatsapp ? (
                      <span className="rounded-full bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">بلا تواصل</span>
                    ) : null}
                    {!property.image ? (
                      <span className="rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700">بلا صورة</span>
                    ) : null}
                    {!property.description || property.description.trim().length < 25 ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">وصف ضعيف</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="mb-3 text-right">
          <h3 className="text-[19px] font-black text-[#06142f]">الموديولات الرئيسية</h3>
          <p className="mt-1 text-[12px] font-bold text-slate-500">بطاقات صغيرة للتنقل السريع</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((item) => (
            <ModuleMiniCard
              key={item.title}
              title={item.title}
              desc={item.desc}
              onClick={() => onNavigate(item.section)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InfoBox
          title="الأكثر حفظاً فالمفضلة"
          items={mostFavorited.map((item) => `${item.title} • ${item.favoriteCount || 0} مفضلة`)}
        />

        <InfoBox
          title="ملخص إداري سريع"
          items={[
            `العقارات المتاحة: ${available}`,
            `العقارات المباعة: ${sold}`,
            `الإشعارات الحالية: ${alerts.length}`,
            `الرسائل الحالية: ${messages.length}`,
            `الوثائق المرفوعة: ${reports.length}`,
          ]}
        />
      </div>
    </div>
  )
}

'''

updated = text[:start] + new_block + text[end:]
path.write_text(updated, encoding="utf-8")
print("Done: Dashboard updated successfully")
