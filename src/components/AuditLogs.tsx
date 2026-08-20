import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, ShieldCheck, Clock, User, Filter } from 'lucide-react';

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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Security & Compliance
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Event Ledger</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Immutable System Audit Trail
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Chronological, non-repudiable logs of all mutations, payments, transfers and status changes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#15151A] text-[#D4AF37] border border-[#23232A] text-xs font-mono">
            {auditLogs.length} Events Recorded
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action, resident name, entity ID, or admin user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] p-6 space-y-4">
        <div className="relative pl-6 border-l border-[#23232A] space-y-5">
          {filteredLogs.map(log => (
            <div key={log.id} className="relative group">
              <span className="absolute -left-[31px] top-2 w-2.5 h-2.5 rounded-full bg-[#D4AF37] border-2 border-[#0F0F12] group-hover:scale-125 transition-transform" />
              <div className="bg-[#15151A] p-4 rounded-xl border border-[#23232A] text-xs space-y-2 hover:border-[#2A2A32] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#0F0F12] text-[#D4AF37] border border-[#23232A] font-mono text-[9px]">
                      {log.action}
                    </span>
                    <span className="text-[#6B6B76] font-mono">[{log.entity_type}]</span>
                  </div>
                  <span className="text-[10px] text-[#6B6B76] font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-[#6B6B76]" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-[#D1D1D1] text-xs font-normal">{log.details}</p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-[#6B6B76] font-mono border-t border-[#1F1F23]">
                  <span>Initiated by: {log.admin_user}</span>
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
