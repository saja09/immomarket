export default function SearchBar() {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/95 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-slate-500">
              Smart Search
            </p>
            <p className="mt-1 text-sm text-slate-400">
              ابحث بالصوت أو بالكتابة
            </p>
          </div>

          <button className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0Z" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          defaultValue="عطيني شقة مشمشة فالمنزه بين 70 و80 متر وبأقل من 50 مليون"
          className="mb-4 w-full rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-[1.05rem] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="ابحث عن العقار الذي تريده..."
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button className="rounded-[22px] bg-slate-950 px-5 py-5 text-xl font-black text-white transition hover:bg-slate-800">
            بحث
          </button>

          <button className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-xl font-bold text-slate-900 transition hover:bg-slate-50">
            عرض الخريطة
          </button>
        </div>

        <button className="mt-4 block w-full rounded-[22px] border border-blue-100 bg-blue-50 px-4 py-4 text-right text-lg font-bold leading-8 text-blue-700 transition hover:bg-blue-100">
          مثال: عطيني شقة مشمشة فالمنزه بين 70 و80 متر وبأقل من 50 مليون
        </button>
      </div>
    </div>
  )
}
