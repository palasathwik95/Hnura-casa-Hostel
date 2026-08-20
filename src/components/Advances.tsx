import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';

export const Advances: React.FC = () => {
  const { advances, residents, adjustAdvance, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [adjustType, setAdjustType] = useState<'DEPOSIT' | 'DEDUCTION' | 'REFUND'>('DEPOSIT');
  const [adjustAmount, setAdjustAmount] = useState<number>(5000);
  const [adjustNotes, setAdjustNotes] = useState('');

  // Total advance held across all active and former residents
  const totalHeldAdvance = useMemo(() => {
    return advances.reduce((sum, a) => sum + a.current_advance, 0);
  }, [advances]);

  const advanceRows = useMemo(() => {
    return advances.map(adv => {
      const res = residents.find(r => r.id === adv.resident_id);
      return {
        ...adv,
        resident: res
      };
    });
  }, [advances, residents]);

  const filteredAdvances = useMemo(() => {
    return advanceRows.filter(row => {
      const q = searchTerm.toLowerCase();
      return (
        !q ||
        (row.resident && row.resident.name.toLowerCase().includes(q)) ||
        (row.resident && row.resident.id.toLowerCase().includes(q)) ||
        (row.resident && row.resident.current_room_number?.includes(q))
      );
    });
  }, [advanceRows, searchTerm]);

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || adjustAmount <= 0) {
      addToast('error', 'Invalid Input', 'Please select resident and specify a valid amount.');
      return;
    }

    try {
      await adjustAdvance({
        resident_id: selectedResidentId,
        type: adjustType,
        amount: adjustAmount,
        notes: adjustNotes || `${adjustType} recorded manually by Admin.`
      });
      setModalOpen(false);
      setAdjustNotes('');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Security Deposits & Escrow
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Advance Ledger</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Advance & Security Deposit Ledger
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Compliant escrow accounting for security deposits, damage deductions, and exit refunds.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Record Deposit / Refund</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <div className="flex items-center justify-between text-[#4CAF50]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Escrow Funds</span>
            <Wallet className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-3xl font-serif font-bold text-[#4CAF50] mt-2">
            ₹{(totalHeldAdvance || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#6B6B76] mt-1">Held across {advances.length} resident accounts</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#6B6B76] font-medium uppercase tracking-wider">Standard Advance per Bed</span>
          <p className="text-3xl font-serif font-bold text-white mt-2">₹5,000</p>
          <p className="text-xs text-[#6B6B76] mt-1">Refundable on move-out</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#6B6B76] font-medium uppercase tracking-wider">Active Ledgers</span>
          <p className="text-3xl font-serif font-bold text-[#D4AF37] mt-2">
            {advances.filter(a => a.current_advance > 0).length}
          </p>
          <p className="text-xs text-[#6B6B76] mt-1">100% audit compliant</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resident advance by name, ID, or room..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D1D1]">
            <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-mono text-[10px] tracking-wider border-b border-[#1F1F23]">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-3">Room / Bed</th>
                <th className="py-3.5 px-3">Initial Deposit</th>
                <th className="py-3.5 px-3">Total Deductions</th>
                <th className="py-3.5 px-3">Refunds</th>
                <th className="py-3.5 px-3">Current Held Balance</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {filteredAdvances.map(row => (
                <tr key={row.id} className="hover:bg-[#15151A]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={row.resident?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                        alt={row.resident?.name || 'Resident'}
                        className="w-8 h-8 rounded-full object-cover border border-[#23232A]"
                      />
                      <div>
                        <p className="font-medium text-white text-xs">{row.resident?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-[#6B6B76] font-mono">{row.resident_id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    {row.resident?.current_room_number ? (
                      <span className="font-mono text-white bg-[#15151A] px-2 py-0.5 rounded-full border border-[#23232A] text-[11px]">
                        Rm {row.resident.current_room_number}
                      </span>
                    ) : (
                      <span className="text-[#6B6B76]">Vacated</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#D1D1D1]">
                    ₹{(row.initial_deposit || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#D4AF37]">
                    ₹{(row.deductions_total || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-rose-400">
                    ₹{(row.refunds_total || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-semibold text-[#4CAF50] text-sm">
                    ₹{(row.current_advance || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                        row.status === 'HELD'
                          ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                          : 'bg-[#15151A] text-[#6B6B76] border border-[#23232A]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-xs text-[#6B6B76]">
                    {row.transactions.length} entries
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit / Refund Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Record Advance Transaction</h3>
            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6B76] mb-1">Select Resident</label>
                <select
                  value={selectedResidentId}
                  onChange={e => setSelectedResidentId(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  <option value="">-- Choose Resident --</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Room {r.current_room_number || 'Vacated'} - {r.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B6B76] mb-1">Transaction Type</label>
                  <select
                    value={adjustType}
                    onChange={e => setAdjustType(e.target.value as any)}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="DEPOSIT">Deposit (+)</option>
                    <option value="DEDUCTION">Deduction (Damage/Fine) (-)</option>
                    <option value="REFUND">Refund on Exit (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B6B76] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(Number(e.target.value))}
                    min={1}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1">Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Additional security deposit or key replacement charge"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F23]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
