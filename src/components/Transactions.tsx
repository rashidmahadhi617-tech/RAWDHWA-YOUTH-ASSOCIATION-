import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Plus, Smartphone, FileSpreadsheet, FileText, CheckCircle, 
  ArrowUpRight, ArrowDownLeft, SlidersHorizontal, Trash2, Printer, Award, Ticket 
} from 'lucide-react';
import { Transaction, Member } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  currentUser: Member | null;
  isAdmin: boolean;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function Transactions({
  transactions,
  currentUser,
  isAdmin,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'tuma' | 'pokea'>('tuma');
  const [provider, setProvider] = useState<Transaction['provider']>('M-Pesa (Vodacom)');
  const [referenceId, setReferenceId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'completed' | 'pending'>('completed');

  // Filters
  const [filterType, setFilterType] = useState<'zote' | 'tuma' | 'pokea'>('zote');
  const [filterProvider, setFilterProvider] = useState<string>('zote');

  const providers: Transaction['provider'][] = [
    'M-Pesa (Vodacom)',
    'Airtel Money',
    'Tigo Pesa',
    'Halopesa',
    'Zantel Ezy Pesa',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Tafadhali weka kiasi sahihi cha fedha.');
      return;
    }
    if (!referenceId.trim()) {
      alert('Tafadhali weka Namba ya Muamala (Reference ID).');
      return;
    }

    // Determine who is performing this
    const memberName = currentUser ? currentUser.name : 'Mwanachama Mgeni';
    const memberPhone = currentUser ? currentUser.phone : '0000000000';
    const memberId = currentUser ? currentUser.id : 'm-guest';

    onAddTransaction({
      memberId,
      memberName,
      memberPhone,
      amount: Math.floor(Number(amount)),
      type,
      provider,
      referenceId: referenceId.trim().toUpperCase(),
      status: transactionStatus,
    });

    setAmount('');
    setReferenceId('');
    setShowAddForm(false);
  };

  // Filter computation
  const filteredTransactions = transactions.filter((tx) => {
    // If not Admin, standard members only see their own transactions
    if (!isAdmin && currentUser && tx.memberId !== currentUser.id) {
      return false;
    }

    const matchType = filterType === 'zote' || tx.type === filterType;
    const matchProvider = filterProvider === 'zote' || tx.provider === filterProvider;

    return matchType && matchProvider;
  });

  const getProviderColor = (prov: Transaction['provider']) => {
    switch (prov) {
      case 'M-Pesa (Vodacom)':
        return 'text-red-650 bg-red-50 border-red-200';
      case 'Airtel Money':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Tigo Pesa':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Halopesa':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Zantel Ezy Pesa':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getProviderLogoSymbol = (prov: Transaction['provider']) => {
    switch (prov) {
      case 'M-Pesa (Vodacom)':
        return 'M';
      case 'Airtel Money':
        return 'A';
      case 'Tigo Pesa':
        return 'T';
      case 'Halopesa':
        return 'H';
      case 'Zantel Ezy Pesa':
        return 'Z';
      default:
        return 'P';
    }
  };

  const formatTsh = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' TZS';
  };

  // Cumulative analytics of the filtered list
  const totalSent = filteredTransactions.filter(t => t.type === 'tuma').reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = filteredTransactions.filter(t => t.type === 'pokea').reduce((sum, t) => sum + t.amount, 0);

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="transactions-section">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Money Sent/Deposited card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Jumla ya Kutuma (Deposits)</span>
            <span className="text-xl md:text-2xl font-mono font-bold text-slate-800 block">
              {formatTsh(totalSent)}
            </span>
            <span className="text-xs text-emerald-650 font-medium">Mitandao ya Tanzania</span>
          </div>
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Money Received/Withdrawn card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Jumla ya Kupokea (Withdrawals)</span>
            <span className="text-xl md:text-2xl font-mono font-bold text-slate-800 block">
              {formatTsh(totalReceived)}
            </span>
            <span className="text-xs text-rose-600 font-medium">Ulipaji na matumizi mengine</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-700">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Net Flow / Balance Card */}
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Salio la Mzunguko (Net Balance)</span>
            <span className="text-xl md:text-2xl font-mono font-bold text-amber-300 block">
              {formatTsh(totalSent - totalReceived)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Ripoti yako binafsi</span>
          </div>
          <div className="p-3 bg-slate-700 rounded-2xl text-amber-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* FILTER CONTROLS AND DOCUMENT DOWNLOADING */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type selector */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-650 outline-none"
            >
              <option value="zote">Miamala Zote (All Types)</option>
              <option value="tuma">Imetumwa Pekee (Send)</option>
              <option value="pokea">Imepokelewa Pekee (Receive)</option>
            </select>

            {/* Provider selector */}
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-650 outline-none"
            >
              <option value="zote">Mitandao Yote (All Networks)</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow transition cursor-pointer"
              id="new-transaction-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Rekodi Muamala Mpya</span>
            </button>

            <button
              onClick={() => setShowPrintPreview(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow transition cursor-pointer"
              id="download-invoice-btn"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Pakua/Print Ripoti</span>
            </button>
          </div>
        </div>

        {/* TRANS TRANSACTION RECORDING EXPANDABLE FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 gap-4 grid grid-cols-1 md:grid-cols-12 text-slate-700">
                <div className="md:col-span-12 border-b border-slate-200 pb-2 mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-850">Fomu ya Kujaza Muamala wa Tanzania</h4>
                  <p className="text-[11px] text-slate-500">Miamala yote itahudumiwa kwa uhakika na kuonekana kwenye ripoti ya kikundi.</p>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Kiasi cha Fedha (Tsh)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Mfano: 50000"
                    className="w-full text-slate-800 text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Aina ya Muamala</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-slate-800 text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-emerald-600"
                  >
                    <option value="tuma">Nimetuma / Nimeweka (Deposit)</option>
                    <option value="pokea">Nimepokea / Nimekopa (Withdraw)</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mtandao wa Simu wenye Huduma</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full text-slate-800 text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-emerald-600"
                  >
                    {providers.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Namba ya Muamala / Reference ID</label>
                  <input
                    type="text"
                    required
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="Mfano: MP87DFG821 au TG88JHG111"
                    className="w-full text-slate-800 text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none focus:border-emerald-605"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hali ya Muamala (Status)</label>
                  <select
                    value={transactionStatus}
                    onChange={(e) => setTransactionStatus(e.target.value as any)}
                    disabled={!isAdmin}
                    className="w-full text-slate-800 text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none disabled:bg-slate-100"
                  >
                    <option value="completed">Kamilika (Completed)</option>
                    <option value="pending">Inasubiri (Pending Admin review)</option>
                  </select>
                </div>

                <div className="md:col-span-12 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-medium bg-slate-200 text-slate-600 rounded-lg"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow cursor-pointer"
                  >
                    Hifadhi Muamala
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRANSACTIONS DATA TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-650 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Muuzaji/Mwanachama</th>
                <th className="py-3 px-4">Aina</th>
                <th className="py-3 px-4">Mtandao</th>
                <th className="py-3 px-4">Kumbukumbu / ID</th>
                <th className="py-3 px-4 text-right">Kiwango (TZS)</th>
                <th className="py-3 px-4 text-center">Hali</th>
                {isAdmin && <th className="py-3 px-4 text-center">Kitendo (Action)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-450 font-mono">
                    Hakuna miamala yoyote iliyosajiliwa kulingana na vichujio vyako.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block">{tx.memberName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{tx.memberPhone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${
                        tx.type === 'tuma'
                          ? 'bg-emerald-55 text-emerald-800 border-emerald-100'
                          : 'bg-rose-50 text-rose-800 border-rose-100'
                      }`}>
                        {tx.type === 'tuma' ? (
                          <>
                            <ArrowUpRight className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Tuma</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-2.5 h-2.5 text-rose-600" />
                            <span>Pokea</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono select-none">
                      <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${getProviderColor(tx.provider)}`}>
                        <span className="w-4 h-4 bg-white/40 text-center rounded-full text-[9px] flex items-center justify-center font-black">
                          {getProviderLogoSymbol(tx.provider)}
                        </span>
                        <span>{tx.provider}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Ticket className="w-3.5 h-3.5 text-slate-300" />
                        <span>{tx.referenceId}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                      tx.type === 'tuma' ? 'text-emerald-700' : 'text-slate-800'
                    }`}>
                      {formatTsh(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        tx.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-950 font-bold'
                          : 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                      }`}>
                        {tx.status === 'completed' ? 'Kamilika' : 'Pending review'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Je, unataka kufuta rekodi hii ya kifedha?')) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="hover:bg-rose-50 text-rose-600 p-1.5 rounded-lg border border-transparent hover:border-slate-100 transition cursor-pointer"
                          title="Futa muamala"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC ELEST PRINT / DOWNLOAD REPORT PREVIEW MODAL */}
      <AnimatePresence>
        {showPrintPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden" id="report-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col justify-between border border-slate-100"
            >
              {/* Modal controls in app */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold uppercase tracking-wider">Hakiki Ripoti ya Kifedha ya Rawdhwa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={triggerPrint}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Hifadhi kama PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPrintPreview(false)}
                    className="text-slate-400 hover:text-white px-2 py-1 text-xs underline"
                  >
                    Funga Ukurasa
                  </button>
                </div>
              </div>

              {/* Printable Area - Perfectly formatted paper invoice / statement */}
              <div className="flex-grow overflow-y-auto p-8 bg-white text-slate-800 print:p-0 font-sans" id="printable-statement">
                {/* Visual Header */}
                <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-xl bg-emerald-950 flex items-center justify-center font-bold text-amber-400 text-2xl border-2 border-amber-300">
                      R
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-wider text-slate-905">RAWDHWA YOUTH ASSOCIATION</h1>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Ripoti ya Mzunguko ya Kifedha ya Kikundi</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Simu: +255 712 345 678 | Dar es Salaam, Tanzania</p>
                    </div>
                  </div>

                  <div className="text-center md:text-right">
                    <span className="text-xs bg-emerald-50 text-emerald-900 font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">Ripoti Rasmi</span>
                    <p className="text-xs text-slate-400 font-mono mt-2">Tarehe ya Ripoti: {new Date().toLocaleDateString('sw-TZ', { dateStyle: 'long' })}</p>
                    <p className="text-[10.5px] text-slate-400 font-mono">Mwanachama: {isAdmin ? 'Msimamizi wa Mfumo wote' : currentUser?.name}</p>
                  </div>
                </div>

                {/* Grid Analytics on statement */}
                <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50 mb-6 font-mono text-center">
                  <div className="border-r border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Mchango Uliowekwa</span>
                    <p className="text-sm font-bold text-emerald-800 mt-1">{formatTsh(totalSent)}</p>
                  </div>
                  <div className="border-r border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Mikopo/Kupokelewa</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">{formatTsh(totalReceived)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black">Net Salio la Mwanachama</span>
                    <p className="text-sm font-bold text-amber-600 mt-1">{formatTsh(totalSent - totalReceived)}</p>
                  </div>
                </div>

                {/* Table Data list of print */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1.5">Mchanganuo wa Vitendo Zote vya Kifedha</h3>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-900 font-bold bg-slate-100 text-slate-700">
                        <th className="py-2 px-2">Kumbukumbu ID</th>
                        <th className="py-2 px-2">Member / Simu</th>
                        <th className="py-2 px-2">Njia ya Mtandao</th>
                        <th className="py-2 px-2">Aina</th>
                        <th className="py-2 px-2 text-right">Kiwango cha Fedha (Tsh)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2 px-2 font-mono font-bold text-slate-900">{tx.referenceId}</td>
                          <td className="py-2 px-2">
                            <span>{tx.memberName}</span>
                            <span className="text-[9px] text-slate-450 block font-mono">{tx.memberPhone}</span>
                          </td>
                          <td className="py-2 px-2 font-mono uppercase text-[9px] text-slate-500">{tx.provider}</td>
                          <td className="py-2 px-2">
                            <span className="font-extrabold text-[10px] uppercase">
                              {tx.type === 'tuma' ? 'Amana (IN)' : 'Malipo (OUT)'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold">{formatTsh(tx.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Document stamp and footers on Statement paper */}
                <div className="mt-12 pt-8 border-t border-dashed border-slate-300 flex items-center justify-between">
                  <div className="text-center md:text-left space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kimeidhinishwa Na</p>
                    <div className="h-10 w-24 border-b border-emerald-950 flex items-end justify-center">
                      <span className="font-serif italic text-xs text-slate-500 font-medium">Rashid Mahadhi</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-400 mt-1">Mkurugenzi wa RAWDHWA</p>
                  </div>

                  <div className="text-center md:text-right hidden sm:block">
                    <div className="w-16 h-16 rounded-full border-4 border-double border-emerald-950/20 text-emerald-950/25 flex items-center justify-center text-[10px] font-bold rotate-12 uppercase select-none p-2 text-center">
                      Rawdhwa Approved
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom footer bar of modal */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer"
                >
                  Funga Hakiki (Close Preview)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
