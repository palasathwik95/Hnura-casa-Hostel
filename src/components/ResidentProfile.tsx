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
  XCircle
} from 'lucide-react';

interface ResidentProfileProps {
  residentId: string;
  onBack: () => void;
  onOpenTransferModal: (resident: Resident) => void;
  onOpenVacateModal: (resident: Resident) => void;
  onOpenEditModal: (resident: Resident) => void;
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
    setRecordPaymentModalOpen,
    setPreselectedResidentForPayment,
    setPrintReceiptPayment,
    verifyKYC,
    sendWhatsApp,
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
      <div className="p-8 text-center bg-[#0F0F12] rounded-2xl border border-[#1F1F23] text-[#6B6B76]">
        <p>Resident not found or has been removed.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-xs font-semibold">
          ← Return to Directory
        </button>
      </div>
    );
  }

  const isVacated = resident.status === 'VACATED';

  return (
    <div className="space-y-6 pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#15151A] border border-[#23232A] text-[#D1D1D1] hover:text-white hover:border-[#D4AF37]/40 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Residents Directory</span>
        </button>

        <div className="flex items-center space-x-2">
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
            className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/35 hover:bg-[#25D366]/25 text-xs font-semibold transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </button>

          {/* Record Payment */}
          {!isVacated && (
            <button
              onClick={() => {
                setPreselectedResidentForPayment(resident);
                setRecordPaymentModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-semibold hover:brightness-110 active:scale-95 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          {/* Transfer Room */}
          {!isVacated && (
            <button
              onClick={() => onOpenTransferModal(resident)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-[#15151A] border border-[#23232A] text-[#D1D1D1] hover:bg-[#1F1F23] hover:text-white text-xs font-medium transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Change Room</span>
            </button>
          )}

          {/* Mark Vacated */}
          {!isVacated ? (
            <button
              onClick={() => onOpenVacateModal(resident)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Mark Vacated</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-[#15151A] text-[#6B6B76] border border-[#1F1F23] rounded-full text-xs font-mono">
              Archived / Vacated on {resident.vacated_date}
            </span>
          )}

          {/* Edit Profile */}
          <button
            onClick={() => onOpenEditModal(resident)}
            className="p-2 rounded-full bg-[#15151A] border border-[#23232A] text-[#D1D1D1] hover:text-white transition-colors"
            title="Edit Resident"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resident Main Hero Header Card */}
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
          <img
            src={resident.photo_url}
            alt={resident.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#D4AF37]/50"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-tight">
                {resident.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#15151A] text-[#6B6B76] border border-[#1F1F23]">
                {resident.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                  resident.status === 'ACTIVE'
                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                    : 'bg-[#15151A] text-[#6B6B76] border border-[#1F1F23]'
                }`}
              >
                {resident.status}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                  resident.kyc_status === 'VERIFIED'
                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                    : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                }`}
              >
                KYC: {resident.kyc_status} ({resident.kyc_completion}%)
              </span>
            </div>

            <p className="text-xs text-[#D1D1D1] mt-1.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{resident.college || 'College N/A'} • {resident.course || 'Course'} ({resident.academic_year || 'Year'})</span>
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#6B6B76] font-mono">
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#25D366]" />
                <span>{resident.phone}</span>
              </span>
              {resident.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-[#D1D1D1]" />
                  <span>{resident.email}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#6B6B76]" />
                <span>Joined {resident.joining_date}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Room & Financial Badge on Right */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#15151A] p-4 rounded-xl border border-[#23232A] text-xs">
          <div>
            <p className="text-[#6B6B76] text-[10px] uppercase font-bold tracking-wider">Assigned Room</p>
            <p className="text-sm font-light text-white font-mono mt-0.5">
              {resident.current_room_number ? `Room ${resident.current_room_number}` : 'Vacated'}
            </p>
            <p className="text-[10px] text-[#D4AF37] font-mono">
              {resident.current_bed_number ? `Bed ${resident.current_bed_number}` : 'No Bed'}
            </p>
          </div>
          <div>
            <p className="text-[#6B6B76] text-[10px] uppercase font-bold tracking-wider">Monthly Fee</p>
            <p className="text-sm font-light text-white font-mono mt-0.5">
              ₹{resident.monthly_fee.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[#6B6B76]">{resident.sharing_type}</p>
          </div>
          <div>
            <p className="text-[#6B6B76] text-[10px] uppercase font-bold tracking-wider">Security Advance</p>
            <p className="text-sm font-light text-[#4CAF50] font-mono mt-0.5">
              ₹{(advanceAccount?.current_advance || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[#6B6B76]">Held in Trust</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#1F1F23] pb-2 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Personal & Stay Profile' },
          { id: 'financials', label: `Financial Ledger (${residentPayments.length})` },
          { id: 'kyc', label: `KYC Documents (${docs.length})` },
          { id: 'transfers', label: `Room History (${assignments.length})` },
          { id: 'complaints', label: `Complaints (${residentComplaints.length})` },
          { id: 'whatsapp', label: `WhatsApp Logs (${messages.length})` },
          { id: 'timeline', label: `Activity Trail (${historyLogs.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs ${
              activeTab === tab.id
                ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                : 'bg-[#15151A] text-[#6B6B76] hover:text-white'
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
          <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3">
            <h3 className="text-xs font-bold text-[#D1D1D1] uppercase tracking-widest flex items-center space-x-2 pb-2 border-b border-[#1F1F23]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>Personal Information</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Full Name</span>
                <span className="font-semibold text-white">{resident.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Date of Birth</span>
                <span className="text-[#D1D1D1] font-mono">{resident.date_of_birth || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Primary Phone</span>
                <span className="text-[#D1D1D1] font-mono">{resident.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">WhatsApp Number</span>
                <span className="text-[#25D366] font-mono">{resident.whatsapp || resident.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Email Address</span>
                <span className="text-[#D1D1D1]">{resident.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">College</span>
                <span className="text-[#D1D1D1] text-right">{resident.college || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B6B76]">Course & Year</span>
                <span className="text-[#D1D1D1]">{resident.course} ({resident.academic_year})</span>
              </div>
            </div>
          </div>

          {/* Parent / Guardian Information */}
          <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3">
            <h3 className="text-xs font-bold text-[#D1D1D1] uppercase tracking-widest flex items-center space-x-2 pb-2 border-b border-[#1F1F23]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>Parent / Guardian & Emergency</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Parent / Guardian Name</span>
                <span className="font-semibold text-white">{resident.parent_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Parent Contact Phone</span>
                <span className="text-[#D1D1D1] font-mono">{resident.parent_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Emergency Phone</span>
                <span className="text-rose-400 font-mono font-semibold">{resident.emergency_contact || 'N/A'}</span>
              </div>
              <div className="py-1">
                <span className="text-[#6B6B76] block mb-1">Permanent Home Address</span>
                <p className="text-[#D1D1D1] bg-[#15151A] p-2.5 rounded-lg border border-[#23232A]">
                  {resident.permanent_address || 'Address details on file.'}
                </p>
              </div>
            </div>
          </div>

          {/* Stay & Allocation Information */}
          <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3">
            <h3 className="text-xs font-bold text-[#D1D1D1] uppercase tracking-widest flex items-center space-x-2 pb-2 border-b border-[#1F1F23]">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
              <span>Stay & Assignment Details</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Hostel Property</span>
                <span className="font-semibold text-white">Hanura Casa Madhapur</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Joining Date</span>
                <span className="text-[#D1D1D1] font-mono">{resident.joining_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Current Room</span>
                <span className="font-semibold text-white font-mono">
                  {resident.current_room_number ? `Room ${resident.current_room_number} (Floor ${resident.floor_number})` : 'Vacated'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Bed Number</span>
                <span className="font-semibold text-[#D4AF37] font-mono">
                  {resident.current_bed_number ? `Bed ${resident.current_bed_number}` : 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                <span className="text-[#6B6B76]">Sharing Type</span>
                <span className="text-[#D1D1D1]">{resident.sharing_type}</span>
              </div>
              {resident.vacated_date && (
                <div className="flex justify-between py-1 text-rose-400 font-mono">
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
            <div className="bg-[#0F0F12] p-4 rounded-xl border border-[#1F1F23]">
              <span className="text-[11px] text-[#6B6B76] font-medium">Monthly Fee</span>
              <p className="text-xl font-light font-mono text-white mt-1">₹{(resident.monthly_fee || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F0F12] p-4 rounded-xl border border-[#1F1F23]">
              <span className="text-[11px] text-[#6B6B76] font-medium">Lifetime Amount Paid</span>
              <p className="text-xl font-light font-mono text-[#4CAF50] mt-1">₹{(lifetimePaid || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F0F12] p-4 rounded-xl border border-[#1F1F23]">
              <span className="text-[11px] text-[#6B6B76] font-medium">August 2026 Paid</span>
              <p className="text-xl font-light font-mono text-white mt-1">₹{(currentMonthPaid || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F0F12] p-4 rounded-xl border border-[#1F1F23]">
              <span className="text-[11px] text-[#6B6B76] font-medium">Current Balance (Aug)</span>
              <p className={`text-xl font-light font-mono mt-1 ${(currentMonthBalance || 0) > 0 ? 'text-[#D4AF37]' : 'text-[#4CAF50]'}`}>
                ₹{(currentMonthBalance || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
            <div className="p-4 bg-[#15151A] border-b border-[#1F1F23] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Payment Transaction Ledger</h3>
                <p className="text-xs text-[#6B6B76]">All historical financial transactions remain permanently preserved</p>
              </div>
              <button
                onClick={() => {
                  setPreselectedResidentForPayment(resident);
                  setRecordPaymentModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110"
              >
                + Record New Payment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#D1D1D1]">
                <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-semibold text-[10px] tracking-widest border-b border-[#1F1F23]">
                  <tr>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Expected</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Advance Used</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Reference / Date</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F23]">
                  {residentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#6B6B76]">
                        No payment records found for this resident.
                      </td>
                    </tr>
                  ) : (
                    residentPayments.map(p => (
                      <tr key={p.id} className="hover:bg-[#15151A]/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-white">{p.id}</td>
                        <td className="py-3 px-4 font-medium text-white">{p.month}</td>
                        <td className="py-3 px-4 font-mono">₹{(p.expected_amount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono font-medium text-[#4CAF50]">
                          ₹{(p.amount_paid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#6B6B76]">
                          ₹{(p.advance_used || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {(p.balance || 0) > 0 ? (
                            <span className="text-[#D4AF37] font-medium">₹{(p.balance || 0).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-[#4CAF50]">₹0 (Cleared)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#15151A] text-[#D1D1D1] font-mono text-[10px]">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#6B6B76]">
                          <p>{p.transaction_reference}</p>
                          <p className="text-[10px] text-[#4F4F5A]">{new Date(p.payment_date).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setPrintReceiptPayment(p)}
                              title="Print Digital Receipt"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#15151A] hover:bg-[#1F1F23] text-[#D4AF37] rounded-full text-[11px] font-medium border border-[#23232A] transition-colors"
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
                              className="p-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 rounded-full transition-colors"
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

          {/* Advance Ledger Detail */}
          {advanceAccount && (
            <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-[#D4AF37]" />
                  <span>Security Deposit / Advance Ledger</span>
                </h3>
                <span className="text-xs font-mono text-[#4CAF50] font-medium">
                  Current Advance: ₹{(advanceAccount.current_advance || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="space-y-2">
                {advanceAccount.transactions.map((txn, idx) => (
                  <div key={txn.id || idx} className="p-3 bg-[#15151A] rounded-xl border border-[#23232A] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          txn.type === 'DEPOSIT' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                        }`}>
                          {txn.type}
                        </span>
                        <span>{txn.notes}</span>
                      </p>
                      <p className="text-[10px] text-[#6B6B76] font-mono mt-0.5">
                        Ref: {txn.reference} • Date: {new Date(txn.date || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-[#4CAF50]">
                        {txn.type === 'DEPOSIT' ? `+₹${(txn.amount || 0).toLocaleString('en-IN')}` : `-₹${(txn.amount || 0).toLocaleString('en-IN')}`}
                      </p>
                      <p className="text-[10px] text-[#6B6B76] font-mono">Balance: ₹{(txn.balance_after || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIGITAL KYC DOCUMENTS */}
      {activeTab === 'kyc' && (
        <div className="space-y-5">
          <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Digital Identity & Document Vault</h3>
              <p className="text-xs text-[#6B6B76]">Authenticated document preview & admin verification</p>
            </div>
            <button
              onClick={() => {
                const docType = prompt('Document Type (AADHAAR, PAN, COLLEGE_ID, ADDRESS_PROOF):', 'AADHAAR');
                if (docType) {
                  uploadKYC({
                    resident_id: resident.id,
                    document_type: docType,
                    document_name: `${docType}_Scan_${resident.name.replace(/\s+/g, '_')}.pdf`,
                    document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
                  });
                }
              }}
              className="px-3.5 py-1.5 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110"
            >
              + Upload Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map(doc => (
              <div key={doc.id} className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#15151A] text-[#D4AF37] font-mono text-[10px] border border-[#23232A]">
                    {doc.document_type}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                      doc.status === 'VERIFIED'
                        ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                        : doc.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="h-36 rounded-xl overflow-hidden bg-[#15151A] border border-[#1F1F23] relative group">
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
                      className="px-3 py-1.5 bg-white/10 text-white rounded-full text-xs font-medium border border-white/20"
                    >
                      View Full Preview
                    </a>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-white truncate">{doc.document_name}</p>
                  <p className="text-[10px] text-[#6B6B76] font-mono">
                    Size: {doc.file_size} • Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                  {doc.verified_by && (
                    <p className="text-[10px] text-[#4CAF50] font-mono">
                      ✓ Verified by {doc.verified_by} on {new Date(doc.verified_at!).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Admin Verification Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-[#1F1F23]">
                  <button
                    onClick={() => verifyKYC({ document_id: doc.id, status: 'VERIFIED' })}
                    className="flex-1 py-1.5 bg-[#4CAF50]/10 hover:bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/20 rounded-full text-xs font-medium flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      verifyKYC({ document_id: doc.id, status: 'REJECTED', rejection_reason: reason || undefined });
                    }}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full text-xs font-medium flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROOM ASSIGNMENTS & TRANSFERS HISTORY */}
      {activeTab === 'transfers' && (
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
            <div>
              <h3 className="text-sm font-semibold text-white">Room Allocation & Transfer History</h3>
              <p className="text-xs text-[#6B6B76]">Complete historical audit of bed movements within Hanura Casa</p>
            </div>
            {!isVacated && (
              <button
                onClick={() => onOpenTransferModal(resident)}
                className="px-3 py-1.5 bg-[#15151A] text-[#D1D1D1] border border-[#23232A] rounded-full text-xs font-medium hover:text-white"
              >
                + Transfer Room
              </button>
            )}
          </div>

          <div className="space-y-3">
            {assignments.map((asn, idx) => (
              <div key={asn.id || idx} className="p-4 bg-[#15151A] rounded-xl border border-[#23232A] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#1F1F23] border border-[#2B2B33] flex items-center justify-center text-[#D4AF37] font-mono font-medium">
                    {asn.room_number}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Room {asn.room_number} • Bed {asn.bed_number}
                    </p>
                    <p className="text-[11px] text-[#6B6B76] font-mono">
                      Start: {asn.start_date} {asn.end_date ? `to ${asn.end_date}` : '(Current)'}
                    </p>
                    {asn.transfer_reason && (
                      <p className="text-[10px] text-[#6B6B76] mt-0.5">Reason: {asn.transfer_reason}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase ${
                    asn.status === 'ACTIVE'
                      ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                      : 'bg-[#15151A] text-[#6B6B76]'
                  }`}
                >
                  {asn.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4">
          <h3 className="text-sm font-semibold text-white">Resident Complaints & Service Requests</h3>
          <div className="space-y-3">
            {residentComplaints.length === 0 ? (
              <p className="text-xs text-[#6B6B76] py-6 text-center">No complaints filed by this resident.</p>
            ) : (
              residentComplaints.map(cmp => (
                <div key={cmp.id} className="p-4 bg-[#15151A] rounded-xl border border-[#23232A] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      {cmp.category} (Room {cmp.room_number})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                      {cmp.status}
                    </span>
                  </div>
                  <p className="text-[#D1D1D1]">{cmp.description}</p>
                  {cmp.resolution_notes && (
                    <p className="text-[#4CAF50] text-[11px] bg-[#4CAF50]/10 p-2 rounded-lg border border-[#4CAF50]/20">
                      Resolution: {cmp.resolution_notes}
                    </p>
                  )}
                  <p className="text-[10px] text-[#6B6B76] font-mono">
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
          <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#25D366]" />
                <span>Compose & Send Direct WhatsApp to {resident.name}</span>
              </h3>
              <span className="text-xs font-mono text-[#25D366]">{resident.phone}</span>
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
                  className={`p-2 rounded-xl text-xs font-medium border transition-all text-left ${
                    profileWhatsAppType === t.id
                      ? 'bg-[#15151A] border-[#25D366] text-[#25D366]'
                      : 'bg-[#15151A]/50 border-[#23232A] text-[#6B6B76] hover:text-white'
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
                placeholder="Type your message to send on WhatsApp..."
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#25D366]"
              />
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-[#6B6B76]">
                Opens WhatsApp Web/App directly with this resident's pre-filled personalized message.
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
                className="px-4 py-2 bg-[#25D366] text-black font-semibold rounded-full hover:brightness-110 text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingProfileWA ? 'Opening...' : 'Send Direct WhatsApp'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Logs History */}
          <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4">
            <h3 className="text-sm font-semibold text-white">Dispatched WhatsApp Logs ({messages.length})</h3>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-[#6B6B76] py-6 text-center">No WhatsApp messages dispatched yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="p-4 bg-[#15151A] rounded-xl border border-[#23232A] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#25D366] flex items-center space-x-1.5">
                        <Send className="w-3.5 h-3.5" />
                        <span>{msg.message_type}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] text-[10px] font-mono uppercase border border-[#4CAF50]/20">
                        {msg.status}
                      </span>
                    </div>
                    <pre className="text-[#D1D1D1] font-sans whitespace-pre-wrap bg-[#0F0F12] p-3 rounded-lg border border-[#1F1F23]">
                      {msg.message_content}
                    </pre>
                    <p className="text-[10px] text-[#6B6B76] font-mono">
                      Sent at: {new Date(msg?.sent_at || Date.now()).toLocaleString()} • Recipient: {msg.phone}
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
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4">
          <h3 className="text-sm font-semibold text-white">Immutable Resident Activity Trail</h3>
          <div className="relative pl-6 border-l border-[#1F1F23] space-y-6">
            {historyLogs.map(log => (
              <div key={log.id} className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#0F0F12]" />
                <div className="bg-[#15151A] p-3 rounded-xl border border-[#23232A] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{log.action}</span>
                    <span className="text-[10px] text-[#6B6B76] font-mono">
                      {new Date(log?.timestamp || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#D1D1D1] mt-1">{log.details}</p>
                  <p className="text-[10px] text-[#6B6B76] mt-1 font-mono">Admin: {log.admin_user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
