import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Payment } from '../types';
import {
  Search,
  Filter,
  CreditCard,
  Printer,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  TrendingUp,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

export const Payments: React.FC = () => {
  const {
    payments,
    residents,
    setRecordPaymentModalOpen,
    setPreselectedResidentForPayment,
    setPrintReceiptPayment,
    sendWhatsApp,
    sendDirectWhatsApp
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING'>('ALL');

  const monthOptions = [
    { value: '2026-08', label: 'August 2026 (Current)' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' }
  ];

  // Derive all active residents status for the selected month
  const monthData = useMemo(() => {
    return residents
      .filter(r => r.status === 'ACTIVE')
      .map(r => {
        const payment = payments.find(p => p.resident_id === r.id && p.month === selectedMonth);
        const paid = payment ? payment.amount_paid : 0;
        const expected = r.monthly_fee || 0;
        const balance = Math.max(0, expected - paid);

        let status: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
        if (paid >= expected) status = 'PAID';
        else if (paid > 0) status = 'PARTIAL';

        return {
          resident: r,
          payment,
          expected,
          paid,
          balance,
          status
        };
      });
  }, [residents, payments, selectedMonth]);

  // Aggregate KPI metrics for this selected month
  const totalExpected = monthData.reduce((sum, item) => sum + item.expected, 0);
  const totalCollected = monthData.reduce((sum, item) => sum + item.paid, 0);
  const totalOutstanding = monthData.reduce((sum, item) => sum + item.balance, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return monthData.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        item.resident.name.toLowerCase().includes(q) ||
        item.resident.id.toLowerCase().includes(q) ||
        (item.resident.current_room_number && item.resident.current_room_number.includes(q)) ||
        item.resident.phone.includes(q);

      if (!matchSearch) return false;

      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      return true;
    });
  }, [monthData, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Month Selector */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF1E9A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              TREASURY & FEE MANAGEMENT
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono font-bold">• Monthly Ledger</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Fee Collection & Financial Ledger
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Automated balance tracking, rent collection, and instant WhatsApp receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="flex items-center space-x-2 bg-[#0B0B0C] px-3.5 py-2 rounded-xl border border-white/[0.08]">
            <Calendar className="w-4 h-4 text-[#0CC6FF]" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#141414] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setRecordPaymentModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Selected Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#8E8E9F] font-mono font-bold uppercase tracking-wider">Total Expected</span>
          <p className="text-2xl font-mono font-bold text-white mt-2">₹{(totalExpected || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">{monthData.length} Active Residents</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Collected</span>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-2">₹{(totalCollected || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">{collectionRate}% Realized</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#FF6F3C] font-mono font-bold uppercase tracking-wider">Pending Dues</span>
          <p className="text-2xl font-mono font-bold text-[#FF6F3C] mt-2">₹{(totalOutstanding || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">
            {monthData.filter(i => (i.balance || 0) > 0).length} Unsettled
          </p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#0CC6FF] font-mono font-bold uppercase tracking-wider">Realization Rate</span>
          <p className="text-2xl font-mono font-bold text-white mt-2">{collectionRate}%</p>
          <div className="w-full bg-[#0B0B0C] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] h-full rounded-full"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resident name, room, ID, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-md'
                  : 'bg-[#0B0B0C] text-[#8E8E9F] hover:text-white border border-white/[0.05]'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st === 'PENDING' ? 'Pending Dues' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Card Grid (Mobile/Tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filteredRows.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#8E8E9F] bg-[#141414] rounded-2xl border border-white/[0.08]">
            No payment records found for this period.
          </div>
        ) : (
          filteredRows.map(({ resident, payment, expected, paid, balance, status }) => (
            <div key={resident.id} className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={resident.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt={resident.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{resident.name}</h4>
                    <p className="text-[10px] text-[#8E8E9F] font-mono">
                      Rm {resident.current_room_number} (Bed #{resident.current_bed_number})
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    status === 'PAID'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : status === 'PARTIAL'
                      ? 'bg-[#0CC6FF]/15 text-[#0CC6FF] border border-[#0CC6FF]/30'
                      : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#0B0B0C] p-3 rounded-xl border border-white/[0.06] text-xs">
                <div>
                  <span className="text-[10px] text-[#8E8E9F] block">Fee</span>
                  <span className="font-mono font-bold text-white">₹{(expected || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E8E9F] block">Paid</span>
                  <span className="font-mono font-bold text-emerald-400">₹{(paid || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E8E9F] block">Balance</span>
                  <span className={`font-mono font-bold ${balance > 0 ? 'text-[#FF6F3C]' : 'text-emerald-400'}`}>
                    ₹{(balance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#8E8E9F] font-mono">
                  {payment ? `${payment.payment_method} • ${payment.transaction_reference}` : 'Unpaid'}
                </span>

                <div className="flex items-center space-x-2">
                  {balance > 0 && (
                    <button
                      onClick={() => {
                        setPreselectedResidentForPayment(resident);
                        setRecordPaymentModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110"
                    >
                      Collect
                    </button>
                  )}

                  {payment && (
                    <button
                      onClick={() => setPrintReceiptPayment(payment)}
                      title="Print Official Receipt"
                      className="p-2 bg-[#0B0B0C] hover:bg-white/[0.06] text-[#FF1E9A] border border-white/[0.08] rounded-xl transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sendDirectWhatsApp({
                        resident,
                        payment,
                        type: balance > 0 ? 'PAYMENT_REMINDER' : 'PAYMENT_CONFIRMATION',
                        balance,
                        month: selectedMonth,
                        openDirect: true
                      });
                    }}
                    title={`Send Direct WhatsApp (${resident.phone})`}
                    className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 rounded-xl transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Payment Table */}
      <div className="hidden lg:block bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E4E4E7]">
            <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-3">Room / Bed</th>
                <th className="py-3.5 px-3">Expected Fee</th>
                <th className="py-3.5 px-3">Amount Paid</th>
                <th className="py-3.5 px-3">Remaining Balance</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Payment Ref</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#8E8E9F]">
                    No payment records found for this period.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ resident, payment, expected, paid, balance, status }) => (
                  <tr key={resident.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Resident */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={resident.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                          alt={resident.name}
                          className="w-8 h-8 rounded-xl object-cover border border-white/[0.08]"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{resident.name}</p>
                          <p className="text-[10px] text-[#8E8E9F] font-mono">{resident.id} • {resident.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Room / Bed */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-white bg-[#0B0B0C] px-2.5 py-1 rounded-xl border border-white/[0.08] text-[11px] font-bold">
                        Rm {resident.current_room_number} (Bed #{resident.current_bed_number})
                      </span>
                    </td>

                    {/* Expected */}
                    <td className="py-3.5 px-3 font-mono text-[#E4E4E7]">
                      ₹{(expected || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      ₹{(paid || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-3 font-mono">
                      {(balance || 0) > 0 ? (
                        <span className="text-[#FF6F3C] font-bold">₹{(balance || 0).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center space-x-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          status === 'PAID'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : status === 'PARTIAL'
                            ? 'bg-[#0CC6FF]/15 text-[#0CC6FF] border border-[#0CC6FF]/30'
                            : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#8E8E9F]">
                      {payment ? (
                        <div>
                          <p className="text-white font-medium">{payment.payment_method}</p>
                          <p className="text-[10px] text-[#8E8E9F]">{payment.transaction_reference}</p>
                        </div>
                      ) : (
                        <span className="text-[#8E8E9F]">Pending</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Collect / Record */}
                        {balance > 0 && (
                          <button
                            onClick={() => {
                              setPreselectedResidentForPayment(resident);
                              setRecordPaymentModalOpen(true);
                            }}
                            className="px-3.5 py-1 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-[11px] font-bold hover:brightness-110 shadow-sm"
                          >
                            Collect
                          </button>
                        )}

                        {/* Receipt */}
                        {payment && (
                          <button
                            onClick={() => setPrintReceiptPayment(payment)}
                            title="Print Official Receipt"
                            className="p-1.5 bg-[#0B0B0C] hover:bg-white/[0.06] text-[#FF1E9A] border border-white/[0.08] rounded-xl transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* WhatsApp Direct Dispatch */}
                        <button
                          onClick={() => {
                            sendDirectWhatsApp({
                              resident,
                              payment,
                              type: balance > 0 ? 'PAYMENT_REMINDER' : 'PAYMENT_CONFIRMATION',
                              balance,
                              month: selectedMonth,
                              openDirect: true
                            });
                          }}
                          title={`Send Direct WhatsApp (${resident.phone})`}
                          className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 rounded-xl transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
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
  );
};
