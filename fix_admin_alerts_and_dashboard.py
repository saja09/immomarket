from pathlib import Path

path = Path.home() / "immomarket" / "src" / "admin" / "AdminApp.tsx"
text = path.read_text()

# 1) fix sidebar label for alerts
text = text.replace(
    '{ key: "alerts", title: "الإشعارات", short: "الحملات" },',
    '{ key: "alerts", title: "الإشعارات", short: "التنبيهات" },'
)

# 2) Dashboard props: ensure alerts prop exists
old = """  reports,
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
}) {"""
new = """  reports,
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
}) {"""
if old in text:
    text = text.replace(old, new, 1)

# 3) Dashboard destructuring
old = """function Dashboard({
  onNavigate,
  properties,
  owners,
  sellers,
  leads,
  visits,
  messages,
  ads,
  reports,
}: {"""
new = """function Dashboard({
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
}: {"""
if old in text:
    text = text.replace(old, new, 1)

# 4) Use alerts directly instead of recomputing inside Dashboard
old = """  const notifications = useMemo(() => {
    const messageAlerts = buildMessageAlerts(messages)
    const propertyAlerts = buildPropertyAlerts(
      properties.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        description: item.description,
        ownerName: item.ownerName,
        sellerName: item.sellerName,
        propertyPhone: item.propertyPhone,
        propertyWhatsapp: item.propertyWhatsapp,
        featured: item.featured,
        hidden: item.hidden,
        visitsCount: item.viewsCount || 0,
        leadsCount: 0,
      }))
    )
    const adAlerts = buildAdAlerts(
      ads.map((ad) => ({
        id: ad.id,
        name: ad.name,
        propertyTitle: ad.propertyTitle,
        budgetDh: ad.budgetDh,
        visitsCount: ad.visitsCount,
        leadsCount: ad.leadsCount,
        result: ad.result,
      }))
    )

    return sortByPriorityAndTime([...messageAlerts, ...propertyAlerts, ...adAlerts]).slice(0, 8)
  }, [messages, properties, ads])"""
new = """  const notifications = alerts.slice(0, 8)"""
if old in text:
    text = text.replace(old, new, 1)

# 5) Add alerts count to dashboard stats
old = """  const stats = [
    { title: "العقارات", value: total, note: "كل العقارات", section: "properties" as AdminSection },
    { title: "المتاحة", value: available, note: "جاهزة", section: "properties" as AdminSection },
    { title: "المباعة", value: sold, note: "أرشيف البيع", section: "sold" as AdminSection },
    { title: "الطلبات", value: leads.length, note: "الزبناء", section: "leads" as AdminSection },
    { title: "الزيارات", value: visits.length, note: "المتابعة", section: "visits" as AdminSection },
    { title: "الرسائل", value: messages.length, note: "التواصل", section: "messages" as AdminSection },
  ]"""
new = """  const stats = [
    { title: "العقارات", value: total, note: "كل العقارات", section: "properties" as AdminSection },
    { title: "المتاحة", value: available, note: "جاهزة", section: "properties" as AdminSection },
    { title: "المباعة", value: sold, note: "أرشيف البيع", section: "sold" as AdminSection },
    { title: "الطلبات", value: leads.length, note: "الزبناء", section: "leads" as AdminSection },
    { title: "الزيارات", value: visits.length, note: "المتابعة", section: "visits" as AdminSection },
    { title: "الرسائل", value: messages.length, note: "التواصل", section: "messages" as AdminSection },
    { title: "الإشعارات", value: alerts.length, note: "التنبيهات", section: "alerts" as AdminSection },
  ]"""
if old in text:
    text = text.replace(old, new, 1)

# 6) Add alerts module card
old = """  const modules = [
    { title: "إضافة عقار", desc: "إدخال عقار جديد مباشرة.", section: "add-property" as AdminSection },
    { title: "وثائق العقارات", desc: "رفع الوثائق وربطها بكل عقار.", section: "documents" as AdminSection },
    { title: "الإحصائيات والتقارير", desc: "رؤية شاملة للأداء والنتائج.", section: "stats-reports" as AdminSection },
    { title: "الرسائل", desc: "الحجوزات والاستفسارات بالأولوية.", section: "messages" as AdminSection },
  ]"""
new = """  const modules = [
    { title: "إضافة عقار", desc: "إدخال عقار جديد مباشرة.", section: "add-property" as AdminSection },
    { title: "وثائق العقارات", desc: "رفع الوثائق وربطها بكل عقار.", section: "documents" as AdminSection },
    { title: "الإحصائيات والتقارير", desc: "رؤية شاملة للأداء والنتائج.", section: "stats-reports" as AdminSection },
    { title: "الإشعارات", desc: "كل التنبيهات والأولويات فبلاصة وحدة.", section: "alerts" as AdminSection },
    { title: "الرسائل", desc: "الحجوزات والاستفسارات بالأولوية.", section: "messages" as AdminSection },
  ]"""
if old in text:
    text = text.replace(old, new, 1)

# 7) Ensure allAlerts memo exists before content
anchor = '  const content = useMemo(() => {'
if anchor in text and 'const allAlerts = useMemo(() => {' not in text:
    insert = """  const allAlerts = useMemo(() => {
    const messageAlerts = buildMessageAlerts(messages)
    const propertyAlerts = buildPropertyAlerts(
      properties.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        description: item.description,
        ownerName: item.ownerName,
        sellerName: item.sellerName,
        propertyPhone: item.propertyPhone,
        propertyWhatsapp: item.propertyWhatsapp,
        featured: item.featured,
        hidden: item.hidden,
        visitsCount: item.viewsCount || 0,
        leadsCount: 0,
      }))
    )
    const adAlerts = buildAdAlerts(
      ads.map((ad) => ({
        id: ad.id,
        name: ad.name,
        propertyTitle: ad.propertyTitle,
        budgetDh: ad.budgetDh,
        visitsCount: ad.visitsCount,
        leadsCount: ad.leadsCount,
        result: ad.result,
      }))
    )

    return sortByPriorityAndTime([...messageAlerts, ...propertyAlerts, ...adAlerts])
  }, [messages, properties, ads])

"""
    text = text.replace(anchor, insert + anchor, 1)

# 8) pass alerts into Dashboard first occurrence
old = """          <Dashboard
            onNavigate={setSection}
            properties={properties}
            owners={owners}
            sellers={sellers}
            leads={leads}
            visits={visits}
            messages={messages}
            ads={ads}
            reports={reports}
          />"""
new = """          <Dashboard
            onNavigate={setSection}
            properties={properties}
            owners={owners}
            sellers={sellers}
            leads={leads}
            visits={visits}
            messages={messages}
            ads={ads}
            reports={reports}
            alerts={allAlerts}
          />"""
if old in text:
    text = text.replace(old, new, 1)

# 9) pass alerts into Dashboard default occurrence
if old in text:
    text = text.replace(old, new, 1)

# 10) add alerts case if missing
case_anchor = """      case "documents":
        return (
          <ReportsPage
            reports={reports}
            properties={properties.map((item) => ({
              id: item.id,
              title: item.title,
              district: item.district,
            }))}
            onSave={handleAddReport}
            onDelete={handleDeleteReport}
          />
        )

      case "stats-reports":
        return (
          <StatsReportsPage"""
if case_anchor in text and 'case "alerts":' not in text:
    replacement = """      case "documents":
        return (
          <ReportsPage
            reports={reports}
            properties={properties.map((item) => ({
              id: item.id,
              title: item.title,
              district: item.district,
            }))}
            onSave={handleAddReport}
            onDelete={handleDeleteReport}
          />
        )

      case "alerts":
        return <AlertsPage alerts={allAlerts} onNavigate={setSection} />

      case "stats-reports":
        return (
          <StatsReportsPage"""
    text = text.replace(case_anchor, replacement, 1)

# 11) wire create visit from message if not already wired
if "onCreateVisit={handleCreateVisitFromMessage}" not in text:
    old = """        return (
          <MessagesPage
            messages={messages}
            properties={properties}
            onSave={handleAddMessage}
            onDelete={handleDeleteMessage}
            onChangeStatus={handleChangeMessageStatus}
          />
        )"""
    new = """        return (
          <MessagesPage
            messages={messages}
            properties={properties}
            onSave={handleAddMessage}
            onDelete={handleDeleteMessage}
            onChangeStatus={handleChangeMessageStatus}
            onCreateVisit={handleCreateVisitFromMessage}
          />
        )"""
    if old in text:
        text = text.replace(old, new, 1)

# 12) add create visit handler if missing
if "function handleCreateVisitFromMessage(message: MessageItem)" not in text:
    anchor = """  function handleDeleteAd(id: number) {
    updateAds(ads.filter((item) => item.id !== id))
  }

  function handleAddReport(report: Omit<AdminReportItem, "id" | "createdAt">, editingId?: number) {"""
    insert = """  function handleDeleteAd(id: number) {
    updateAds(ads.filter((item) => item.id !== id))
  }

  function handleCreateVisitFromMessage(message: MessageItem) {
    const nextVisit: Visit = {
      id: Date.now(),
      clientName: message.senderName || "بدون اسم",
      leadId: null,
      propertyId: message.propertyId || null,
      propertyTitle: message.propertyTitle || "",
      ownerName: message.ownerName || "",
      sellerName: message.sellerName || "",
      source: message.source || "WhatsApp",
      visitDate: "",
      visitTime: "",
      status: "pending",
      result: "",
      notes: [
        "تم إنشاء هذه الزيارة مباشرة من صفحة الرسائل.",
        message.body ? `الرسالة الأصلية: ${message.body}` : "",
        message.phone ? `الهاتف: ${message.phone}` : "",
        message.whatsapp ? `الواتساب: ${message.whatsapp}` : "",
        message.propertyLink ? `رابط العقار: ${message.propertyLink}` : "",
      ]
        .filter(Boolean)
        .join("\\n"),
      createdAt: new Date().toISOString(),
    }

    updateVisits([nextVisit, ...visits])
    updateMessages(
      messages.map((item) =>
        item.id === message.id ? { ...item, status: "followed" } : item
      )
    )
    setSection("visits")
  }

  function handleAddReport(report: Omit<AdminReportItem, "id" | "createdAt">, editingId?: number) {"""
    if anchor in text:
        text = text.replace(anchor, insert, 1)

# 13) add onCreateVisit prop in MessagesPage type if missing
if "onCreateVisit: (message: MessageItem) => void" not in text:
    old = """}: {
  messages: MessageItem[]
  properties: AdminProperty[]
  onSave: (message: Omit<MessageItem, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: MessageStatus) => void
}) {"""
    new = """}: {
  messages: MessageItem[]
  properties: AdminProperty[]
  onSave: (message: Omit<MessageItem, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: MessageStatus) => void
  onCreateVisit: (message: MessageItem) => void
}) {"""
    if old in text:
        text = text.replace(old, new, 1)

if "onCreateVisit," not in text:
    old = """function MessagesPage({
  messages,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
}: {"""
    new = """function MessagesPage({
  messages,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
  onCreateVisit,
}: {"""
    if old in text:
        text = text.replace(old, new, 1)

# 14) add button in message cards if missing
if "حوّل إلى زيارة" not in text:
    old = """                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>

                      {item.whatsapp ? ("""
    new = """                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>

                      {item.messageType === "booking" ? (
                        <button
                          type="button"
                          onClick={() => onCreateVisit(item)}
                          className="rounded-full bg-[#06142f] px-3 py-2 text-[11px] font-bold text-white"
                        >
                          حوّل إلى زيارة
                        </button>
                      ) : null}

                      {item.whatsapp ? ("""
    if old in text:
        text = text.replace(old, new, 1)

path.write_text(text)
print(f"Done: {path}")
