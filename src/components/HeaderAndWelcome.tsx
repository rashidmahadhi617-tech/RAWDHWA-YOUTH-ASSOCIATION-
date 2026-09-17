import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, User, ShieldCheck, UserPlus, LogIn, Clock, Sparkles } from 'lucide-react';
import { Member } from '../types';

interface HeaderAndWelcomeProps {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  members: Member[];
  onRegister: (name: string, phone: string) => { success: boolean; message: string; regNumber?: string };
  onLogin: (phone: string) => { success: boolean; user: Member | null; message: string };
  onAdminLogin: (password: string) => { success: boolean; message: string };
}

export default function HeaderAndWelcome({
  logoUrl,
  setLogoUrl,
  members,
  onRegister,
  onLogin,
  onAdminLogin,
}: HeaderAndWelcomeProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMessage, setRegMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  // Track successful signup for SMS mockup rendering
  const [successRegNumber, setSuccessRegNumber] = useState<string | null>(null);
  const [successPhone, setSuccessPhone] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);

  // Login States
  const [loginPhone, setLoginPhone] = useState('');
  const [loginMessage, setLoginMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Admin States
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Logo Editing States
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState(logoUrl);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      setRegMessage({ text: 'Tafadhali jaza majina yote na namba ya simu.', isError: true });
      return;
    }
    const result = onRegister(regName.trim(), regPhone.trim());
    setRegMessage({ text: result.message, isError: !result.success });
    if (result.success) {
      setSuccessRegNumber(result.regNumber || null);
      setSuccessPhone(regPhone.trim());
      setSuccessName(regName.trim());
      setRegName('');
      setRegPhone('');
    } else {
      setSuccessRegNumber(null);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setLoginMessage({ text: 'Tafadhali jaza namba yako ya usajili au simu.', isError: true });
      return;
    }
    const result = onLogin(loginPhone.trim());
    setLoginMessage({ text: result.message, isError: !result.success });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setAdminMessage({ text: 'Tafadhali weka nenosiri (password).', isError: true });
      return;
    }
    const result = onAdminLogin(adminPassword);
    setAdminMessage({ text: result.message, isError: !result.success });
    if (result.success) {
      setAdminPassword('');
    }
  };

  const handleSaveLogo = () => {
    if (tempLogoUrl.trim()) {
      setLogoUrl(tempLogoUrl.trim());
      setIsEditingLogo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="welcome-screen">
      {/* Top Brand Banner */}
      <header className="bg-emerald-950 text-white py-4 px-6 shadow-md border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative group/logo">
              <img
                src={logoUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 cursor-pointer shadow-inner"
                onClick={() => {
                  setTempLogoUrl(logoUrl);
                  setIsEditingLogo(true);
                }}
                title="Bonyeza kubadilisha picha/nembo"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[9px] text-emerald-950 font-bold px-1 rounded-full cursor-pointer hover:bg-amber-400">
                EDIT
              </span>
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg md:text-xl tracking-wider text-amber-300">
                RAWDHWA YOUTH ASSOCIATION
              </h1>
              <p className="text-xs text-emerald-200/90 font-mono">Umoja, Maendeleo, na Uwekezaji</p>
            </div>
          </div>
          <div className="hidden sm:flex text-right flex-col">
            <span className="text-xs text-amber-200/80 font-mono">TZ Portal v1.0</span>
            <span className="text-[11px] text-emerald-200/60 font-mono">Tanzania Youth Economic Association</span>
          </div>
        </div>
      </header>

      {/* Main Container - Split View (Logo/About Left, Authentication Right) */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden w-full grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
          
          {/* LEFT SIDE: Custom Interactive Association Identity Cover */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Logo/Image Area - Fully customizable inline */}
            <div className="relative z-10 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start space-y-4">
                <div className="relative group inline-block">
                  <img
                    src={logoUrl}
                    alt="Rawdhwa Youth Association Premium Logo"
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-2xl object-cover border-4 border-amber-400 shadow-2xl transition duration-300 transform group-hover:scale-105"
                  />
                  <button
                    onClick={() => {
                      setTempLogoUrl(logoUrl);
                      setIsEditingLogo(true);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-xs font-medium text-amber-300"
                    id="edit-art-btn"
                  >
                    <span>Badilisha Picha</span>
                    <span className="text-[10px] text-white underline">Bonyeza hapa</span>
                  </button>
                </div>
                
                <div>
                  <h2 className="text-2xl lg:text-3xl font-sans font-bold text-amber-400 tracking-tight">
                    RAWDHWA YOUTH ASSOCIATION
                  </h2>
                  <p className="text-sm text-emerald-100/90 mt-2 italic font-sans max-w-sm">
                    "Kukusanya nguvu za vijana kufanya uwekezaji endelevu na ujenzi wa uchumi wenye tija."
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats & features summary at the bottom */}
            <div className="relative z-10 mt-8 lg:mt-0 space-y-4 border-t border-emerald-800/60 pt-6">
              <div className="flex items-center space-x-3 text-emerald-100">
                <div className="p-1.5 bg-amber-500/10 rounded text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hali ya Usalama</h4>
                  <p className="text-xs text-emerald-200/80">Kila mwanachama anapaswa kuidhinishwa na Admin</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-emerald-100">
                <div className="p-1.5 bg-amber-500/10 rounded text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Uwekezaji wa Hisa</h4>
                  <p className="text-xs text-emerald-200/80">Uwezo wa kufuatilia hisa zako moja kwa moja</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-emerald-100">
                <div className="p-1.5 bg-amber-500/10 rounded text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Miamala ya Mtandao</h4>
                  <p className="text-xs text-emerald-200/80">Airtel Money, M-Pesa, Tigo Pesa, Halopesa</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Authentication flow & interactive state inputs */}
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-white" id="auth-panel">
            
            {/* LOGO EDIT MODAL POPUP */}
            <AnimatePresence>
              {isEditingLogo && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm"
                  id="logo-edit-modal"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-100"
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Hariri Picha au Nembo ya Chama</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Weka URL ya picha yoyote unayotaka kuweka kama logo ya Rawdhwa Youth Association. Itaonekana kwenye portal yote.
                    </p>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none text-slate-800"
                      value={tempLogoUrl}
                      onChange={(e) => setTempLogoUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    <div className="mt-4 flex space-x-2 justify-end">
                      <button
                        onClick={() => setIsEditingLogo(false)}
                        className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        Ghairi
                      </button>
                      <button
                        onClick={handleSaveLogo}
                        className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        id="save-logo-btn"
                      >
                        Hifadhi
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB SELECTORS - Elegant Swahili navigation */}
            <div className="flex border-b border-slate-100 mb-8 overflow-x-auto">
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setIsLoginView(true);
                  setLoginMessage(null);
                }}
                className={`flex items-center space-x-1.5 pb-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  !isAdminMode && isLoginView
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                id="tab-login"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingia Kwenye Akaunti</span>
              </button>
              
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setIsLoginView(false);
                  setRegMessage(null);
                }}
                className={`flex items-center space-x-1.5 pb-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  !isAdminMode && !isLoginView
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                id="tab-register"
              >
                <UserPlus className="w-4 h-4" />
                <span>Usajili wa Wanachama</span>
              </button>

              <button
                onClick={() => {
                  setIsAdminMode(true);
                  setAdminMessage(null);
                }}
                className={`flex items-center space-x-1.5 pb-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ml-auto ${
                  isAdminMode
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                id="tab-admin"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mkurugenzi (Admin)</span>
              </button>
            </div>

            {/* CONDITIONAL AUTH RENDER */}
            <div className="space-y-6">
              
              {/* 1. MEMBER LOGIN VIEW */}
              {!isAdminMode && isLoginView && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="login-form-div"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-sans font-bold text-slate-800">Karibu Kwenye Mfumo</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Weka namba yako ya upekee ya usajili (Registration Number) uliyopewa ulipojisajili ili uingie ndani ya kiwanja cha wanachama.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Namba ya Usajili (Kama: RYA-2026-002) au Namba ya Simu
                      </label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 absolute left-3 top-3.5 text-emerald-600" />
                        <input
                          type="text"
                          required
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="Andika namba yako ya usajili (Mfano: RYA-2026-###)..."
                          className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono tracking-wide"
                        />
                      </div>
                    </div>

                    {loginMessage && (
                      <div className={`p-4 rounded-xl text-xs flex flex-col space-y-1 ${
                        loginMessage.isError 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`} id="login-feedback">
                        <div className="font-semibold">
                          {loginMessage.isError ? "Kosa katika kuingia:" : "Hali ya Usajili:"}
                        </div>
                        <p>{loginMessage.text}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/10 cursor-pointer"
                      id="login-submit-btn"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Thibitisha na Uingie Ndani</span>
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      Hujajisajili bado?{' '}
                      <button
                        onClick={() => setIsLoginView(false)}
                        className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                      >
                        Sajili akaunti hapa
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 2. MEMBER REGISTRATION VIEW */}
              {!isAdminMode && !isLoginView && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="register-form-div"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-sans font-bold text-slate-800">Jisajili Rawdhwa Association</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Wasilisha namba yako na jina. Mara tu baada ya viongozi kuona na kuidhinisha (approve), utapata uwezo wa kuingia.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Jina Kamili la Mwanachama
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Mfano: Amina Kassim Salim"
                          className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Namba ya Simu yenye M-Pesa/Airtel/Tigo (TZ)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="Mfano: 0754889900"
                          className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {regMessage && (
                      <div className={`p-4 rounded-xl text-xs flex flex-col space-y-1 ${
                        regMessage.isError 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`} id="reg-feedback">
                        <div className="font-semibold">
                          {regMessage.isError ? "Tatizo la Usajili:" : "Hongera, Usajili Umepokelewa!"}
                        </div>
                        <p>{regMessage.text}</p>
                      </div>
                    )}

                    {/* Simulated SMS receipt indicator */}
                    {!regMessage?.isError && successRegNumber && (
                      <div className="bg-slate-900 text-white rounded-2xl p-4 border-l-4 border-amber-500 shadow-xl space-y-3 font-sans my-4 relative">
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="flex items-center space-x-2 text-amber-400 pb-1.5 border-b border-slate-800">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-mono tracking-widest uppercase">MOCK SMS GATEWAY (Iliyotumwa kwa: {successPhone})</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-mono">Ujumbe Mfupi wa Simu (SMS):</p>
                          <p className="text-xs text-slate-200 italic leading-relaxed">
                            "Ndugu <span className="font-semibold text-white">{successName}</span>, usajili wako umepokelewa vyema na sasa umesajiliwa kuwa Pending Approval. Namba yako ya Usajili ya kuingia kwenye mfumo ni:
                          </p>
                          <div className="py-2.5 px-3 bg-slate-950 rounded-xl border border-emerald-500/10 text-center font-mono text-lg font-extrabold tracking-widest text-amber-300 shadow-inner flex items-center justify-center select-all">
                            {successRegNumber}
                          </div>
                          <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                            ⚠️ Tafadhali ihifadhi namba hii kwa makini. Mara tu Admin atakapoidhinisha uanachama wako, utatumia namba hii kuingia katika mfumo kama mwanachama.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                      id="reg-submit-btn"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Tuma Ombi la Usajili</span>
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      Umeshasajiliwa tayari?{' '}
                      <button
                        onClick={() => setIsLoginView(true)}
                        className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                      >
                        Ingia hapa
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 3. ADMIN PASSWORD VIEW */}
              {isAdminMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="admin-form-div"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Udhibiti wa Admin</span>
                    </div>
                    <h3 className="text-xl font-sans font-bold text-slate-800">Ukurasa wa Viongozi</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Weka nenosiri la Mkurugenzi ili kupata mamlaka ya kuidhinisha wanachama, kuandika taarifa, na kuhariri hisa au logo.
                    </p>
                  </div>

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Nenosiri (Admin Password)
                      </label>
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Weka password (iliyowekwa: admin)..."
                        className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl py-3 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {adminMessage && (
                      <div className={`p-4 rounded-xl text-xs flex flex-col space-y-1 ${
                        adminMessage.isError 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`} id="admin-feedback">
                        <p>{adminMessage.text}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium text-sm py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                      id="admin-submit-btn"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ingia Kama Admin</span>
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      Rudi nyuma kama mwanachama wa kawaida?{' '}
                      <button
                        onClick={() => {
                          setIsAdminMode(false);
                          setIsLoginView(true);
                        }}
                        className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                      >
                        Ingia kwa Namba ya Simu
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* Footer info in Swahili */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p>© 2026 Rawdhwa Youth Association. Haki zote zimehifadhiwa.</p>
          <div className="flex space-x-4">
            <span className="text-slate-500">Tiba ya Vijana na Kujenga Jamii Imara</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
