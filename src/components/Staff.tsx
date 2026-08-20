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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Human Resources & Payroll
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Staff Roster</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Staff Directory & Payroll Operations
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Hostel wardens, security personnel, kitchen cooks, housekeeping & maintenance payroll records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#15151A] px-4 py-2 rounded-full border border-[#23232A] text-xs font-mono text-[#D1D1D1]">
            Payroll Period: <span className="text-[#D4AF37] font-bold">August 2026</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#6B6B76] font-medium uppercase tracking-wider">Total Active Staff</span>
          <p className="text-3xl font-serif font-bold text-white mt-2">{staff.length}</p>
          <p className="text-xs text-[#6B6B76] mt-1">Wardens, Cooks, Security & Housekeeping</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">Monthly Payroll Obligation</span>
          <p className="text-3xl font-serif font-bold text-[#D4AF37] mt-2">
            ₹{(totalMonthlyPayroll || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#6B6B76] mt-1">Automated expense integration</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#4CAF50] font-medium uppercase tracking-wider">Payroll Status</span>
          <p className="text-3xl font-serif font-bold text-[#4CAF50] mt-2">
            {staff.filter(s => s.salary_history.some(h => h.month === selectedMonth)).length} / {staff.length} Paid
          </p>
          <p className="text-xs text-[#6B6B76] mt-1">Direct Bank Wire / UPI</p>
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
              className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-4 flex flex-col justify-between hover:border-[#2A2A32] transition-colors"
            >
              <div>
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-[#15151A] border border-[#23232A] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{member.name}</h3>
                    <p className="text-xs text-[#D4AF37]">{member.role}</p>
                    <p className="text-[10px] text-[#6B6B76] font-mono">{member.id} • {member.phone}</p>
                  </div>
                </div>

                <div className="mt-4 bg-[#15151A] p-3 rounded-xl border border-[#23232A] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B76]">Monthly Salary:</span>
                    <span className="text-[#4CAF50] font-medium">₹{(member.salary || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B76]">Joining Date:</span>
                    <span className="text-[#D1D1D1]">{member.joining_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B76]">August Status:</span>
                    <span className={`font-medium ${paidThisMonth ? 'text-[#4CAF50]' : 'text-[#D4AF37]'}`}>
                      {paidThisMonth ? '✓ Disbursed' : '● Due for Disbursement'}
                    </span>
                  </div>
                  {historyEntry && (
                    <div className="pt-1 text-[10px] text-[#6B6B76]">
                      Ref: {historyEntry.reference} ({new Date(historyEntry.paid_at || Date.now()).toLocaleDateString()})
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1F1F23] flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    member.status === 'ACTIVE'
                      ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                      : 'bg-[#15151A] text-[#6B6B76] border border-[#23232A]'
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
                    className="px-3.5 py-1.5 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110"
                  >
                    Disburse Salary
                  </button>
                ) : (
                  <span className="text-xs text-[#4CAF50] font-medium flex items-center space-x-1">
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
