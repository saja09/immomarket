export type AdminMessagePriority = "urgent_booking" | "booking" | "inquiry_due" | "inquiry" | "normal"

export type AdminNotificationItem = {
  id: string
  title: string
  description: string
  priority: AdminMessagePriority
  relatedSection: "messages" | "visits" | "leads" | "properties" | "ads" | "sold" | "reports"
  createdAt: string
}

export type ReminderMessageInput = {
  id: number
  senderName: string
  propertyTitle: string
  createdAt: string
  status: string
  source: string
  messageType?: "booking" | "inquiry"
}

export type PropertyHealthInput = {
  id: number
  title: string
  image: string
  description: string
  ownerName: string
  sellerName: string
  propertyPhone: string
  propertyWhatsapp: string
  featured: boolean
  hidden: boolean
  visitsCount?: number
  leadsCount?: number
}

export type AdHealthInput = {
  id: number
  name: string
  propertyTitle: string
  budgetDh: number
  visitsCount: number
  leadsCount: number
  result: string
}

export function formatHoursLeft(dateString: string, totalHours = 24) {
  if (!dateString) return null

  const createdAt = new Date(dateString).getTime()
  if (Number.isNaN(createdAt)) return null

  const now = Date.now()
  const elapsedMs = now - createdAt
  const elapsedHours = elapsedMs / (1000 * 60 * 60)
  const left = Math.max(0, totalHours - elapsedHours)

  return Number(left.toFixed(1))
}

export function buildMessagePriority(message: ReminderMessageInput): AdminMessagePriority {
  const type = message.messageType || "inquiry"
  const hoursLeft = formatHoursLeft(message.createdAt, 24)

  if (type === "booking") {
    if (message.status === "new" || message.status === "unread") return "urgent_booking"
    return "booking"
  }

  if (hoursLeft !== null && hoursLeft <= 3 && message.status !== "followed" && message.status !== "archived") {
    return "inquiry_due"
  }

  if (type === "inquiry") return "inquiry"

  return "normal"
}

export function sortByPriorityAndTime<T extends { createdAt: string; priority: AdminMessagePriority }>(items: T[]) {
  const order: Record<AdminMessagePriority, number> = {
    urgent_booking: 1,
    booking: 2,
    inquiry_due: 3,
    inquiry: 4,
    normal: 5,
  }

  return [...items].sort((a, b) => {
    const p = order[a.priority] - order[b.priority]
    if (p !== 0) return p
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function buildPropertyAlerts(properties: PropertyHealthInput[]) {
  const alerts: AdminNotificationItem[] = []

  properties.forEach((property) => {
    if (!property.image) {
      alerts.push({
        id: `property-image-${property.id}`,
        title: "عقار ناقص الصورة الرئيسية",
        description: property.title,
        priority: "normal",
        relatedSection: "properties",
        createdAt: new Date().toISOString(),
      })
    }

    if (!property.description || property.description.trim().length < 25) {
      alerts.push({
        id: `property-description-${property.id}`,
        title: "عقار خاصو وصف أقوى",
        description: property.title,
        priority: "normal",
        relatedSection: "properties",
        createdAt: new Date().toISOString(),
      })
    }

    if (!property.ownerName) {
      alerts.push({
        id: `property-owner-${property.id}`,
        title: "عقار غير مربوط بمالك",
        description: property.title,
        priority: "normal",
        relatedSection: "properties",
        createdAt: new Date().toISOString(),
      })
    }

    if (!property.sellerName) {
      alerts.push({
        id: `property-seller-${property.id}`,
        title: "عقار غير مربوط ببائع",
        description: property.title,
        priority: "normal",
        relatedSection: "properties",
        createdAt: new Date().toISOString(),
      })
    }

    if (!property.propertyPhone && !property.propertyWhatsapp) {
      alerts.push({
        id: `property-contact-${property.id}`,
        title: "عقار بلا وسيلة تواصل",
        description: property.title,
        priority: "normal",
        relatedSection: "properties",
        createdAt: new Date().toISOString(),
      })
    }
  })

  return alerts
}

export function buildAdAlerts(ads: AdHealthInput[]) {
  const alerts: AdminNotificationItem[] = []

  ads.forEach((ad) => {
    if (ad.budgetDh > 0 && ad.leadsCount === 0 && ad.visitsCount > 0) {
      alerts.push({
        id: `ad-needs-review-${ad.id}`,
        title: "إشهار خاصو تعديل",
        description: `${ad.name} • ${ad.propertyTitle || "المنصة"}`,
        priority: "normal",
        relatedSection: "ads",
        createdAt: new Date().toISOString(),
      })
    }

    if (ad.visitsCount < 10 && ad.budgetDh >= 500) {
      alerts.push({
        id: `ad-budget-low-${ad.id}`,
        title: "إشهار ضعيف الأداء",
        description: `${ad.name} • خاص مراجعة أو رفع الميزانية`,
        priority: "normal",
        relatedSection: "ads",
        createdAt: new Date().toISOString(),
      })
    }
  })

  return alerts
}

export function buildMessageAlerts(messages: ReminderMessageInput[]) {
  const alerts: AdminNotificationItem[] = []

  messages.forEach((message) => {
    const priority = buildMessagePriority(message)
    const hoursLeft = formatHoursLeft(message.createdAt, 24)

    if (priority === "urgent_booking") {
      alerts.push({
        id: `booking-${message.id}`,
        title: "طلب حجز جديد عندو أولوية قصوى",
        description: `${message.senderName} • ${message.propertyTitle || "بدون عقار"}`,
        priority,
        relatedSection: "messages",
        createdAt: message.createdAt,
      })
    }

    if (priority === "inquiry_due") {
      alerts.push({
        id: `inquiry-due-${message.id}`,
        title: "استفسار خاصو جواب قبل نهاية 24 ساعة",
        description: `${message.senderName} • باقي تقريباً ${hoursLeft} س`,
        priority,
        relatedSection: "messages",
        createdAt: message.createdAt,
      })
    }
  })

  return sortByPriorityAndTime(alerts)
}
