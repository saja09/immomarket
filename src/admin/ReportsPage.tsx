import { useMemo, useState, type FormEvent } from "react"

type DocumentType = "contract" | "title" | "id" | "tax" | "plan" | "authorization" | "custom"

export type AdminReportItem = {
  id: number
  title: string
  reportType: DocumentType
  propertyId: number | null
  propertyTitle: string
  fileName: string
  fileDataUrl: string
  notes: string
  createdAt: string
}

type PropertyOption = {
  id: number
  title: string
  district: string
}

function documentTypeLabel(value: DocumentType) {
  if (value === "contract") return "عقد"
  if (value === "title") return "رسم / ملكية"
  if (value === "id") return "وثيقة هوية"
  if (value === "tax") return "وثيقة ضريبية"
  if (value === "plan") return "تصميم / Plan"
  if (value === "authorization") return "ترخيص / Autorisation"
  return "وثيقة أخرى"
}

function formatDateLabel(value: string) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("fr-FR")
  } catch {
    return value
  }
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
  value: string
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
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-right outline-none focus:border-[#06142f]"
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

export default function ReportsPage({
  reports,
  properties,
  onSave,
  onDelete,
}: {
  reports: AdminReportItem[]
  properties: PropertyOption[]
  onSave: (report: Omit<AdminReportItem, "id" | "createdAt">, editingId?: number) => void
  onDelete: (id: number) => void
}) {
  const [editingReport, setEditingReport] = useState<AdminReportItem | null>(null)
  const [title, setTitle] = useState("")
  const [reportType, setReportType] = useState<DocumentType>("contract")
  const [propertyId, setPropertyId] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileDataUrl, setFileDataUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)

  function resetForm() {
    setTitle("")
    setReportType("contract")
    setPropertyId("")
    setFileName("")
    setFileDataUrl("")
    setNotes("")
    setMessage("")
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setMessage("جاري تجهيز الوثيقة...")
      const dataUrl = await fileToDataUrl(file)
      setFileDataUrl(dataUrl)
      setFileName(file.name || "document.pdf")
      setMessage("تم تجهيز الوثيقة بنجاح.")
    } catch {
      setMessage("وقع خطأ أثناء تجهيز الوثيقة.")
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setMessage("عمر عنوان الوثيقة.")
      return
    }

    if (!fileDataUrl.trim()) {
      setMessage("خاصك ترفع الوثيقة أولاً.")
      return
    }

    const linkedProperty = properties.find((item) => String(item.id) === propertyId)

    onSave(
      {
        title: title.trim(),
        reportType,
        propertyId: linkedProperty ? linkedProperty.id : null,
        propertyTitle: linkedProperty ? linkedProperty.title : "",
        fileName: fileName.trim() || "document.pdf",
        fileDataUrl,
        notes: notes.trim(),
      },
      editingReport?.id
    )

    setMessage(editingReport ? "تم تعديل الوثيقة بنجاح." : "تمت إضافة الوثيقة بنجاح.")
    setEditingReport(null)
    resetForm()
  }

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return reports

    return reports.filter((item) =>
      [
        item.title,
        item.propertyTitle,
        item.fileName,
        item.notes,
        documentTypeLabel(item.reportType),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [reports, search])

  return (
    <div className="space-y-4">
      <PageHeader
        title="وثائق العقارات"
        subtitle="رفع وثائق العقار وربطها به لتبقى محفوظة ومنظمة داخل باج أدمين"
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h3 className="text-right text-[18px] font-black text-[#06142f]">
            {editingReport ? "تعديل الوثيقة" : "إضافة وثيقة جديدة"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-right">
            <Input value={title} onChange={setTitle} placeholder="عنوان الوثيقة" />

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={reportType}
                onChange={(v) => setReportType(v as DocumentType)}
                options={[
                  { value: "contract", label: "عقد" },
                  { value: "title", label: "رسم / ملكية" },
                  { value: "id", label: "وثيقة هوية" },
                  { value: "tax", label: "وثيقة ضريبية" },
                  { value: "plan", label: "تصميم / Plan" },
                  { value: "authorization", label: "ترخيص / Autorisation" },
                  { value: "custom", label: "وثيقة أخرى" },
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
            </div>

            <label className="flex cursor-pointer items-center justify-center rounded-[18px] bg-[#06142f] px-4 py-4 text-[14px] font-bold text-white">
              {uploading ? "جاري تجهيز الوثيقة..." : fileName ? `تم اختيار: ${fileName}` : "رفع الوثيقة"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات الوثيقة"
              className="min-h-[110px] w-full rounded-[16px] border border-slate-200 px-4 py-3 text-right outline-none focus:border-[#06142f]"
            />

            {message ? (
              <p className="text-[12px] font-bold text-[#2563eb]">{message}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              {editingReport ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReport(null)
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
                {editingReport ? "حفظ التعديل" : "حفظ الوثيقة"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <Input value={search} onChange={setSearch} placeholder="بحث عن وثيقة..." />
              <div className="min-w-[110px] rounded-[16px] bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-slate-400">الإجمالي</p>
                <p className="mt-1 text-[20px] font-black text-[#06142f]">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-right shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[15px] font-black text-[#06142f]">مازال ما كاين حتى وثيقة.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReport(report)
                          setTitle(report.title)
                          setReportType(report.reportType)
                          setPropertyId(report.propertyId ? String(report.propertyId) : "")
                          setFileName(report.fileName)
                          setFileDataUrl(report.fileDataUrl)
                          setNotes(report.notes)
                          setMessage("")
                        }}
                        className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700"
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(report.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700"
                      >
                        حذف
                      </button>

                      <a
                        href={report.fileDataUrl}
                        download={report.fileName || "document"}
                        className="rounded-full bg-[#06142f] px-3 py-2 text-[11px] font-bold text-white"
                      >
                        تحميل
                      </a>
                    </div>

                    <div className="text-right">
                      <h3 className="text-[18px] font-black text-[#06142f]">{report.title}</h3>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">
                        {documentTypeLabel(report.reportType)} • {formatDateLabel(report.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {report.propertyTitle ? (
                      <span className="rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700">
                        العقار: {report.propertyTitle}
                      </span>
                    ) : null}

                    {report.fileName ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#06142f]">
                        {report.fileName}
                      </span>
                    ) : null}
                  </div>

                  {report.notes ? (
                    <div className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black text-slate-400">ملاحظات</p>
                      <p className="mt-2 text-[12px] font-bold leading-6 text-slate-600">
                        {report.notes}
                      </p>
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
