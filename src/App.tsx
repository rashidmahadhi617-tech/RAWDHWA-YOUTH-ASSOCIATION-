import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Coins, Smartphone, ShieldCheck, LogOut, Menu, X, 
  User, Sparkles, Building2, Bell, RefreshCw, Calendar, SmartphoneCharging,
  ArrowLeft, Users
} from 'lucide-react';

import { Member, Announcement, Transaction } from './types';
import { 
  INITIAL_MEMBERS, INITIAL_ANNOUNCEMENTS, INITIAL_TRANSACTIONS, 
  DEFAULT_LOGO, DEFAULT_ADMIN_PASSWORD 
} from './mockData';

// Subcomponents
import HeaderAndWelcome from './components/HeaderAndWelcome';
import Announcements from './components/Announcements';
import Shares from './components/Shares';
import Transactions from './components/Transactions';
import AdminApproval from './components/AdminApproval';

export default function App() {
  // --- Persistent Storage State Initialization ---
  // Force clean state check synchronously before initialization
  const isCleared = localStorage.getItem('rawdhwa_db_fresh_reset_v4');
  if (!isCleared) {
    localStorage.removeItem('rawdhwa_members');
    localStorage.removeItem('rawdhwa_announcements');
    localStorage.removeItem('rawdhwa_transactions');
    localStorage.removeItem('rawdhwa_session');
    localStorage.setItem('rawdhwa_db_fresh_reset_v4', 'true');
  }

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    const saved = localStorage.getItem('rawdhwa_logo');
    if (!saved || saved.includes('unsplash.com')) {
      return DEFAULT_LOGO;
    }
    return saved;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('rawdhwa_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('rawdhwa_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rawdhwa_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [currentSession, setCurrentSession] = useState<{
    user: Member | null;
    isAdmin: boolean;
  } | null>(() => {
    const saved = localStorage.getItem('rawdhwa_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'shares' | 'transactions' | 'approvals'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Mifumo iko imara');
  const [impersonatedMemberId, setImpersonatedMemberId] = useState<string | null>(null);

  // Derive effective user context for Admin Impersonation (Angalia kama Mwanachama)
  const isActualAdmin = currentSession ? currentSession.isAdmin : false;
  const impersonatedMember = impersonatedMemberId 
    ? members.find(m => m.id === impersonatedMemberId) || null 
    : null;

  const effectiveUser = impersonatedMember || (currentSession ? currentSession.user : null);
  const effectiveIsAdmin = isActualAdmin && !impersonatedMemberId;

  // --- Effects for Syncing to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('rawdhwa_logo', logoUrl);
  }, [logoUrl]);

  useEffect(() => {
    localStorage.setItem('rawdhwa_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('rawdhwa_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('rawdhwa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('rawdhwa_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('rawdhwa_session');
    }
  }, [currentSession]);


  // --- Helper trigger status update ---
  const triggerSyncIndicator = (msg: string) => {
    setSyncStatus(msg);
    setTimeout(() => setSyncStatus('Mifumo iko imara (Imehifadhiwa)'), 3000);
  };


  // --- User Registration Request Flow ---
  const handleRegister = (name: string, phone: string) => {
    // Basic sanitization
    const formattedPhone = phone.trim();
    const formattedName = name.trim();

    const phoneExists = members.some(m => m.phone === formattedPhone);
    if (phoneExists) {
      return { success: false, message: 'Namba hii ya simu tayari imesajiliwa kwenye mfumo.' };
    }

    // Auto-generate Registration Number (RYA-2026-00X)
    const maxSeqNum = members.reduce((max, m) => {
      if (m.regNumber && m.regNumber.startsWith('RYA-2026-')) {
        const parts = m.regNumber.split('-');
        if (parts.length >= 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq)) return Math.max(max, seq);
        }
      }
      return max;
    }, 0);
    const nextNum = maxSeqNum + 1;
    const regNumber = `RYA-2026-${String(nextNum).padStart(3, '0')}`;

    const newMember: Member = {
      id: 'm-' + Date.now(),
      name: formattedName,
      phone: formattedPhone,
      regNumber: regNumber,
      status: 'pending', // Starts suspended until Approved by admin
      role: 'member',
      shares: 0,
      joinedAt: new Date().toISOString(),
    };

    setMembers(prev => [...prev, newMember]);
    triggerSyncIndicator('Usajili unalindwa...');
    return {
      success: true,
      regNumber: regNumber,
      message: `Asante ${formattedName}! Usajili wako umepokelewa na sasa umeidhinishwa kuwa "Pending Approval".`
    };
  };


  // --- Member Login flow ---
  const handleLogin = (regNoOrPhone: string) => {
    const trimmed = regNoOrPhone.trim().toUpperCase();
    const member = members.find(m => 
      (m.regNumber && m.regNumber.toUpperCase() === trimmed) || 
      m.phone === trimmed ||
      m.phone.replace(/^0/, '') === trimmed.replace(/^0/, '')
    );

    if (!member) {
      return { success: false, user: null, message: 'Namba ya usajili haipo kwenye mfumo wetu. Bonyeza "Usajili wa Wanachama" kujiunga.' };
    }

    if (member.status === 'pending') {
      return { 
        success: false, 
        user: null, 
        message: `Usajili wako haujathibitishwa bado na viongozi ("Registration pending"). Namba yako ya Usajili ni: ${member.regNumber}. Tafadhali subiri uthibitisho.`
      };
    }

    if (member.status === 'rejected') {
      return { success: false, user: null, message: 'Usajili wako ulikataliwa au kusitishwa. Tafadhali wasiliana na uongozi.' };
    }

    // Success login
    setCurrentSession({ user: member, isAdmin: member.role === 'admin' });
    setActiveTab('home');
    triggerSyncIndicator('Karibu tena, kitambulisho chako kimethibitishwa.');
    return { success: true, user: member, message: 'Umeingia kwa mafanikio!' };
  };


  // --- Admin Login ---
  const handleAdminLogin = (password: string) => {
    if (password === DEFAULT_ADMIN_PASSWORD || password === 'admin123') {
      // Login as Rashid Mahadhi (Admin) which is preset
      const adminMember = members.find(m => m.role === 'admin') || members[0];
      setCurrentSession({ user: adminMember, isAdmin: true });
      setActiveTab('home');
      triggerSyncIndicator('Umeingia kama Mkurugenzi (Admin)');
      return { success: true, message: 'Karibu Kiongozi! Mfumo unakupa mamlaka kamili ya uhariri.' };
    } else {
      return { success: false, message: 'Nenosiri sio sahihi. Tafadhali wasiliana na IT au jaribu tena.' };
    }
  };


  // --- Logout ---
  const handleLogout = () => {
    setCurrentSession(null);
    setActiveTab('home');
    triggerSyncIndicator('Umetoka kikamilifu.');
  };


  // --- Admin Approval Actions ---
  const handleApproveMember = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'approved' };
      }
      return m;
    }));
    triggerSyncIndicator('Uanachama umeidhinishwa kwa urahisi.');
  };

  const handleRejectMember = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'pending' }; // Revert to pending instead of hard deleting to allow toggle back
      }
      return m;
    }));
    triggerSyncIndicator('Uanachama umeondolewa/kurudishwa pending.');
  };


  // --- Announcement Actions ---
  const handleAddAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: 'ann-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    triggerSyncIndicator('Taarifa mpya imechapishwa.');
  };

  const handleEditAnnouncement = (id: string, updatedFields: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === id) {
        return { ...ann, ...updatedFields };
      }
      return ann;
    }));
    triggerSyncIndicator('Mabadiliko ya maelezo yamehifadhiwa.');
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    triggerSyncIndicator('Habari imefutwa kabisa.');
  };


  // --- Shares Actions ---
  const handleUpdateShares = (id: string, additionalAmount: number) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, shares: (m.shares || 0) + additionalAmount };
      }
      return m;
    }));
    triggerSyncIndicator('Kiwango cha hisa kimeongezwa.');
  };

  const handleSetShares = (id: string, amount: number) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, shares: amount };
      }
      return m;
    }));
    triggerSyncIndicator('Jumla ya hisa imesasishwa.');
  };

  const handleDeleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    if (!target) return;
    if (target.role === 'admin') {
      triggerSyncIndicator('Huwezi kumfuta Kiongozi Mkuu.');
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    if (impersonatedMemberId === id) {
      setImpersonatedMemberId(null);
    }
    triggerSyncIndicator(`Mwanachama "${target.name}" amefutwa kabisa.`);
  };


  // --- Transactions Actions ---
  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
      date: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTx, ...prev]);

    // OPTIONAL ADVANCED: If transaction is 'completed' and 'tuma' (deposit/send),
    // automatically add that amount to member shares! This keeps everything perfectly synced.
    if (newTx.status === 'completed' && newTx.type === 'tuma') {
      const matchMember = members.find(m => m.phone === newTx.memberPhone || m.id === newTx.memberId);
      if (matchMember) {
        handleUpdateShares(matchMember.id, newTx.amount);
      }
    }

    triggerSyncIndicator('Muamala wa fedha umerekodiwa kwenye ripoti.');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    triggerSyncIndicator('Rekodi ya muamala imefutwa.');
  };

  // Switch display component render
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Announcements
            announcements={announcements}
            isAdmin={effectiveIsAdmin}
            onAddAnnouncement={handleAddAnnouncement}
            onEditAnnouncement={handleEditAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        );
      case 'shares':
        return (
          <Shares
            members={members}
            isAdmin={effectiveIsAdmin}
            currentUser={effectiveUser}
            onUpdateShares={handleUpdateShares}
            onSetShares={handleSetShares}
            onImpersonate={(m) => {
              setImpersonatedMemberId(m.id);
              setActiveTab('shares');
            }}
            transactions={transactions}
            onDeleteMember={handleDeleteMember}
            onExitImpersonation={() => setImpersonatedMemberId(null)}
            isImpersonating={!!impersonatedMemberId}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            currentUser={effectiveUser}
            isAdmin={effectiveIsAdmin}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'approvals':
        return (
          <AdminApproval
            members={members}
            onApproveMember={handleApproveMember}
            onRejectMember={handleRejectMember}
          />
        );
      default:
        return null;
    }
  };

  // If NOT logged in, show HeaderAndWelcome flow wrapper
  if (!currentSession) {
    return (
      <HeaderAndWelcome
        logoUrl={logoUrl}
        setLogoUrl={setLogoUrl}
        members={members}
        onRegister={handleRegister}
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  // Otherwise, render full portal desktop sidebar dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans" id="app-portal">
      
      {/* SIDEBAR FOR DESKTOP & MOBILE WRAPPER */}
      <aside className="w-full md:w-80 bg-emerald-950 text-white flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-amber-500/20 shadow-xl z-20 flex-shrink-0">
        
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={logoUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-md"
              />
              <div>
                <h1 className="font-sans font-black text-sm lg:text-base tracking-wider text-amber-300">
                  RAWDHWA
                </h1>
                <p className="text-[10px] text-emerald-200/80 font-mono uppercase tracking-widest">Youth Association</p>
              </div>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-amber-300 p-1 rounded-lg hover:bg-white/10"
              id="mobile-hamburger"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* User Logged Details card in Sidebar */}
          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-800 flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-emerald-950 font-black flex items-center justify-center font-mono">
                {currentSession.user?.name.charAt(0).toUpperCase() || 'R'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-emerald-900 rounded-full"></span>
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-xs truncate block text-amber-100">{currentSession.user?.name}</span>
                {currentSession.isAdmin && (
                  <span className="px-1.5 py-0.2 bg-amber-450/20 text-amber-300 rounded text-[8px] uppercase tracking-widest font-extrabold flex-shrink-0 border border-amber-400/25">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-200 font-mono truncate block leading-none mt-1">{currentSession.user?.phone || 'Msimamizi'}</span>
            </div>
          </div>

          {/* Sidebar Nav Items (Swahili layout) */}
          <nav className={`md:flex flex-col space-y-1.5 ${mobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
              id="nav-home"
            >
              <BookOpen className="w-4 h-4" />
              <span>Nyumbani & Habari</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('shares');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase cursor-pointer ${
                activeTab === 'shares'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
              id="nav-shares"
            >
              <Coins className="w-4 h-4" />
              <span>Hisa za Wanachama</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('transactions');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
              id="nav-transactions"
            >
              <SmartphoneCharging className="w-4 h-4" />
              <span>Taarifa za Kifedha</span>
            </button>

            {/* Admin Approvals queue - visible only to Admin */}
            {currentSession.isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('approvals');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase relative cursor-pointer ${
                  activeTab === 'approvals'
                    ? 'bg-amber-400 text-emerald-950 font-bold shadow-md'
                    : 'text-amber-300 hover:bg-white/10 border border-amber-300/20'
                }`}
                id="nav-approvals"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Thibitisha Usajili</span>
                
                {/* Count badge of pending */}
                {members.filter(m => m.status === 'pending').length > 0 && (
                  <span className="absolute right-3 top-3.5 bg-red-500 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                    {members.filter(m => m.status === 'pending').length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Bottom controls: Logout / syncing indicator */}
        <div className={`md:flex flex-col space-y-4 pt-6 border-t border-emerald-800/60 mt-6 md:mt-0 ${
          mobileMenuOpen ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Status Synchronization pill */}
          <div className="flex items-center space-x-2 text-[10px] text-emerald-300 bg-emerald-900/45 px-3 py-1.5 rounded-lg border border-emerald-800/50">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            <span className="font-mono">{syncStatus}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white border border-red-500/20 text-xs font-bold uppercase transition cursor-pointer"
            id="logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ondoka (Log Out)</span>
          </button>
        </div>

      </aside>

      {/* EAST MAIN VIEW AREA - Fluid width sizing wrapper */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full overflow-hidden flex flex-col justify-between">
        
        {impersonatedMember && (
          <div className="bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/35 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500 text-slate-950 p-2 rounded-xl flex-shrink-0 animate-pulse">
                <Users className="w-5 h-5 font-bold" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">Mfumo Chini ya Ukaguzi</p>
                <p className="text-sm font-black text-slate-800">{impersonatedMember.name} <span className="font-mono text-xs font-normal text-amber-900 bg-amber-400/20 px-1.5 py-0.5 rounded ml-1">{impersonatedMember.regNumber}</span></p>
              </div>
            </div>
            <button
              onClick={() => setImpersonatedMemberId(null)}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 shadow cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 font-bold" />
              <span>◀ Rudi Kwenye Orodha Kuu</span>
            </button>
          </div>
        )}

        {/* Dynamic transition layout wrapper */}
        <div className="flex-grow">
          {renderTabContent()}
        </div>

        {/* Client Bottom indicator */}
        <footer className="text-center font-mono text-[10px] text-slate-400 border-t border-slate-100 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>Hati miliki © 2026 Rawdhwa Youth Association. Mfumo wa Kikundi wa Ndani.</span>
          <span className="text-emerald-700 font-semibold uppercase tracking-wider">Umoja ni Nguvu yetu</span>
        </footer>

      </main>

    </div>
  );
}
