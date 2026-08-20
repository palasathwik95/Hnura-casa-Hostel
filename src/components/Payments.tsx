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
  Calendar
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
        const expected = r.monthly_fee;
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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Financial Accounting & Billing
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Monthly Rent Ledger</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Fee Collection & Financial Ledger
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Automated balance tracking, advance utilization & instantaneous receipt generation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#15151A] px-3.5 py-2 rounded-full border border-[#23232A]">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#15151A] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setRecordPaymentModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Selected Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#6B6B76] font-medium uppercase tracking-wider">Total Expected</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">₹{(totalExpected || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#6B6B76] mt-1">{monthData.length} Active Residents</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#4CAF50] font-medium uppercase tracking-wider">Collected</span>
          <p className="text-2xl font-serif font-bold text-[#4CAF50] mt-2">₹{(totalCollected || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#6B6B76] mt-1">{collectionRate}% Realized</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">Pending Dues</span>
          <p className="text-2xl font-serif font-bold text-[#D4AF37] mt-2">₹{(totalOutstanding || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#6B6B76] mt-1">
            {monthData.filter(i => (i.balance || 0) > 0).length} Unsettled
          </p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#D1D1D1] font-medium uppercase tracking-wider">Collection Rate</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">{collectionRate}%</p>
          <div className="w-full bg-[#15151A] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#D4AF37] h-full rounded-full"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resident name, room, ID, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                  : 'bg-[#15151A] text-[#6B6B76] hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st === 'PENDING' ? 'Pending Dues' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D1D1]">
            <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-mono text-[10px] tracking-wider border-b border-[#1F1F23]">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-3">Room / Bed</th>
                <th className="py-3.5 px-3">Expected Fee</th>
                <th className="py-3.5 px-3">Amount Paid</th>
                <th className="py-3.5 px-3">Advance Used</th>
                <th className="py-3.5 px-3">Remaining Balance</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Payment Ref</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#6B6B76]">
                    No payment records found for this period.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ resident, payment, expected, paid, balance, status }) => (
                  <tr key={resident.id} className="hover:bg-[#15151A]/60 transition-colors">
                    {/* Resident */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={resident.photo_url}
                          alt={resident.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#23232A]"
                        />
                        <div>
                          <p className="font-medium text-white text-xs">{resident.name}</p>
                          <p className="text-[10px] text-[#6B6B76] font-mono">{resident.id} • {resident.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Room / Bed */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-white bg-[#15151A] px-2 py-0.5 rounded-full border border-[#23232A] text-[11px]">
                        Rm {resident.current_room_number} (Bed {resident.current_bed_number})
                      </span>
                    </td>

                    {/* Expected */}
                    <td className="py-3.5 px-3 font-mono text-[#D1D1D1]">
                      ₹{(expected || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-3 font-mono font-medium text-[#4CAF50]">
                      ₹{(paid || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Advance Used */}
                    <td className="py-3.5 px-3 font-mono text-[#6B6B76]">
                      ₹{(payment?.advance_used || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-3 font-mono">
                      {(balance || 0) > 0 ? (
                        <span className="text-[#D4AF37] font-semibold">₹{(balance || 0).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#4CAF50] flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                          status === 'PAID'
                            ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                            : status === 'PARTIAL'
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#6B6B76]">
                      {payment ? (
                        <div>
                          <p className="text-white">{payment.payment_method}</p>
                          <p className="text-[10px] text-[#6B6B76]">{payment.transaction_reference}</p>
                        </div>
                      ) : (
                        <span className="text-[#6B6B76]">Pending</span>
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
                            className="px-3 py-1 bg-[#D4AF37] text-black rounded-full text-[11px] font-semibold hover:brightness-110"
                          >
                            Collect
                          </button>
                        )}

                        {/* Receipt */}
                        {payment && (
                          <button
                            onClick={() => setPrintReceiptPayment(payment)}
                            title="Print Official Receipt"
                            className="p-1.5 bg-[#15151A] hover:bg-[#1F1F23] text-[#D4AF37] border border-[#23232A] rounded-full transition-colors"
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
                          className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 rounded-full transition-colors"
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
