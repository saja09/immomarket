python <<'PY'
from pathlib import Path

path = Path.home() / "immomarket" / "src" / "admin" / "AdminApp.tsx"
text = path.read_text()

# 1) import AlertsPage
if 'import AlertsPage from "./AlertsPage"' not in text:
    old = 'import StatsReportsPage from "./StatsReportsPage"\n'
    new = 'import StatsReportsPage from "./StatsReportsPage"\nimport AlertsPage from "./AlertsPage"\n'
    if old in text:
        text = text.replace(old, new, 1)

# 2) AdminSection add alerts
old = '''type AdminSection =
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
  | "stats-reports"'''
new = '''type AdminSection =
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
  | "alerts"'''
if old in text and '"alerts"' not in old:
    text = text.replace(old, new, 1)

# 3) sidebar add alerts after messages
needle = '{ key: "messages", title: "الرسائل", short: "الأولوية" },'
insert = '''{ key: "messages", title: "الرسائل", short: "الأولوية" },
  { key: "alerts", title: "الإشعارات", short: "التنبيهات" },'''
if needle in text and '{ key: "alerts", title: "الإشعارات", short: "التنبيهات" },' not in text:
    text = text.replace(needle, insert, 1)

# 4) useMemo deps add allAlerts
old = '}, [section, properties, owners, sellers, leads, visits, messages, ads, reports, controls, editingProperty])'
new = '}, [section, properties, owners, sellers, leads, visits, messages, ads, reports, controls, editingProperty, allAlerts])'
if old in text:
    text = text.replace(old, new, 1)

path.write_text(text)
print(f"Fixed: {path}")
PY

cd ~/immomarket && npm run dev
