from pathlib import Path

path = Path.home() / "immomarket" / "src" / "admin" / "AdminApp.tsx"
text = path.read_text()

old1 = """}: {
  messages: MessageItem[]
  properties: AdminProperty[]
  onSave: (message: Omit<MessageItem, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: MessageStatus) => void
}) {"""
new1 = """}: {
  messages: MessageItem[]
  properties: AdminProperty[]
  onSave: (message: Omit<MessageItem, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: MessageStatus) => void
  onCreateVisit: (message: MessageItem) => void
}) {"""
if old1 not in text:
    raise SystemExit("Block 1 not found")
text = text.replace(old1, new1, 1)

old2 = """function MessagesPage({
  messages,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
}: {"""
new2 = """function MessagesPage({
  messages,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
  onCreateVisit,
}: {"""
if old2 not in text:
    raise SystemExit("Block 2 not found")
text = text.replace(old2, new2, 1)

old3 = """                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>

                      {item.whatsapp ? ("""
new3 = """                      <button
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
if old3 not in text:
    raise SystemExit("Block 3 not found")
text = text.replace(old3, new3, 1)

old4 = """  function handleAddAd(ad: Omit<AdCampaign, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      updateAds(ads.map((item) => (item.id === editingId ? { ...item, ...ad } : item)))
      return
    }
    const nextAd: AdCampaign = { ...ad, id: Date.now(), createdAt: new Date().toISOString() }
    updateAds([nextAd, ...ads])
  }

  function handleDeleteAd(id: number) {
    updateAds(ads.filter((item) => item.id !== id))
  }

  function handleAddReport(report: Omit<AdminReportItem, "id" | "createdAt">, editingId?: number) {"""
new4 = """  function handleAddAd(ad: Omit<AdCampaign, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      updateAds(ads.map((item) => (item.id === editingId ? { ...item, ...ad } : item)))
      return
    }
    const nextAd: AdCampaign = { ...ad, id: Date.now(), createdAt: new Date().toISOString() }
    updateAds([nextAd, ...ads])
  }

  function handleDeleteAd(id: number) {
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
if old4 not in text:
    raise SystemExit("Block 4 not found")
text = text.replace(old4, new4, 1)

old5 = """        return (
          <MessagesPage
            messages={messages}
            properties={properties}
            onSave={handleAddMessage}
            onDelete={handleDeleteMessage}
            onChangeStatus={handleChangeMessageStatus}
          />
        )"""
new5 = """        return (
          <MessagesPage
            messages={messages}
            properties={properties}
            onSave={handleAddMessage}
            onDelete={handleDeleteMessage}
            onChangeStatus={handleChangeMessageStatus}
            onCreateVisit={handleCreateVisitFromMessage}
          />
        )"""
if old5 not in text:
    raise SystemExit("Block 5 not found")
text = text.replace(old5, new5, 1)

path.write_text(text)
print(f"Done: {path}")
