import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Users, ShieldAlert, Smartphone, Clock, Trash } from 'lucide-react';
import { Member } from '../types';

interface AdminApprovalProps {
  members: Member[];
  onApproveMember: (id: string) => void;
  onRejectMember: (id: string) => void;
}

export default function AdminApproval({ members, onApproveMember, onRejectMember }: AdminApprovalProps) {
  // Find pending members
  const pendingMembers = members.filter((m) => m.status === 'pending');
  // Find approved members (excluding the admin)
  const approvedMembers = members.filter((m) => m.status === 'approved' && m.role !== 'admin');

  return (
    <div className="space-y-6" id="admin-approvals-section">
      
      {/* Pending Approvals Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
              <span>Maombi ya Usajili Yanayosubiri ({pendingMembers.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hapa ndipo viongozi wanaidhinisha wanachama wapya ili waweze kuingia kwenye portal na kuona hisa zao.
            </p>
          </div>
          <div className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold font-mono">
            Pending Log
          </div>
        </div>

        {pendingMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center space-y-2">
            <Users className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-mono">Hakuna maombi mapya yanayosubiri kuidhinishwa kwa sasa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMembers.map((member) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={member.id}
                className="p-5 border border-amber-200 bg-amber-50/20 rounded-xl flex flex-col justify-between hover:bg-amber-50/40 transition gap-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{member.name}</h4>
                    <span className="text-xs text-slate-400 block font-mono">Simu: {member.phone}</span>
                    <span className="text-[10px] text-amber-700 font-mono mt-1 block flex items-center space-x-0.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Ombi: {new Date(member.joinedAt).toLocaleString('sw-TZ')}</span>
                    </span>
                  </div>

                  <span className="text-[9px] bg-amber-100/80 border border-amber-200 text-amber-850 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Pending
                  </span>
                </div>

                {/* Approve/Reject Controls */}
                <div className="flex space-x-2 border-t border-amber-200/40 pt-3 mt-1">
                  <button
                    onClick={() => onApproveMember(member.id)}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Idhinisha (Approve)</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Je, hakika unataka kukataa ombi la ${member.name}?`)) {
                        onRejectMember(member.id);
                      }
                    }}
                    className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 hover:text-rose-800 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Kataa</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Already Approved Members Suspended/Removal State Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-50 pb-4">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Wanachama Walioidhinishwa ({approvedMembers.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {approvedMembers.map((m) => (
            <div
              key={m.id}
              className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-800">{m.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{m.phone}</p>
                <p className="text-[9px] font-bold text-emerald-700 block font-mono mt-1">Hisa: {new Intl.NumberFormat('en-US').format(m.shares)} TZS</p>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Je, unataka kurudisha ${m.name} kwenye hali ya KUSUBIRI (Pending) au kumtoa?`)) {
                    onRejectMember(m.id);
                  }
                }}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer"
                title="Rudisha kwenye pending au kufuta usajili"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
