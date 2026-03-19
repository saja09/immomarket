import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminLogin from "./AdminLogin"
import ReportsPage, { type AdminReportItem } from "./ReportsPage"
import StatsReportsPage from "./StatsReportsPage"
import AlertsPage from "./AlertsPage"
import {
  buildAdAlerts,
  buildMessageAlerts,
  buildPropertyAlerts,
  buildMessagePriority,
  sortByPriorityAndTime,
  formatHoursLeft,
  type AdminMessagePriority,
} from "./notifications"

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
  | "alerts"

type PropertyStatus = "available" | "negotiation" | "reserved" | "sold"
type OwnerType = "individual" | "company" | "agency" | "developer"
type LeadStatus = "new" | "contacted" | "interested" | "not_interested" | "visit_booked" | "closed"
type VisitStatus = "pending" | "completed" | "postponed" | "cancelled"
type MessageStatus = "unread" | "followed" | "archived" | "transferred" | "transferred"
type MessageType = "booking" | "inquiry"

type Owner = {
  id: number
  name: string
  companyName: string
  phone: string
  whatsapp: string
  city: string
  address: string
  ownerType: OwnerType
  notes: string
  createdAt: string
}

type Seller = {
  id: number
  name: string
  phone: string
  whatsapp: string
  city: string
  notes: string
  createdAt: string
}

type AdminProperty = {
  id: number
  title: string
  city: string
  district: string
  area: number
  priceDh: number
  supportDh: number
  rooms: number
  bathrooms: number
  kitchens: number
  description: string
  amenities: string[]
  equippedKitchen: boolean
  nearMosque: boolean
  nearSchool: boolean
  image: string
  gallery: string[]
  video: string
  lat: string
  lng: string
  status: PropertyStatus
  hidden: boolean
  featured: boolean
  ownerId: number | null
  ownerName: string
  sellerId: number | null
  sellerName: string
  propertyPhone: string
  propertyWhatsapp: string
  viewsCount?: number
  favoriteCount?: number
  soldAt?: string
  soldPriceDh?: number
  soldBy?: "me" | "other_agency" | "owner" | "unknown"
  saleNotes?: string
  createdAt: string
}

type Lead = {
  id: number
  clientName: string
  phone: string
  whatsapp: string
  propertyId: number | null
  propertyTitle: string
  ownerId: number | null
  ownerName: string
  sellerId: number | null
  sellerName: string
  source: string
  status: LeadStatus
  notes: string
  createdAt: string
}

type Visit = {
  id: number
  clientName: string
  leadId: number | null
  propertyId: number | null
  propertyTitle: string
  ownerName: string
  sellerName: string
  source: string
  visitDate: string
  visitTime: string
  status: VisitStatus
  result: string
  notes: string
  createdAt: string
}

type MessageItem = {
  id: number
  senderName: string
  phone: string
  whatsapp: string
  propertyId: number | null
  propertyNumber: number | null
  propertyTitle: string
  propertyLink: string
  ownerName: string
  sellerName: string
  source: string
  messageType: MessageType
  body: string
  status: MessageStatus
  notes: string
  createdAt: string
}

type AdCampaign = {
  id: number
  name: string
  platform: string
  propertyId: number | null
  propertyTitle: string
  budgetDh: number
  startDate: string
  endDate: string
  visitsCount: number
  leadsCount: number
  result: string
  notes: string
  createdAt: string
}

type UiControls = {
  showMap: boolean
  showWhatsapp: boolean
  showPhone: boolean
  showArVr: boolean
  showSoldProperties: boolean
  showFeaturedProperties: boolean
  showHousingSupport: boolean
}

type SidebarItem = {
  key: AdminSection
  title: string
  short: string
}

const PROPERTIES_STORAGE_KEY = "immomarket_admin_properties"
const FEATURE_OPTIONS_KEY = "immomarket_admin_feature_options"
const OWNERS_STORAGE_KEY = "immomarket_admin_owners"
const SELLERS_STORAGE_KEY = "immomarket_admin_sellers"
const LEADS_STORAGE_KEY = "immomarket_admin_leads"
const VISITS_STORAGE_KEY = "immomarket_admin_visits"
const MESSAGES_STORAGE_KEY = "immomarket_admin_messages"
const ADS_STORAGE_KEY = "immomarket_admin_ads"
const CONTROLS_STORAGE_KEY = "immomarket_admin_controls"
const REPORTS_STORAGE_KEY = "immomarket_admin_reports"

const sidebarItems: SidebarItem[] = [
  { key: "dashboard", title: "Dashboard", short: "الرئيسية" },
  { key: "add-property", title: "إضافة عقار", short: "جديد" },
  { key: "properties", title: "العقارات", short: "الإدارة" },
  { key: "owners", title: "الموردون / الملاك", short: "المالكون" },
  { key: "sellers", title: "البائعون", short: "التواصل" },
  { key: "leads", title: "الطلبات", short: "الزبناء" },
  { key: "visits", title: "الزيارات", short: "المتابعة" },
  { key: "messages", title: "الرسائل", short: "الأولوية" },
  { key: "alerts", title: "الإشعارات", short: "التنبيهات" },
  { key: "documents", title: "وثائق العقارات", short: "الوثائق" },
  { key: "stats-reports", title: "الإحصائيات والتقارير", short: "Reports" },
  { key: "sold", title: "المباعة", short: "الأرشيف" },
  { key: "ads", title: "الإشهارات", short: "الحملات" },
  { key: "controls", title: "التحكم", short: "الواجهة" },
]

const leadSources = [
  "Facebook",
  "Instagram",
  "Google",
  "WhatsApp",
  "TikTok",
  "معرفة شخصية",
  "الموقع مباشرة",
  "وسيط",
  "مصدر آخر",
]

const adPlatforms = ["Facebook", "Instagram", "Google", "TikTok", "Avito", "Autre"]

function formatDh(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value || 0)} DH`
}

function formatDateLabel(value: string) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("fr-FR")
  } catch {
    return value
  }
}

function propertyStatusLabel(status: PropertyStatus) {
  if (status === "available") return "متاح"
  if (status === "negotiation") return "تفاوض"
  if (status === "reserved") return "محجوز"
  return "مباع"
}

function leadStatusLabel(status: LeadStatus) {
  if (status === "new") return "جديد"
  if (status === "contacted") return "تم الاتصال"
  if (status === "interested") return "مهتم"
  if (status === "not_interested") return "غير مهتم"
  if (status === "visit_booked") return "حجز زيارة"
  return "مغلق"
}

function visitStatusLabel(status: VisitStatus) {
  if (status === "pending") return "في الانتظار"
  if (status === "completed") return "تمت"
  if (status === "postponed") return "مؤجلة"
  return "ألغيت"
}

function messageStatusLabel(status: MessageStatus) {
  if (status === "unread") return "غير مقروءة"
  if (status === "followed") return "تمت المتابعة"
  if (status === "transferred") return "تم التحويل"
  return "مؤرشفة"
}

function ownerTypeLabel(value: OwnerType) {
  if (value === "company") return "شركة"
  if (value === "agency") return "وكالة"
  if (value === "developer") return "منعش"
  return "فرد"
}

function soldByLabel(value?: "me" | "other_agency" | "owner" | "unknown") {
  if (value === "me") return "أنا"
  if (value === "other_agency") return "وكالة أخرى"
  if (value === "owner") return "المالك مباشرة"
  return "غير معروف"
}

function messageTypeLabel(value: MessageType) {
  return value === "booking" ? "طلب موعد / معاينة" : "طلب استفسار"
}

function inquiryDeadlineLabel(item: { messageType: MessageType; status: MessageStatus; hoursLeft?: number | null }) {
  if (item.messageType !== "inquiry") return null
  if (item.status === "transferred") return "تم التحويل"
  if (item.status === "archived" || item.status === "followed") return "تمت المعالجة"
  if (item.hoursLeft === null || item.hoursLeft === undefined) return "داخل الأجل"
  if (item.hoursLeft <= 0) return "فات الأجل"
  if (item.hoursLeft <= 3) return "قرب يسالي"
  return "داخل الأجل"
}

function inquiryDeadlineClasses(item: { messageType: MessageType; status: MessageStatus; hoursLeft?: number | null }) {
  const label = inquiryDeadlineLabel(item)
  if (label === "تم التحويل") return "bg-violet-100 text-violet-700"
  if (label === "تمت المعالجة") return "bg-emerald-100 text-emerald-700"
  if (label === "فات الأجل") return "bg-rose-100 text-rose-700"
  if (label === "قرب يسالي") return "bg-amber-100 text-amber-700"
  return "bg-sky-100 text-sky-700"
}

function messagePriorityLabel(value: AdminMessagePriority) {
  if (value === "urgent_booking") return "أولوية قصوى"
  if (value === "booking") return "حجز"
  if (value === "inquiry_due") return "استفسار مستعجل"
  if (value === "inquiry") return "استفسار"
  return "عادي"
}

function getOwnerDisplayName(owner: Owner) {
  return owner.companyName.trim() || owner.name.trim() || "بدون اسم"
}

function getSellerDisplayName(seller: Seller) {
  return seller.name.trim() || "بدون اسم"
}

function safeReadJsonArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveJsonArray(key: string, value: unknown[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

function safeReadJsonObject<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? { ...fallback, ...parsed } : fallback
  } catch {
    return fallback
  }
}

function saveJsonObject(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function safeReadProperties() {
  return safeReadJsonArray<AdminProperty>(PROPERTIES_STORAGE_KEY)
}
function saveProperties(list: AdminProperty[]) {
  saveJsonArray(PROPERTIES_STORAGE_KEY, list)
}
function safeReadOwners() {
  return safeReadJsonArray<Owner>(OWNERS_STORAGE_KEY)
}
function saveOwners(list: Owner[]) {
  saveJsonArray(OWNERS_STORAGE_KEY, list)
}
function safeReadSellers() {
  return safeReadJsonArray<Seller>(SELLERS_STORAGE_KEY)
}
function saveSellers(list: Seller[]) {
  saveJsonArray(SELLERS_STORAGE_KEY, list)
}
function safeReadLeads() {
  return safeReadJsonArray<Lead>(LEADS_STORAGE_KEY)
}
function saveLeads(list: Lead[]) {
  saveJsonArray(LEADS_STORAGE_KEY, list)
}
function safeReadVisits() {
  return safeReadJsonArray<Visit>(VISITS_STORAGE_KEY)
}
function saveVisits(list: Visit[]) {
  saveJsonArray(VISITS_STORAGE_KEY, list)
}
function safeReadMessages() {
  return safeReadJsonArray<MessageItem>(MESSAGES_STORAGE_KEY)
}
function saveMessages(list: MessageItem[]) {
  saveJsonArray(MESSAGES_STORAGE_KEY, list)
}
function safeReadAds() {
  return safeReadJsonArray<AdCampaign>(ADS_STORAGE_KEY)
}
function saveAds(list: AdCampaign[]) {
  saveJsonArray(ADS_STORAGE_KEY, list)
}
function safeReadReports() {
  return safeReadJsonArray<AdminReportItem>(REPORTS_STORAGE_KEY)
}
function saveReports(list: AdminReportItem[]) {
  saveJsonArray(REPORTS_STORAGE_KEY, list)
}

function safeReadControls(): UiControls {
  return safeReadJsonObject<UiControls>(CONTROLS_STORAGE_KEY, {
    showMap: true,
    showWhatsapp: true,
    showPhone: true,
    showArVr: true,
    showSoldProperties: true,
    showFeaturedProperties: true,
    showHousingSupport: true,
  })
}

function saveControls(value: UiControls) {
  saveJsonObject(CONTROLS_STORAGE_KEY, value)
}

function safeReadFeatureOptions(): string[] {
  try {
    const raw = localStorage.getItem(FEATURE_OPTIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item || "").trim()).filter(Boolean)
      : []
  } catch {
    return []
  }
}

function saveFeatureOptions(list: string[]) {
  localStorage.setItem(
    FEATURE_OPTIONS_KEY,
    JSON.stringify(Array.from(new Set(list.map((item) => String(item || "").trim()).filter(Boolean))))
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
    />
  )
}

function Select({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-right outline-none focus:border-[#06142f] ${className}`}
    >
      {options.map((option) => (
        <option key={`${option.value}-${option.label}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
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

function CompactStatCard({
  title,
  value,
  note,
  onClick,
}: {
  title: string
  value: string | number
  note: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
    >
      <p className="text-[11px] font-black text-slate-400">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-[24px] font-black leading-none text-[#06142f] lg:text-[28px]">{value}</p>
        <p className="text-[11px] font-bold text-slate-500">{note}</p>
      </div>
    </button>
  )
}

function ModuleMiniCard({
  title,
  desc,
  onClick,
}: {
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
    >
      <p className="text-[16px] font-black text-[#06142f]">{title}</p>
      <p className="mt-2 text-[11px] font-bold leading-6 text-slate-500">{desc}</p>
    </button>
  )
}

function InfoBox({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-[20px] bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <h3 className="text-[18px] font-black text-[#06142f]">{title}</h3>
      <div className="mt-3 space-y-2 text-[12px] font-bold text-slate-600">
        {items.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </div>
  )
}

function DesktopSidebar({
  section,
  onNavigate,
  onLogout,
}: {
  section: AdminSection
  onNavigate: (value: AdminSection) => void
  onLogout: () => void
}) {
  return (
    <aside className="hidden lg:flex lg:min-h-[calc(100vh-2rem)] lg:flex-col lg:rounded-[28px] lg:bg-[#06142f] lg:p-4 lg:text-white lg:shadow-[0_18px_45px_rgba(6,20,47,0.18)]">
      <div className="rounded-[22px] bg-white/10 p-4 text-right">
        <p className="text-[11px] font-bold text-slate-200">لوحة الإدارة</p>
        <h1 className="mt-2 text-[24px] font-black leading-tight">ImmoMarket</h1>
        <p className="mt-1 text-[12px] font-bold text-slate-300">Admin Panel</p>
      </div>

      <div className="mt-4 space-y-2">
        {sidebarItems.map((item) => {
          const active = section === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`w-full rounded-[16px] px-4 py-3 text-right transition ${
                active ? "bg-white text-[#06142f]" : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <p className="text-[15px] font-black">{item.title}</p>
              <p className={`mt-1 text-[11px] font-bold ${active ? "text-slate-500" : "text-slate-300"}`}>
                {item.short}
              </p>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto rounded-[16px] bg-white/10 px-4 py-3 text-[14px] font-black text-white"
      >
        تسجيل الخروج
      </button>
    </aside>
  )
}

function MobileHeader({
  section,
  onNavigate,
  onLogout,
}: {
  section: AdminSection
  onNavigate: (value: AdminSection) => void
  onLogout: () => void
}) {
  return (
    <div className="space-y-3 lg:hidden">
      <div className="rounded-[22px] bg-[#06142f] px-4 py-4 text-white shadow-[0_12px_30px_rgba(6,20,47,0.16)]">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold"
          >
            خروج
          </button>

          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-300">لوحة الإدارة</p>
            <h1 className="mt-1 text-[24px] font-black">ImmoMarket</h1>
            <p className="text-[12px] font-bold text-slate-300">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.05)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {sidebarItems.map((item) => {
            const active = section === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`shrink-0 rounded-[16px] px-4 py-3 text-right transition ${
                  active ? "bg-[#06142f] text-white" : "bg-slate-100 text-[#06142f]"
                }`}
              >
                <p className="text-[13px] font-black">{item.title}</p>
                <p className={`mt-1 text-[10px] font-bold ${active ? "text-slate-200" : "text-slate-500"}`}>
                  {item.short}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Dashboard({
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

function AddPropertyPage({
  onAdd,
  editingProperty,
  onCancelEdit,
  owners,
  sellers,
}: {
  onAdd: (property: Omit<AdminProperty, "id" | "createdAt">, editingId?: number) => void
  editingProperty: AdminProperty | null
  onCancelEdit: () => void
  owners: Owner[]
  sellers: Seller[]
}) {
  const defaultFeatureOptions = ["مطبخ مجهز", "قرب المسجد", "قرب المدرسة"]

  const [title, setTitle] = useState("")
  const [city, setCity] = useState("سيدي علال البحراوي")
  const [district, setDistrict] = useState("")
  const [area, setArea] = useState("")
  const [priceDh, setPriceDh] = useState("")
  const [supportDh, setSupportDh] = useState("0")
  const [rooms, setRooms] = useState("2")
  const [bathrooms, setBathrooms] = useState("1")
  const [kitchens, setKitchens] = useState("1")
  const [description, setDescription] = useState("")
  const [amenitiesText, setAmenitiesText] = useState("")
  const [equippedKitchen, setEquippedKitchen] = useState(false)
  const [nearMosque, setNearMosque] = useState(false)
  const [nearSchool, setNearSchool] = useState(false)
  const [image, setImage] = useState("")
  const [gallery, setGallery] = useState<string[]>([])
  const [video, setVideo] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [status, setStatus] = useState<PropertyStatus>("available")
  const [featured, setFeatured] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [featureOptions, setFeatureOptions] = useState<string[]>(defaultFeatureOptions)
  const [newFeature, setNewFeature] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [sellerId, setSellerId] = useState("")
  const [propertyPhone, setPropertyPhone] = useState("")
  const [propertyWhatsapp, setPropertyWhatsapp] = useState("")

  useEffect(() => {
    const saved = safeReadFeatureOptions()
    if (saved.length) setFeatureOptions(Array.from(new Set([...defaultFeatureOptions, ...saved])))
  }, [])

  useEffect(() => {
    if (!editingProperty) {
      resetForm()
      return
    }

    setTitle(editingProperty.title)
    setCity(editingProperty.city)
    setDistrict(editingProperty.district)
    setArea(String(editingProperty.area))
    setPriceDh(String(editingProperty.priceDh))
    setSupportDh(String(editingProperty.supportDh))
    setRooms(String(editingProperty.rooms))
    setBathrooms(String(editingProperty.bathrooms))
    setKitchens(String(editingProperty.kitchens))
    setDescription(editingProperty.description)
    setAmenitiesText((editingProperty.amenities || []).join("\n"))
    setEquippedKitchen(!!editingProperty.equippedKitchen)
    setNearMosque(!!editingProperty.nearMosque)
    setNearSchool(!!editingProperty.nearSchool)
    setImage(editingProperty.image)
    setGallery(editingProperty.gallery || [])
    setVideo(editingProperty.video)
    setLat(editingProperty.lat)
    setLng(editingProperty.lng)
    setStatus(editingProperty.status)
    setFeatured(editingProperty.featured)
    setHidden(editingProperty.hidden)
    setOwnerId(editingProperty.ownerId ? String(editingProperty.ownerId) : "")
    setSellerId(editingProperty.sellerId ? String(editingProperty.sellerId) : "")
    setPropertyPhone(editingProperty.propertyPhone || "")
    setPropertyWhatsapp(editingProperty.propertyWhatsapp || "")
    setMessage("")
    setActiveIndex(0)

    const merged = Array.from(
      new Set([...defaultFeatureOptions, ...(editingProperty.amenities || []).filter(Boolean), ...safeReadFeatureOptions()])
    )
    setFeatureOptions(merged)
    saveFeatureOptions(merged)
  }, [editingProperty])

  function resetForm() {
    setTitle("")
    setCity("سيدي علال البحراوي")
    setDistrict("")
    setArea("")
    setPriceDh("")
    setSupportDh("0")
    setRooms("2")
    setBathrooms("1")
    setKitchens("1")
    setDescription("")
    setAmenitiesText("")
    setEquippedKitchen(false)
    setNearMosque(false)
    setNearSchool(false)
    setImage("")
    setGallery([])
    setVideo("")
    setLat("")
    setLng("")
    setStatus("available")
    setFeatured(false)
    setHidden(false)
    setOwnerId("")
    setSellerId("")
    setPropertyPhone("")
    setPropertyWhatsapp("")
    setMessage("")
    setActiveIndex(0)
    setNewFeature("")
  }

  async function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingMain(true)
      setMessage("جاري تجهيز الصورة الرئيسية...")
      const dataUrl = await fileToDataUrl(file)
      setImage(dataUrl)
      if (!gallery.length) setGallery([dataUrl])
      setActiveIndex(0)
      setMessage("تم تجهيز الصورة الرئيسية بنجاح.")
    } catch {
      setMessage("وقع خطأ فرفع الصورة الرئيسية.")
    } finally {
      setUploadingMain(false)
    }
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    try {
      setUploadingGallery(true)
      setMessage("جاري تجهيز صور gallery...")
      const results = await Promise.allSettled(files.map((file) => fileToDataUrl(file)))
      const ok = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value)
      const failed = results.length - ok.length
      if (!ok.length) {
        setMessage("فشل تجهيز الصور المختارة. جرب عدد أقل أو صور بحجم أصغر.")
        return
      }
      const nextGallery = [...gallery, ...ok]
      setGallery(nextGallery)
      if (!image && nextGallery[0]) setImage(nextGallery[0])
      setMessage(
        failed > 0
          ? `وقع خطأ فرفع ${failed} من الصور، والباقي ترفع مزيان.`
          : `تم تجهيز ${ok.length} صورة بنجاح.`
      )
    } catch {
      setMessage("وقع خطأ فرفع بعض صور gallery.")
    } finally {
      setUploadingGallery(false)
    }
  }

  function handleRemoveGalleryImage(index: number) {
    const next = gallery.filter((_, i) => i !== index)
    const removed = gallery[index]
    setGallery(next)

    if (image === removed) {
      setImage(next[0] || "")
      setActiveIndex(0)
    } else if (activeIndex >= next.length) {
      setActiveIndex(Math.max(0, next.length - 1))
    }
  }

  function handlePickAsMain(index: number) {
    const selected = gallery[index]
    if (!selected) return
    setImage(selected)
    setActiveIndex(index)
  }

  const selectedAmenities = useMemo(() => {
    return amenitiesText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }, [amenitiesText])

  function syncAmenities(list: string[]) {
    setAmenitiesText(Array.from(new Set(list)).join("\n"))
  }

  function isFeatureChecked(feature: string) {
    return selectedAmenities.includes(feature)
  }

  function toggleFeature(feature: string) {
    if (feature === "مطبخ مجهز") return setEquippedKitchen((prev) => !prev)
    if (feature === "قرب المسجد") return setNearMosque((prev) => !prev)
    if (feature === "قرب المدرسة") return setNearSchool((prev) => !prev)

    if (isFeatureChecked(feature)) {
      syncAmenities(selectedAmenities.filter((item) => item !== feature))
    } else {
      syncAmenities([...selectedAmenities, feature])
    }
  }

  function isChecked(feature: string) {
    if (feature === "مطبخ مجهز") return equippedKitchen
    if (feature === "قرب المسجد") return nearMosque
    if (feature === "قرب المدرسة") return nearSchool
    return isFeatureChecked(feature)
  }

  function handleAddFeature() {
    const value = newFeature.trim()
    if (!value) {
      setMessage("كتب الميزة الجديدة أولاً.")
      return
    }

    const nextOptions = Array.from(new Set([...featureOptions, value]))
    setFeatureOptions(nextOptions)
    saveFeatureOptions(nextOptions)
    if (!selectedAmenities.includes(value)) syncAmenities([...selectedAmenities, value])

    setNewFeature("")
    setMessage(`تمت إضافة الميزة: ${value}`)
  }

  function handleOwnerChange(value: string) {
    setOwnerId(value)
    const owner = owners.find((item) => String(item.id) === value)
    if (owner) {
      if (!propertyPhone.trim()) setPropertyPhone(owner.phone || "")
      if (!propertyWhatsapp.trim()) setPropertyWhatsapp(owner.whatsapp || "")
    }
  }

  function handleSellerChange(value: string) {
    setSellerId(value)
    const seller = sellers.find((item) => String(item.id) === value)
    if (seller) {
      setPropertyPhone((prev) => (prev.trim() ? prev : seller.phone || ""))
      setPropertyWhatsapp((prev) => (prev.trim() ? prev : seller.whatsapp || ""))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!title.trim() || !district.trim() || !area || !priceDh) {
      setMessage("عمر العنوان والحي والمساحة والثمن.")
      return
    }

    if (!image.trim()) {
      setMessage("خاصك تضيف الصورة الرئيسية قبل الحفظ.")
      return
    }

    const linkedOwner = owners.find((item) => String(item.id) === ownerId)
    const linkedSeller = sellers.find((item) => String(item.id) === sellerId)

    onAdd(
      {
        title: title.trim(),
        city: city.trim(),
        district: district.trim(),
        area: Number(area),
        priceDh: Number(priceDh),
        supportDh: Number(supportDh || 0),
        rooms: Number(rooms),
        bathrooms: Number(bathrooms),
        kitchens: Number(kitchens),
        description: description.trim(),
        amenities: selectedAmenities,
        equippedKitchen,
        nearMosque,
        nearSchool,
        image: image.trim(),
        gallery: gallery.length > 0 ? gallery : [image.trim()],
        video: video.trim(),
        lat: lat.trim(),
        lng: lng.trim(),
        status,
        hidden,
        featured,
        ownerId: linkedOwner ? linkedOwner.id : null,
        ownerName: linkedOwner ? getOwnerDisplayName(linkedOwner) : "",
        sellerId: linkedSeller ? linkedSeller.id : null,
        sellerName: linkedSeller ? getSellerDisplayName(linkedSeller) : "",
        propertyPhone: propertyPhone.trim(),
        propertyWhatsapp: propertyWhatsapp.trim(),
        viewsCount: editingProperty?.viewsCount || 0,
        favoriteCount: editingProperty?.favoriteCount || 0,
        soldAt: editingProperty?.soldAt || "",
        soldPriceDh: editingProperty?.soldPriceDh || 0,
        soldBy: editingProperty?.soldBy || "unknown",
        saleNotes: editingProperty?.saleNotes || "",
      },
      editingProperty?.id
    )

    setMessage(editingProperty ? "تم تعديل العقار بنجاح." : "تمت إضافة العقار بنجاح.")
    resetForm()
    onCancelEdit()
  }

  const finalPrice = Math.max(0, Number(priceDh || 0) - Number(supportDh || 0))
  const activeImage = image || gallery[activeIndex] || ""

  return (
    <div className="space-y-4">
      <PageHeader
        title={editingProperty ? "تعديل العقار" : "إضافة عقار"}
        subtitle="إضافة وتعديل العقار مع ربطه بالمالك والبائع"
      />

      <main className="mx-auto max-w-md">
        <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="relative h-[280px] w-full overflow-hidden bg-slate-100">
            {activeImage ? (
              <img src={activeImage} alt={title || "preview"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[14px] font-bold text-slate-500">
                اختار الصورة الرئيسية
              </div>
            )}
          </div>

          <div className="px-4 pb-1 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer rounded-full bg-[#2563eb] px-4 py-3 text-center text-[14px] font-bold text-white shadow">
                {uploadingMain ? "جاري تجهيز الصورة..." : "تغيير الصورة الرئيسية"}
                <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
              </label>

              <label className="cursor-pointer rounded-full bg-[#06142f] px-4 py-3 text-center text-[14px] font-bold text-white shadow">
                {uploadingGallery ? "جاري تجهيز الصور..." : "إضافة صور gallery"}
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
              </label>
            </div>

            {gallery.length > 0 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((img, index) => {
                  const isActive = image === img
                  return (
                    <div key={index} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePickAsMain(index)}
                        className={`overflow-hidden rounded-[18px] ring-2 transition-all ${
                          isActive ? "ring-[#06142f]" : "ring-transparent opacity-80"
                        }`}
                      >
                        <img src={img} alt={`gallery-${index}`} className="h-20 w-24 object-cover" />
                      </button>

                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handlePickAsMain(index)}
                          className="flex-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-[#06142f]"
                        >
                          رئيسية
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="flex-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="p-5 pt-3 text-right">
            <Input value={title} onChange={setTitle} placeholder="عنوان العقار" />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input value={city} onChange={setCity} placeholder="المدينة" />
              <Input value={district} onChange={setDistrict} placeholder="الحي" />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <Select
                value={ownerId}
                onChange={handleOwnerChange}
                options={[
                  { value: "", label: owners.length ? "اختر المورد / المالك" : "مازال ما كاين حتى مالك" },
                  ...owners.map((owner) => ({
                    value: String(owner.id),
                    label: `${getOwnerDisplayName(owner)} • ${ownerTypeLabel(owner.ownerType)}`,
                  })),
                ]}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <Select
                value={sellerId}
                onChange={handleSellerChange}
                options={[
                  { value: "", label: sellers.length ? "اختر البائع / المسؤول" : "مازال ما كاين حتى بائع" },
                  ...sellers.map((seller) => ({
                    value: String(seller.id),
                    label: getSellerDisplayName(seller),
                  })),
                ]}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input value={propertyPhone} onChange={setPropertyPhone} placeholder="رقم الهاتف الخاص بالعقار" />
              <Input value={propertyWhatsapp} onChange={setPropertyWhatsapp} placeholder="رقم الواتساب الخاص بالعقار" />
            </div>

            <div className="mt-4 rounded-[20px] bg-[#f8fafc] p-4 ring-1 ring-slate-200 text-center">
              <p className="text-[13px] font-bold text-slate-400">الثمن الأصلي</p>
              <input
                type="number"
                value={priceDh}
                onChange={(e) => setPriceDh(e.target.value)}
                placeholder="الثمن"
                className="mt-2 w-full bg-transparent text-center text-[34px] font-black tracking-tight text-[#2563eb] outline-none"
              />

              <div className="mt-3">
                <p className="mb-2 text-[12px] font-bold text-slate-500">الدعم السكني</p>
                <Select
                  value={supportDh}
                  onChange={setSupportDh}
                  options={[
                    { value: "0", label: "بلا دعم" },
                    { value: "70000", label: "دعم 7 مليون" },
                    { value: "100000", label: "دعم 10 مليون" },
                  ]}
                />
              </div>

              <p className="mt-3 text-[14px] font-black text-green-700">الثمن بعد الدعم: {formatDh(finalPrice)}</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">المساحة</p>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">الحي</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{district || "—"}</p>
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">المدينة</p>
                <p className="mt-1 text-[15px] font-extrabold text-[#06142f]">{city || "—"}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">الغرف</p>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">الحمامات</p>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>

              <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">المطابخ</p>
                <input
                  type="number"
                  value={kitchens}
                  onChange={(e) => setKitchens(e.target.value)}
                  className="mt-1 w-full bg-transparent text-center text-[15px] font-extrabold text-[#06142f] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[13px] font-bold text-slate-400">الوصف</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف العقار..."
                className="mt-2 min-h-[120px] w-full bg-transparent text-[16px] leading-8 text-[#06142f] outline-none"
              />
            </div>

            <div className="mt-4 rounded-[18px] bg-white p-4 ring-1 ring-slate-200">
              <p className="mb-3 text-[13px] font-bold text-slate-500">مميزات العقار</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="rounded-full bg-[#06142f] px-4 py-2 text-[13px] font-bold text-white"
                >
                  إضافة
                </button>

                <input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="اكتب مميزة جديدة..."
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-right text-[14px] outline-none"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {featureOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center justify-end gap-3 rounded-[16px] bg-slate-50 px-4 py-3"
                  >
                    <span className="text-[13px] font-bold text-[#06142f]">{item}</span>
                    <input type="checkbox" checked={isChecked(item)} onChange={() => toggleFeature(item)} />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[13px] font-bold text-slate-400">الموقع والحالة</p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Input value={lat} onChange={setLat} placeholder="Latitude" />
                <Input value={lng} onChange={setLng} placeholder="Longitude" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Select
                  value={status}
                  onChange={(v) => setStatus(v as PropertyStatus)}
                  options={[
                    { value: "available", label: "متاح" },
                    { value: "negotiation", label: "تفاوض" },
                    { value: "reserved", label: "محجوز" },
                    { value: "sold", label: "مباع" },
                  ]}
                />
                <Input value={video} onChange={setVideo} placeholder="رابط الفيديو" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="flex items-center justify-end gap-3 rounded-[16px] bg-white px-4 py-3">
                  <span className="text-[13px] font-bold text-[#06142f]">عقار مميز</span>
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                </label>

                <label className="flex items-center justify-end gap-3 rounded-[16px] bg-white px-4 py-3">
                  <span className="text-[13px] font-bold text-[#06142f]">إخفاء العقار</span>
                  <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                </label>
              </div>
            </div>

            {message ? <p className="mt-4 text-right text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              {editingProperty ? (
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    onCancelEdit()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingProperty ? "حفظ التعديل" : "حفظ العقار"}
              </button>
            </div>
          </form>
        </article>
      </main>
    </div>
  )
}

function OwnersPage({
  owners,
  properties,
  onSave,
  onDelete,
}: {
  owners: Owner[]
  properties: AdminProperty[]
  onSave: (owner: Omit<Owner, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
}) {
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [ownerType, setOwnerType] = useState<OwnerType>("individual")
  const [notes, setNotes] = useState("")
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!editingOwner) {
      resetForm()
      return
    }
    setName(editingOwner.name)
    setCompanyName(editingOwner.companyName)
    setPhone(editingOwner.phone)
    setWhatsapp(editingOwner.whatsapp)
    setCity(editingOwner.city)
    setAddress(editingOwner.address)
    setOwnerType(editingOwner.ownerType)
    setNotes(editingOwner.notes)
    setMessage("")
  }, [editingOwner])

  function resetForm() {
    setName("")
    setCompanyName("")
    setPhone("")
    setWhatsapp("")
    setCity("")
    setAddress("")
    setOwnerType("individual")
    setNotes("")
    setMessage("")
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() && !companyName.trim()) {
      setMessage("عمر اسم المالك أو اسم الشركة.")
      return
    }

    onSave(
      {
        name: name.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        address: address.trim(),
        ownerType,
        notes: notes.trim(),
      },
      editingOwner?.id
    )

    setMessage(editingOwner ? "تم تعديل المالك بنجاح." : "تمت إضافة المالك بنجاح.")
    setEditingOwner(null)
    resetForm()
  }

  const filteredOwners = owners.filter((owner) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [owner.name, owner.companyName, owner.phone, owner.whatsapp, owner.city, owner.address, owner.notes]
      .join(" ")
      .toLowerCase()
      .includes(q)
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="الموردون / الملاك"
        subtitle="إدارة الملاك الأصليين للعقارات والشركات المرتبطة بهم"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingOwner ? "تعديل مالك" : "إضافة مالك جديد"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={name} onChange={setName} placeholder="اسم الشخص" />
            <Input value={companyName} onChange={setCompanyName} placeholder="اسم الشركة (اختياري)" />

            <div className="grid grid-cols-2 gap-3">
              <Input value={phone} onChange={setPhone} placeholder="رقم الهاتف" />
              <Input value={whatsapp} onChange={setWhatsapp} placeholder="رقم الواتساب" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input value={city} onChange={setCity} placeholder="المدينة" />
              <Select
                value={ownerType}
                onChange={(v) => setOwnerType(v as OwnerType)}
                options={[
                  { value: "individual", label: "فرد" },
                  { value: "company", label: "شركة" },
                  { value: "agency", label: "وكالة" },
                  { value: "developer", label: "منعش" },
                ]}
              />
            </div>

            <Input value={address} onChange={setAddress} placeholder="العنوان" />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="min-h-[100px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              {editingOwner ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingOwner(null)
                    resetForm()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingOwner ? "حفظ التعديل" : "حفظ المالك"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <Input value={search} onChange={setSearch} placeholder="بحث عن مالك أو شركة أو رقم..." />
              <div className="min-w-[110px] rounded-[16px] bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-slate-400">الإجمالي</p>
                <p className="mt-1 text-[20px] font-black text-[#06142f]">{owners.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredOwners.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى مالك.</p>
              </div>
            ) : (
              filteredOwners.map((owner) => {
                const ownerProperties = properties.filter((property) => property.ownerId === owner.id)
                const total = ownerProperties.length
                const sold = ownerProperties.filter((property) => property.status === "sold").length
                const available = ownerProperties.filter((property) => property.status === "available").length
                const outside = Math.max(0, sold - Math.ceil(sold / 2))
                const yours = Math.max(0, sold - outside)

                return (
                  <div
                    key={owner.id}
                    className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingOwner(owner)}
                          className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                        >
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(owner.id)}
                          className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                        >
                          حذف
                        </button>
                      </div>

                      <div className="text-right">
                        <h3 className="text-[18px] font-black text-[#06142f]">{getOwnerDisplayName(owner)}</h3>
                        <p className="mt-1 text-[12px] font-bold text-slate-500">
                          {ownerTypeLabel(owner.ownerType)} • {owner.city || "بدون مدينة"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-5">
                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">كل العقارات</p>
                        <p className="mt-1 text-[15px] font-black text-[#06142f]">{total}</p>
                      </div>

                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">المتاحة</p>
                        <p className="mt-1 text-[15px] font-black text-[#06142f]">{available}</p>
                      </div>

                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">المباعة</p>
                        <p className="mt-1 text-[15px] font-black text-[#06142f]">{sold}</p>
                      </div>

                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">تباعو عن طريقك</p>
                        <p className="mt-1 text-[15px] font-black text-green-700">{yours}</p>
                      </div>

                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">مشاو عليك</p>
                        <p className="mt-1 text-[15px] font-black text-rose-700">{outside}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {owner.phone ? (
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                          هاتف: {owner.phone}
                        </span>
                      ) : null}
                      {owner.whatsapp ? (
                        <span className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700">
                          واتساب: {owner.whatsapp}
                        </span>
                      ) : null}
                      {owner.address ? (
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                          {owner.address}
                        </span>
                      ) : null}
                    </div>

                    {owner.notes ? (
                      <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                        <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{owner.notes}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SellersPage({
  sellers,
  properties,
  onSave,
  onDelete,
}: {
  sellers: Seller[]
  properties: AdminProperty[]
  onSave: (seller: Omit<Seller, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
}) {
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [city, setCity] = useState("")
  const [notes, setNotes] = useState("")
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!editingSeller) {
      resetForm()
      return
    }
    setName(editingSeller.name)
    setPhone(editingSeller.phone)
    setWhatsapp(editingSeller.whatsapp)
    setCity(editingSeller.city)
    setNotes(editingSeller.notes)
    setMessage("")
  }, [editingSeller])

  function resetForm() {
    setName("")
    setPhone("")
    setWhatsapp("")
    setCity("")
    setNotes("")
    setMessage("")
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setMessage("عمر اسم البائع.")
      return
    }

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        notes: notes.trim(),
      },
      editingSeller?.id
    )

    setMessage(editingSeller ? "تم تعديل البائع بنجاح." : "تمت إضافة البائع بنجاح.")
    setEditingSeller(null)
    resetForm()
  }

  const filteredSellers = sellers.filter((seller) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [seller.name, seller.phone, seller.whatsapp, seller.city, seller.notes]
      .join(" ")
      .toLowerCase()
      .includes(q)
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="البائعون / مسؤولو التواصل"
        subtitle="إدارة الأشخاص المسؤولين على التواصل مع الزبناء في كل عقار"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingSeller ? "تعديل بائع" : "إضافة بائع جديد"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={name} onChange={setName} placeholder="اسم البائع" />

            <div className="grid grid-cols-2 gap-3">
              <Input value={phone} onChange={setPhone} placeholder="رقم الهاتف" />
              <Input value={whatsapp} onChange={setWhatsapp} placeholder="رقم الواتساب" />
            </div>

            <Input value={city} onChange={setCity} placeholder="المدينة" />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="min-h-[100px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              {editingSeller ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSeller(null)
                    resetForm()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingSeller ? "حفظ التعديل" : "حفظ البائع"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <Input value={search} onChange={setSearch} placeholder="بحث عن بائع أو رقم..." />
              <div className="min-w-[110px] rounded-[16px] bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-slate-400">الإجمالي</p>
                <p className="mt-1 text-[20px] font-black text-[#06142f]">{sellers.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSellers.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى بائع.</p>
              </div>
            ) : (
              filteredSellers.map((seller) => {
                const sellerProperties = properties.filter((property) => property.sellerId === seller.id)
                const total = sellerProperties.length
                const sold = sellerProperties.filter((property) => property.status === "sold").length
                const available = sellerProperties.filter((property) => property.status === "available").length

                return (
                  <div
                    key={seller.id}
                    className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSeller(seller)}
                          className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                        >
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(seller.id)}
                          className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                        >
                          حذف
                        </button>
                      </div>

                      <div className="text-right">
                        <h3 className="text-[18px] font-black text-[#06142f]">{getSellerDisplayName(seller)}</h3>
                        <p className="mt-1 text-[12px] font-bold text-slate-500">{seller.city || "بدون مدينة"}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">العقارات</p>
                        <p className="mt-1 text-[15px] font-black text-[#06142f]">{total}</p>
                      </div>

                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">المتاحة</p>
                        <p className="mt-1 text-[15px] font-black text-[#06142f]">{available}</p>
                      </div>

                      <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">المباعة</p>
                        <p className="mt-1 text-[15px] font-black text-green-700">{sold}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {seller.phone ? (
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                          هاتف: {seller.phone}
                        </span>
                      ) : null}
                      {seller.whatsapp ? (
                        <span className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700">
                          واتساب: {seller.whatsapp}
                        </span>
                      ) : null}
                    </div>

                    {seller.notes ? (
                      <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                        <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                        <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{seller.notes}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeadsPage({
  leads,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
}: {
  leads: Lead[]
  properties: AdminProperty[]
  onSave: (lead: Omit<Lead, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: LeadStatus) => void
}) {
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [clientName, setClientName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [source, setSource] = useState("Facebook")
  const [status, setStatus] = useState<LeadStatus>("new")
  const [notes, setNotes] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterSource, setFilterSource] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!editingLead) {
      resetForm()
      return
    }

    setClientName(editingLead.clientName)
    setPhone(editingLead.phone)
    setWhatsapp(editingLead.whatsapp)
    setPropertyId(editingLead.propertyId ? String(editingLead.propertyId) : "")
    setSource(editingLead.source)
    setStatus(editingLead.status)
    setNotes(editingLead.notes)
    setMessage("")
  }, [editingLead])

  function resetForm() {
    setClientName("")
    setPhone("")
    setWhatsapp("")
    setPropertyId("")
    setSource("Facebook")
    setStatus("new")
    setNotes("")
    setMessage("")
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!clientName.trim()) {
      setMessage("عمر اسم الزبون.")
      return
    }

    const selectedProperty = properties.find((item) => String(item.id) === propertyId)

    onSave(
      {
        clientName: clientName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        propertyId: selectedProperty ? selectedProperty.id : null,
        propertyTitle: selectedProperty ? selectedProperty.title : "",
        ownerId: selectedProperty ? selectedProperty.ownerId : null,
        ownerName: selectedProperty ? selectedProperty.ownerName : "",
        sellerId: selectedProperty ? selectedProperty.sellerId : null,
        sellerName: selectedProperty ? selectedProperty.sellerName : "",
        source,
        status,
        notes: notes.trim(),
      },
      editingLead?.id
    )

    setMessage(editingLead ? "تم تعديل الطلب بنجاح." : "تمت إضافة الطلب بنجاح.")
    setEditingLead(null)
    resetForm()
  }

  function handlePropertyChange(value: string) {
    setPropertyId(value)
    const selectedProperty = properties.find((item) => String(item.id) === value)
    if (selectedProperty) {
      setPhone((prev) => prev.trim() || selectedProperty.propertyPhone || "")
      setWhatsapp((prev) => prev.trim() || selectedProperty.propertyWhatsapp || "")
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q
      ? true
      : [
          lead.clientName,
          lead.phone,
          lead.whatsapp,
          lead.propertyTitle,
          lead.ownerName,
          lead.sellerName,
          lead.source,
          lead.notes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)

    const matchesStatus = filterStatus ? lead.status === filterStatus : true
    const matchesSource = filterSource ? lead.source === filterSource : true
    return matchesSearch && matchesStatus && matchesSource
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="الطلبات"
        subtitle="تنظيم الزبناء المهتمين وربطهم بالعقار والمالك والبائع"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingLead ? "تعديل الطلب" : "إضافة طلب جديد"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={clientName} onChange={setClientName} placeholder="اسم الزبون" />

            <div className="grid grid-cols-2 gap-3">
              <Input value={phone} onChange={setPhone} placeholder="رقم الهاتف" />
              <Input value={whatsapp} onChange={setWhatsapp} placeholder="رقم الواتساب" />
            </div>

            <Select
              value={propertyId}
              onChange={handlePropertyChange}
              options={[
                { value: "", label: properties.length ? "اختر العقار" : "مازال ما كاين حتى عقار" },
                ...properties.map((property) => ({
                  value: String(property.id),
                  label: `${property.title} • ${property.district}`,
                })),
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={source}
                onChange={setSource}
                options={leadSources.map((item) => ({ value: item, label: item }))}
              />

              <Select
                value={status}
                onChange={(v) => setStatus(v as LeadStatus)}
                options={[
                  { value: "new", label: "جديد" },
                  { value: "contacted", label: "تم الاتصال" },
                  { value: "interested", label: "مهتم" },
                  { value: "not_interested", label: "غير مهتم" },
                  { value: "visit_booked", label: "حجز زيارة" },
                  { value: "closed", label: "مغلق" },
                ]}
              />
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="min-h-[110px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              {editingLead ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLead(null)
                    resetForm()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingLead ? "حفظ التعديل" : "حفظ الطلب"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="grid gap-3 md:grid-cols-4">
              <Input value={search} onChange={setSearch} placeholder="بحث..." />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "", label: "كل الحالات" },
                  { value: "new", label: "جديد" },
                  { value: "contacted", label: "تم الاتصال" },
                  { value: "interested", label: "مهتم" },
                  { value: "not_interested", label: "غير مهتم" },
                  { value: "visit_booked", label: "حجز زيارة" },
                  { value: "closed", label: "مغلق" },
                ]}
              />
              <Select
                value={filterSource}
                onChange={setFilterSource}
                options={[
                  { value: "", label: "كل المصادر" },
                  ...leadSources.map((item) => ({ value: item, label: item })),
                ]}
              />
              <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-slate-400">الإجمالي</p>
                <p className="mt-1 text-[20px] font-black text-[#06142f]">{leads.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى طلب.</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingLead(lead)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(lead.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>

                      {lead.whatsapp ? (
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700"
                        >
                          واتساب
                        </a>
                      ) : null}

                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]"
                        >
                          اتصال
                        </a>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{lead.clientName}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {lead.propertyTitle || "بدون عقار"} • {lead.source}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {lead.ownerName ? (
                      <span className="rounded-full bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700">
                        المالك: {lead.ownerName}
                      </span>
                    ) : null}
                    {lead.sellerName ? (
                      <span className="rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700">
                        البائع: {lead.sellerName}
                      </span>
                    ) : null}
                    {lead.phone ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        هاتف: {lead.phone}
                      </span>
                    ) : null}
                    {lead.whatsapp ? (
                      <span className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700">
                        واتساب: {lead.whatsapp}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Select
                      value={lead.status}
                      onChange={(v) => onChangeStatus(lead.id, v as LeadStatus)}
                      options={[
                        { value: "new", label: "جديد" },
                        { value: "contacted", label: "تم الاتصال" },
                        { value: "interested", label: "مهتم" },
                        { value: "not_interested", label: "غير مهتم" },
                        { value: "visit_booked", label: "حجز زيارة" },
                        { value: "closed", label: "مغلق" },
                      ]}
                    />

                    <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[11px] font-black text-slate-400">الحالة الحالية</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">
                        {leadStatusLabel(lead.status)}
                      </p>
                    </div>
                  </div>

                  {lead.notes ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{lead.notes}</p>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisitsPage({
  visits,
  leads,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
}: {
  visits: Visit[]
  leads: Lead[]
  properties: AdminProperty[]
  onSave: (visit: Omit<Visit, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: VisitStatus) => void
}) {
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [clientName, setClientName] = useState("")
  const [leadId, setLeadId] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [source, setSource] = useState("Facebook")
  const [visitDate, setVisitDate] = useState("")
  const [visitTime, setVisitTime] = useState("")
  const [status, setStatus] = useState<VisitStatus>("pending")
  const [result, setResult] = useState("")
  const [notes, setNotes] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!editingVisit) {
      resetForm()
      return
    }

    setClientName(editingVisit.clientName)
    setLeadId(editingVisit.leadId ? String(editingVisit.leadId) : "")
    setPropertyId(editingVisit.propertyId ? String(editingVisit.propertyId) : "")
    setSource(editingVisit.source)
    setVisitDate(editingVisit.visitDate)
    setVisitTime(editingVisit.visitTime)
    setStatus(editingVisit.status)
    setResult(editingVisit.result)
    setNotes(editingVisit.notes)
    setMessage("")
  }, [editingVisit])

  function resetForm() {
    setClientName("")
    setLeadId("")
    setPropertyId("")
    setSource("Facebook")
    setVisitDate("")
    setVisitTime("")
    setStatus("pending")
    setResult("")
    setNotes("")
    setMessage("")
  }

  function handleLeadChange(value: string) {
    setLeadId(value)
    const lead = leads.find((item) => String(item.id) === value)
    if (lead) {
      setClientName(lead.clientName || "")
      setPropertyId(lead.propertyId ? String(lead.propertyId) : "")
      setSource(lead.source || "Facebook")
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!clientName.trim()) {
      setMessage("عمر اسم الزبون.")
      return
    }

    const selectedProperty = properties.find((item) => String(item.id) === propertyId)

    onSave(
      {
        clientName: clientName.trim(),
        leadId: leadId ? Number(leadId) : null,
        propertyId: selectedProperty ? selectedProperty.id : null,
        propertyTitle: selectedProperty ? selectedProperty.title : "",
        ownerName: selectedProperty ? selectedProperty.ownerName : "",
        sellerName: selectedProperty ? selectedProperty.sellerName : "",
        source,
        visitDate,
        visitTime,
        status,
        result: result.trim(),
        notes: notes.trim(),
      },
      editingVisit?.id
    )

    setMessage(editingVisit ? "تم تعديل الزيارة بنجاح." : "تمت إضافة الزيارة بنجاح.")
    setEditingVisit(null)
    resetForm()
  }

  const filteredVisits = visits.filter((visit) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q
      ? true
      : [visit.clientName, visit.propertyTitle, visit.ownerName, visit.sellerName, visit.source, visit.result, visit.notes]
          .join(" ")
          .toLowerCase()
          .includes(q)

    const matchesStatus = filterStatus ? visit.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="الزيارات"
        subtitle="تسجيل الزيارات الميدانية وربطها بالعقار والطلب والنتيجة"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingVisit ? "تعديل الزيارة" : "إضافة زيارة جديدة"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={clientName} onChange={setClientName} placeholder="اسم الزبون" />

            <Select
              value={leadId}
              onChange={handleLeadChange}
              options={[
                { value: "", label: leads.length ? "اختر الطلب (اختياري)" : "مازال ما كاين حتى طلب" },
                ...leads.map((lead) => ({
                  value: String(lead.id),
                  label: `${lead.clientName} • ${lead.propertyTitle || "بدون عقار"}`,
                })),
              ]}
            />

            <Select
              value={propertyId}
              onChange={setPropertyId}
              options={[
                { value: "", label: properties.length ? "اختر العقار" : "مازال ما كاين حتى عقار" },
                ...properties.map((property) => ({
                  value: String(property.id),
                  label: `${property.title} • ${property.district}`,
                })),
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={source}
                onChange={setSource}
                options={leadSources.map((item) => ({ value: item, label: item }))}
              />
              <Select
                value={status}
                onChange={(v) => setStatus(v as VisitStatus)}
                options={[
                  { value: "pending", label: "في الانتظار" },
                  { value: "completed", label: "تمت" },
                  { value: "postponed", label: "مؤجلة" },
                  { value: "cancelled", label: "ألغيت" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input value={visitDate} onChange={setVisitDate} placeholder="تاريخ الزيارة" type="date" />
              <Input value={visitTime} onChange={setVisitTime} placeholder="وقت الزيارة" type="time" />
            </div>

            <Input value={result} onChange={setResult} placeholder="النتيجة" />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="min-h-[110px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              {editingVisit ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingVisit(null)
                    resetForm()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingVisit ? "حفظ التعديل" : "حفظ الزيارة"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="grid gap-3 md:grid-cols-3">
              <Input value={search} onChange={setSearch} placeholder="بحث..." />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "", label: "كل الحالات" },
                  { value: "pending", label: "في الانتظار" },
                  { value: "completed", label: "تمت" },
                  { value: "postponed", label: "مؤجلة" },
                  { value: "cancelled", label: "ألغيت" },
                ]}
              />
              <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-slate-400">الإجمالي</p>
                <p className="mt-1 text-[20px] font-black text-[#06142f]">{visits.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredVisits.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى زيارة.</p>
              </div>
            ) : (
              filteredVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingVisit(visit)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(visit.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{visit.clientName}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {visit.propertyTitle || "بدون عقار"} • {visit.source}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {visit.ownerName ? (
                      <span className="rounded-full bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700">
                        المالك: {visit.ownerName}
                      </span>
                    ) : null}
                    {visit.sellerName ? (
                      <span className="rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700">
                        البائع: {visit.sellerName}
                      </span>
                    ) : null}
                    {visit.visitDate ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        {formatDateLabel(visit.visitDate)}
                      </span>
                    ) : null}
                    {visit.visitTime ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        {visit.visitTime}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Select
                      value={visit.status}
                      onChange={(v) => onChangeStatus(visit.id, v as VisitStatus)}
                      options={[
                        { value: "pending", label: "في الانتظار" },
                        { value: "completed", label: "تمت" },
                        { value: "postponed", label: "مؤجلة" },
                        { value: "cancelled", label: "ألغيت" },
                      ]}
                    />
                    <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[11px] font-black text-slate-400">الحالة الحالية</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">
                        {visitStatusLabel(visit.status)}
                      </p>
                    </div>
                  </div>

                  {visit.result ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">النتيجة</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{visit.result}</p>
                    </div>
                  ) : null}

                  {visit.notes ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{visit.notes}</p>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MessagesPage({
  messages,
  properties,
  onSave,
  onDelete,
  onChangeStatus,
  onCreateVisit,
}: {
  messages: MessageItem[]
  properties: AdminProperty[]
  onSave: (message: Omit<MessageItem, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: MessageStatus) => void
  onCreateVisit: (message: MessageItem) => void
}) {
  const [editingMessage, setEditingMessage] = useState<MessageItem | null>(null)
  const [senderName, setSenderName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [source, setSource] = useState("WhatsApp")
  const [messageType, setMessageType] = useState<MessageType>("booking")
  const [body, setBody] = useState("")
  const [status, setStatus] = useState<MessageStatus>("unread")
  const [notes, setNotes] = useState("")
  const [propertyLink, setPropertyLink] = useState("")
  const [propertyNumber, setPropertyNumber] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!editingMessage) {
      resetForm()
      return
    }

    setSenderName(editingMessage.senderName)
    setPhone(editingMessage.phone)
    setWhatsapp(editingMessage.whatsapp)
    setPropertyId(editingMessage.propertyId ? String(editingMessage.propertyId) : "")
    setPropertyNumber(editingMessage.propertyNumber ? String(editingMessage.propertyNumber) : "")
    setPropertyLink(editingMessage.propertyLink || "")
    setSource(editingMessage.source)
    setMessageType(editingMessage.messageType)
    setBody(editingMessage.body)
    setStatus(editingMessage.status)
    setNotes(editingMessage.notes)
    setMessage("")
  }, [editingMessage])

  function resetForm() {
    setSenderName("")
    setPhone("")
    setWhatsapp("")
    setPropertyId("")
    setPropertyNumber("")
    setPropertyLink("")
    setSource("WhatsApp")
    setMessageType("booking")
    setBody("")
    setStatus("unread")
    setNotes("")
    setMessage("")
  }

  function handlePropertyChange(value: string) {
    setPropertyId(value)
    const idx = properties.findIndex((item) => String(item.id) === value)
    const selectedProperty = idx >= 0 ? properties[idx] : null
    if (selectedProperty) {
      setPhone((prev) => prev.trim() || selectedProperty.propertyPhone || "")
      setWhatsapp((prev) => prev.trim() || selectedProperty.propertyWhatsapp || "")
      setPropertyNumber(String(idx + 1))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!senderName.trim()) {
      setMessage("عمر اسم المرسل.")
      return
    }

    const selectedProperty = properties.find((item) => String(item.id) === propertyId)

    onSave(
      {
        senderName: senderName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        propertyId: selectedProperty ? selectedProperty.id : null,
        propertyNumber: propertyNumber ? Number(propertyNumber) : null,
        propertyTitle: selectedProperty ? selectedProperty.title : "",
        propertyLink: propertyLink.trim(),
        ownerName: selectedProperty ? selectedProperty.ownerName : "",
        sellerName: selectedProperty ? selectedProperty.sellerName : "",
        source,
        messageType,
        body: body.trim(),
        status,
        notes: notes.trim(),
      },
      editingMessage?.id
    )

    setMessage(editingMessage ? "تم تعديل الرسالة بنجاح." : "تمت إضافة الرسالة بنجاح.")
    setEditingMessage(null)
    resetForm()
  }

  const enrichedMessages = useMemo(() => {
    return messages.map((item) => ({
      ...item,
      priority: buildMessagePriority({
        id: item.id,
        senderName: item.senderName,
        propertyTitle: item.propertyTitle,
        createdAt: item.createdAt,
        status: item.status,
        source: item.source,
        messageType: item.messageType,
      }),
      hoursLeft: formatHoursLeft(item.createdAt, 24),
    }))
  }, [messages])

  const filteredMessages = useMemo(() => {
    const filtered = enrichedMessages.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchesSearch = !q
        ? true
        : [
            item.senderName,
            item.phone,
            item.whatsapp,
            item.propertyTitle,
            item.ownerName,
            item.sellerName,
            item.source,
            item.body,
            item.notes,
            item.propertyLink,
            messageTypeLabel(item.messageType),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)

      const matchesStatus = filterStatus ? item.status === filterStatus : true
      const matchesType = filterType ? item.messageType === filterType : true
      return matchesSearch && matchesStatus && matchesType
    })

    return sortByPriorityAndTime(filtered as Array<typeof filtered[number] & { priority: AdminMessagePriority }>)
  }, [enrichedMessages, search, filterStatus, filterType])

  return (
    <div className="space-y-4">
      <PageHeader
        title="الرسائل"
        subtitle="تنظيم الحجوزات والاستفسارات مع الأولوية والتذكير قبل نهاية 24 ساعة"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingMessage ? "تعديل الرسالة" : "إضافة رسالة جديدة"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={senderName} onChange={setSenderName} placeholder="اسم المرسل" />

            <div className="grid grid-cols-2 gap-3">
              <Input value={phone} onChange={setPhone} placeholder="رقم الهاتف" />
              <Input value={whatsapp} onChange={setWhatsapp} placeholder="رقم الواتساب" />
            </div>

            <Select
              value={propertyId}
              onChange={handlePropertyChange}
              options={[
                { value: "", label: properties.length ? "اختر العقار" : "مازال ما كاين حتى عقار" },
                ...properties.map((property) => ({
                  value: String(property.id),
                  label: `${property.title} • ${property.district}`,
                })),
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input value={propertyNumber} onChange={setPropertyNumber} placeholder="رقم العقار" type="number" />
              <Input value={propertyLink} onChange={setPropertyLink} placeholder="رابط العقار" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={source}
                onChange={setSource}
                options={leadSources.map((item) => ({ value: item, label: item }))}
              />
              <Select
                value={messageType}
                onChange={(v) => setMessageType(v as MessageType)}
                options={[
                  { value: "booking", label: "طلب موعد / معاينة" },
                  { value: "inquiry", label: "طلب استفسار" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={status}
                onChange={(v) => setStatus(v as MessageStatus)}
                options={[
                  { value: "unread", label: "غير مقروءة" },
                  { value: "followed", label: "تمت المتابعة" },
                  { value: "archived", label: "مؤرشفة" },
                        { value: "transferred", label: "تم التحويل" },
                        { value: "transferred", label: "تم التحويل" },
                ]}
              />
              <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-right">
                <p className="text-[11px] font-black text-slate-400">الأولوية الحالية</p>
                <p className="mt-1 text-[14px] font-black text-[#06142f]">
                  {messagePriorityLabel(
                    buildMessagePriority({
                      id: 0,
                      senderName,
                      propertyTitle: "",
                      createdAt: new Date().toISOString(),
                      status,
                      source,
                      messageType,
                    })
                  )}
                </p>
              </div>
            </div>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="نص الرسالة"
              className="min-h-[110px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="min-h-[90px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              {editingMessage ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessage(null)
                    resetForm()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingMessage ? "حفظ التعديل" : "حفظ الرسالة"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="grid gap-3 md:grid-cols-4">
              <Input value={search} onChange={setSearch} placeholder="بحث..." />
              <Select
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: "", label: "كل الأنواع" },
                  { value: "booking", label: "حجز / معاينة" },
                  { value: "inquiry", label: "استفسار" },
                ]}
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "", label: "كل الحالات" },
                  { value: "unread", label: "غير مقروءة" },
                  { value: "followed", label: "تمت المتابعة" },
                  { value: "archived", label: "مؤرشفة" },
                ]}
              />
              <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-slate-400">الإجمالي</p>
                <p className="mt-1 text-[20px] font-black text-[#06142f]">{messages.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى رسالة.</p>
              </div>
            ) : (
              filteredMessages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMessage(item)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>

                      <button
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

                      {item.whatsapp ? (
                        <a
                          href={`https://wa.me/${item.whatsapp.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700"
                        >
                          واتساب
                        </a>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{item.senderName}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {item.propertyTitle || "بدون عقار"} • {item.source}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <span
                      className={`rounded-full px-3 py-2 text-[11px] font-bold ${
                        item.priority === "urgent_booking"
                          ? "bg-rose-100 text-rose-700"
                          : item.priority === "inquiry_due"
                            ? "bg-amber-100 text-amber-700"
                            : item.messageType === "booking"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {messageTypeLabel(item.messageType)} • {messagePriorityLabel(item.priority)}
                    </span>

                    {item.hoursLeft !== null && item.messageType === "inquiry" ? (
                      <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                        باقي تقريباً {item.hoursLeft} س
                      </span>
                    ) : null}

                    {item.ownerName ? (
                      <span className="rounded-full bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700">
                        المالك: {item.ownerName}
                      </span>
                    ) : null}

                    {item.sellerName ? (
                      <span className="rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700">
                        البائع: {item.sellerName}
                      </span>
                    ) : null}

                    {item.propertyNumber ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        العقار رقم {item.propertyNumber}
                      </span>
                    ) : null}

                    {item.phone ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        هاتف: {item.phone}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Select
                      value={item.status}
                      onChange={(v) => onChangeStatus(item.id, v as MessageStatus)}
                      options={[
                        { value: "unread", label: "غير مقروءة" },
                        { value: "followed", label: "تمت المتابعة" },
                        { value: "archived", label: "مؤرشفة" },
                        { value: "transferred", label: "تم التحويل" },
                      ]}
                    />

                    <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[11px] font-black text-slate-400">الحالة الحالية</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">
                        {messageStatusLabel(item.status)}
                      </p>
                    </div>
                  </div>

                  {item.propertyLink ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">رابط العقار</p>
                      <a
                        href={item.propertyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-[12px] font-bold text-[#2563eb]"
                      >
                        {item.propertyLink}
                      </a>
                    </div>
                  ) : null}

                  {item.body ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الرسالة</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{item.body}</p>
                    </div>
                  ) : null}

                  {item.notes ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{item.notes}</p>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SoldPage({
  properties,
  onSaveSale,
}: {
  properties: AdminProperty[]
  onSaveSale: (
    propertyId: number,
    soldAt: string,
    soldPriceDh: number,
    soldBy: "me" | "other_agency" | "owner" | "unknown",
    saleNotes: string
  ) => void
}) {
  const soldProperties = properties.filter((property) => property.status === "sold")
  const [selectedId, setSelectedId] = useState("")
  const [soldAt, setSoldAt] = useState("")
  const [soldPriceDh, setSoldPriceDh] = useState("")
  const [soldBy, setSoldBy] = useState<"me" | "other_agency" | "owner" | "unknown">("me")
  const [saleNotes, setSaleNotes] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedId) {
      setMessage("اختر العقار المباع.")
      return
    }
    onSaveSale(Number(selectedId), soldAt, Number(soldPriceDh || 0), soldBy, saleNotes.trim())
    setMessage("تم حفظ معلومات البيع بنجاح.")
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="العقارات المباعة"
        subtitle="أرشيف العقارات المباعة وتتبع تاريخ البيع والنتائج"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">معلومات البيع</h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Select
              value={selectedId}
              onChange={setSelectedId}
              options={[
                { value: "", label: soldProperties.length ? "اختر العقار المباع" : "مازال ما كاين حتى عقار مباع" },
                ...soldProperties.map((property) => ({
                  value: String(property.id),
                  label: property.title,
                })),
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input value={soldAt} onChange={setSoldAt} placeholder="تاريخ البيع" type="date" />
              <Input value={soldPriceDh} onChange={setSoldPriceDh} placeholder="ثمن البيع" type="number" />
            </div>

            <Select
              value={soldBy}
              onChange={(v) => setSoldBy(v as "me" | "other_agency" | "owner" | "unknown")}
              options={[
                { value: "me", label: "أنا" },
                { value: "other_agency", label: "وكالة أخرى" },
                { value: "owner", label: "المالك مباشرة" },
                { value: "unknown", label: "غير معروف" },
              ]}
            />

            <textarea
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              placeholder="ملاحظات البيع"
              className="min-h-[100px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
            >
              حفظ معلومات البيع
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {soldProperties.length === 0 ? (
            <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى عقار مباع.</p>
            </div>
          ) : (
            soldProperties.map((property) => (
              <div key={property.id} className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="text-right">
                  <h3 className="text-[18px] font-black text-[#06142f]">{property.title}</h3>
                  <p className="mt-1 text-[12px] font-bold text-slate-500">
                    {property.ownerName || "بدون مالك"} • {property.sellerName || "بدون بائع"}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                    <p className="text-[10px] font-black text-slate-400">تاريخ البيع</p>
                    <p className="mt-1 text-[14px] font-black text-[#06142f]">{formatDateLabel(property.soldAt || "")}</p>
                  </div>

                  <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                    <p className="text-[10px] font-black text-slate-400">ثمن البيع</p>
                    <p className="mt-1 text-[14px] font-black text-[#06142f]">
                      {formatDh(property.soldPriceDh || property.priceDh)}
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                    <p className="text-[10px] font-black text-slate-400">جهة البيع</p>
                    <p className="mt-1 text-[14px] font-black text-[#06142f]">{soldByLabel(property.soldBy)}</p>
                  </div>

                  <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                    <p className="text-[10px] font-black text-slate-400">الحالة</p>
                    <p className="mt-1 text-[14px] font-black text-green-700">مباع</p>
                  </div>
                </div>

                {property.saleNotes ? (
                  <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                    <p className="text-[10px] font-black text-slate-400">ملاحظات البيع</p>
                    <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{property.saleNotes}</p>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function AdsPage({
  ads,
  properties,
  onSave,
  onDelete,
}: {
  ads: AdCampaign[]
  properties: AdminProperty[]
  onSave: (ad: Omit<AdCampaign, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
}) {
  const [editingAd, setEditingAd] = useState<AdCampaign | null>(null)
  const [name, setName] = useState("")
  const [platform, setPlatform] = useState("Facebook")
  const [propertyId, setPropertyId] = useState("")
  const [budgetDh, setBudgetDh] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [visitsCount, setVisitsCount] = useState("")
  const [leadsCount, setLeadsCount] = useState("")
  const [result, setResult] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!editingAd) {
      resetForm()
      return
    }

    setName(editingAd.name)
    setPlatform(editingAd.platform)
    setPropertyId(editingAd.propertyId ? String(editingAd.propertyId) : "")
    setBudgetDh(String(editingAd.budgetDh))
    setStartDate(editingAd.startDate)
    setEndDate(editingAd.endDate)
    setVisitsCount(String(editingAd.visitsCount))
    setLeadsCount(String(editingAd.leadsCount))
    setResult(editingAd.result)
    setNotes(editingAd.notes)
    setMessage("")
  }, [editingAd])

  function resetForm() {
    setName("")
    setPlatform("Facebook")
    setPropertyId("")
    setBudgetDh("")
    setStartDate("")
    setEndDate("")
    setVisitsCount("")
    setLeadsCount("")
    setResult("")
    setNotes("")
    setMessage("")
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setMessage("عمر اسم الحملة.")
      return
    }

    const selectedProperty = properties.find((item) => String(item.id) === propertyId)

    onSave(
      {
        name: name.trim(),
        platform,
        propertyId: selectedProperty ? selectedProperty.id : null,
        propertyTitle: selectedProperty ? selectedProperty.title : "",
        budgetDh: Number(budgetDh || 0),
        startDate,
        endDate,
        visitsCount: Number(visitsCount || 0),
        leadsCount: Number(leadsCount || 0),
        result: result.trim(),
        notes: notes.trim(),
      },
      editingAd?.id
    )

    setMessage(editingAd ? "تم تعديل الحملة بنجاح." : "تمت إضافة الحملة بنجاح.")
    setEditingAd(null)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="الإشهارات"
        subtitle="تتبع الحملات الإعلانية والميزانية وعدد الزيارات والطلبات"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingAd ? "تعديل الحملة" : "إضافة حملة جديدة"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={name} onChange={setName} placeholder="اسم الحملة" />

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={platform}
                onChange={setPlatform}
                options={adPlatforms.map((item) => ({ value: item, label: item }))}
              />
              <Input value={budgetDh} onChange={setBudgetDh} placeholder="الميزانية DH" type="number" />
            </div>

            <Select
              value={propertyId}
              onChange={setPropertyId}
              options={[
                { value: "", label: properties.length ? "اختر العقار (اختياري)" : "مازال ما كاين حتى عقار" },
                ...properties.map((property) => ({
                  value: String(property.id),
                  label: `${property.title} • ${property.district}`,
                })),
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input value={startDate} onChange={setStartDate} placeholder="تاريخ البداية" type="date" />
              <Input value={endDate} onChange={setEndDate} placeholder="تاريخ النهاية" type="date" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input value={visitsCount} onChange={setVisitsCount} placeholder="عدد الزيارات" type="number" />
              <Input value={leadsCount} onChange={setLeadsCount} placeholder="عدد الطلبات" type="number" />
            </div>

            <Input value={result} onChange={setResult} placeholder="النتيجة النهائية" />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="min-h-[100px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? <p className="text-[12px] font-bold text-[#2563eb]">{message}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              {editingAd ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAd(null)
                    resetForm()
                  }}
                  className="rounded-full bg-slate-200 px-4 py-3 text-[15px] font-bold text-[#06142f]"
                >
                  إلغاء التعديل
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-full bg-[#06142f] px-4 py-3 text-[15px] font-bold text-white"
              >
                {editingAd ? "حفظ التعديل" : "حفظ الحملة"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-3">
          {ads.length === 0 ? (
            <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى إشهار.</p>
            </div>
          ) : (
            ads.map((ad) => {
              const costPerVisit = ad.visitsCount > 0 ? ad.budgetDh / ad.visitsCount : 0
              const costPerLead = ad.leadsCount > 0 ? ad.budgetDh / ad.leadsCount : 0

              return (
                <div key={ad.id} className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAd(ad)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(ad.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{ad.name}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {ad.platform} • {ad.propertyTitle || "المنصة كاملة"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الميزانية</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{formatDh(ad.budgetDh)}</p>
                    </div>
                    <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الزيارات</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{ad.visitsCount}</p>
                    </div>
                    <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الطلبات</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{ad.leadsCount}</p>
                    </div>
                    <div className="rounded-[14px] bg-slate-50 px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">تكلفة الطلب</p>
                      <p className="mt-1 text-[14px] font-black text-[#2563eb]">{formatDh(costPerLead)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                      تكلفة الزيارة: {formatDh(costPerVisit)}
                    </span>
                    {ad.startDate ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        البداية: {formatDateLabel(ad.startDate)}
                      </span>
                    ) : null}
                    {ad.endDate ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        النهاية: {formatDateLabel(ad.endDate)}
                      </span>
                    ) : null}
                  </div>

                  {ad.result ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">النتيجة</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{ad.result}</p>
                    </div>
                  ) : null}

                  {ad.notes ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{ad.notes}</p>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function ControlsPage({
  controls,
  onSave,
}: {
  controls: UiControls
  onSave: (next: UiControls) => void
}) {
  const [localControls, setLocalControls] = useState<UiControls>(controls)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setLocalControls(controls)
  }, [controls])

  function toggle<K extends keyof UiControls>(key: K) {
    setLocalControls((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    onSave(localControls)
    setMessage("تم حفظ إعدادات الواجهة بنجاح.")
  }

  const items: { key: keyof UiControls; title: string }[] = [
    { key: "showMap", title: "الخريطة" },
    { key: "showWhatsapp", title: "واتساب" },
    { key: "showPhone", title: "الهاتف" },
    { key: "showArVr", title: "AR / VR" },
    { key: "showSoldProperties", title: "العقارات المباعة" },
    { key: "showFeaturedProperties", title: "العقارات المميزة" },
    { key: "showHousingSupport", title: "الدعم السكني" },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="التحكم في الواجهة"
        subtitle="تشغيل وإيقاف عناصر الواجهة وحفظ الإعدادات محلياً"
      />

      <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between rounded-[18px] bg-slate-50 px-4 py-4"
            >
              <input
                type="checkbox"
                checked={localControls[item.key]}
                onChange={() => toggle(item.key)}
              />
              <span className="text-[14px] font-black text-[#06142f]">{item.title}</span>
            </label>
          ))}
        </div>

        {message ? (
          <p className="mt-4 text-right text-[12px] font-bold text-[#2563eb]">{message}</p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#06142f] px-5 py-3 text-[15px] font-bold text-white"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  )
}

function PropertiesPage({
  properties,
  onDelete,
  onToggleHidden,
  onToggleFeatured,
  onChangeStatus,
  onEdit,
}: {
  properties: AdminProperty[]
  onDelete: (id: number) => void
  onToggleHidden: (id: number) => void
  onToggleFeatured: (id: number) => void
  onChangeStatus: (id: number, status: PropertyStatus) => void
  onEdit: (property: AdminProperty) => void
}) {
  const sortedProperties = [...properties].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))

  return (
    <div className="space-y-4">
      <PageHeader title="إدارة العقارات" subtitle="تحكم كامل في العقارات المضافة" />

      <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        {sortedProperties.length === 0 ? (
          <p className="text-right text-[13px] font-bold text-slate-500">
            مازال ما كاين حتى عقار. زيد أول عقار من صفحة "إضافة عقار".
          </p>
        ) : (
          <div className="space-y-3">
            {sortedProperties.map((property) => {
              const finalPrice = Math.max(0, property.priceDh - property.supportDh)
              return (
                <div key={property.id} className="rounded-[18px] border border-slate-200 bg-[#fcfcfd] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(property)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleHidden(property.id)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]"
                      >
                        {property.hidden ? "إظهار" : "إخفاء"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleFeatured(property.id)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]"
                      >
                        {property.featured ? "إلغاء التمييز" : "تمييز"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(property.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{property.title}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {property.city} • {property.district}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {property.ownerName ? (
                      <span className="rounded-full bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700">
                        المالك: {property.ownerName}
                      </span>
                    ) : null}
                    {property.sellerName ? (
                      <span className="rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700">
                        البائع: {property.sellerName}
                      </span>
                    ) : null}
                    {property.propertyPhone ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        هاتف: {property.propertyPhone}
                      </span>
                    ) : null}
                    {property.propertyWhatsapp ? (
                      <span className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700">
                        واتساب: {property.propertyWhatsapp}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                      المشاهدات: {property.viewsCount || 0}
                    </span>
                    <span className="rounded-full bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">
                      المفضلة: {property.favoriteCount || 0}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-6">
                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">المساحة</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{property.area}m²</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الثمن</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{formatDh(property.priceDh)}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الدعم</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{formatDh(property.supportDh)}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">بعد الدعم</p>
                      <p className="mt-1 text-[14px] font-black text-[#2563eb]">{formatDh(finalPrice)}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الغرف</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{property.rooms}</p>
                    </div>

                    <div className="rounded-[14px] bg-white px-3 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">الحمامات</p>
                      <p className="mt-1 text-[14px] font-black text-[#06142f]">{property.bathrooms}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <Select
                      value={property.status}
                      onChange={(v) => onChangeStatus(property.id, v as PropertyStatus)}
                      options={[
                        { value: "available", label: "متاح" },
                        { value: "negotiation", label: "تفاوض" },
                        { value: "reserved", label: "محجوز" },
                        { value: "sold", label: "مباع" },
                      ]}
                      className="max-w-[220px]"
                    />

                    <div className="flex flex-wrap justify-end gap-2 text-right">
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        {propertyStatusLabel(property.status)}
                      </span>
                      {property.hidden ? (
                        <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                          مخفي
                        </span>
                      ) : null}
                      {property.featured ? (
                        <span className="rounded-full bg-green-50 px-3 py-2 text-[11px] font-bold text-green-700">
                          مميز
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {property.description || property.image || property.video ? (
                    <div className="mt-3 rounded-[14px] bg-white px-4 py-3 text-right">
                      {property.description ? (
                        <>
                          <p className="text-[10px] font-black text-slate-400">الوصف</p>
                          <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">{property.description}</p>
                        </>
                      ) : null}

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        {property.image ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            صورة رئيسية
                          </span>
                        ) : null}
                        {property.gallery.length > 0 ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            {property.gallery.length} صور
                          </span>
                        ) : null}
                        {property.video ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            فيديو
                          </span>
                        ) : null}
                        {property.lat && property.lng ? (
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                            خريطة
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("immomarket_admin") === "true")
  const [section, setSection] = useState<AdminSection>("dashboard")
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [ads, setAds] = useState<AdCampaign[]>([])
  const [reports, setReports] = useState<AdminReportItem[]>([])
  const [controls, setControls] = useState<UiControls>(safeReadControls())
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null)

  useEffect(() => {
    setProperties(safeReadProperties())
    setOwners(safeReadOwners())
    setSellers(safeReadSellers())
    setLeads(safeReadLeads())
    setVisits(safeReadVisits())
    setMessages(safeReadMessages())
    setAds(safeReadAds())
    setReports(safeReadReports())
    setControls(safeReadControls())
  }, [])

  function updateProperties(next: AdminProperty[]) {
    setProperties(next)
    saveProperties(next)
  }

  function updateOwners(next: Owner[]) {
    setOwners(next)
    saveOwners(next)
  }

  function updateSellers(next: Seller[]) {
    setSellers(next)
    saveSellers(next)
  }

  function updateLeads(next: Lead[]) {
    setLeads(next)
    saveLeads(next)
  }

  function updateVisits(next: Visit[]) {
    setVisits(next)
    saveVisits(next)
  }

  function updateMessages(next: MessageItem[]) {
    setMessages(next)
    saveMessages(next)
  }

  function updateAds(next: AdCampaign[]) {
    setAds(next)
    saveAds(next)
  }

  function updateReports(next: AdminReportItem[]) {
    setReports(next)
    saveReports(next)
  }

  function handleSaveControls(next: UiControls) {
    setControls(next)
    saveControls(next)
  }

  function handleAddOwner(owner: Omit<Owner, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      const nextOwners = owners.map((item) => (item.id === editingId ? { ...item, ...owner } : item))
      updateOwners(nextOwners)

      const updatedOwner = nextOwners.find((item) => item.id === editingId)
      if (updatedOwner) {
        const ownerDisplayName = getOwnerDisplayName(updatedOwner)

        updateProperties(
          properties.map((property) =>
            property.ownerId === editingId ? { ...property, ownerName: ownerDisplayName } : property
          )
        )

        updateLeads(
          leads.map((lead) =>
            lead.ownerId === editingId ? { ...lead, ownerName: ownerDisplayName } : lead
          )
        )
      }
      return
    }

    const nextOwner: Owner = { ...owner, id: Date.now(), createdAt: new Date().toISOString() }
    updateOwners([nextOwner, ...owners])
  }

  function handleDeleteOwner(id: number) {
    updateOwners(owners.filter((item) => item.id !== id))
    updateProperties(
      properties.map((property) =>
        property.ownerId === id ? { ...property, ownerId: null, ownerName: "" } : property
      )
    )
    updateLeads(
      leads.map((lead) =>
        lead.ownerId === id ? { ...lead, ownerId: null, ownerName: "" } : lead
      )
    )
  }

  function handleAddSeller(seller: Omit<Seller, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      const nextSellers = sellers.map((item) => (item.id === editingId ? { ...item, ...seller } : item))
      updateSellers(nextSellers)

      const updatedSeller = nextSellers.find((item) => item.id === editingId)
      if (updatedSeller) {
        const sellerDisplayName = getSellerDisplayName(updatedSeller)

        updateProperties(
          properties.map((property) =>
            property.sellerId === editingId ? { ...property, sellerName: sellerDisplayName } : property
          )
        )

        updateLeads(
          leads.map((lead) =>
            lead.sellerId === editingId ? { ...lead, sellerId: updatedSeller.id, sellerName: sellerDisplayName } : lead
          )
        )
      }
      return
    }

    const nextSeller: Seller = { ...seller, id: Date.now(), createdAt: new Date().toISOString() }
    updateSellers([nextSeller, ...sellers])
  }

  function handleDeleteSeller(id: number) {
    updateSellers(sellers.filter((item) => item.id !== id))
    updateProperties(
      properties.map((property) =>
        property.sellerId === id ? { ...property, sellerId: null, sellerName: "" } : property
      )
    )
    updateLeads(
      leads.map((lead) =>
        lead.sellerId === id ? { ...lead, sellerId: null, sellerName: "" } : lead
      )
    )
  }

  function handleAddLead(lead: Omit<Lead, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      updateLeads(leads.map((item) => (item.id === editingId ? { ...item, ...lead } : item)))
      return
    }
    const nextLead: Lead = { ...lead, id: Date.now(), createdAt: new Date().toISOString() }
    updateLeads([nextLead, ...leads])
  }

  function handleDeleteLead(id: number) {
    updateLeads(leads.filter((item) => item.id !== id))
  }

  function handleChangeLeadStatus(id: number, status: LeadStatus) {
    updateLeads(leads.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  function handleAddVisit(visit: Omit<Visit, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      updateVisits(visits.map((item) => (item.id === editingId ? { ...item, ...visit } : item)))
      return
    }
    const nextVisit: Visit = { ...visit, id: Date.now(), createdAt: new Date().toISOString() }
    updateVisits([nextVisit, ...visits])
  }

  function handleDeleteVisit(id: number) {
    updateVisits(visits.filter((item) => item.id !== id))
  }

  function handleChangeVisitStatus(id: number, status: VisitStatus) {
    updateVisits(visits.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  function handleAddMessage(message: Omit<MessageItem, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      updateMessages(messages.map((item) => (item.id === editingId ? { ...item, ...message } : item)))
      return
    }
    const nextMessage: MessageItem = { ...message, id: Date.now(), createdAt: new Date().toISOString() }
    updateMessages([nextMessage, ...messages])
  }

  function handleDeleteMessage(id: number) {
    updateMessages(messages.filter((item) => item.id !== id))
  }

  function handleChangeMessageStatus(id: number, status: MessageStatus) {
    updateMessages(messages.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  function handleAddAd(ad: Omit<AdCampaign, "id" | "createdAt">, editingId?: number) {
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
        .join("\n"),
      createdAt: new Date().toISOString(),
    }

    updateVisits([nextVisit, ...visits])
    updateMessages(
      messages.map((item) =>
        item.id === message.id ? { ...item, status: "transferred" } : item
      )
    )
    setSection("visits")
  }

  function handleAddReport(report: Omit<AdminReportItem, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      updateReports(reports.map((item) => (item.id === editingId ? { ...item, ...report } : item)))
      return
    }
    const nextReport: AdminReportItem = { ...report, id: Date.now(), createdAt: new Date().toISOString() }
    updateReports([nextReport, ...reports])
  }

  function handleDeleteReport(id: number) {
    updateReports(reports.filter((item) => item.id !== id))
  }

  function handleAddProperty(property: Omit<AdminProperty, "id" | "createdAt">, editingId?: number) {
    if (editingId) {
      const next = properties.map((item) => (item.id === editingId ? { ...item, ...property } : item))
      updateProperties(next)
      setSection("properties")
      return
    }

    const nextItem: AdminProperty = {
      ...property,
      soldAt: "",
      soldPriceDh: 0,
      soldBy: "unknown",
      saleNotes: "",
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }

    updateProperties([nextItem, ...properties])
    setSection("properties")
  }

  function handleDeleteProperty(id: number) {
    updateProperties(properties.filter((item) => item.id !== id))
    updateLeads(
      leads.map((lead) =>
        lead.propertyId === id
          ? { ...lead, propertyId: null, propertyTitle: "", ownerId: null, ownerName: "", sellerId: null, sellerName: "" }
          : lead
      )
    )
    updateMessages(
      messages.map((item) =>
        item.propertyId === id
          ? { ...item, propertyId: null, propertyNumber: null, propertyTitle: "", propertyLink: "", ownerName: "", sellerName: "" }
          : item
      )
    )
    updateReports(
      reports.map((item) =>
        item.propertyId === id ? { ...item, propertyId: null, propertyTitle: "" } : item
      )
    )
  }

  function handleToggleHidden(id: number) {
    updateProperties(properties.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item)))
  }

  function handleToggleFeatured(id: number) {
    updateProperties(properties.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)))
  }

  function handleChangePropertyStatus(id: number, status: PropertyStatus) {
    updateProperties(properties.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  function handleSaveSale(
    propertyId: number,
    soldAt: string,
    soldPriceDh: number,
    soldBy: "me" | "other_agency" | "owner" | "unknown",
    saleNotes: string
  ) {
    updateProperties(
      properties.map((item) =>
        item.id === propertyId
          ? { ...item, status: "sold", soldAt, soldPriceDh, soldBy, saleNotes }
          : item
      )
    )
  }

  function handleEdit(property: AdminProperty) {
    setEditingProperty(property)
    setSection("add-property")
  }

  function handleCancelEdit() {
    setEditingProperty(null)
  }

  function handleLogin() {
    setIsAdmin(true)
    setSection("dashboard")
  }

  function handleLogout() {
    localStorage.removeItem("immomarket_admin")
    localStorage.removeItem("immomarket_admin_email")
    setIsAdmin(false)
    setSection("dashboard")
  }

  const allAlerts = useMemo(() => {
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

  const content = useMemo(() => {
    switch (section) {
      case "dashboard":
        return (
          <Dashboard
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
          />
        )

      case "add-property":
        return (
          <AddPropertyPage
            onAdd={handleAddProperty}
            editingProperty={editingProperty}
            onCancelEdit={handleCancelEdit}
            owners={owners}
            sellers={sellers}
          />
        )

      case "properties":
        return (
          <PropertiesPage
            properties={properties}
            onDelete={handleDeleteProperty}
            onToggleHidden={handleToggleHidden}
            onToggleFeatured={handleToggleFeatured}
            onChangeStatus={handleChangePropertyStatus}
            onEdit={handleEdit}
          />
        )

      case "owners":
        return (
          <OwnersPage
            owners={owners}
            properties={properties}
            onSave={handleAddOwner}
            onDelete={handleDeleteOwner}
          />
        )

      case "sellers":
        return (
          <SellersPage
            sellers={sellers}
            properties={properties}
            onSave={handleAddSeller}
            onDelete={handleDeleteSeller}
          />
        )

      case "leads":
        return (
          <LeadsPage
            leads={leads}
            properties={properties}
            onSave={handleAddLead}
            onDelete={handleDeleteLead}
            onChangeStatus={handleChangeLeadStatus}
          />
        )

      case "visits":
        return (
          <VisitsPage
            visits={visits}
            leads={leads}
            properties={properties}
            onSave={handleAddVisit}
            onDelete={handleDeleteVisit}
            onChangeStatus={handleChangeVisitStatus}
          />
        )

      case "messages":
        return (
          <MessagesPage
            messages={messages}
            properties={properties}
            onSave={handleAddMessage}
            onDelete={handleDeleteMessage}
            onChangeStatus={handleChangeMessageStatus}
            onCreateVisit={handleCreateVisitFromMessage}
          />
        )

      case "documents":
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
          <StatsReportsPage
            properties={properties}
            leads={leads}
            visits={visits}
            messages={messages}
            ads={ads}
          />
        )

      case "sold":
        return <SoldPage properties={properties} onSaveSale={handleSaveSale} />

      case "ads":
        return <AdsPage ads={ads} properties={properties} onSave={handleAddAd} onDelete={handleDeleteAd} />

      case "controls":
        return <ControlsPage controls={controls} onSave={handleSaveControls} />

      default:
        return (
          <Dashboard
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
          />
        )
    }
  }, [section, properties, owners, sellers, leads, visits, messages, ads, reports, controls, editingProperty, allAlerts])

  if (!isAdmin) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[#f3f5fb]" dir="rtl">
      <div className="mx-auto max-w-[1500px] p-3 lg:p-4">
        <MobileHeader section={section} onNavigate={setSection} onLogout={handleLogout} />

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <DesktopSidebar section={section} onNavigate={setSection} onLogout={handleLogout} />
          <main>{content}</main>
        </div>
      </div>
    </div>
  )
}
