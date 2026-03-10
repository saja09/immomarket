import { UserRound } from "lucide-react"

export default function Header({ openAuth }: { openAuth: () => void }) {
  return (
    <header className="mx-auto mt-4 max-w-md px-4">
      <div className="flex items-center justify-between rounded-[28px] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">

        <button
          onClick={openAuth}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8fafc] px-4 py-2 text-[14px] font-bold text-[#06142f]"
        >
          <UserRound size={18} />
          الدخول
        </button>

        <div className="flex items-center gap-3">

          <h1 className="text-[30px] font-black tracking-tight text-[#06142f]">
            ImmoMarket
          </h1>

          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#06142f] to-[#0a2b63] shadow">
            <span className="text-[18px] font-black text-white">IM</span>
          </div>

        </div>

      </div>
    </header>
  )
}
