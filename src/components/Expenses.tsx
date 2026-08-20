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
      case 'GROCERY': return <ShoppingCart className="w-4 h-4 text-[#4CAF50]" />;
      case 'ELECTRICITY': return <Zap className="w-4 h-4 text-[#D4AF37]" />;
      case 'SALARIES': return <UserCheck className="w-4 h-4 text-white" />;
      case 'GAS': return <Flame className="w-4 h-4 text-[#D4AF37]" />;
      case 'INTERNET': return <Wifi className="w-4 h-4 text-[#D1D1D1]" />;
      case 'MAINTENANCE': return <Wrench className="w-4 h-4 text-rose-400" />;
      default: return <Receipt className="w-4 h-4 text-[#6B6B76]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Financial Accounting & Operations
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Expense Ledger</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Operating Expenses & Mess Procurement
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Mess grocery itemization, power bills, staff salaries, and infrastructure upkeep ledgers.
          </p>
        </div>

        <button
          onClick={() => setAddExpenseModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#6B6B76] font-medium uppercase tracking-wider">Filtered Expenses</span>
          <p className="text-2xl font-serif font-bold text-[#D4AF37] mt-2">
            ₹{(totalAmount || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B76] mt-1">{filteredExpenses.length} Vouchers Recorded</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#4CAF50] font-medium uppercase tracking-wider">Mess / Grocery</span>
          <p className="text-2xl font-serif font-bold text-[#4CAF50] mt-2">
            ₹
            {(filteredExpenses
              .filter(e => e.category === 'GROCERY')
              .reduce((s, e) => s + (e.amount || 0), 0) || 0)
              .toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B76] mt-1">Provisions & Vegetables</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">Utilities (Power/Gas)</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">
            ₹
            {(filteredExpenses
              .filter(e => e.category === 'ELECTRICITY' || e.category === 'GAS' || e.category === 'WATER')
              .reduce((s, e) => s + (e.amount || 0), 0) || 0)
              .toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B76] mt-1">Bills & Cylinders</p>
        </div>

        <div className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23]">
          <span className="text-xs text-[#D1D1D1] font-medium uppercase tracking-wider">Staff Salaries</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">
            ₹
            {(filteredExpenses
              .filter(e => e.category === 'SALARIES')
              .reduce((s, e) => s + (e.amount || 0), 0) || 0)
              .toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B76] mt-1">Cooks, Security, Wardens</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses, vendors, grocery items (e.g. Basmati rice, oil)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-[#15151A] border border-[#23232A] rounded-full px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="ALL" className="bg-[#15151A]">All Months</option>
            <option value="2026-08" className="bg-[#15151A]">August 2026</option>
            <option value="2026-07" className="bg-[#15151A]">July 2026</option>
            <option value="2026-06" className="bg-[#15151A]">June 2026</option>
            <option value="2026-05" className="bg-[#15151A]">May 2026</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#15151A] border border-[#23232A] rounded-full px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="ALL" className="bg-[#15151A]">All Categories</option>
            <option value="GROCERY" className="bg-[#15151A]">Grocery / Mess</option>
            <option value="ELECTRICITY" className="bg-[#15151A]">Electricity</option>
            <option value="SALARIES" className="bg-[#15151A]">Salaries</option>
            <option value="GAS" className="bg-[#15151A]">Gas / Kitchen</option>
            <option value="INTERNET" className="bg-[#15151A]">Internet</option>
            <option value="MAINTENANCE" className="bg-[#15151A]">Maintenance</option>
            <option value="CLEANING" className="bg-[#15151A]">Cleaning Supplies</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D1D1]">
            <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-mono text-[10px] tracking-wider border-b border-[#1F1F23]">
              <tr>
                <th className="py-3.5 px-4">Expense Title / Category</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Vendor / Payee</th>
                <th className="py-3.5 px-3">Item Breakdown</th>
                <th className="py-3.5 px-3">Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#6B6B76]">
                    No expense records matching the filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#15151A]/60 transition-colors">
                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#15151A] border border-[#23232A]">
                          {getCategoryIcon(exp.category)}
                        </div>
                        <div>
                          <p className="font-medium text-white text-xs">{exp.title}</p>
                          <p className="text-[10px] text-[#6B6B76] font-mono flex items-center space-x-1">
                            <span>{exp.id}</span>
                            <span>•</span>
                            <span className="text-[#D4AF37]">{exp.category}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 font-mono text-[#D1D1D1]">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-3 text-[#D1D1D1]">
                      {exp.vendor || 'N/A'}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3">
                      {exp.items && exp.items.length > 0 ? (
                        <div className="space-y-1">
                          {exp.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-block mr-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-[#15151A] text-[#D1D1D1] font-mono text-[10px] border border-[#23232A]"
                            >
                              {item.item_name} ({item.quantity} {item.unit}) - ₹{item.total_price}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#6B6B76] font-mono text-[10px]">Direct Voucher</span>
                      )}
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-3 font-mono text-[#6B6B76]">
                      {exp.payment_mode}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D4AF37] text-sm">
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
