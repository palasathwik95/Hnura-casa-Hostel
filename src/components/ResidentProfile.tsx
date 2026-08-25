import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Resident, Payment } from '../types';
import {
  ArrowLeft,
  CreditCard,
  ArrowRightLeft,
  UserMinus,
  Send,
  Edit,
  Building2,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquareWarning,
  History,
  FileCheck,
  Printer,
  XCircle,
  Upload,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ResidentProfileProps {
  residentId: string;
  onBack: () => void;
  onOpenTransferModal?: (resident: Resident) => void;
  onOpenVacateModal?: (resident: Resident) => void;
  onOpenEditModal?: (resident: Resident) => void;
}

export const ResidentProfile: React.FC<ResidentProfileProps> = ({
  residentId,
  onBack,
  onOpenTransferModal,
  onOpenVacateModal,
  onOpenEditModal
}) => {
  const {
    residents,
    payments,
    advances,
    residentDocuments,
    roomAssignments,
    complaints,
    whatsappMessages,
    auditLogs,
    openEditResidentModal,
    openTransferResidentModal,
    openVacateResidentModal,
    setRecordPaymentModalOpen,
    setPreselectedResidentForPayment,
    setPrintReceiptPayment,
    setUploadKYCResident,
    setUploadKYCModalOpen,
    verifyKYC,
    sendDirectWhatsApp,
    uploadKYC,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'financials' | 'kyc' | 'transfers' | 'complaints' | 'whatsapp' | 'timeline'
  >('overview');

  const [profileWhatsAppType, setProfileWhatsAppType] = useState<
    'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'KYC_REQUEST' | 'CUSTOM'
  >('PAYMENT_REMINDER');
  const [profileWhatsAppText, setProfileWhatsAppText] = useState('');
  const [isSendingProfileWA, setIsSendingProfileWA] = useState(false);

  const resident = residents.find(r => r.id === residentId);

  // Financial calculations
  const residentPayments = useMemo(() => {
    return payments.filter(p => p.resident_id === residentId).sort((a, b) => b.month.localeCompare(a.month));
  }, [payments, residentId]);

  const advanceAccount = useMemo(() => {
    return advances.find(a => a.resident_id === residentId);
  }, [advances, residentId]);

  const lifetimePaid = useMemo(() => {
    return residentPayments.reduce((sum, p) => sum + p.amount_paid, 0);
  }, [residentPayments]);

  const currentMonthPayment = residentPayments.find(p => p.month === '2026-08');
  const currentMonthPaid = currentMonthPayment ? currentMonthPayment.amount_paid : 0;
  const currentMonthBalance = resident?.status === 'ACTIVE'
    ? Math.max(0, (resident.monthly_fee || 0) - currentMonthPaid)
    : 0;

  // Documents
  const docs = useMemo(() => {
    return residentDocuments.filter(d => d.resident_id === residentId);
  }, [residentDocuments, residentId]);

  // Assignments
  const assignments = useMemo(() => {
    return roomAssignments.filter(a => a.resident_id === residentId);
  }, [roomAssignments, residentId]);

  // Complaints
  const residentComplaints = useMemo(() => {
    return complaints.filter(c => c.resident_id === residentId);
  }, [complaints, residentId]);

  // WhatsApp
  const messages = useMemo(() => {
    return whatsappMessages.filter(m => m.resident_id === residentId);
  }, [whatsappMessages, residentId]);

  // Audit Logs
  const historyLogs = useMemo(() => {
    return auditLogs.filter(l => l.entity_id === residentId || l.details.includes(resident?.name || ''));
  }, [auditLogs, residentId, resident]);

  if (!resident) {
    return (
      <div className="p-8 text-center bg-[#141414] rounded-2xl border border-white/[0.08] text-[#8E8E9F]">
        <p>Resident not found or has been removed.</p>
        <button onClick={onBack} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold">
          ← Return to Directory
        </button>
      </div>
    );
  }

  const isVacated = resident.status === 'VACATED';

  // Safe handler actions
  const handleEdit = () => {
    if (onOpenEditModal) onOpenEditModal(resident);
    else openEditResidentModal(resident);
  };

  const handleTransfer = () => {
    if (onOpenTransferModal) onOpenTransferModal(resident);
    else openTransferResidentModal(resident);
  };

  const handleVacate = () => {
    if (onOpenVacateModal) onOpenVacateModal(resident);
    else openVacateResidentModal(resident);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#141414] border border-white/[0.08] text-white hover:border-[#FF1E9A]/50 text-xs font-semibold transition-all shadow-md w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-[#0CC6FF]" />
          <span>Back to Resident Directory</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Send Direct WhatsApp */}
          <button
            onClick={() => {
              sendDirectWhatsApp({
                resident,
                type: currentMonthBalance > 0 ? 'PAYMENT_REMINDER' : 'PAYMENT_CONFIRMATION',
                balance: currentMonthBalance,
                month: 'August 2026',
                openDirect: true
              });
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/35 hover:bg-[#25D366]/25 text-xs font-bold transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Chat WhatsApp</span>
          </button>

          {/* Record Payment */}
          {!isVacated && (
            <button
              onClick={() => {
                setPreselectedResidentForPayment(resident);
                setRecordPaymentModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          {/* Transfer Room */}
          {!isVacated && (
            <button
              onClick={handleTransfer}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#141414] border border-white/[0.08] text-[#0CC6FF] hover:bg-white/[0.06] text-xs font-semibold transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Change Room</span>
            </button>
          )}

          {/* Mark Vacated */}
          {!isVacated ? (
            <button
              onClick={handleVacate}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Vacate</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-[#141414] text-[#8E8E9F] border border-white/[0.08] rounded-xl text-xs font-mono">
              Vacated on {resident.vacated_date}
            </span>
          )}

          {/* Edit Profile */}
          <button
            onClick={handleEdit}
            className="p-2 rounded-xl bg-[#141414] border border-white/[0.08] text-[#8E8E9F] hover:text-white transition-colors"
            title="Edit Resident"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resident Main Hero Header Card */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF1E9A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center space-x-4 sm:space-x-5 z-10">
          <img
            src={resident.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
            alt={resident.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#FF1E9A]/50 shadow-[0_0_20px_rgba(255,30,154,0.2)]"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                {resident.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08]">
                {resident.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  resident.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {resident.status}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  resident.kyc_status === 'VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                }`}
              >
                KYC: {resident.kyc_status} ({resident.kyc_completion}%)
              </span>
            </div>

            <p className="text-xs text-[#E4E4E7] mt-1.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#0CC6FF]" />
                <span>{resident.college || 'College N/A'} • {resident.course || 'Course'} ({resident.academic_year || 'Year'})</span>
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#8E8E9F] font-mono">
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#25D366]" />
                <span className="text-white font-medium">{resident.phone}</span>
              </span>
              {resident.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-[#0CC6FF]" />
                  <span>{resident.email}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#8E8E9F]" />
                <span>Joined {resident.joining_date}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Room & Financial Badge on Right */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0B0B0C] p-4 rounded-2xl border border-white/[0.08] text-xs z-10">
          <div>
            <p className="text-[#8E8E9F] text-[10px] uppercase font-mono font-bold tracking-wider">Assigned Room</p>
            <p className="text-sm font-bold text-white font-mono mt-0.5">
              {resident.current_room_number ? `Room ${resident.current_room_number}` : 'Vacated'}
            </p>
            <p className="text-[10px] text-[#0CC6FF] font-mono font-bold">
              {resident.current_bed_number ? `Bed #${resident.current_bed_number}` : 'No Bed'}
            </p>
          </div>
          <div>
            <p className="text-[#8E8E9F] text-[10px] uppercase font-mono font-bold tracking-wider">Monthly Fee</p>
            <p className="text-sm font-bold text-[#0CC6FF] font-mono mt-0.5">
              ₹{(resident.monthly_fee || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[#8E8E9F]">{resident.sharing_type || 'Standard'}</p>
          </div>
          <div>
            <p className="text-[#8E8E9F] text-[10px] uppercase font-mono font-bold tracking-wider">Account Status</p>
            <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {resident.status === 'ACTIVE' ? 'Active Occupant' : 'Vacated'}
            </p>
            <p className="text-[10px] text-[#8E8E9F]">{residentPayments.length} Total Receipts</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2 overflow-x-auto text-xs scrollbar-none">
        {[
          { id: 'overview', label: 'Profile & Contact' },
          { id: 'financials', label: `Financial Ledger (${residentPayments.length})` },
          { id: 'kyc', label: `KYC Vault (${docs.length})` },
          { id: 'transfers', label: `Room Transfers (${assignments.length})` },
          { id: 'complaints', label: `Complaints (${residentComplaints.length})` },
          { id: 'whatsapp', label: `WhatsApp Logs (${messages.length})` },
          { id: 'timeline', label: `Audit Trail (${historyLogs.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-xs font-bold ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-[0_0_15px_rgba(255,30,154,0.3)]'
                : 'bg-[#141414] text-[#8E8E9F] hover:text-white border border-white/[0.05]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW (Personal, Parent, Stay) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Personal Information */}
          <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center space-x-2 pb-2 border-b border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-[#FF1E9A]" />
              <span>Personal Information</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Full Name</span>
                <span className="font-bold text-white">{resident.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Date of Birth</span>
                <span className="text-[#E4E4E7] font-mono">{resident.date_of_birth || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Primary Phone</span>
                <span className="text-[#E4E4E7] font-mono">{resident.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">WhatsApp</span>
                <span className="text-[#25D366] font-mono">{resident.whatsapp || resident.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Email Address</span>
                <span className="text-[#E4E4E7]">{resident.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">College / Work</span>
                <span className="text-[#E4E4E7] text-right">{resident.college || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8E8E9F]">Course & Year</span>
                <span className="text-[#E4E4E7]">{resident.course} ({resident.academic_year})</span>
              </div>
            </div>
          </div>

          {/* Parent / Guardian Information */}
          <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center space-x-2 pb-2 border-b border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-[#0CC6FF]" />
              <span>Parent & Emergency Contacts</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Parent Name</span>
                <span className="font-bold text-white">{resident.parent_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Parent Contact</span>
                <span className="text-[#E4E4E7] font-mono">{resident.parent_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Emergency Phone</span>
                <span className="text-rose-400 font-mono font-bold">{resident.emergency_contact || 'N/A'}</span>
              </div>
              <div className="py-1">
                <span className="text-[#8E8E9F] block mb-1">Permanent Home Address</span>
                <p className="text-[#E4E4E7] bg-[#0B0B0C] p-2.5 rounded-xl border border-white/[0.08]">
                  {resident.permanent_address || 'Address details on file.'}
                </p>
              </div>
            </div>
          </div>

          {/* Stay & Allocation Information */}
          <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center space-x-2 pb-2 border-b border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-[#6C4CFF]" />
              <span>Accommodations & Allocation</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Property</span>
                <span className="font-bold text-white">Hanura Casa Smart Living</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Check-In Date</span>
                <span className="text-[#E4E4E7] font-mono">{resident.joining_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Current Room</span>
                <span className="font-bold text-white font-mono">
                  {resident.current_room_number ? `Room ${resident.current_room_number} (Floor ${resident.floor_number})` : 'Vacated'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Bed Number</span>
                <span className="font-bold text-[#0CC6FF] font-mono">
                  {resident.current_bed_number ? `Bed #${resident.current_bed_number}` : 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.05]">
                <span className="text-[#8E8E9F]">Sharing Type</span>
                <span className="text-[#E4E4E7]">{resident.sharing_type || 'Standard'}</span>
              </div>
              {resident.vacated_date && (
                <div className="flex justify-between py-1 text-rose-400 font-mono font-bold">
                  <span>Vacated Date</span>
                  <span>{resident.vacated_date}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL SUMMARY & LEDGER */}
      {activeTab === 'financials' && (
        <div className="space-y-5">
          {/* Top Financial Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] shadow-lg">
              <span className="text-[11px] text-[#8E8E9F] font-mono uppercase font-bold">Monthly Fee</span>
              <p className="text-xl font-bold font-mono text-[#0CC6FF] mt-1">₹{(resident.monthly_fee || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] shadow-lg">
              <span className="text-[11px] text-[#8E8E9F] font-mono uppercase font-bold">Lifetime Paid</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">₹{(lifetimePaid || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] shadow-lg">
              <span className="text-[11px] text-[#8E8E9F] font-mono uppercase font-bold">August 2026 Paid</span>
              <p className="text-xl font-bold font-mono text-white mt-1">₹{(currentMonthPaid || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] shadow-lg">
              <span className="text-[11px] text-[#8E8E9F] font-mono uppercase font-bold">August Dues</span>
              <p className={`text-xl font-bold font-mono mt-1 ${(currentMonthBalance || 0) > 0 ? 'text-[#FF6F3C]' : 'text-emerald-400'}`}>
                ₹{(currentMonthBalance || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0B0B0C] border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Payment Transaction Ledger</h3>
                <p className="text-xs text-[#8E8E9F]">Permanent encrypted payment records</p>
              </div>
              <button
                onClick={() => {
                  setPreselectedResidentForPayment(resident);
                  setRecordPaymentModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md transition-all"
              >
                + Record New Payment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#E4E4E7]">
                <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-widest border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Expected</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Ref / Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {residentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#8E8E9F]">
                        No payment records found for this resident.
                      </td>
                    </tr>
                  ) : (
                    residentPayments.map(p => (
                      <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4 font-mono text-white font-bold">{p.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{p.month}</td>
                        <td className="py-3 px-4 font-mono">₹{(p.expected_amount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ₹{(p.amount_paid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {(p.balance || 0) > 0 ? (
                            <span className="text-[#FF6F3C] font-bold">₹{(p.balance || 0).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">₹0 (Cleared)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0B0C] border border-white/[0.08] text-[#0CC6FF] font-mono text-[10px]">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#8E8E9F]">
                          <p className="text-white">{p.transaction_reference}</p>
                          <p className="text-[10px] text-[#8E8E9F]">{new Date(p.payment_date).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setPrintReceiptPayment(p)}
                              title="Print Digital Receipt"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#0B0B0C] hover:bg-white/[0.06] text-[#FF1E9A] rounded-lg text-[11px] font-bold border border-white/[0.08] transition-colors"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>

                            <button
                              onClick={() => {
                                sendDirectWhatsApp({
                                  resident,
                                  payment: p,
                                  type: 'PAYMENT_CONFIRMATION',
                                  month: p.month,
                                  openDirect: true
                                });
                              }}
                              title="Send Receipt via WhatsApp"
                              className="p-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 rounded-lg transition-colors"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL KYC DOCUMENTS */}
      {activeTab === 'kyc' && (
        <div className="space-y-5">
          <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white">Digital Identity & Document Vault</h3>
              <p className="text-xs text-[#8E8E9F]">Upload, inspect, and approve resident KYC records</p>
            </div>
            <button
              onClick={() => {
                setUploadKYCResident(resident);
                setUploadKYCModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#0CC6FF] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md transition-all flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.length === 0 ? (
              <div className="col-span-full bg-[#141414] p-8 text-center rounded-2xl border border-white/[0.08] text-[#8E8E9F]">
                No KYC documents uploaded yet for this resident.
              </div>
            ) : (
              docs.map(doc => (
                <div key={doc.id} className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#0B0B0C] text-[#0CC6FF] font-mono text-[10px] border border-white/[0.08] font-bold">
                      {doc.document_type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        doc.status === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : doc.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="h-44 rounded-xl overflow-hidden bg-[#0B0B0C] border border-white/[0.08] relative group">
                    <img
                      src={doc.document_url}
                      alt={doc.document_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold border border-white/30 flex items-center space-x-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Full Document</span>
                      </a>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white truncate">{doc.document_name}</p>
                    <p className="text-[10px] text-[#8E8E9F] font-mono">
                      Size: {doc.file_size} • Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                    {doc.verified_by && (
                      <p className="text-[10px] text-emerald-400 font-mono font-bold">
                        ✓ Verified by {doc.verified_by} on {new Date(doc.verified_at!).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Admin Verification Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.08]">
                    <button
                      onClick={() => verifyKYC({ document_id: doc.id, status: 'VERIFIED' })}
                      className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify & Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        verifyKYC({ document_id: doc.id, status: 'REJECTED', rejection_reason: reason || undefined });
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ROOM ASSIGNMENTS & TRANSFERS HISTORY */}
      {activeTab === 'transfers' && (
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white">Room Allocation & Movement Trail</h3>
              <p className="text-xs text-[#8E8E9F]">Complete record of bed transfers within the property</p>
            </div>
            {!isVacated && (
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-[#0B0B0C] text-[#0CC6FF] border border-white/[0.08] rounded-xl text-xs font-bold hover:bg-white/[0.04] transition-colors"
              >
                + Transfer Room
              </button>
            )}
          </div>

          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-xs text-[#8E8E9F] py-4 text-center">No transfer records found.</p>
            ) : (
              assignments.map((asn, idx) => (
                <div key={asn.id || idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-[#0CC6FF] font-mono font-bold">
                      {asn.room_number}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        Room {asn.room_number} • Bed #{asn.bed_number}
                      </p>
                      <p className="text-[11px] text-[#8E8E9F] font-mono">
                        Start: {asn.start_date} {asn.end_date ? `to ${asn.end_date}` : '(Current Active)'}
                      </p>
                      {asn.transfer_reason && (
                        <p className="text-[10px] text-[#8E8E9F] mt-0.5">Reason: {asn.transfer_reason}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                      asn.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#141414] text-[#8E8E9F]'
                    }`}
                  >
                    {asn.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white">Resident Complaints & Service Tickets</h3>
          <div className="space-y-3">
            {residentComplaints.length === 0 ? (
              <p className="text-xs text-[#8E8E9F] py-6 text-center">No complaints filed by this resident.</p>
            ) : (
              residentComplaints.map(cmp => (
                <div key={cmp.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-white/[0.06] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {cmp.category} (Room {cmp.room_number})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#FF6F3C]/10 text-[#FF6F3C] border border-[#FF6F3C]/30 uppercase font-bold">
                      {cmp.status}
                    </span>
                  </div>
                  <p className="text-[#E4E4E7]">{cmp.description}</p>
                  {cmp.resolution_notes && (
                    <p className="text-emerald-400 text-[11px] bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                      Resolution: {cmp.resolution_notes}
                    </p>
                  )}
                  <p className="text-[10px] text-[#8E8E9F] font-mono">
                    Logged: {new Date(cmp.created_at).toLocaleDateString()} • Assigned: {cmp.assigned_person}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: WHATSAPP LOGS & COMPOSER */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-5">
          {/* Quick Direct WhatsApp Dispatcher Box */}
          <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#25D366]" />
                <span>Compose & Send WhatsApp to {resident.name}</span>
              </h3>
              <span className="text-xs font-mono text-[#25D366] font-bold">{resident.phone}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'PAYMENT_REMINDER', label: 'Rent Reminder' },
                { id: 'PAYMENT_CONFIRMATION', label: 'Payment Receipt' },
                { id: 'KYC_REQUEST', label: 'KYC Alert' },
                { id: 'CUSTOM', label: 'Custom Message' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setProfileWhatsAppType(t.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    profileWhatsAppType === t.id
                      ? 'bg-[#0B0B0C] border-[#25D366] text-[#25D366]'
                      : 'bg-[#0B0B0C]/50 border-white/[0.06] text-[#8E8E9F] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {profileWhatsAppType === 'CUSTOM' && (
              <textarea
                rows={3}
                value={profileWhatsAppText}
                onChange={e => setProfileWhatsAppText(e.target.value)}
                placeholder="Type your custom message..."
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#25D366]"
              />
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-[#8E8E9F]">
                Launches WhatsApp Web or Mobile App with pre-filled message.
              </p>
              <button
                onClick={async () => {
                  setIsSendingProfileWA(true);
                  try {
                    await sendDirectWhatsApp({
                      resident,
                      type: profileWhatsAppType,
                      customText: profileWhatsAppText,
                      balance: currentMonthBalance,
                      month: 'August 2026',
                      openDirect: true
                    });
                    setProfileWhatsAppText('');
                  } finally {
                    setIsSendingProfileWA(false);
                  }
                }}
                disabled={isSendingProfileWA}
                className="px-5 py-2.5 bg-[#25D366] text-black font-bold rounded-xl hover:brightness-110 text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingProfileWA ? 'Opening...' : 'Send WhatsApp'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Logs History */}
          <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white">Dispatched WhatsApp Logs ({messages.length})</h3>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-[#8E8E9F] py-6 text-center">No WhatsApp messages dispatched yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#25D366] flex items-center space-x-1.5">
                        <Send className="w-3.5 h-3.5" />
                        <span>{msg.message_type}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase border border-emerald-500/30 font-bold">
                        {msg.status}
                      </span>
                    </div>
                    <pre className="text-[#E4E4E7] font-sans whitespace-pre-wrap bg-[#141414] p-3 rounded-xl border border-white/[0.08]">
                      {msg.message_content}
                    </pre>
                    <p className="text-[10px] text-[#8E8E9F] font-mono">
                      Sent: {new Date(msg?.sent_at || Date.now()).toLocaleString()} • To: {msg.phone}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ACTIVITY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white">Immutable Resident Audit Trail</h3>
          <div className="relative pl-6 border-l border-white/[0.08] space-y-6">
            {historyLogs.map(log => (
              <div key={log.id} className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-[#FF1E9A] border-2 border-[#141414]" />
                <div className="bg-[#0B0B0C] p-3.5 rounded-xl border border-white/[0.06] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] text-[#8E8E9F] font-mono">
                      {new Date(log?.timestamp || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#E4E4E7] mt-1">{log.details}</p>
                  <p className="text-[10px] text-[#8E8E9F] mt-1 font-mono">Operator: {log.admin_user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
