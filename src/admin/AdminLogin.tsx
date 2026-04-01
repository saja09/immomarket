import React, { useState } from 'react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // الحسابات المقبولة
  const accounts = [
    { email: "elghallaoui.simo@gmail.com", pass: "689108" },
    { email: "admin@immomarket.ma", pass: "simo123" }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    // التحقق من الحسابات
    const userFound = accounts.find(acc => acc.email.toLowerCase() === inputEmail && acc.pass === inputPass);

    if (userFound) {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("immomarket_admin_user", JSON.stringify({
        email: userFound.email,
        role: 'admin'
      }));
      
      // توجيه مباشر ومضمون للداشبورد
      window.location.href = "/admin-dashboard";
    } else {
      setError('المعلومات غير صحيحة. تأكد من البريد والباسورد.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5fb] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center border border-slate-100">
        <div className="h-16 w-16 bg-[#06142f] rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-6 shadow-lg shadow-blue-900/20">IM</div>
        <h1 className="text-[32px] font-black text-[#06142f] mb-2">دخول الإدارة</h1>
        <p className="text-slate-400 font-bold mb-8 text-sm">صفحة خاصة بالأدمن فقط</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="البريد الإلكتروني" 
            className="w-full p-5 rounded-[20px] border border-slate-100 bg-slate-50 text-right outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            className="w-full p-5 rounded-[20px] border border-slate-100 bg-slate-50 text-right outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="text-red-500 font-black text-xs mt-2">{error}</p>}
          
          <button type="submit" className="w-full bg-[#06142f] text-white py-5 rounded-[22px] font-black text-xl shadow-xl hover:bg-blue-600 transition-all mt-6 shadow-blue-900/20">
            دخول للنظام
          </button>
        </form>
        <button onClick={() => window.location.href="/"} className="mt-8 text-slate-400 font-bold text-xs">رجوع للموقع الرئيسي</button>
      </div>
    </div>
  );
};

export default AdminLogin;
