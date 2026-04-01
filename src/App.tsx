import { useEffect, useMemo, useState, memo } from "react"
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom"
import { 
  MapPin, Ruler, BedDouble, Sparkles, Phone, MessageCircle, ArrowRight, User, Key
} from "lucide-react"
import SearchBar from "./components/SearchBar"
import { parseSearchWithAI } from "./services/aiSearch"

// --- Helpers ---
const formatDh = (v: number) => new Intl.NumberFormat("fr-FR").format(v).replace(/,/g, ' ') + " DH";
const priceStringToDh = (p: any) => typeof p === "number" ? p : Number(String(p).replace(/[^\d]/g, "") || 0);
const normalize = (t: string) => t?.toLowerCase().trim().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه") || "";

// --- المكون: لوغو Dare 🔑 Dark ---
const BrandLogo = () => (
  <div className="flex items-center gap-2 select-none" dir="ltr">
    <span className="text-[19px] font-black tracking-tight text-blue-600 uppercase">Dare</span>
    <div className="flex items-center justify-center">
      <svg width="18" height="24" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L22 12M12 2L2 12" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="18" r="4" stroke="#d4af37" strokeWidth="2.2"/>
        <path d="M12 22V30M12 25H15M12 28H15" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="text-[19px] font-black tracking-tight text-[#06142f] uppercase">Dark</span>
  </div>
);

const seedData = [
  { id: 1, title: "شقة اقتصادية بالدعم - حي الأمل", city: "سيدي علال البحراوي", district: "حي الأمل", area: 62, priceDh: 430000, supportDh: 100000, rooms: 2, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
  { id: 2, title: "فيلا فاخرة بمسبح - حي السعادة", city: "سيدي علال البحراوي", district: "حي السعادة", area: 320, priceDh: 2100000, supportDh: 0, rooms: 5, image: "https://images.unsplash.com/photo-1613977257363-707ba9348227" },
  { id: 3, title: "شقة عائلية كبيرة - حي النهضة", city: "سيدي علال البحراوي", district: "حي النهضة", area: 78, priceDh: 520000, supportDh: 70000, rooms: 3, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" },
  { id: 4, title: "استوديو عصري بسلا الجديدة", city: "سلا", district: "سلا الجديدة", area: 45, priceDh: 350000, supportDh: 0, rooms: 1, image: "https://images.unsplash.com/photo-1536376073367-e315021516e9" },
  { id: 5, title: "منزل مستقل - حي الفتح", city: "سيدي علال البحراوي", district: "حي الفتح", area: 100, priceDh: 850000, supportDh: 0, rooms: 4, image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83" },
  { id: 6, title: "شقة بـ 7 مليون دعم - البحراوي", city: "سيدي علال البحراوي", district: "حي النهضة", area: 78, priceDh: 520000, supportDh: 70000, rooms: 3, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb" },
];

export default function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const raw = localStorage.getItem("immomarket_admin_properties");
    const local = raw ? JSON.parse(raw) : [];
    setProperties([...local, ...seedData]);
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
      
      {/* --- الجزء الثابت الفوقاني: الهيدر والبار معاً --- */}
      <div className="sticky top-0 z-[100] bg-[#f8fafc]/80 backdrop-blur-xl pb-2">
        
        {/* البانر (السمية واللوغو) */}
        <header className="mx-auto max-w-md px-4 pt-4 mb-2">
          <div className="flex items-center justify-between rounded-[28px] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-white relative overflow-visible">
            <Link to="/admin-login" className="h-10 px-6 rounded-full text-[11px] font-black text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shrink-0">LOGIN</Link>
            <div className="absolute left-1/2 -translate-x-1/2">
               <BrandLogo />
            </div>
            <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
               <div className="h-2 w-2 bg-blue-600 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
            </div>
          </div>
        </header>

        {/* بار البحث (تحت السمية مباشرة وفنفس الـ Sticky) */}
        <SearchBar 
          value={query} 
          onChange={setQuery} 
          onAiSearch={async (val:string) => {
             const res = await parseSearchWithAI(val);
             if(res) setFilters(res);
          }} 
          onFilterChange={(f:any) => setFilters(f)}
          districts={Array.from(new Set(properties.map(p => p.district)))}
        />
      </div>

      {/* --- محتوى السيت --- */}
      <main className="pb-20 pt-4">
        <div className="px-5 max-w-md mx-auto space-y-8">
          <div className="flex items-center justify-between px-2">
             <span className="text-[10px] font-black bg-[#06142f] text-white px-3 py-1 rounded-full shadow-md uppercase tracking-widest">Units: {filteredProperties.length}</span>
             <h2 className="text-2xl font-black tracking-tight text-[#06142f]">المتوفر الآن</h2>
          </div>

          <div className="grid gap-6">
            {filteredProperties.map(p => (
              <Link key={p.id} to={`/property/${p.id}`} className="block bg-white rounded-[45px] overflow-hidden shadow-sm border border-white transition-all active:scale-95 group">
                <div className="relative h-64 bg-slate-100">
                  <img src={p.image} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur text-[#06142f] px-5 py-2 rounded-2xl font-black text-sm shadow-sm border">DH {formatDh(p.priceDh)}</div>
                  {p.supportDh > 0 && <div className="absolute bottom-5 right-5 bg-[#10b981] text-white px-3 py-1.5 rounded-full font-black text-[9px] shadow-lg">SUPPORT {p.supportDh/10000}M</div>}
                </div>
                <div className="p-7 text-right">
                  <h3 className="font-black text-lg text-[#06142f] mb-3">{p.title}</h3>
                  <div className="flex justify-end gap-3 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><MapPin size={10}/> {p.district}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><Ruler size={10}/> {p.area} M²</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Routes>
        <Route path="/property/:id" element={<PropertyDetails properties={properties} />} />
      </Routes>
    </div>
  )
}

function PropertyDetails({ properties }: { properties: any[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = properties.find(item => String(item.id) === id);
  if (!p) return null;
  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[200] overflow-y-auto p-4 text-right animate-in fade-in duration-300">
      <button onClick={() => navigate(-1)} className="bg-white px-5 py-2 rounded-full shadow-sm font-bold flex items-center gap-2 border mb-6"><ArrowRight size={18}/> رجوع</button>
      <div className="max-w-md mx-auto bg-white rounded-[45px] overflow-hidden shadow-2xl border">
        <img src={p.image} className="w-full h-80 object-cover" />
        <div className="p-8">
          <h2 className="text-2xl font-black">{p.title}</h2>
          <div className="bg-blue-50 p-6 rounded-3xl text-center my-6 border">
             <p className="text-3xl font-black text-blue-600">{formatDh(p.priceDh)}</p>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">{p.description}</p>
          <div className="mt-10 grid grid-cols-2 gap-3">
             <a href="https://wa.me/212771455703" className="bg-green-600 text-white py-4 rounded-3xl text-center font-black shadow-lg flex items-center justify-center gap-2"><MessageCircle size={20}/> واتساب</a>
             <a href="tel:0771455703" className="bg-[#06142f] text-white py-4 rounded-3xl text-center font-black shadow-lg flex items-center justify-center gap-2"><Phone size={20}/> اتصال</a>
          </div>
        </div>
      </div>
    </div>
  )
}
