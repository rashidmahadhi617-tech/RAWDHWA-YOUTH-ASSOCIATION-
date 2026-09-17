import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Coins, Award, Users, PlusCircle, CheckCircle, Smartphone, Edit, ArrowUpRight, ArrowDownLeft, Ticket, Trash2, ArrowLeft } from 'lucide-react';
import { Member, Transaction } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SharesProps {
  members: Member[];
  isAdmin: boolean;
  onUpdateShares: (memberId: string, additionalAmount: number) => void;
  onSetShares: (memberId: string, amount: number) => void;
  currentUser?: Member | null;
  onImpersonate?: (member: Member) => void;
  transactions?: Transaction[];
  onDeleteMember?: (memberId: string) => void;
  onExitImpersonation?: () => void;
  isImpersonating?: boolean;
}

export default function Shares({ 
  members, 
  isAdmin, 
  onUpdateShares, 
  onSetShares,
  currentUser,
  onImpersonate,
  transactions,
  onDeleteMember,
  onExitImpersonation,
  isImpersonating = false
}: SharesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [shareValue, setShareValue] = useState('');
  const [updateType, setUpdateType] = useState<'add' | 'set'>('add');

  // Filter approved members
  const approvedMembers = members.filter((m) => m.status === 'approved' && m.role !== 'admin');
  
  // Overall sum of all approved members shares
  const totalShares = approvedMembers.reduce((sum, m) => sum + (m.shares || 0), 0);

  const formatTsh = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' TZS';
  };

  // 1. MEMBER PERSONAL VIEW MODE (IF NOT ADMIN)
  if (!isAdmin && currentUser) {
    const personalMember = members.find(m => m.id === currentUser.id) || currentUser;
    const sharePercentage = totalShares > 0 ? ((personalMember.shares / totalShares) * 100).toFixed(1) : '0.0';
    const targetGoal = 1000000; // 1,000,000 TZS target limit
    const progressPercent = Math.min(100, (personalMember.shares / targetGoal) * 100);

    const personalTransactions = (transactions || []).filter(
      (t) => t.memberId === personalMember.id
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-6" id="personal-shares-view">
        {/* If Admin is impersonating this user, let's have a beautiful Back button right here at the top of the card! */}
        {isImpersonating && onExitImpersonation && (
          <div className="flex justify-start">
            <button
              onClick={onExitImpersonation}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-800" />
              <span>◀ Rudi Nyuma Kwenye Orodha ya Wanachama</span>
            </button>
          </div>
        )}

        {/* Header decoration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Usimamizi wa Hisa Zako ({personalMember.name})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Angalia mchango wako wa hisa, asilimia ya umiliki wako katika mfuko mkuu wa kikundi cha Rawdhwa.
              </p>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl text-emerald-800 text-xs font-semibold border border-emerald-100">
              Uanachama: Approved (Mwanachama Hai)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Personal Share Accumulation */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 border border-amber-500/10 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[180px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Namba ya Usajili: {personalMember.regNumber}</span>
              <h3 className="text-sm font-semibold text-emerald-200 mt-3">Hisa Zako Zilizolimbikizwa</h3>
              <p className="text-3xl font-mono font-extrabold text-white tracking-tight mt-2">{formatTsh(personalMember.shares)}</p>
            </div>
            <div className="border-t border-emerald-800/40 pt-3 mt-4 text-xs text-emerald-300 font-mono flex justify-between">
              <span>Siku ya Usajili: {new Date(personalMember.joinedAt || Date.now()).toLocaleDateString('sw-TZ')}</span>
              <span>Hisa Moja: 10,000 TZS</span>
            </div>
          </div>

          {/* Card: Portfolio Percentage */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Asilimia ya Miliki Yako</h3>
                <h4 className="text-sm font-bold text-slate-800 mt-1">Mchango Wako Katika Association</h4>
              </div>
              <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-800">
                <Award className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>Mchango Wako: {formatTsh(personalMember.shares)}</span>
                <span>Jumla ya Mfuko: {formatTsh(totalShares)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-grow bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${sharePercentage}%` }}
                  ></div>
                </div>
                <span className="font-mono font-black text-slate-800 text-sm">{sharePercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress towards Goal */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Maendeleo ya Lengo la Hisa la Awamu ya Kwanza</span>
            </h3>
            <p className="text-xs text-slate-500">
              Lengo lililowekwa kwa kila kijana mwanachama ni kufikia au kupita thamani ya hisa 105 zenye jumla ya <span className="font-bold text-slate-800">Tsh 1,000,000</span> katika ununuzi wa kiwanja cha kikundi.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Malengo: {progressPercent.toFixed(1)}% Imekamilika</span>
              <span className="text-slate-800 font-bold">{formatTsh(personalMember.shares)} / {formatTsh(targetGoal)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium block">
              {personalMember.shares >= targetGoal
                ? "🎉 Hongera sana! Umefikia lengo la juu la hisa kwa awamu hii thabiti." 
                : `Bado unahitaji kuongeza ${formatTsh(targetGoal - personalMember.shares)} ili kufikia lengo kamili la awamu hii.`}
            </p>
          </div>
        </div>

        {/* Recent Miamala ya Hivi Karibuni Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-amber-500" />
              <span>Miamala yako ya Hivi Karibuni</span>
            </h3>
            <span className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-mono border border-slate-200">
              Jumla: {personalTransactions.length}
            </span>
          </div>

          {personalTransactions.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-50/50 border border-slate-100">
              <p className="text-xs text-slate-500">Hujafanya muamala wowote bado kwenye mfumo wetu.</p>
              <p className="text-[10px] text-slate-400 mt-1">Sajili miamala uliyofanya kwenye tab ya "Miamala" ili rekodi zako zijitokeze hapa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 text-[10px] uppercase">
                    <th className="py-3 px-4">Tarehe</th>
                    <th className="py-3 px-4">Kumbukumbu ID</th>
                    <th className="py-3 px-4">Njia ya Mtandao</th>
                    <th className="py-3 px-4">Aina</th>
                    <th className="py-3 px-4 text-right">Kiwango (Tsh)</th>
                    <th className="py-3 px-4 text-center">Hali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personalTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/30 transition text-slate-700">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(tx.date).toLocaleDateString('sw-TZ', { dateStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {tx.referenceId}
                      </td>
                      <td className="py-3 px-4 font-mono select-none">
                        <span className="text-slate-600 font-medium text-[11px]">{tx.provider}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          tx.type === 'tuma' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-800 border border-rose-100'
                        }`}>
                          {tx.type === 'tuma' ? (
                            <>
                              <ArrowUpRight className="w-2.5 h-2.5 text-emerald-700 font-bold" />
                              <span>Tuma (IN)</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-2.5 h-2.5 text-rose-600 font-bold" />
                              <span>Pokea (OUT)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                        tx.type === 'tuma' ? 'text-emerald-700' : 'text-slate-800'
                      }`}>
                        {formatTsh(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-950 font-bold'
                            : 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                        }`}>
                          {tx.status === 'completed' ? 'Kamilika' : 'Haikikiwa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Search filter
  const filteredMembers = approvedMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  const handleOpenUpdate = (member: Member) => {
    setSelectedMember(member);
    setShareValue('');
    setUpdateType('add');
    setShowUpdateModal(true);
  };

  const handleApplyUpdate = () => {
    if (!selectedMember || !shareValue || isNaN(Number(shareValue)) || Number(shareValue) < 0) {
      alert('Tafadhali weka kiwango sahihi cha fedha cha hisa.');
      return;
    }

    const value = Math.floor(Number(shareValue));
    if (updateType === 'add') {
      onUpdateShares(selectedMember.id, value);
    } else {
      onSetShares(selectedMember.id, value);
    }
    setShowUpdateModal(false);
    setSelectedMember(null);
  };

  return (
    <div className="space-y-6" id="shares-section">
      {/* Dynamic Member Share Summary Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Accumulation Card */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 border border-amber-500/10 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-300">Jumla ya Hisa Zote</h3>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
            {formatTsh(totalShares)}
          </p>
          <div className="text-[11px] text-emerald-200 mt-2 font-mono flex items-center space-x-1">
            <span>Uwekezaji thabiti wa kikundi cha Rawdhwa</span>
          </div>
        </div>

        {/* Member Count Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Wanachama Wenye Hisa</h3>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl md:text-3xl font-mono font-bold text-slate-800">
            {approvedMembers.length}
          </p>
          <div className="text-xs text-slate-400 mt-2">
            Idadi ya wanachama walioidhinishwa rasmi
          </div>
        </div>

        {/* Average Share Value Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Kiwango cha Wastani</h3>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl md:text-3xl font-mono font-bold text-slate-800">
            {formatTsh(approvedMembers.length > 0 ? Math.round(totalShares / approvedMembers.length) : 0)}
          </p>
          <div className="text-xs text-slate-400 mt-2">
            Wastani wa thamani ya hisa kwa kila mwanachama
          </div>
        </div>

      </div>

      {/* Visual Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Mchanganuo wa Hisa kwa Mchoro (Share Distribution Visual)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Mchoro unaonyesha mchango thabiti wa kila mwanachama alioidhinishwa katika harakati za maendeleo ya chama.
          </p>
        </div>
        
        <div className="h-72 w-full pt-2">
          {approvedMembers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Hakuna wanachama walioidhinishwa kwa sasa ili kuonyesha mchango wa hisa.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={approvedMembers.map(m => ({
                  name: m.name.split(' ')[0] + ' ' + (m.name.split(' ')[1] ? m.name.split(' ')[1].charAt(0) + '.' : ''),
                  fullName: m.name,
                  shares: m.shares
                }))}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000}k`}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                  formatter={(value: any) => [formatTsh(Number(value)), 'Hisa']}
                  contentStyle={{ 
                    backgroundColor: '#022c22', 
                    color: '#fff', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    borderColor: '#f59e0b'
                  }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar 
                  dataKey="shares" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={45}
                >
                  {approvedMembers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#047857' : '#d97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SEARCH AND INDIVIDUAL SELECTION SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Hisa za Mtu Mmoja Mmoja</h3>
            <p className="text-xs text-slate-400">
              Chuja hapa chini kwa jina au namba ya simu ili kuangalia mchanganuo wa mtu binafsi.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tafuta mwanachama..."
              className="w-full text-slate-800 text-xs border border-slate-300 rounded-xl py-2.5 pl-9 pr-4 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* DATA TABLE - Swahili UI for Members shares with elegant indicators */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-650 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Picha / Jina la Mwanachama</th>
                <th className="py-3 px-4">Namba ya Simu</th>
                <th className="py-3 px-4 text-right">Kiwango cha Hisa (TZS)</th>
                <th className="py-3 px-4 text-right">Asilimia (%) ya Mfuko</th>
                {isAdmin && <th className="py-3 px-4 text-center">Marekebisho (Actions)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-slate-400 font-mono">
                    Hakuna mwanachama aliyepatikana kwa jina hilo.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const sharePercentage = totalShares > 0 ? ((member.shares / totalShares) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold font-sans border border-emerald-100">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block text-sm">{member.name}</span>
                          <div className="flex items-center space-x-1.5 text-[10px] text-amber-800 font-mono mt-0.5">
                            <span className="bg-amber-100 border border-amber-200/50 px-1.5 py-0.2 rounded font-extrabold">{member.regNumber || 'RYA-NO'}</span>
                            <span className="text-slate-350">|</span>
                            <span className="text-slate-400">Siku: {new Date(member.joinedAt).toLocaleDateString('sw-TZ')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-700 text-sm">
                        {formatTsh(member.shares)}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-500">
                        <div className="inline-flex items-center space-x-1 font-mono">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden md:block">
                            <div 
                              className="bg-amber-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, Number(sharePercentage))}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700">{sharePercentage}%</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenUpdate(member)}
                              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                              title="Badilisha au ongeza hisa"
                            >
                              <Edit className="w-3 h-3 text-amber-600" />
                              <span>Hisa</span>
                            </button>
                            {onImpersonate && (
                              <button
                                onClick={() => onImpersonate(member)}
                                className="bg-emerald-50 hover:bg-emerald-200 border border-emerald-200 text-emerald-800 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                title="Ingia kama mwanachama huyu kuona faili lake"
                              >
                                <Users className="w-3 h-3 text-emerald-600" />
                                <span>Kagua</span>
                              </button>
                            )}
                            {onDeleteMember && (
                              <button
                                onClick={() => {
                                  setMemberToDelete(member);
                                  setShowDeleteConfirm(true);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                title="Futa mwanachama huyu kabisa"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>Futa</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHARE UPDATE MODAL FOR ADMIN */}
      <AnimatePresence>
        {showUpdateModal && selectedMember && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm" id="share-update-modal">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl"
            >
              <div className="flex items-center space-x-2 text-amber-600 mb-3">
                <Coins className="w-5 h-5" />
                <h3 className="text-md font-bold uppercase tracking-wider">Rekebisha Hisa za Mwanachama</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 text-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-extrabold">Mwanachama</p>
                <p className="font-bold text-sm text-slate-800">{selectedMember.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] font-mono text-slate-500">{selectedMember.phone}</span>
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold font-mono">
                    Hisa sasa: {formatTsh(selectedMember.shares)}
                  </span>
                </div>
              </div>

              {/* Action type: Add or Replace */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUpdateType('add')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer transition ${
                    updateType === 'add'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Ongeza kiasi (Add Share)
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateType('set')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer transition ${
                    updateType === 'set'
                      ? 'bg-indigo-600 border-indigo-650 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Badilisha Jumla yote
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {updateType === 'add' ? 'Kiasi cha Kuongeza (Tsh)' : 'Kuweka Kiasi Kipya cha Jumla (Tsh)'}
                  </label>
                  <input
                    type="number"
                    value={shareValue}
                    onChange={(e) => setShareValue(e.target.value)}
                    placeholder="Mfano: 50000"
                    className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2 justify-end">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedMember(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Ghairi
                  </button>
                  <button
                    onClick={handleApplyUpdate}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow cursor-pointer"
                    id="submit-share-update-btn"
                  >
                    Hifadhi Taarifa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && memberToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm shadow-2xl" id="delete-confirm-modal">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl relative"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-650 rounded-full flex items-center justify-center mx-auto text-3xl font-bold border border-rose-100 shadow-inner">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Uhakiki wa Kufuta</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Unakaribia kumfuta mwanachama <span className="font-extrabold text-slate-800">"{memberToDelete.name}"</span> ({memberToDelete.regNumber || 'RYA-NO'}) kabisa kutoka kwenye mfumo wetu.
                  </p>
                  <p className="text-[10px] text-rose-600 mt-2 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200/50">
                    Kumbuka: Tendo hili litafuta hisa na rekodi zote za mwanachama huyu, na halina nafasi ya kurudishwa tena!
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setMemberToDelete(null);
                    }}
                    className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
                  >
                    Ghairi
                  </button>
                  <button
                    onClick={() => {
                      if (onDeleteMember) {
                        onDeleteMember(memberToDelete.id);
                      }
                      setShowDeleteConfirm(false);
                      setMemberToDelete(null);
                    }}
                    className="flex-grow bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-rose-900/10 transition active:scale-95 cursor-pointer"
                  >
                    Ndio, Mfute
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
