import { useEffect, useMemo, useState, memo } from "react"
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom"
import { MapPin, Ruler, BedDouble, Sparkles, User, Key, Globe, Search, Loader2 } from "lucide-react"
import SearchBar from "./components/SearchBar"
import { parseSearchWithAI } from "./services/aiSearch"
import { translations } from "./translations"

const formatDh = (v: number) => new Intl.NumberFormat("fr-FR").format(v).replace(/,/g, ' ');
const normalize = (t: string) => t?.toLowerCase().trim().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه") || "";

const seedData = [
  { id: 1, title: "شقة اقتصادية بالدعم", city: "سيدي علال البحراوي", district: "حي الأمل", area: 62, priceDh: 430000, supportDh: 100000, rooms: 2, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
  { id: 2, title: "فيلا فاخرة بمسبح", city: "سيدي علال البحراوي", district: "حي السعادة", area: 320, priceDh: 2100000, supportDh: 0, rooms: 5, image: "https://images.unsplash.com/photo-1613977257363-707ba9348227" },
];

export default function App() {
  const [lang, setLang] = useState<string>(localStorage.getItem("app_lang") || "ar");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = translations[lang] || translations.ar;
  const [properties, setProperties] = useState<any[]>(seedData);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    localStorage.setItem("app_lang", lang);
    document.documentElement.dir = t.dir;
    const raw = localStorage.getItem("immomarket_admin_properties");
    if (raw) setProperties([...JSON.parse(raw), ...seedData]);
  }, [lang, t]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const price = Number(p.priceDh || p.price || 0);
      if (filters.district && p.district !== filters.district) return false;
      if (filters.minPrice && price < Number(filters.minPrice) * 10000) return false;
      if (filters.maxPrice && price > Number(filters.maxPrice) * 10000) return false;
      if (filters.supportDh !== "" && filters.supportDh !== undefined && p.supportDh !== Number(filters.supportDh)) return false;
      return (normalize(p.title) + normalize(p.district)).includes(normalize(query));
    });
  }, [properties, query, filters]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#06142f] font-sans pb-10 transition-all duration-300" dir={t.dir}>
      <header className="mx-auto mt-4 max-w-md px-4 sticky top-4 z-[200]">
        <div className="flex items-center justify-between rounded-[28px] bg-white/95 backdrop-blur-md px-5 py-3 shadow-xl border border-white relative">
           <Link to="/admin-login" className="h-9 px-4 rounded-full text-[11px] font-black text-slate-400 border border-slate-100 flex items-center justify-center uppercase">{t.login}</Link>
           <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5" dir="ltr">
              <span className="text-[18px] font-black text-blue-600 uppercase">Dare</span>
              <Key size={16} className="text-amber-500 fill-amber-500 rotate-[135deg]" />
              <span className="text-[18px] font-black text-[#06142f] uppercase">Dark</span>
           </div>
           <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="h-9 w-9 bg-slate-50 border rounded-xl flex items-center justify-center shadow-sm uppercase text-[10px] font-black">{lang}</button>
              {isLangOpen && (
                <div className={`absolute top-full mt-2 w-40 bg-white rounded-2xl shadow-2xl border p-2 ${t.dir==='rtl'?'left-0':'right-0'} animate-in fade-in zoom-in-95`}>
                   {Object.keys(translations).map(l => (
                     <button key={l} onClick={()=>{setLang(l); setIsLangOpen(false)}} className={`w-full text-right p-2.5 rounded-xl text-xs font-black flex justify-between items-center ${lang===l?'bg-blue-50 text-blue-600':'text-slate-500 hover:bg-slate-50'}`}>
                        <span className="opacity-30 uppercase text-[9px]">{l}</span>
                        {translations[l].name}
                     </button>
                   ))}
                </div>
              )}
           </div>
        </div>
      </header>

      <main className="mt-6">
        <SearchBar value={query} onChange={setQuery} onAiSearch={async(v:any)=>{const r=await parseSearchWithAI(v); if(r)setFilters(r)}} onFilterChange={setFilters} districts={Array.from(new Set(properties.map(p => p.district)))} t={t} />
        
        <div className="px-5 mt-10 max-w-md mx-auto space-y-8">
          <div className={`flex items-center justify-between px-2 ${t.dir==='rtl'?'flex-row':'flex-row-reverse'}`}>
             <span className="bg-[#06142f] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">Units: {filteredProperties.length}</span>
             <h2 className="text-2xl font-black tracking-tight">{t.availableNow}</h2>
          </div>

          <div className="space-y-8">
            {filteredProperties.map(p => (
              <div key={p.id} className="bg-white rounded-[45px] overflow-hidden shadow-sm border border-white">
                <div className="relative h-64"><img src={p.image} className="h-full w-full object-cover" />
                  <div className={`absolute top-5 ${t.dir==='rtl'?'left-5':'right-5'} bg-white px-5 py-2 rounded-2xl font-black text-sm`}>DH {formatDh(p.priceDh)}</div>
                </div>
                <div className={`p-8 ${t.dir==='rtl'?'text-right':'text-left'}`}>
                  <h3 className="font-black text-lg mb-4">{p.title}</h3>
                  <div className={`flex gap-2 ${t.dir==='rtl'?'justify-end':'justify-start'}`}>
                    <span className="bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-50">{t.districts[p.district] || p.district} <MapPin size={10} className="inline ml-1"/></span>
                    <span className="bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-50">{p.area} M² <Ruler size={10} className="inline ml-1"/></span>
                    <span className="bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-50">{p.rooms} {t.rooms} <BedDouble size={10} className="inline ml-1"/></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
