import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import {
  Receipt,
  Search,
  Plus,
  ShoppingCart,
  Zap,
  UserCheck,
  Flame,
  Wifi,
  Wrench,
  Sparkles,
  Calendar,
  Filter
} from 'lucide-react';

export const Expenses: React.FC = () => {
  const { expenses, setAddExpenseModalOpen } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (selectedMonth !== 'ALL' && !e.date.startsWith(selectedMonth)) return false;
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;

      const q = searchTerm.toLowerCase();
      if (!q) return true;

      return (
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.vendor?.toLowerCase().includes(q) ||
        e.items?.some(i => i.item_name.toLowerCase().includes(q))
      );
    });
  }, [expenses, selectedMonth, categoryFilter, searchTerm]);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GROCERY': return <ShoppingCart className="w-4 h-4 text-[#0CC6FF]" />;
      case 'ELECTRICITY': return <Zap className="w-4 h-4 text-[#FF6F3C]" />;
      case 'SALARIES': return <UserCheck className="w-4 h-4 text-[#FF1E9A]" />;
      case 'GAS': return <Flame className="w-4 h-4 text-[#FF6F3C]" />;
      case 'INTERNET': return <Wifi className="w-4 h-4 text-[#6C4CFF]" />;
      case 'MAINTENANCE': return <Wrench className="w-4 h-4 text-rose-400" />;
      default: return <Receipt className="w-4 h-4 text-[#8E8E9F]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6F3C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              OPERATING OUTFLOWS & PROCUREMENT
            </span>
            <span className="text-xs text-[#FF6F3C] font-mono font-bold">• Expense Ledger</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Operating Expenses & Mess Procurement
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Mess grocery itemization, power bills, staff salaries, and infrastructure upkeep ledgers.
          </p>
        </div>

        <button
          onClick={() => setAddExpenseModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all z-10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#8E8E9F] font-mono font-bold uppercase tracking-wider">Filtered Outflow</span>
          <p className="text-2xl font-mono font-bold text-[#FF6F3C] mt-2">
            ₹{(totalAmount || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">{filteredExpenses.length} Vouchers Recorded</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#0CC6FF] font-mono font-bold uppercase tracking-wider">Mess / Grocery</span>
          <p className="text-2xl font-mono font-bold text-[#0CC6FF] mt-2">
            ₹
            {(filteredExpenses
              .filter(e => e.category === 'GROCERY')
              .reduce((s, e) => s + (e.amount || 0), 0) || 0)
              .toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">Provisions & Vegetables</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#FF6F3C] font-mono font-bold uppercase tracking-wider">Utilities (Power/Gas)</span>
          <p className="text-2xl font-mono font-bold text-white mt-2">
            ₹
            {(filteredExpenses
              .filter(e => e.category === 'ELECTRICITY' || e.category === 'GAS' || e.category === 'WATER')
              .reduce((s, e) => s + (e.amount || 0), 0) || 0)
              .toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">Bills & Cylinders</p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-[11px] text-[#FF1E9A] font-mono font-bold uppercase tracking-wider">Staff Salaries</span>
          <p className="text-2xl font-mono font-bold text-white mt-2">
            ₹
            {(filteredExpenses
              .filter(e => e.category === 'SALARIES')
              .reduce((s, e) => s + (e.amount || 0), 0) || 0)
              .toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8E8E9F] mt-1">Cooks, Security, Wardens</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses, vendors, grocery items (e.g. Basmati rice, oil)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#FF1E9A] cursor-pointer"
          >
            <option value="ALL" className="bg-[#141414]">All Months</option>
            <option value="2026-08" className="bg-[#141414]">August 2026</option>
            <option value="2026-07" className="bg-[#141414]">July 2026</option>
            <option value="2026-06" className="bg-[#141414]">June 2026</option>
            <option value="2026-05" className="bg-[#141414]">May 2026</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#FF1E9A] cursor-pointer"
          >
            <option value="ALL" className="bg-[#141414]">All Categories</option>
            <option value="GROCERY" className="bg-[#141414]">Grocery / Mess</option>
            <option value="ELECTRICITY" className="bg-[#141414]">Electricity</option>
            <option value="SALARIES" className="bg-[#141414]">Salaries</option>
            <option value="GAS" className="bg-[#141414]">Gas / Kitchen</option>
            <option value="INTERNET" className="bg-[#141414]">Internet</option>
            <option value="MAINTENANCE" className="bg-[#141414]">Maintenance</option>
            <option value="CLEANING" className="bg-[#141414]">Cleaning Supplies</option>
          </select>
        </div>
      </div>

      {/* Responsive Card Grid (Mobile/Tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filteredExpenses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#8E8E9F] bg-[#141414] rounded-2xl border border-white/[0.08]">
            No expense records matching the filters.
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#0B0B0C] border border-white/[0.08]">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{exp.title}</h4>
                    <p className="text-[10px] text-[#8E8E9F] font-mono">
                      {exp.id} • {exp.category}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#FF6F3C] text-sm">
                  ₹{(exp.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-xs text-[#8E8E9F] flex items-center justify-between pt-1">
                <span>Vendor: {exp.vendor || 'N/A'}</span>
                <span className="font-mono">{new Date(exp.date).toLocaleDateString()}</span>
              </div>

              {exp.items && exp.items.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {exp.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#0B0B0C] text-[#E4E4E7] font-mono text-[10px] border border-white/[0.06]"
                    >
                      {item.item_name} ({item.quantity} {item.unit}) - ₹{item.total_price}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E4E4E7]">
            <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Expense Title / Category</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Vendor / Payee</th>
                <th className="py-3.5 px-3">Item Breakdown</th>
                <th className="py-3.5 px-3">Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#8E8E9F]">
                    No expense records matching the filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#0B0B0C] border border-white/[0.08]">
                          {getCategoryIcon(exp.category)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{exp.title}</p>
                          <p className="text-[10px] text-[#8E8E9F] font-mono flex items-center space-x-1">
                            <span>{exp.id}</span>
                            <span>•</span>
                            <span className="text-[#FF6F3C] font-bold">{exp.category}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 font-mono text-[#E4E4E7]">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-3 text-[#E4E4E7]">
                      {exp.vendor || 'N/A'}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3">
                      {exp.items && exp.items.length > 0 ? (
                        <div className="space-y-1">
                          {exp.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-block mr-1.5 mb-1 px-2.5 py-0.5 rounded-lg bg-[#0B0B0C] text-[#E4E4E7] font-mono text-[10px] border border-white/[0.08]"
                            >
                              {item.item_name} ({item.quantity} {item.unit}) - ₹{item.total_price}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#8E8E9F] font-mono text-[10px]">Direct Voucher</span>
                      )}
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-3 font-mono text-[#8E8E9F]">
                      {exp.payment_mode}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#FF6F3C] text-sm">
                      ₹{(exp.amount || 0).toLocaleString('en-IN')}
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
