import { useEffect, useMemo, useState, memo } from "react"
import { Routes, Route, Link, useParams } from "react-router-dom"
import { 
  MapPin, Ruler, BedDouble, Sparkles, Phone, MessageCircle, ArrowRight, User, Key
} from "lucide-react"
import SearchBar from "./components/SearchBar"
import { parseSearchWithAI } from "./services/aiSearch"

// --- Helpers ---
const formatDh = (v: number) => new Intl.NumberFormat("fr-FR").format(v).replace(/,/g, ' ') + " DH";
const priceStringToDh = (p: any) => typeof p === "number" ? p : Number(String(p).replace(/[^\d]/g, "") || 0);
const normalize = (t: string) => t?.toLowerCase().trim().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه") || "";

// --- المكون: لوغو الساروت المفضل عندك (Dare 🔑 Dark) ---
const BrandLogo = () => (
  <div className="flex items-center gap-2 select-none" dir="ltr">
    <span className="text-[19px] font-black tracking-tight text-blue-600 uppercase">Dare</span>
    <div className="flex items-center justify-center">
      <svg width="18" height="24" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L22 12M12 2L2 12" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="18" r="4" stroke="#d4af37" strokeWidth="2"/>
        <path d="M12 22V30M12 25H15M12 28H15" stroke="#d4af37" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="text-[19px] font-black tracking-tight text-[#06142f] uppercase">Dark</span>
  </div>
);

// --- البيانات الحقيقية (15 عقار) ---
const seedData = [
  { id: 1, title: "شقة اقتصادية بالدعم - حي الأمل", city: "سيدي علال البحراوي", district: "حي الأمل", area: 62, priceDh: 430000, supportDh: 100000, rooms: 2, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
  { id: 2, title: "فيلا فاخرة بمسبح - حي السعادة", city: "سيدي علال البحراوي", district: "حي السعادة", area: 320, priceDh: 2100000, supportDh: 0, rooms: 5, image: "https://images.unsplash.com/photo-1613977257363-707ba9348227" },
  { id: 3, title: "شقة عائلية كبيرة - حي النهضة", city: "سيدي علال البحراوي", district: "حي النهضة", area: 78, priceDh: 520000, supportDh: 70000, rooms: 3, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" },
  { id: 4, title: "استوديو عصري بسلا الجديدة", city: "سلا", district: "سلا الجديدة", area: 45, priceDh: 350000, supportDh: 0, rooms: 1, image: "https://images.unsplash.com/photo-1536376073367-e315021516e9" },
  { id: 5, title: "منزل مستقل - حي الفتح", city: "سيدي علال البحراوي", district: "حي الفتح", area: 100, priceDh: 850000, supportDh: 0, rooms: 4, image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83" },
  { id: 6, title: "شقة بـ 7 مليون دعم - البحراوي", city: "سيدي علال البحراوي", district: "حي النهضة", area: 78, priceDh: 520000, supportDh: 70000, rooms: 3, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb" },
  { id: 7, title: "شقة فاخرة بأكدال الرباط", city: "الرباط", district: "أكدال", area: 110, priceDh: 1650000, supportDh: 0, rooms: 3, image: "https://images.unsplash.com/photo-1512918766674-ed62b90eaa9c" },
  { id: 8, title: "منزل ريفي هادئ - وسط المدينة", city: "سيدي علال البحراوي", district: "وسط المدينة", area: 150, priceDh: 750000, supportDh: 0, rooms: 4, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
  { id: 9, title: "شقة بـ 10 مليون دعم - حي الوفاء", city: "سيدي علال البحراوي", district: "حي الوفاء", area: 65, priceDh: 440000, supportDh: 100000, rooms: 2, image: "https://images.unsplash.com/photo-1484154218962-a197022b5858" },
  { id: 10, title: "فيلا مودرن بتمارة - هرهورة", city: "تمارة", district: "هرهورة", area: 400, priceDh: 3500000, supportDh: 0, rooms: 6, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" },
  { id: 11, title: "شقة متوسطة بسلا - حي السلام", city: "سلا", district: "حي السلام", area: 85, priceDh: 680000, supportDh: 0, rooms: 3, image: "https://images.unsplash.com/photo-1494526585095-c41746248156" },
  { id: 12, title: "شقة رخيصة جدا - حي الأمل", city: "سيدي علال البحراوي", district: "حي الأمل", area: 50, priceDh: 320000, supportDh: 100000, rooms: 2, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85" },
  { id: 13, title: "شقة كبيرة فـ تمارة - حي المسيرة", city: "تمارة", district: "حي المسيرة", area: 105, priceDh: 890000, supportDh: 70000, rooms: 3, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb" },
  { id: 14, title: "استوديو راقي - مارينا سلا", city: "سلا", district: "مارينا", area: 55, priceDh: 950000, supportDh: 0, rooms: 1, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
  { id: 15, title: "فيلا اقتصادية - البحراوي الجديدة", city: "سيدي علال البحراوي", district: "حي الياسمين", area: 180, priceDh: 1300000, supportDh: 0, rooms: 4, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c" }
];

export default function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const raw = localStorage.getItem("immomarket_admin_properties");
    const localData = raw ? JSON.parse(raw) : [];
    setProperties([...localData, ...seedData]);
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const pPrice = Number(p.priceDh || 0);
      const s = normalize(query);
      if (filters.district && normalize(p.district) !== normalize(filters.district)) return false;
      if (filters.minPrice && pPrice < Number(filters.minPrice) * 10000) return false;
      if (filters.maxPrice && pPrice > Number(filters.maxPrice) * 10000) return false;
      if (filters.supportDh !== "" && filters.supportDh !== undefined && p.supportDh !== Number(filters.supportDh)) return false;
      return (normalize(p.title) + normalize(p.district)).includes(s);
    });
  }, [properties, query, filters]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#06142f] font-sans" dir="rtl">
      {/* --- الهيدر المستقر الأصلي (Dare🔑Dark) --- */}
      <header className="mx-auto mt-4 max-w-md px-4 sticky top-4 z-50">
        <div className="flex items-center justify-between rounded-[28px] bg-white/95 backdrop-blur-md px-5 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-white relative overflow-visible">
           <Link to="/admin-login" className="h-10 px-5 rounded-full text-[11px] font-black text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shrink-0">LOGIN</Link>
           <div className="absolute left-1/2 -translate-x-1/2">
              <BrandLogo />
           </div>
           <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"></div>
        </div>
      </header>

      <main className="pb-20 pt-4">
        <SearchBar 
          value={query} onChange={setQuery} 
          onAiSearch={async (val:string) => {
             const res = await parseSearchWithAI(val);
             if(res) setFilters(res);
          }} 
          onFilterChange={(f:any) => setFilters(f)}
          districts={Array.from(new Set(properties.map(p => p.district)))}
        />

        <div className="px-5 mt-10 max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-black tracking-tight text-[#06142f]">المتوفر الآن</h2>
             <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full shadow-md uppercase">Units: {filteredProperties.length}</span>
          </div>

          <div className="grid gap-6">
            {filteredProperties.map(p => (
              <div key={p.id} className="block bg-white rounded-[45px] overflow-hidden shadow-sm border border-white transition-all active:scale-95 group">
                <div className="relative h-64 bg-slate-100">
                  <img src={p.image} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur text-[#06142f] px-5 py-2 rounded-2xl font-black text-sm shadow-sm border">DH {formatDh(p.priceDh)}</div>
                  {p.supportDh > 0 && <div className="absolute bottom-5 right-5 bg-[#10b981] text-white px-3 py-1.5 rounded-full font-black text-[9px] shadow-lg">SUPPORT {p.supportDh/10000}M</div>}
                </div>
                <div className="p-7 text-right">
                  <h3 className="font-black text-lg text-[#06142f] leading-tight mb-3">{p.title}</h3>
                  <div className="flex justify-end gap-3 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><MapPin size={10}/> {p.district}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><Ruler size={10}/> {p.area} M²</span>
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
