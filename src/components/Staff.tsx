import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Staff } from '../types';
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  DollarSign,
  Calendar,
  CheckCircle2,
  Printer,
  Sparkles
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staff, disburseSalary, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  const filteredStaff = staff.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
  });

  const totalMonthlyPayroll = staff.reduce((sum, s) => sum + s.salary, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6C4CFF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              HUMAN RESOURCES & PAYROLL LEDGER
            </span>
            <span className="text-xs text-[#6C4CFF] font-mono font-bold">• Staff Roster</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Staff Directory & Payroll Operations
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Hostel wardens, security personnel, kitchen cooks, housekeeping & maintenance payroll records.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <div className="bg-[#0B0B0C] px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-mono text-[#E4E4E7]">
            Payroll Period: <span className="text-[#0CC6FF] font-bold">August 2026</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#8E8E9F] font-mono font-bold uppercase tracking-wider">Total Active Staff</span>
          <p className="text-3xl font-mono font-bold text-white mt-2">{staff.length}</p>
          <p className="text-xs text-[#8E8E9F] mt-1">Wardens, Cooks, Security & Housekeeping</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#FF1E9A] font-mono font-bold uppercase tracking-wider">Monthly Payroll Obligation</span>
          <p className="text-3xl font-mono font-bold text-[#FF1E9A] mt-2">
            ₹{(totalMonthlyPayroll || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#8E8E9F] mt-1">Direct expense ledger integration</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Disbursement Realization</span>
          <p className="text-3xl font-mono font-bold text-emerald-400 mt-2">
            {staff.filter(s => s.salary_history.some(h => h.month === selectedMonth)).length} / {staff.length} Paid
          </p>
          <p className="text-xs text-[#8E8E9F] mt-1">Direct Bank Wire / UPI Vouchers</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, designation, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#6C4CFF] transition-colors"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(member => {
          const paidThisMonth = member.salary_history.some(h => h.month === selectedMonth);
          const historyEntry = member.salary_history.find(h => h.month === selectedMonth);

          return (
            <div
              key={member.id}
              className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-lg"
            >
              <div>
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6C4CFF]/20 to-[#FF1E9A]/20 border border-white/[0.08] flex items-center justify-center text-[#FF1E9A] font-bold text-sm font-mono">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{member.name}</h3>
                    <p className="text-xs text-[#0CC6FF] font-medium">{member.role}</p>
                    <p className="text-[10px] text-[#8E8E9F] font-mono">{member.id} • {member.phone}</p>
                  </div>
                </div>

                <div className="mt-4 bg-[#0B0B0C] p-3 rounded-xl border border-white/[0.06] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8E8E9F]">Monthly Salary:</span>
                    <span className="text-emerald-400 font-bold">₹{(member.salary || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E9F]">Joining Date:</span>
                    <span className="text-[#E4E4E7]">{member.joining_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E9F]">August Status:</span>
                    <span className={`font-bold ${paidThisMonth ? 'text-emerald-400' : 'text-[#FF6F3C]'}`}>
                      {paidThisMonth ? '✓ Disbursed' : '● Due for Disbursement'}
                    </span>
                  </div>
                  {historyEntry && (
                    <div className="pt-1 text-[10px] text-[#8E8E9F]">
                      Ref: {historyEntry.reference} ({new Date(historyEntry.paid_at || Date.now()).toLocaleDateString()})
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    member.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08]'
                  }`}
                >
                  {member.status}
                </span>

                {!paidThisMonth ? (
                  <button
                    onClick={() => {
                      if (confirm(`Disburse ₹${(member.salary || 0).toLocaleString('en-IN')} to ${member.name} for ${selectedMonth}?`)) {
                        disburseSalary({
                          staff_id: member.id,
                          month: selectedMonth,
                          amount: member.salary,
                          payment_mode: 'UPI'
                        });
                      }
                    }}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md transition-all"
                  >
                    Disburse Salary
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Paid Full</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
