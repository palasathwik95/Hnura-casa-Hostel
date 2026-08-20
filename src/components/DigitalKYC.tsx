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
  AlertCircle
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
  const verifiedPercent = Math.round((verifiedCount / activeResidents.length) * 100) || 0;

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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Compliance & Identity Verification
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• KYC Engine</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Digital KYC & Verification
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Government ID validation (Aadhaar/PAN/College ID), fraud prevention & authenticated admin approvals.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#15151A] px-4 py-2.5 rounded-2xl border border-[#23232A]">
          <div className="text-right">
            <p className="text-[10px] text-[#6B6B76] uppercase font-semibold">Verification Health</p>
            <p className="text-lg font-serif font-bold text-[#4CAF50]">{verifiedPercent}% Verified</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#4CAF50]/30 border-t-[#4CAF50] flex items-center justify-center text-xs font-mono text-[#4CAF50]">
            {verifiedPercent}%
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#4CAF50] font-medium uppercase tracking-wider">Fully Verified</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">{verifiedCount}</p>
          <p className="text-[11px] text-[#6B6B76] mt-1">Active Residents Compliant</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">Action / Review Required</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">{pendingCount}</p>
          <p className="text-[11px] text-[#6B6B76] mt-1">Pending admin verification</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-rose-400 font-medium uppercase tracking-wider">Not Started</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">{notStartedCount}</p>
          <p className="text-[11px] text-[#6B6B76] mt-1">Reminder required</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search KYC by resident name, ID, or room..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'VERIFIED', 'NOT_STARTED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                  : 'bg-[#15151A] text-[#6B6B76] hover:text-white'
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
              className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.photo_url}
                      alt={r.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#23232A]"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{r.name}</h4>
                      <p className="text-[10px] text-[#6B6B76] font-mono">
                        {r.id} • Room {r.current_room_number} (Bed {r.current_bed_number})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                      r.kyc_status === 'VERIFIED'
                        ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                        : r.kyc_status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                    }`}
                  >
                    {r.kyc_status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-[#6B6B76] mb-1">
                    <span>KYC Completion</span>
                    <span className="text-[#D4AF37] font-semibold">{r.kyc_completion}%</span>
                  </div>
                  <div className="w-full bg-[#15151A] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.kyc_completion === 100
                          ? 'bg-[#4CAF50]'
                          : r.kyc_completion > 0
                          ? 'bg-[#D4AF37]'
                          : 'bg-[#23232A]'
                      }`}
                      style={{ width: `${r.kyc_completion}%` }}
                    />
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#6B6B76] uppercase tracking-wider">
                    Uploaded Documents ({docs.length})
                  </span>
                  {docs.length === 0 ? (
                    <p className="text-[11px] text-[#6B6B76] italic py-1">No documents uploaded yet.</p>
                  ) : (
                    docs.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDoc(d)}
                        className="p-2 rounded-xl bg-[#15151A] hover:bg-[#1F1F23] cursor-pointer border border-[#23232A] flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          <FileText className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="text-white truncate font-medium">{d.document_name}</span>
                        </div>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                            d.status === 'VERIFIED'
                              ? 'bg-[#4CAF50]/10 text-[#4CAF50]'
                              : d.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1F1F23] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedResidentId(r.id);
                    setActiveTab('residents');
                  }}
                  className="text-xs text-[#D4AF37] hover:underline font-medium"
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
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{selectedDoc.document_name}</h3>
                <p className="text-xs text-[#6B6B76] font-mono">
                  {selectedDoc.document_type} • Uploaded {new Date(selectedDoc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-full text-[#6B6B76] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="h-64 rounded-xl overflow-hidden bg-[#15151A] border border-[#23232A] relative">
              <img
                src={selectedDoc.document_url}
                alt={selectedDoc.document_name}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedDoc.verified_by && (
              <p className="text-xs text-[#4CAF50] font-mono bg-[#4CAF50]/10 p-2.5 rounded-xl border border-[#4CAF50]/20">
                ✓ Verified by {selectedDoc.verified_by} on {new Date(selectedDoc.verified_at!).toLocaleDateString()}
              </p>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1F1F23]">
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
                className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-full text-xs font-medium border border-rose-500/20"
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
                className="px-4 py-2 bg-[#D4AF37] hover:brightness-110 text-black rounded-full text-xs font-semibold shadow"
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
