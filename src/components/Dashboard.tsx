import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  Wrench,
  MessageSquareWarning,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Sparkles,
  ChevronRight,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    metrics,
    residents,
    rooms,
    payments,
    expenses,
    staff,
    salaryPayments,
    maintenanceRequests,
    setActiveTab,
    setSelectedResidentId,
    setRecordPaymentModalOpen,
    setPreselectedResidentForPayment,
    sendWhatsApp,
    sendDirectWhatsApp
  } = useApp();

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-white/50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF1E9A]" />
      </div>
    );
  }

  // Format currency in Indian format
  const formatINR = (val?: number | null) => {
    return `₹${(val ?? 0).toLocaleString('en-IN')}`;
  };

  // Prepare Chart Data from real DB payments and expenses across recent months
  const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
  const monthLabels: Record<string, string> = {
    '2026-04': 'Apr',
    '2026-05': 'May',
    '2026-06': 'Jun',
    '2026-07': 'Jul',
    '2026-08': 'Aug'
  };

  const revenueVsExpenseData = months.map(m => {
    const monthPayments = payments.filter(p => p.month === m);
    const monthExpenses = expenses.filter(e => e.date.startsWith(m));
    const revenue = monthPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const net = revenue - expense;

    return {
      month: monthLabels[m] || m,
      Revenue: revenue,
      Expenses: expense,
      Net: net
    };
  });

  // Expense Categories Pie Data
  const expenseCatMap: Record<string, number> = {};
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith('2026-08'));
  currentMonthExpenses.forEach(e => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });

  const pieColors = ['#FF1E9A', '#0CC6FF', '#FF6F3C', '#6C4CFF', '#10B981', '#F59E0B', '#8B5CF6'];
  const expensePieData = Object.entries(expenseCatMap).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value
  }));

  // Attention Required Lists
  const activeResidents = residents.filter(r => r.status === 'ACTIVE');
  
  // Pending fee residents for Aug 2026
  const pendingResidents = activeResidents.map(r => {
    const payment = payments.find(p => p.resident_id === r.id && p.month === '2026-08');
    const paid = payment ? payment.amount_paid : 0;
    const balance = Math.max(0, (r.monthly_fee || 0) - paid);
    return { resident: r, paid, expected: r.monthly_fee, balance };
  }).filter(item => item.balance > 0);

  // Unpaid staff for current month
  const unpaidStaff = staff.filter(s => !salaryPayments.some(payment => payment.staff_id === s.id && payment.month === '2026-08'));

  // Pending maintenance
  const openMaintenance = maintenanceRequests.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Summary Hero Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF1E9A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0CC6FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              TELEMETRY & OPERATIONS
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono">• August 2026</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white mt-1">
            Executive Overview & Portfolio Status
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1.5 max-w-xl">
            Live database telemetry across all suites, {metrics.total_beds} bed inventories, and treasury ledgers.
          </p>
        </div>

        {/* Collection Performance Gauge */}
        <div className="flex items-center space-x-4 bg-[#0B0B0C] px-5 py-4 rounded-2xl border border-white/[0.08] shadow-inner z-10">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#8E8E9F] font-mono font-bold">Aug Realization</p>
            <p className="text-2xl font-bold text-white font-mono">{metrics.collection_rate}<span className="text-[#FF1E9A]">%</span></p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF1E9A] to-[#6C4CFF] p-[2px] shadow-[0_0_15px_rgba(255,30,154,0.3)]">
            <div className="w-full h-full bg-[#0B0B0C] rounded-[10px] flex items-center justify-center text-xs font-mono font-bold text-white">
              {metrics.collection_rate}%
            </div>
          </div>
        </div>
      </div>

      {/* 10 Executive KPI Cards in Hanura Media Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Beds */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#0CC6FF]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Total Beds</span>
            <Building2 className="w-3.5 h-3.5 text-[#0CC6FF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono mb-1">{metrics.total_beds}</div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">4 Floors Configured</div>
        </div>

        {/* Occupied Beds */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-emerald-500/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Occupied</span>
            <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono mb-1">{metrics.occupied_beds}</div>
          <div className="text-[11px] text-emerald-400 font-medium font-mono">{metrics.occupancy_rate}% occupancy</div>
        </div>

        {/* Vacant Beds */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#0CC6FF]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Vacant</span>
            <Building2 className="w-3.5 h-3.5 text-[#0CC6FF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0CC6FF] font-mono mb-1">{metrics.vacant_beds}</div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">Ready for Intake</div>
        </div>

        {/* Active Residents */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#6C4CFF]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Active Residents</span>
            <Users className="w-3.5 h-3.5 text-[#6C4CFF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono mb-1">{metrics.active_residents}</div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">{metrics.former_residents} Archived</div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#FF1E9A]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Utilization</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#FF1E9A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono mb-1">{metrics.occupancy_rate}<span className="text-[#FF1E9A]">%</span></div>
          <div className="h-1.5 w-full bg-[#0B0B0C] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] rounded-full" style={{ width: `${Math.min(100, metrics.occupancy_rate)}%` }} />
          </div>
        </div>

        {/* Expected Monthly Collection */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#0CC6FF]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Expected Fees</span>
            <CreditCard className="w-3.5 h-3.5 text-[#0CC6FF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mb-1">
            {formatINR(metrics.expected_monthly_collection)}
          </div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">August Total</div>
        </div>

        {/* Collected This Month */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-emerald-500/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1.5 flex items-center justify-between">
            <span>Realized (Aug)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mb-1">
            {formatINR(metrics.collected_this_month)}
          </div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">UPI, Bank & Cash</div>
        </div>

        {/* Pending Amount */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#FF6F3C]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF6F3C] mb-1.5 flex items-center justify-between">
            <span>Pending Dues</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF6F3C] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#FF6F3C] font-mono mb-1">
            {formatINR(metrics.pending_amount)}
          </div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">{pendingResidents.length} Pending</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#6C4CFF]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] mb-1.5 flex items-center justify-between">
            <span>Aug Outflows</span>
            <Receipt className="w-3.5 h-3.5 text-[#6C4CFF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mb-1">
            {formatINR(metrics.total_expenses)}
          </div>
          <div className="text-[11px] text-[#8E8E9F] font-medium">Mess, Utilities, Staff</div>
        </div>

        {/* Net Operating Income */}
        <div className="bg-[#141414] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:border-[#FF1E9A]/40 transition-all shadow-lg group">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF1E9A] mb-1.5 flex items-center justify-between">
            <span>Net Operating</span>
            <Wallet className="w-3.5 h-3.5 text-[#FF1E9A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mb-1">
            {formatINR(metrics.net_operating_amount)}
          </div>
          <div className="text-[11px] text-[#FF1E9A] font-medium font-mono">Net Operating Margin</div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Trend (2 columns) */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/[0.08] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-bold mb-1">CASHFLOW TRAJECTORY</div>
              <h3 className="text-base font-heading font-bold text-white">Monthly Fee Inflows vs Operating Outflows</h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-[10px] text-[#0CC6FF] border border-[#0CC6FF]/30 px-3.5 py-1.5 rounded-xl uppercase font-mono font-bold hover:bg-[#0CC6FF]/10 transition-colors"
            >
              Detailed P&L
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsExpenseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#8E8E9F" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8E8E9F"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0B0C', borderColor: '#23232A', borderRadius: '12px', color: '#FFF' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                <Bar dataKey="Revenue" fill="#FF1E9A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#6C4CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution (1 column) */}
        <div className="bg-[#141414] border border-white/[0.08] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-bold mb-1">ALLOCATION MATRIX</div>
                <h3 className="text-base font-heading font-bold text-white">August Outflows Breakdown</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#FF6F3C]">{formatINR(metrics.total_expenses)}</span>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0C', borderColor: '#23232A', borderRadius: '12px', color: '#FFF' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/[0.06]">
            {expensePieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                <span className="text-[#8E8E9F] truncate">{entry.name}:</span>
                <span className="font-mono text-white font-bold">{formatINR(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ATTENTION REQUIRED SECTION */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-bold mb-1">OPERATIONAL DIAGNOSTICS</div>
            <h3 className="text-base font-heading font-bold text-white">Priority Action Queue & Triage</h3>
          </div>
          <span className="text-[10px] font-mono text-[#FF1E9A] border border-[#FF1E9A]/30 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
            {pendingResidents.length + unpaidStaff.length + openMaintenance.length} Pending Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overdue / Pending Fees */}
          <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF1E9A] flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pending Dues ({pendingResidents.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#8E8E9F]">Aug 2026</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {pendingResidents.length === 0 ? (
                  <p className="text-xs text-emerald-400 py-3 text-center">All fees reconciled</p>
                ) : (
                  pendingResidents.slice(0, 3).map(({ resident, balance }) => (
                    <div key={resident.id} className="p-2.5 bg-[#141414] rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-bold text-white truncate">{resident.name}</p>
                        <p className="text-[10px] text-[#8E8E9F] font-mono">Rm {resident.current_room_number} • Bed {resident.current_bed_number}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-[#FF6F3C]">₹{(balance || 0).toLocaleString('en-IN')}</p>
                        <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                          <button
                            onClick={() => {
                              sendDirectWhatsApp({
                                resident,
                                type: 'PAYMENT_REMINDER',
                                balance,
                                month: 'August 2026',
                                openDirect: true
                              });
                            }}
                            title={`Remind ${resident.name} on WhatsApp`}
                            className="p-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setPreselectedResidentForPayment(resident);
                              setRecordPaymentModalOpen(true);
                            }}
                            className="text-[10px] text-[#0CC6FF] font-bold hover:underline"
                          >
                            Collect →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="mt-3 pt-2 border-t border-white/[0.06] text-xs text-[#FF1E9A] hover:text-white flex items-center justify-between w-full font-bold"
            >
              <span>View All Dues</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Staff Payroll Action Queue */}
          <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6C4CFF] flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#6C4CFF]" />
                  <span>Pending Payroll ({unpaidStaff.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#8E8E9F]">Aug 2026</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {unpaidStaff.length === 0 ? (
                  <p className="text-xs text-emerald-400 py-3 text-center">All staff salaries paid</p>
                ) : (
                  unpaidStaff.slice(0, 3).map(stf => (
                    <div key={stf.id} className="p-2.5 bg-[#141414] rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-bold text-white truncate">{stf.name}</p>
                        <p className="text-[10px] text-[#8E8E9F] truncate">{stf.role}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        ₹{(stf.monthly_salary || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('staff')}
              className="mt-3 pt-2 border-t border-white/[0.06] text-xs text-[#6C4CFF] hover:text-white flex items-center justify-between w-full font-bold"
            >
              <span>Staff & Payroll Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pending Maintenance */}
          <div className="bg-[#0B0B0C] p-4 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6C4CFF] flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#6C4CFF]" />
                  <span>Work Orders ({openMaintenance.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#8E8E9F]">Repairs</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {openMaintenance.length === 0 ? (
                  <p className="text-xs text-emerald-400 py-3 text-center">All assets optimal</p>
                ) : (
                  openMaintenance.slice(0, 3).map(mnt => (
                    <div key={mnt.id} className="p-2.5 bg-[#141414] rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-bold text-white truncate">{mnt.category} (Rm {mnt.room_number})</p>
                        <p className="text-[10px] text-[#8E8E9F] font-mono">Assigned: {mnt.assigned_staff}</p>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#6C4CFF]/15 text-[#6C4CFF] uppercase border border-[#6C4CFF]/30 font-bold">
                        {mnt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="mt-3 pt-2 border-t border-white/[0.06] text-xs text-[#6C4CFF] hover:text-white flex items-center justify-between w-full font-bold"
            >
              <span>Work Order Log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
