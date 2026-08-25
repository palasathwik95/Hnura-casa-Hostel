import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, ShieldCheck, Clock, User, Filter, Sparkles } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.admin_user.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6C4CFF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              SECURITY, COMPLIANCE & GOVERNANCE
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono font-bold">• Event Ledger</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Immutable System Audit Trail
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Chronological, non-repudiable logs of all mutations, payments, transfers and status changes.
          </p>
        </div>

        <div className="flex items-center space-x-2 z-10">
          <span className="px-4 py-2 rounded-xl bg-[#0B0B0C] text-[#0CC6FF] border border-white/[0.08] text-xs font-mono font-bold">
            {auditLogs.length} Events Logged
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action, resident name, entity ID, or admin user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#6C4CFF] transition-colors"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-[#141414] rounded-2xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
        <div className="relative pl-6 border-l border-white/[0.08] space-y-5">
          {filteredLogs.map(log => (
            <div key={log.id} className="relative group">
              <span className="absolute -left-[31px] top-2 w-2.5 h-2.5 rounded-full bg-[#FF1E9A] shadow-[0_0_10px_#FF1E9A] border-2 border-[#141414] group-hover:scale-125 transition-transform" />
              <div className="bg-[#0B0B0C] p-4 rounded-xl border border-white/[0.06] text-xs space-y-2 hover:border-white/20 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#141414] text-[#0CC6FF] border border-white/[0.08] font-mono font-bold text-[9px]">
                      {log.action}
                    </span>
                    <span className="text-[#8E8E9F] font-mono">[{log.entity_type}]</span>
                  </div>
                  <span className="text-[10px] text-[#8E8E9F] font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-[#8E8E9F]" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-[#E4E4E7] text-xs font-normal leading-relaxed">{log.details}</p>

                <div className="pt-2 flex flex-wrap items-center justify-between text-[10px] text-[#8E8E9F] font-mono border-t border-white/[0.06] gap-2">
                  <span>Initiated by: <strong className="text-white">{log.admin_user}</strong></span>
                  <span>Log ID: {log.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
