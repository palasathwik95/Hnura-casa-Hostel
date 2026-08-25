import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Resident, Payment } from '../types';
import { ResidentProfile } from './ResidentProfile';
import {
  Search,
  Filter,
  Plus,
  UserCheck,
  Building2,
  Phone,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  UserMinus,
  Eye,
  Edit,
  CreditCard,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  ChevronRight,
  UserPlus
} from 'lucide-react';

interface ResidentsProps {
  onSelectResident?: (id: string) => void;
  onOpenAddModal?: () => void;
  onOpenTransferModal?: (resident: Resident) => void;
  onOpenVacateModal?: (resident: Resident) => void;
  onOpenEditModal?: (resident: Resident) => void;
}

export const Residents: React.FC<ResidentsProps> = ({
  onSelectResident: propOnSelectResident,
  onOpenAddModal: propOnOpenAddModal,
  onOpenTransferModal: propOnOpenTransferModal,
  onOpenVacateModal: propOnOpenVacateModal,
  onOpenEditModal: propOnOpenEditModal
}) => {
  const {
    residents,
    payments,
    advances,
    selectedResidentId,
    setSelectedResidentId,
    setAddResidentModalOpen,
    openEditResidentModal,
    openTransferResidentModal,
    openVacateResidentModal,
    setRecordPaymentModalOpen,
    setPreselectedResidentForPayment,
    setUploadKYCResident,
    setUploadKYCModalOpen,
    sendWhatsApp,
    sendDirectWhatsApp,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'VACATED' | 'PENDING_PAYMENT' | 'PAID' | 'KYC_PENDING' | 'KYC_VERIFIED'>('ACTIVE');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [bulkActionSending, setBulkActionSending] = useState(false);

  // Safe handler bridges
  const handleSelectResident = (id: string) => {
    if (propOnSelectResident) propOnSelectResident(id);
    else setSelectedResidentId(id);
  };

  const handleOpenAddModal = () => {
    if (propOnOpenAddModal) propOnOpenAddModal();
    else setAddResidentModalOpen(true);
  };

  const handleOpenEdit = (resident: Resident) => {
    if (propOnOpenEditModal) propOnOpenEditModal(resident);
    else openEditResidentModal(resident);
  };

  const handleOpenTransfer = (resident: Resident) => {
    if (propOnOpenTransferModal) propOnOpenTransferModal(resident);
    else openTransferResidentModal(resident);
  };

  const handleOpenVacate = (resident: Resident) => {
    if (propOnOpenVacateModal) propOnOpenVacateModal(resident);
    else openVacateResidentModal(resident);
  };

  // Calculate current month (2026-08) financials for each resident
  const residentsWithFinancials = useMemo(() => {
    return residents.map(r => {
      const currentMonthPayment = payments.find(p => p.resident_id === r.id && p.month === '2026-08');
      const adv = advances.find(a => a.resident_id === r.id);
      const paid = currentMonthPayment ? currentMonthPayment.amount_paid : 0;
      const expected = r.monthly_fee || 0;
      const balance = r.status === 'ACTIVE' ? Math.max(0, expected - paid) : 0;

      let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      if (paid >= expected && expected > 0) paymentStatus = 'PAID';
      else if (paid > 0) paymentStatus = 'PARTIAL';

      return {
        ...r,
        current_advance: adv?.current_advance || 0,
        aug_paid: paid,
        aug_balance: balance,
        payment_status: paymentStatus
      };
    });
  }, [residents, payments, advances]);

  // Filtered residents list
  const filteredResidents = useMemo(() => {
    return residentsWithFinancials.filter(r => {
      // Search match
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.current_room_number && r.current_room_number.includes(q)) ||
        (r.college && r.college.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Status filter
      if (statusFilter === 'ACTIVE' && r.status !== 'ACTIVE') return false;
      if (statusFilter === 'VACATED' && r.status !== 'VACATED') return false;
      if (statusFilter === 'PENDING_PAYMENT' && (r.status !== 'ACTIVE' || r.aug_balance === 0)) return false;
      if (statusFilter === 'PAID' && (r.status !== 'ACTIVE' || r.payment_status !== 'PAID')) return false;
      if (statusFilter === 'KYC_PENDING' && r.kyc_status === 'VERIFIED') return false;
      if (statusFilter === 'KYC_VERIFIED' && r.kyc_status !== 'VERIFIED') return false;

      // Floor filter
      if (floorFilter !== 'ALL') {
        const floorNum = Number(floorFilter);
        if (r.floor_number !== floorNum) return false;
      }

      return true;
    });
  }, [residentsWithFinancials, searchTerm, statusFilter, floorFilter]);

  // Select all toggler
  const handleSelectAll = () => {
    if (selectedResidentIds.length === filteredResidents.length) {
      setSelectedResidentIds([]);
    } else {
      setSelectedResidentIds(filteredResidents.map(r => r.id));
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedResidentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk WhatsApp Reminder to selected
  const handleBulkWhatsApp = async () => {
    if (selectedResidentIds.length === 0) {
      addToast('info', 'Select Residents', 'Please select at least one resident.');
      return;
    }
    setBulkActionSending(true);
    try {
      await sendWhatsApp({
        resident_ids: selectedResidentIds,
        message_type: 'PAYMENT_REMINDER',
        month: 'August 2026'
      });
      setSelectedResidentIds([]);
    } catch (err) {
      // handled
    } finally {
      setBulkActionSending(false);
    }
  };

  // If a resident is currently selected, render the profile directly!
  if (selectedResidentId) {
    return (
      <ResidentProfile
        residentId={selectedResidentId}
        onBack={() => setSelectedResidentId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-6 rounded-2xl border border-white/[0.08] shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              RESIDENT DIRECTORY
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono">• {filteredResidents.length} Showing</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Resident Accommodations & Matrix
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Live lifecycle control with synchronized room assignments and non-destructive vacating rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedResidentIds.length > 0 && (
            <button
              onClick={handleBulkWhatsApp}
              disabled={bulkActionSending}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/25 text-xs font-bold transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast WhatsApp ({selectedResidentIds.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Resident</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 shadow-lg">
        {/* Status Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          {[
            { id: 'ACTIVE', label: 'Active Residents' },
            { id: 'PENDING_PAYMENT', label: 'Pending Dues' },
            { id: 'PAID', label: 'Paid Full' },
            { id: 'KYC_PENDING', label: 'KYC Action Req.' },
            { id: 'KYC_VERIFIED', label: 'KYC Verified' },
            { id: 'VACATED', label: 'Former / Vacated' },
            { id: 'ALL', label: 'All Records' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-[0_0_15px_rgba(255,30,154,0.3)]'
                  : 'bg-[#0B0B0C] text-[#8E8E9F] hover:text-white hover:bg-white/[0.04] border border-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Floor Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-3 relative">
            <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone number, resident ID, room, college..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#0CC6FF]"
            />
          </div>

          <div>
            <select
              value={floorFilter}
              onChange={e => setFloorFilter(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0CC6FF]"
            >
              <option value="ALL">All Floors (1 to 4)</option>
              <option value="1">Floor 1 (Premier)</option>
              <option value="2">Floor 2 (Club)</option>
              <option value="3">Floor 3 (Executive)</option>
              <option value="4">Floor 4 (Sky Suite)</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET CARD VIEW (Visible on sm/md screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filteredResidents.length === 0 ? (
          <div className="col-span-full bg-[#141414] p-8 text-center rounded-2xl border border-white/[0.08] text-[#8E8E9F]">
            No residents matching your filter criteria.
          </div>
        ) : (
          filteredResidents.map(r => {
            const isVacated = r.status === 'VACATED';
            return (
              <div
                key={r.id}
                className={`bg-[#141414] rounded-2xl border border-white/[0.08] p-5 space-y-4 shadow-lg relative overflow-hidden transition-all hover:border-white/[0.2] ${
                  isVacated ? 'opacity-70 bg-[#0B0B0C]' : ''
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                      alt={r.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/[0.1]"
                    />
                    <div>
                      <h4 className="font-heading font-bold text-white text-sm">{r.name}</h4>
                      <p className="text-[11px] font-mono text-[#8E8E9F]">{r.id}</p>
                      <p className="text-[11px] text-[#0CC6FF]">{r.college || 'Resident'}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isVacated
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-2 bg-[#0B0B0C] p-3 rounded-xl border border-white/[0.05] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#8E8E9F]">Room & Bed:</span>
                    <p className="font-bold text-white mt-0.5">
                      {isVacated ? 'Vacated' : `Room ${r.current_room_number} (Bed #${r.current_bed_number})`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E8E9F]">Monthly Fee:</span>
                    <p className="font-bold text-[#0CC6FF] mt-0.5">₹{(r.monthly_fee || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E8E9F]">Advance Escrow:</span>
                    <p className="font-bold text-[#6C4CFF] mt-0.5">₹{(r.current_advance || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E8E9F]">August Dues:</span>
                    <p className={`font-bold mt-0.5 ${r.aug_balance > 0 ? 'text-[#FF6F3C]' : 'text-emerald-400'}`}>
                      {r.aug_balance > 0 ? `₹${r.aug_balance.toLocaleString('en-IN')}` : 'Cleared'}
                    </p>
                  </div>
                </div>

                {/* Mobile action bar */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => handleSelectResident(r.id)}
                    className="flex-1 py-2 px-3 bg-[#0B0B0C] hover:bg-white/[0.06] text-white rounded-xl text-xs font-bold border border-white/[0.08] flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0CC6FF]" />
                    <span>View Profile</span>
                  </button>

                  {!isVacated && (
                    <>
                      <button
                        onClick={() => {
                          setPreselectedResidentForPayment(r);
                          setRecordPaymentModalOpen(true);
                        }}
                        title="Record Payment"
                        className="p-2 bg-[#FF1E9A]/15 text-[#FF1E9A] border border-[#FF1E9A]/30 rounded-xl hover:bg-[#FF1E9A]/25 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sendDirectWhatsApp({
                            resident: r,
                            type: 'PAYMENT_REMINDER',
                            month: 'August 2026',
                            openDirect: true
                          });
                        }}
                        title="Send WhatsApp Reminder"
                        className="p-2 bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 rounded-xl hover:bg-[#25D366]/25 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenTransfer(r)}
                        title="Transfer Room"
                        className="p-2 bg-[#0CC6FF]/15 text-[#0CC6FF] border border-[#0CC6FF]/30 rounded-xl hover:bg-[#0CC6FF]/25 transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP RESPONSIVE DATA TABLE (Hidden on mobile) */}
      <div className="hidden lg:block bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E4E4E7]">
            <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-widest border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-[#8E8E9F] hover:text-white">
                    {selectedResidentIds.length > 0 && selectedResidentIds.length === filteredResidents.length ? (
                      <CheckSquare className="w-4 h-4 text-[#FF1E9A]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">Resident</th>
                <th className="py-3.5 px-3">Room / Bed</th>
                <th className="py-3.5 px-3">Tariff</th>
                <th className="py-3.5 px-3">Advance</th>
                <th className="py-3.5 px-3">Aug Paid</th>
                <th className="py-3.5 px-3">Aug Dues</th>
                <th className="py-3.5 px-3">KYC</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#8E8E9F]">
                    No residents matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResidents.map(r => {
                  const isSelected = selectedResidentIds.includes(r.id);
                  const isVacated = r.status === 'VACATED';

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? 'bg-[#FF1E9A]/5' : ''
                      } ${isVacated ? 'opacity-60 bg-[#0B0B0C]' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleOne(r.id)}
                          className="text-[#8E8E9F] hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#FF1E9A]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Resident Info */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => handleSelectResident(r.id)}
                          className="flex items-center space-x-3 cursor-pointer group"
                        >
                          <img
                            src={r.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                            alt={r.name}
                            className="w-9 h-9 rounded-xl object-cover border border-white/[0.1] group-hover:border-[#FF1E9A] transition-colors"
                          />
                          <div>
                            <p className="font-bold text-white text-xs group-hover:text-[#FF1E9A] transition-colors">
                              {r.name}
                            </p>
                            <p className="text-[10px] text-[#8E8E9F] font-mono">
                              {r.id} • {r.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Room & Bed */}
                      <td className="py-3 px-3 font-mono">
                        {isVacated ? (
                          <span className="text-[#8E8E9F] italic text-[11px]">Unassigned</span>
                        ) : (
                          <div className="text-white">
                            <span className="font-bold text-white">Room {r.current_room_number}</span>
                            <span className="text-[10px] text-[#0CC6FF] ml-1.5 font-bold">(Bed #{r.current_bed_number})</span>
                            <p className="text-[10px] text-[#8E8E9F]">Floor {r.floor_number || 1}</p>
                          </div>
                        )}
                      </td>

                      {/* Tariff */}
                      <td className="py-3 px-3 font-mono font-bold text-[#0CC6FF]">
                        ₹{(r.monthly_fee || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Advance */}
                      <td className="py-3 px-3 font-mono text-[#6C4CFF] font-bold">
                        ₹{(r.current_advance || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Aug Paid */}
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        ₹{(r.aug_paid || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Aug Dues */}
                      <td className="py-3 px-3 font-mono">
                        {r.aug_balance > 0 ? (
                          <span className="text-[#FF6F3C] font-bold">₹{r.aug_balance.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">₹0 (Paid)</span>
                        )}
                      </td>

                      {/* KYC Status */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setUploadKYCResident(r);
                            setUploadKYCModalOpen(true);
                          }}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold transition-all hover:scale-105 ${
                            r.kyc_status === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                          }`}
                        >
                          {r.kyc_status === 'VERIFIED' ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-[#FF6F3C]" />
                          )}
                          <span>{r.kyc_status || 'PENDING'}</span>
                        </button>
                      </td>

                      {/* Active / Vacated status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isVacated
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Row Action Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleSelectResident(r.id)}
                            title="View Full Profile"
                            className="p-1.5 text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Resident"
                            className="p-1.5 text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {!isVacated && (
                            <>
                              <button
                                onClick={() => {
                                  setPreselectedResidentForPayment(r);
                                  setRecordPaymentModalOpen(true);
                                }}
                                title="Record Fee Payment"
                                className="p-1.5 text-[#FF1E9A] hover:bg-[#FF1E9A]/15 border border-[#FF1E9A]/30 rounded-lg transition-colors"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  sendDirectWhatsApp({
                                    resident: r,
                                    type: 'PAYMENT_REMINDER',
                                    month: 'August 2026',
                                    openDirect: true
                                  });
                                }}
                                title="Send WhatsApp Payment Reminder"
                                className="p-1.5 text-[#25D366] hover:bg-[#25D366]/15 border border-[#25D366]/30 rounded-lg transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenTransfer(r)}
                                title="Transfer Room / Bed"
                                className="p-1.5 text-[#0CC6FF] hover:bg-[#0CC6FF]/15 border border-[#0CC6FF]/30 rounded-lg transition-colors"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenVacate(r)}
                                title="Vacate Resident & Release Bed"
                                className="p-1.5 text-rose-400 hover:bg-rose-500/15 border border-rose-500/30 rounded-lg transition-colors"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
