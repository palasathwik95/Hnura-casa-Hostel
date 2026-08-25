import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { residents, rooms, payments, expenses, metrics } = useApp();

  const [activeReport, setActiveReport] = useState<'pnl' | 'occupancy' | 'collection' | 'expenses'>('pnl');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // Compute P&L statement
  const pnlData = useMemo(() => {
    const monthPayments = payments.filter(p => p.month === selectedMonth);
    const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

    const totalIncome = monthPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Group expenses by category
    const expByCategory: Record<string, number> = {};
    monthExpenses.forEach(e => {
      expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
    });

    return {
      totalIncome,
      totalExpense,
      netProfit,
      expByCategory
    };
  }, [payments, expenses, selectedMonth]);

  // Export to Excel / CSV Helper
  const downloadCSV = (filename: string, rows: string[][]) => {
    const processRow = (row: string[]) =>
      row
        .map(val => {
          let str = (val ?? '').toString();
          if (str.search(/("|,|\n)/g) >= 0) {
            str = `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',');

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeReport === 'pnl') {
      const rows = [
        ['HANURA CASA - PROFIT & LOSS STATEMENT', selectedMonth],
        ['Generated On', new Date().toLocaleString()],
        [],
        ['Category', 'Amount (INR)'],
        ['Total Resident Fee Collections (Income)', pnlData.totalIncome.toString()],
        ...Object.entries(pnlData.expByCategory).map(([cat, amt]) => [
          `Expense: ${cat}`,
          amt.toString()
        ]),
        ['Total Operating Expenses', pnlData.totalExpense.toString()],
        ['NET OPERATING PROFIT / SURPLUS', pnlData.netProfit.toString()]
      ];
      downloadCSV(`HanuraCasa_PnL_${selectedMonth}.csv`, rows);
    } else if (activeReport === 'occupancy') {
      const rows = [
        ['Room Number', 'Floor', 'Sharing Type', 'Capacity', 'Occupied', 'Vacant', 'Monthly Rent (INR)', 'Room Revenue (INR)'],
        ...rooms.map(r => [
          r.room_number,
          r.floor_number.toString(),
          r.sharing_type,
          r.capacity.toString(),
          r.occupied_beds_count.toString(),
          r.vacant_beds_count.toString(),
          r.monthly_fee.toString(),
          (r.occupied_beds_count * r.monthly_fee).toString()
        ])
      ];
      downloadCSV(`HanuraCasa_Occupancy_Report.csv`, rows);
    } else if (activeReport === 'collection') {
      const rows = [
        ['Resident ID', 'Name', 'Phone', 'Room', 'Bed', 'Expected Fee', 'Amount Paid', 'Balance', 'Status'],
        ...residents.filter(r => r.status === 'ACTIVE').map(r => {
          const p = payments.find(pay => pay.resident_id === r.id && pay.month === selectedMonth);
          const paid = p ? p.amount_paid : 0;
          const balance = Math.max(0, (r.monthly_fee || 0) - paid);
          return [
            r.id,
            r.name,
            r.phone,
            r.current_room_number || 'N/A',
            r.current_bed_number?.toString() || 'N/A',
            r.monthly_fee.toString(),
            paid.toString(),
            balance.toString(),
            balance === 0 ? 'CLEARED' : 'PENDING'
          ];
        })
      ];
      downloadCSV(`HanuraCasa_Collections_${selectedMonth}.csv`, rows);
    } else if (activeReport === 'expenses') {
      const rows = [
        ['Expense ID', 'Date', 'Category', 'Title', 'Vendor', 'Amount (INR)', 'Payment Mode'],
        ...expenses.filter(e => e.date.startsWith(selectedMonth)).map(e => [
          e.id,
          e.date,
          e.category,
          e.title,
          e.vendor || 'N/A',
          e.amount.toString(),
          e.payment_mode
        ])
      ];
      downloadCSV(`HanuraCasa_Expenses_${selectedMonth}.csv`, rows);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6F3C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              EXECUTIVE AUDIT & BUSINESS INTELLIGENCE
            </span>
            <span className="text-xs text-[#FF6F3C] font-mono font-bold">• Audited Reports</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Financial Analytics & P&L Statements
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Audited financial statements, occupancy ledgers, and downloadable Excel/CSV sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#FF1E9A] cursor-pointer"
          >
            <option value="2026-08" className="bg-[#141414]">August 2026</option>
            <option value="2026-07" className="bg-[#141414]">July 2026</option>
            <option value="2026-06" className="bg-[#141414]">June 2026</option>
            <option value="2026-05" className="bg-[#141414]">May 2026</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-[0_0_20px_rgba(255,30,154,0.3)] transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto text-xs no-scrollbar">
        {[
          { id: 'pnl', label: 'Profit & Loss Statement (P&L)' },
          { id: 'occupancy', label: 'Room Occupancy & Revenue' },
          { id: 'collection', label: 'Fee Collection & Dues' },
          { id: 'expenses', label: 'Operating & Mess Expenses' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as any)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
              activeReport === tab.id
                ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-md'
                : 'bg-[#141414] text-[#8E8E9F] hover:text-white border border-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT 1: P&L */}
      {activeReport === 'pnl' && (
        <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
            <div>
              <h3 className="text-lg font-heading font-extrabold text-white">
                Income Statement / P&L ({selectedMonth})
              </h3>
              <p className="text-xs text-[#8E8E9F]">Hanura Casa Madhapur Campus • Property Code: HC-HYD-01</p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-[#8E8E9F] font-mono">Net Operating Margin</span>
              <p className="text-2xl font-mono font-bold text-emerald-400">
                {pnlData.totalIncome > 0
                  ? `${Math.round((pnlData.netProfit / pnlData.totalIncome) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Breakdown */}
            <div className="bg-[#0B0B0C] p-5 rounded-2xl border border-white/[0.08] space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>Revenue & Inflows</span>
                <span>₹{(pnlData.totalIncome || 0).toLocaleString('en-IN')}</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-[#E4E4E7]">Hostel Resident Monthly Rent</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{(pnlData.totalIncome || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-[#8E8E9F]">
                  <span>Late Fees & Amenities</span>
                  <span className="font-mono font-bold">₹0</span>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-[#0B0B0C] p-5 rounded-2xl border border-white/[0.08] space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6F3C] flex items-center justify-between">
                <span>Operating Expenses</span>
                <span>₹{(pnlData.totalExpense || 0).toLocaleString('en-IN')}</span>
              </h4>
              <div className="space-y-2 text-xs">
                {Object.entries(pnlData.expByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-[#E4E4E7]">{cat}</span>
                    <span className="font-mono font-bold text-[#FF6F3C]">
                      ₹{Number(amt || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Net Operating Surplus */}
          <div className="bg-[#0B0B0C] p-6 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#8E8E9F] uppercase tracking-wider font-mono font-bold">Net Operating Surplus</p>
              <p className="text-xs text-[#8E8E9F] mt-0.5">Calculated strictly as Realized Fee Revenue minus All Operating Vouchers</p>
            </div>
            <p className="text-3xl font-mono font-bold text-[#FF1E9A]">
              ₹{(pnlData.netProfit || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* REPORT 2: OCCUPANCY */}
      {activeReport === 'occupancy' && (
        <div className="bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E4E4E7]">
              <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-4">Room Number</th>
                  <th className="py-3.5 px-3">Floor</th>
                  <th className="py-3.5 px-3">Sharing</th>
                  <th className="py-3.5 px-3">Capacity</th>
                  <th className="py-3.5 px-3">Occupied</th>
                  <th className="py-3.5 px-3">Vacant</th>
                  <th className="py-3.5 px-3">Monthly Rent</th>
                  <th className="py-3.5 px-4 text-right">Potential Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rooms.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{r.room_number}</td>
                    <td className="py-3.5 px-3 font-mono text-[#8E8E9F]">Floor {r.floor_number}</td>
                    <td className="py-3.5 px-3">{r.sharing_type}</td>
                    <td className="py-3.5 px-3 font-mono">{r.capacity}</td>
                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">{r.occupied_beds_count}</td>
                    <td className="py-3.5 px-3 font-mono text-[#FF6F3C] font-bold">{r.vacant_beds_count}</td>
                    <td className="py-3.5 px-3 font-mono">₹{(r.monthly_fee || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{((r.occupied_beds_count || 0) * (r.monthly_fee || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: COLLECTION */}
      {activeReport === 'collection' && (
        <div className="bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E4E4E7]">
              <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-4">Resident</th>
                  <th className="py-3.5 px-3">Room / Bed</th>
                  <th className="py-3.5 px-3">Expected Fee</th>
                  <th className="py-3.5 px-3">Amount Paid</th>
                  <th className="py-3.5 px-3">Balance</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {residents.filter(r => r.status === 'ACTIVE').map(r => {
                  const p = payments.find(pay => pay.resident_id === r.id && pay.month === selectedMonth);
                  const paid = p ? p.amount_paid : 0;
                  const balance = Math.max(0, (r.monthly_fee || 0) - paid);
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{r.name}</td>
                      <td className="py-3.5 px-3 font-mono text-[#8E8E9F]">Room {r.current_room_number} (Bed {r.current_bed_number})</td>
                      <td className="py-3.5 px-3 font-mono">₹{(r.monthly_fee || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">₹{(paid || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#FF6F3C]">₹{(balance || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          balance === 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                        }`}>
                          {balance === 0 ? 'CLEARED' : 'DUE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: EXPENSES */}
      {activeReport === 'expenses' && (
        <div className="bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E4E4E7]">
              <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-4">Title / Category</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Vendor</th>
                  <th className="py-3.5 px-3">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {expenses.filter(e => e.date.startsWith(selectedMonth)).map(e => (
                  <tr key={e.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{e.title}</p>
                      <p className="text-[10px] text-[#0CC6FF] font-mono">{e.category}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#8E8E9F]">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="py-3.5 px-3 text-[#E4E4E7]">{e.vendor || 'N/A'}</td>
                    <td className="py-3.5 px-3 font-mono text-[#8E8E9F]">{e.payment_mode}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#FF6F3C]">
                      ₹{(e.amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
