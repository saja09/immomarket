import { useState } from "react";
import { Search, Sparkles, Loader2, Building2, X, CheckCircle } from "lucide-react";

export default function SearchBar({ value, onChange, onAiSearch, onFilterChange, districts }: any) {
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [localFilters, setLocalFilters] = useState({
    city: "سيدي علال البحراوي", district: "", propertyType: "", minPrice: "", maxPrice: "", supportDh: ""
  });

  const handleApply = () => {
    onFilterChange(localFilters);
    setShowFilter(false);
  };

  const handleFieldChange = (field: string, val: any) => {
    setLocalFilters({ ...localFilters, [field]: val });
  };

  return (
    <section className="mx-auto mt-4 w-full px-4 relative z-[110]">
      {/* بار البحث الرئيسي */}
      <div className={`relative bg-white shadow-xl ring-1 ring-slate-200 transition-all ${showFilter ? 'rounded-t-[30px] border-b-0' : 'rounded-full'}`}>
        <div className="flex items-center p-2">
          {/* زر جيمني */}
          <button 
            onPointerDown={async (e) => {
              e.preventDefault();
              if(!value) return;
              setLoading(true); 
              await onAiSearch(value); 
              setLoading(false); 
              setShowFilter(false);
            }}
            className="h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shrink-0 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          </button>

          <input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowFilter(true)}
            placeholder="ابحث بالهضرة أو حدد الفلتر..."
            className="flex-1 bg-transparent px-4 py-3 text-right outline-none font-bold text-[#06142f] text-sm"
          />

          <div className="h-10 w-10 flex items-center justify-center text-slate-300 border-r pr-2 ml-1"><Search size={20} /></div>
        </div>

        {/* لوحة الفلتر: طول 70% من الشاشة وعرض محترم */}
        {showFilter && (
          <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-slate-100 rounded-b-[35px] shadow-2xl animate-in slide-in-from-top-1 z-[120] flex flex-col h-[70vh]">
             
             {/* الهيدر: X فـ اليسار والسمية فـ اليمين (بدون زر تم) */}
             <div className="flex justify-between items-center px-6 py-5 border-b border-slate-50 bg-white shrink-0">
                <button onClick={() => setShowFilter(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                   <X size={22}/>
                </button>
                <h3 className="font-black text-lg text-[#06142f] flex items-center gap-2">تخصيص البحث <Building2 size={20} className="text-blue-600"/></h3>
             </div>

             {/* منطقة الخيارات القابلة للسكرول */}
             <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
                
                {/* المدينة */}
                <div className="space-y-2 text-right">
                   <label className="text-[11px] font-black text-slate-400 mr-1 uppercase tracking-widest">المدينة</label>
                   <select 
                     value={localFilters.city} 
                     onChange={e => handleFieldChange('city', e.target.value)} 
                     className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] p-5 font-black text-base outline-none appearance-none text-center text-blue-900 shadow-sm"
                   >
                     <option value="سيدي علال البحراوي">سيدي علال البحراوي</option>
                     <option value="الرباط">الرباط</option>
                     <option value="سلا">سلا</option>
                   </select>
                </div>

                {/* الحي ونوع العقار */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 text-right">
                      <label className="text-[11px] font-black text-slate-400 mr-1 uppercase">الحي</label>
                      <select value={localFilters.district} onChange={e => handleFieldChange('district', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none appearance-none text-center">
                        <option value="">كل الأحياء</option>
                        {districts.map((d:string) => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2 text-right">
                      <label className="text-[11px] font-black text-slate-400 mr-1 uppercase">نوع العقار</label>
                      <select value={localFilters.propertyType} onChange={e => handleFieldChange('propertyType', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none appearance-none text-center">
                        <option value="">الكل</option>
                        <option value="شقة">شقة</option>
                        <option value="فيلا">فيلا</option>
                        <option value="منزل">منزل</option>
                      </select>
                   </div>
                </div>

                {/* الأثمنة: أدنى فاليمين وأقصى فاليسار */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 text-right">
                      <label className="text-[11px] font-black text-slate-400 mr-1 uppercase">من (M)</label>
                      <input type="number" value={localFilters.minPrice} onChange={e => handleFieldChange('minPrice', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center font-black text-sm outline-none shadow-inner" placeholder="أدنى" />
                   </div>
                   <div className="space-y-2 text-right">
                      <label className="text-[11px] font-black text-slate-400 mr-1 uppercase">إلى (M)</label>
                      <input type="number" value={localFilters.maxPrice} onChange={e => handleFieldChange('maxPrice', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center font-black text-sm outline-none shadow-inner" placeholder="أقصى" />
                   </div>
                </div>

                {/* الدعم */}
                <div className="space-y-2 text-right pb-4">
                  <label className="text-[11px] font-black text-slate-400 mr-1 uppercase tracking-widest">الدعم السكني</label>
                  <select value={localFilters.supportDh} onChange={e => handleFieldChange('supportDh', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-sm outline-none appearance-none text-center text-emerald-600 shadow-sm">
                    <option value="">الكل (دعم وبلا دعم)</option>
                    <option value="100000">دعم 10 مليون</option>
                    <option value="70000">دعم 7 مليون</option>
                    <option value="0">بدون دعم</option>
                  </select>
                </div>
             </div>

             {/* زر تطبيق البحث: ثابت فأسفل الفيلتر */}
             <div className="p-6 bg-white border-t shrink-0">
                <button 
                  onClick={handleApply}
                  className="w-full bg-[#06142f] text-white py-5 rounded-[25px] font-black text-lg shadow-2xl shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle size={22}/> تطبيق البحث
                </button>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
