python <<'PY'
from pathlib import Path

path = Path.home() / "immomarket" / "src" / "admin" / "AdminApp.tsx"
text = path.read_text()

# 1) add transferred status
text = text.replace(
    'type MessageStatus = "unread" | "followed" | "archived"',
    'type MessageStatus = "unread" | "followed" | "archived" | "transferred"'
)

# 2) status label
old = """function messageStatusLabel(status: MessageStatus) {
  if (status === "unread") return "غير مقروءة"
  if (status === "followed") return "تمت المتابعة"
  return "مؤرشفة"
}"""
new = """function messageStatusLabel(status: MessageStatus) {
  if (status === "unread") return "غير مقروءة"
  if (status === "followed") return "تمت المتابعة"
  if (status === "transferred") return "تم التحويل"
  return "مؤرشفة"
}"""
text = text.replace(old, new)

# 3) helper for inquiry deadline status
marker = 'function messagePriorityLabel(value: AdminMessagePriority) {'
insert = """function inquiryDeadlineLabel(item: { messageType: MessageType; status: MessageStatus; hoursLeft?: number | null }) {
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

"""
if insert not in text:
    text = text.replace(marker, insert + marker, 1)

# 4) unread default card in form options
text = text.replace(
    '{ value: "archived", label: "مؤرشفة" },',
    '{ value: "archived", label: "مؤرشفة" },\n                        { value: "transferred", label: "تم التحويل" },',
    1
)

# 5) filter options add transferred
text = text.replace(
    '{ value: "archived", label: "مؤرشفة" },\n                      ]}',
    '{ value: "archived", label: "مؤرشفة" },\n                        { value: "transferred", label: "تم التحويل" },\n                      ]}',
    1
)

# 6) card status select add transferred
text = text.replace(
    '{ value: "archived", label: "مؤرشفة" },\n                                                                      ]}',
    '{ value: "archived", label: "مؤرشفة" },\n                                                                        { value: "transferred", label: "تم التحويل" },\n                                                                      ]}',
    1
)

# 7) add transfer button next to booking convert
needle = """{item.messageType === "booking" ? (
                                                                              <button
                                          type="button"
                                          onClick={() => onCreateVisit(item)}
                                                                            className="rounded-full bg-[#06142f] px-3 py-2 text-[11px] font-bold text-white"
                             >
                                                        حوّل إلى زيارة
                                        </button>
                                    ) : null}"""
replacement = """{item.messageType === "booking" ? (
                                                                              <button
                                          type="button"
                                          onClick={() => onCreateVisit(item)}
                                                                            className="rounded-full bg-[#06142f] px-3 py-2 text-[11px] font-bold text-white"
                             >
                                                        حوّل إلى زيارة
                                        </button>
                                    ) : null}
                                      {item.messageType === "inquiry" && item.status !== "transferred" ? (
                                        <button
                                          type="button"
                                          onClick={() => onChangeStatus(item.id, "transferred")}
                                          className="rounded-full bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-700"
                                        >
                                          تم التحويل
                                        </button>
                                      ) : null}"""
text = text.replace(needle, replacement)

# 8) replace hours badge with richer deadline badge
old = """{item.hoursLeft !== null && item.messageType === "inquiry" ? (
                                                    <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                        باقي تقريباً {item.hoursLeft} س
                       </span>
                                              ) : null}"""
new = """{item.messageType === "inquiry" ? (
                                                    <span className={`rounded-full px-3 py-2 text-[11px] font-bold ${inquiryDeadlineClasses(item)}`}>
                                                      {inquiryDeadlineLabel(item)}
                                                    </span>
                                                  ) : null}
                                                  {item.hoursLeft !== null && item.messageType === "inquiry" && item.status !== "transferred" ? (
                                                    <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                                                      باقي تقريباً {item.hoursLeft} س
                                                    </span>
                                                  ) : null}"""
text = text.replace(old, new)

# 9) when creating visit from message, mark transferred instead of followed
text = text.replace('{ ...item, status: "followed" }', '{ ...item, status: "transferred" }')

# 10) dashboard stats add urgent/inquiry due small cards by replacing stats block if found
old_stats = """{ title: "الرسائل", value: messages.length, note: "التواصل", section: "messages" as AdminSection },
            { title: "الإشعارات", value: alerts.length, note: "التنبيهات", section: "alerts" as AdminSection },"""
new_stats = """{ title: "الرسائل", value: messages.length, note: "التواصل", section: "messages" as AdminSection },
            { title: "الإشعارات", value: alerts.length, note: "التنبيهات", section: "alerts" as AdminSection },
            { title: "حجوزات مستعجلة", value: alerts.filter((item) => item.priority === "urgent_booking").length, note: "قصوى", section: "alerts" as AdminSection },
            { title: "استفسارات مستعجلة", value: alerts.filter((item) => item.priority === "inquiry_due").length, note: "قرب الأجل", section: "alerts" as AdminSection },"""
text = text.replace(old_stats, new_stats)

path.write_text(text)
print(f"Updated: {path}")
PY

cd ~/immomarket && npm run dev
