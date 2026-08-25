import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Resident, ResidentDocument } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  User,
  Clock,
  Filter,
  Check,
  AlertCircle,
  Sparkles,
  Upload
} from 'lucide-react';

export const DigitalKYC: React.FC = () => {
  const {
    residents,
    residentDocuments,
    verifyKYC,
    setSelectedResidentId,
    setActiveTab,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_STARTED'>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<ResidentDocument | null>(null);

  const activeResidents = residents.filter(r => r.status === 'ACTIVE');

  // Metrics
  const verifiedCount = activeResidents.filter(r => r.kyc_status === 'VERIFIED').length;
  const pendingCount = activeResidents.filter(r => r.kyc_status === 'PENDING' || r.kyc_status === 'SUBMITTED').length;
  const notStartedCount = activeResidents.filter(r => r.kyc_status === 'NOT_STARTED').length;
  const verifiedPercent = Math.round((verifiedCount / (activeResidents.length || 1)) * 100) || 0;

  const filteredResidents = useMemo(() => {
    return activeResidents.filter(r => {
      if (statusFilter !== 'ALL' && r.kyc_status !== statusFilter) return false;
      const q = searchTerm.toLowerCase();
      return (
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.current_room_number && r.current_room_number.includes(q))
      );
    });
  }, [activeResidents, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0CC6FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              GOVERNMENT COMPLIANCE & FRAUD PREVENTION
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono font-bold">• KYC Validation</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Digital KYC & Identity Verification
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Government ID validation (Aadhaar / PAN / College ID), secure audits, and admin authorizations.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-[#0B0B0C] px-5 py-3 rounded-2xl border border-white/[0.08] z-10">
          <div className="text-right">
            <p className="text-[10px] text-[#8E8E9F] font-mono uppercase font-bold">Verification Health</p>
            <p className="text-lg font-mono font-bold text-emerald-400">{verifiedPercent}% Verified</p>
          </div>
          <div className="w-11 h-11 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
            {verifiedPercent}%
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Fully Verified</span>
          <p className="text-3xl font-mono font-bold text-white mt-2">{verifiedCount}</p>
          <p className="text-xs text-[#8E8E9F] mt-1">Active residents compliant</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#FF6F3C] font-mono font-bold uppercase tracking-wider">Review Required</span>
          <p className="text-3xl font-mono font-bold text-[#FF6F3C] mt-2">{pendingCount}</p>
          <p className="text-xs text-[#8E8E9F] mt-1">Pending admin authentication</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-rose-400 font-mono font-bold uppercase tracking-wider">Not Started</span>
          <p className="text-3xl font-mono font-bold text-white mt-2">{notStartedCount}</p>
          <p className="text-xs text-[#8E8E9F] mt-1">Direct reminder required</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search KYC by resident name, ID, or room..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#0CC6FF] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PENDING', 'VERIFIED', 'NOT_STARTED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-md'
                  : 'bg-[#0B0B0C] text-[#8E8E9F] hover:text-white border border-white/[0.05]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Residents KYC Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map(r => {
          const docs = residentDocuments.filter(d => d.resident_id === r.id);

          return (
            <div
              key={r.id}
              className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                      alt={r.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{r.name}</h4>
                      <p className="text-[10px] text-[#8E8E9F] font-mono">
                        {r.id} • Rm {r.current_room_number} (Bed #{r.current_bed_number})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      r.kyc_status === 'VERIFIED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : r.kyc_status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                    }`}
                  >
                    {r.kyc_status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[10px] font-mono text-[#8E8E9F] mb-1 font-bold">
                    <span>KYC Progress</span>
                    <span className="text-[#0CC6FF]">{r.kyc_completion}%</span>
                  </div>
                  <div className="w-full bg-[#0B0B0C] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.kyc_completion === 100
                          ? 'bg-emerald-400'
                          : r.kyc_completion > 0
                          ? 'bg-gradient-to-r from-[#FF1E9A] to-[#0CC6FF]'
                          : 'bg-white/10'
                      }`}
                      style={{ width: `${r.kyc_completion}%` }}
                    />
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#8E8E9F] uppercase font-mono tracking-wider">
                    Uploaded Documents ({docs.length})
                  </span>
                  {docs.length === 0 ? (
                    <p className="text-xs text-[#8E8E9F] italic py-1">No documents uploaded yet.</p>
                  ) : (
                    docs.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDoc(d)}
                        className="p-2 rounded-xl bg-[#0B0B0C] hover:bg-white/[0.04] cursor-pointer border border-white/[0.06] flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          <FileText className="w-3.5 h-3.5 text-[#0CC6FF] shrink-0" />
                          <span className="text-white truncate font-medium">{d.document_name}</span>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            d.status === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : d.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedResidentId(r.id);
                    setActiveTab('residents');
                  }}
                  className="text-xs text-[#0CC6FF] hover:underline font-bold"
                >
                  View Profile & Uploads →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/[0.08] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{selectedDoc.document_name}</h3>
                <p className="text-xs text-[#8E8E9F] font-mono">
                  {selectedDoc.document_type} • Uploaded {new Date(selectedDoc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-full text-[#8E8E9F] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="h-64 rounded-xl overflow-hidden bg-[#0B0B0C] border border-white/[0.08] relative">
              <img
                src={selectedDoc.document_url}
                alt={selectedDoc.document_name}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedDoc.verified_by && (
              <p className="text-xs text-emerald-400 font-mono bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                ✓ Verified by {selectedDoc.verified_by} on {new Date(selectedDoc.verified_at!).toLocaleDateString()}
              </p>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason:');
                  verifyKYC({
                    document_id: selectedDoc.id,
                    status: 'REJECTED',
                    rejection_reason: reason || undefined
                  });
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold border border-rose-500/20 transition-colors"
              >
                Reject
              </button>

              <button
                onClick={() => {
                  verifyKYC({
                    document_id: selectedDoc.id,
                    status: 'VERIFIED'
                  });
                  setSelectedDoc(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
