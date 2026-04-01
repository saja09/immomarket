import { useState } from "react";
import { Search, Sparkles, Loader2, Building2, CheckCircle, RotateCcw } from "lucide-react";

export default function SearchBar({ value, onChange, onAiSearch, onFilterChange, districts }: any) {
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  
  const [localFilters, setLocalFilters] = useState({
    city: "سيدي علال البحراوي",
    district: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    supportDh: ""
  });

  // إرسال التغييرات فوراً للوجيك الرئيسي
  const handleFieldChange = (field: string, val: any) => {
    const next = { ...localFilters, [field]: val };
    setLocalFilters(next);
    onFilterChange(next); 
  };

  const handleReset = () => {
    const reset = { city: "سيدي علال البحراوي", district: "", propertyType: "", minPrice: "", maxPrice: "", supportDh: "" };
    setLocalFilters(reset);
    onFilterChange(reset);
    onChange("");
  };

  return (
    <section className="mx-auto mt-6 w-full max-w-md px-4 relative z-[100]">
      <div className={`relative bg-white rounded-[32px] shadow-xl ring-1 ring-slate-200 transition-all ${showFilter ? 'rounded-b-none border-b-0 shadow-none' : ''}`}>
        <div className="flex items-center p-2">
          {/* زر جيمني */}
          <button 
            onClick={async () => { 
              if(!value) return;
              setLoading(true); await onAiSearch(value); setLoading(false); setShowFilter(false);
            }} 
            className="h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shrink-0 active:scale-90 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          </button>

          {/* خانة البحث: تفتح الفلتر عند التركيز */}
          <input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowFilter(true)}
            placeholder="ابحث بالهضرة أو حدد الفلتر..."
            className="flex-1 bg-transparent px-4 py-3 text-right outline-none font-bold text-[#06142f] text-sm"
          />
          <div className="h-10 w-10 flex items-center justify-center text-slate-300 border-r pr-2"><Search size={20} /></div>
        </div>

        {showFilter && (
          <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-slate-100 rounded-b-[40px] p-6 shadow-2xl animate-in slide-in-from-top-1 z-[110]">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                <button onClick={() => setShowFilter(false)} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">تـم</button>
                <h3 className="font-black text-sm text-[#06142f] flex items-center gap-2">تخصيص البحث <Building2 size={16}/></h3>
             </div>

             <div className="space-y-5 text-right font-bold">
                {/* المدينة */}
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المدينة</label>
                   <select value={localFilters.city} onChange={e => handleFieldChange('city', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black outline-none text-right appearance-none">
                     <option value="سيدي علال البحراوي">سيدي علال البحراوي</option>
                     <option value="الرباط">الرباط</option>
                     <option value="سلا">سلا</option>
                     <option value="تمارة">تمارة</option>
                   </select>
                </div>

                {/* الحي والنوع */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الحي</label>
                      <select value={localFilters.district} onChange={e => handleFieldChange('district', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none text-right appearance-none text-sm">
                        <option value="">جميع الأحياء</option>
                        {districts.map((d:string) => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-tighter">نوع العقار</label>
                      <select value={localFilters.propertyType} onChange={e => handleFieldChange('propertyType', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none text-right appearance-none text-sm">
                        <option value="">الكل</option>
                        <option value="شقة">شقة</option>
                        <option value="فيلا">فيلا</option>
                        <option value="منزل">منزل</option>
                      </select>
                   </div>
                </div>

                {/* الأثمنة (من اليمين إلى اليسار) */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase text-right">الثمن من (مليون)</label>
                      <input type="number" value={localFilters.minPrice} onChange={e => handleFieldChange('minPrice', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center font-black outline-none" placeholder="أدنى" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase text-right">الثمن إلى (مليون)</label>
                      <input type="number" value={localFilters.maxPrice} onChange={e => handleFieldChange('maxPrice', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center font-black outline-none" placeholder="أقصى" />
                   </div>
                </div>

                {/* نوع الدعم */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الدعم السكني</label>
                  <select value={localFilters.supportDh} onChange={e => handleFieldChange('supportDh', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-[#06142f] outline-none text-right appearance-none">
                    <option value="">الكل</option>
                    <option value="100000">دعم 10 مليون</option>
                    <option value="70000">دعم 7 مليون</option>
                    <option value="0">بدون دعم</option>
                  </select>
                </div>
                
                <button onClick={handleReset} className="w-full mt-4 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-sm border border-slate-100 flex items-center justify-center gap-2 active:scale-95 transition-all">مسح كافة الفلاتر <RotateCcw size={14}/></button>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
