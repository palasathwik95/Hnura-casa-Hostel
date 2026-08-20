import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Resident, Payment } from '../types';
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
  Square
} from 'lucide-react';

interface ResidentsProps {
  onSelectResident: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenTransferModal: (resident: Resident) => void;
  onOpenVacateModal: (resident: Resident) => void;
  onOpenEditModal: (resident: Resident) => void;
}

export const Residents: React.FC<ResidentsProps> = ({
  onSelectResident,
  onOpenAddModal,
  onOpenTransferModal,
  onOpenVacateModal,
  onOpenEditModal
}) => {
  const {
    residents,
    payments,
    advances,
    setRecordPaymentModalOpen,
    setPreselectedResidentForPayment,
    sendWhatsApp,
    sendDirectWhatsApp,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'VACATED' | 'PENDING_PAYMENT' | 'PAID' | 'KYC_PENDING' | 'KYC_VERIFIED'>('ACTIVE');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [bulkActionSending, setBulkActionSending] = useState(false);

  // Calculate current month (2026-08) financials for each resident
  const residentsWithFinancials = useMemo(() => {
    return residents.map(r => {
      const currentMonthPayment = payments.find(p => p.resident_id === r.id && p.month === '2026-08');
      const adv = advances.find(a => a.resident_id === r.id);
      const paid = currentMonthPayment ? currentMonthPayment.amount_paid : 0;
      const expected = r.monthly_fee;
      const balance = r.status === 'ACTIVE' ? Math.max(0, expected - paid) : 0;

      let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      if (paid >= expected) paymentStatus = 'PAID';
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

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23]">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Registry Management
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• {filteredResidents.length} Showing</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Resident Directory & Accommodations
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Complete lifecycle management with synchronized room assignments and non-destructive vacating rules.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {selectedResidentIds.length > 0 && (
            <button
              onClick={handleBulkWhatsApp}
              disabled={bulkActionSending}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#15151A] text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/10 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast WhatsApp ({selectedResidentIds.length})</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#F2E3B5] active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resident</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4">
        {/* Status Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
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
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                  : 'bg-[#15151A] text-[#6B6B76] hover:text-white hover:bg-[#1F1F23] border border-[#23232A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Floor Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-3 relative">
            <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone number, resident ID (e.g. RES-1001), room (e.g. 204), college..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div>
            <select
              value={floorFilter}
              onChange={e => setFloorFilter(e.target.value)}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
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

      {/* Main Resident Table */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D1D1]">
            <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-semibold text-[10px] tracking-widest border-b border-[#1F1F23]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-[#6B6B76] hover:text-white">
                    {selectedResidentIds.length > 0 && selectedResidentIds.length === filteredResidents.length ? (
                      <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">Resident</th>
                <th className="py-3.5 px-3">Suite / Bed</th>
                <th className="py-3.5 px-3">Occupancy</th>
                <th className="py-3.5 px-3">Tariff</th>
                <th className="py-3.5 px-3">Advance</th>
                <th className="py-3.5 px-3">Aug Paid</th>
                <th className="py-3.5 px-3">Aug Balance</th>
                <th className="py-3.5 px-3">KYC</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#6B6B76]">
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
                      className={`hover:bg-[#15151A]/60 transition-colors ${
                        isSelected ? 'bg-[#D4AF37]/5' : ''
                      } ${isVacated ? 'opacity-60 bg-[#0A0A0B]' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleOne(r.id)}
                          className="text-[#6B6B76] hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Resident Info */}
                      <td className="py-3 px-3">
                        <div
                          className="flex items-center space-x-3 cursor-pointer group"
                          onClick={() => onSelectResident(r.id)}
                        >
                          <img
                            src={r.photo_url}
                            alt={r.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#23232A] group-hover:border-[#D4AF37] transition-colors"
                          />
                          <div>
                            <p className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors text-sm">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-[#6B6B76] font-mono flex items-center space-x-1">
                              <span>{r.id}</span>
                              <span>•</span>
                              <span>{r.phone}</span>
                            </p>
                            {r.college && (
                              <p className="text-[10px] text-[#6B6B76] truncate max-w-[160px]">{r.college}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Room / Bed */}
                      <td className="py-3 px-3">
                        {isVacated ? (
                          <span className="text-[#6B6B76] font-mono text-xs">Vacated (Released)</span>
                        ) : (
                          <div>
                            <span className="font-medium text-white font-mono bg-[#15151A] px-2 py-0.5 rounded border border-[#23232A]">
                              Rm {r.current_room_number}
                            </span>
                            <p className="text-[10px] text-[#D4AF37] font-mono mt-0.5">
                              Bed {r.current_bed_number} (Fl {r.floor_number})
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Sharing Type */}
                      <td className="py-3 px-3">
                        <span className="text-xs text-[#A1A1AA] bg-[#15151A] px-2.5 py-1 rounded border border-[#1F1F23]">
                          {r.sharing_type}
                        </span>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3 px-3 font-mono font-medium text-white">
                        ₹{(r.monthly_fee || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Current Advance */}
                      <td className="py-3 px-3 font-mono text-[#D4AF37]">
                        ₹{(r.current_advance || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Aug Paid */}
                      <td className="py-3 px-3 font-mono font-medium text-[#4CAF50]">
                        ₹{(r.aug_paid || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Aug Balance */}
                      <td className="py-3 px-3 font-mono">
                        {isVacated ? (
                          <span className="text-[#6B6B76]">N/A</span>
                        ) : (r.aug_balance || 0) > 0 ? (
                          <span className="text-[#D4AF37] font-bold">₹{(r.aug_balance || 0).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-[#4CAF50] font-medium flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        )}
                      </td>

                      {/* KYC Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider ${
                            r.kyc_status === 'VERIFIED'
                              ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                              : r.kyc_status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                          }`}
                        >
                          {r.kyc_status}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider ${
                            r.status === 'ACTIVE'
                              ? 'bg-[#15151A] text-white border border-[#23232A]'
                              : 'bg-[#0A0A0B] text-[#6B6B76] border border-[#1F1F23]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Record Payment */}
                          {r.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                setPreselectedResidentForPayment(r);
                                setRecordPaymentModalOpen(true);
                              }}
                              title="Record Payment"
                              className="p-1.5 rounded-lg bg-[#15151A] text-[#4CAF50] border border-[#23232A] hover:bg-[#4CAF50]/20 transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Transfer Room */}
                          {r.status === 'ACTIVE' && (
                            <button
                              onClick={() => onOpenTransferModal(r)}
                              title="Transfer Room"
                              className="p-1.5 rounded-lg bg-[#15151A] text-[#D1D1D1] border border-[#23232A] hover:text-[#D4AF37] transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Send Direct WhatsApp */}
                          <button
                            onClick={() => {
                              sendDirectWhatsApp({
                                resident: r,
                                type: r.aug_balance > 0 ? 'PAYMENT_REMINDER' : 'PAYMENT_CONFIRMATION',
                                balance: r.aug_balance,
                                month: 'August 2026',
                                openDirect: true
                              });
                            }}
                            title={`Send Direct WhatsApp (${r.phone})`}
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* View Profile */}
                          <button
                            onClick={() => onSelectResident(r.id)}
                            title="View Complete Profile"
                            className="p-1.5 rounded-lg bg-[#15151A] text-[#D1D1D1] border border-[#23232A] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark Vacated */}
                          {r.status === 'ACTIVE' && (
                            <button
                              onClick={() => onOpenVacateModal(r)}
                              title="Mark as Vacated"
                              className="p-1.5 rounded-lg bg-[#15151A] text-rose-400 border border-[#23232A] hover:bg-rose-500/20 transition-colors"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Profile */}
                          <button
                            onClick={() => onOpenEditModal(r)}
                            title="Edit Resident"
                            className="p-1.5 rounded-lg bg-[#15151A] text-[#6B6B76] border border-[#23232A] hover:text-white transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
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
