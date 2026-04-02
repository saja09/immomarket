import { useState } from "react";
import { Search, Sparkles, Loader2, Building2, X, CheckCircle } from "lucide-react";

export default function SearchBar({ value, onChange, onAiSearch, onFilterChange, districts, t }: any) {
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [localFilters, setLocalFilters] = useState({ city: "sidiAllal", district: "", propertyType: "", minPrice: "", maxPrice: "", supportDh: "" });

  const handleChange = (field: string, val: any) => {
    const next = { ...localFilters, [field]: val };
    setLocalFilters(next);
    onFilterChange(next); 
  };

  const isRtl = t.dir === "rtl";

  return (
    <section className="mx-auto mt-4 w-full max-w-md px-4 relative z-[110]">
      <div className={`relative bg-white transition-all shadow-xl ring-1 ring-slate-200/60 ${showFilter ? 'rounded-t-[28px]' : 'rounded-full'}`}>
        <div className={`flex items-center p-1.5 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={async () => { if(!value) return; setLoading(true); await onAiSearch(value); setLoading(false); setShowFilter(false); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shrink-0">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          </button>
          <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setShowFilter(true)} placeholder={t.searchPlaceholder} className={`flex-1 bg-transparent px-3 py-2 outline-none font-bold text-[#06142f] text-sm ${isRtl ? 'text-right' : 'text-left'}`} />
          <div className={`h-8 w-8 flex items-center justify-center text-slate-300 ${isRtl ? 'border-r pr-2' : 'border-l pl-2'}`}><Search size={18} /></div>
        </div>

        {showFilter && (
          <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-slate-100 rounded-b-[35px] shadow-2xl p-6 space-y-6 animate-in slide-in-from-top-1 z-[120]">
             <div className={`flex items-center justify-between border-b pb-4 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                <button onClick={() => setShowFilter(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full"><X size={18}/></button>
                <h3 className="font-black text-sm text-[#06142f] flex items-center gap-2 uppercase tracking-widest">{t.customSearch} <Building2 size={16}/></h3>
             </div>
             
             <div className={`space-y-4 ${isRtl ? 'text-right' : 'text-left'} font-bold`}>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">{t.city}</label>
                   <select value={localFilters.city} onChange={e => handleChange('city', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none appearance-none text-center font-black">
                     <option value="sidiAllal">{t.sidiAllal}</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">{t.district}</label>
                      <select value={localFilters.district} onChange={e => handleChange('district', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-xs outline-none appearance-none text-center">
                        <option value="">{t.allDistricts}</option>
                        {districts.map((d:string) => <option key={d} value={d}>{t.districts[d] || d}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">{t.type}</label>
                      <select value={localFilters.propertyType} onChange={e => handleChange('propertyType', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-xs outline-none appearance-none text-center">
                        <option value="">{t.allTypes}</option>
                        <option value="شقة">{t.propertyTypes["شقة"]}</option>
                        <option value="فيلا">{t.propertyTypes["فيلا"]}</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">{t.priceFrom}</label>
                      <input type="number" value={localFilters.minPrice} onChange={e => handleChange('minPrice', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-center text-xs outline-none" placeholder={t.min} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">{t.priceTo}</label>
                      <input type="number" value={localFilters.maxPrice} onChange={e => handleChange('maxPrice', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-center text-xs outline-none" placeholder={t.max} />
                   </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">{t.support}</label>
                  <select value={localFilters.supportDh} onChange={e => handleChange('supportDh', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-xs outline-none appearance-none text-center text-emerald-600 font-black">
                    <option value="">{t.allSupport}</option>
                    <option value="100000">{t.support10}</option>
                    <option value="70000">{t.support7}</option>
                  </select>
                </div>
                
                <button onClick={() => setShowFilter(false)} className="w-full bg-[#06142f] text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 mt-2 active:scale-95 transition-all">
                   <CheckCircle size={18}/> {t.applySearch}
                </button>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
