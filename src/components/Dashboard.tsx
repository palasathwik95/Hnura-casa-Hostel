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
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Sparkles,
  ChevronRight
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
    complaints,
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
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF1E9A]" />
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

  const pieColors = ['#D4AF37', '#4CAF50', '#F2E3B5', '#8E8E98', '#6B6B76', '#C0C0C0', '#9E9EA8'];
  const expensePieData = Object.entries(expenseCatMap).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value
  }));

  // Attention Required Lists (Computed strictly from live relational state)
  const activeResidents = residents.filter(r => r.status === 'ACTIVE');
  
  // Pending fee residents for Aug 2026
  const pendingResidents = activeResidents.map(r => {
    const payment = payments.find(p => p.resident_id === r.id && p.month === '2026-08');
    const paid = payment ? payment.amount_paid : 0;
    const balance = Math.max(0, r.monthly_fee - paid);
    return { resident: r, paid, expected: r.monthly_fee, balance };
  }).filter(item => item.balance > 0);

  // Missing KYC residents
  const missingKycResidents = activeResidents.filter(
    r => r.kyc_status === 'NOT_STARTED' || r.kyc_status === 'PENDING' || r.kyc_status === 'SUBMITTED'
  );

  // Unresolved complaints
  const openComplaints = complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS');

  // Pending maintenance
  const openMaintenance = maintenanceRequests.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Summary Header */}
      <div className="bg-[#0F0F12] p-6 lg:p-8 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Synthesis & Diagnostics
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• August 2026</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif italic text-white mt-1">
            Executive Overview & Portfolio Status
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1.5 max-w-xl">
            Live database telemetry across all 24 suites, {metrics.total_beds} active bed inventories and treasury ledgers.
          </p>
        </div>

        {/* Collection Performance Gauge */}
        <div className="flex items-center space-x-4 bg-[#15151A] px-5 py-4 rounded-xl border border-[#23232A]">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#6B6B76] font-bold">Aug Realization Rate</p>
            <p className="text-2xl font-light text-white font-mono">{metrics.collection_rate}<span className="text-[#D4AF37]">%</span></p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#1F1F23] border-t-[#D4AF37] flex items-center justify-center text-xs font-mono font-bold text-[#D4AF37]">
            {metrics.collection_rate}%
          </div>
        </div>
      </div>

      {/* 10 Executive KPI Cards in Elegant Dark */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Beds */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Total Beds</span>
            <Building2 className="w-3.5 h-3.5 text-[#6B6B76]" />
          </div>
          <div className="text-3xl font-light text-white font-mono mb-1">{metrics.total_beds}</div>
          <div className="text-xs text-[#6B6B76] font-medium">4 Floors Configured</div>
        </div>

        {/* Occupied Beds */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Occupied</span>
            <Users className="w-3.5 h-3.5 text-[#4CAF50]" />
          </div>
          <div className="text-3xl font-light text-white font-mono mb-1">{metrics.occupied_beds}</div>
          <div className="text-xs text-[#4CAF50] font-medium flex items-center gap-1">
            <span>{metrics.occupancy_rate}% rate</span>
          </div>
        </div>

        {/* Vacant Beds */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Vacant</span>
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-3xl font-light text-[#D4AF37] font-mono mb-1">{metrics.vacant_beds}</div>
          <div className="text-xs text-[#6B6B76] font-medium">Ready for Intake</div>
        </div>

        {/* Active Residents */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Active Residents</span>
            <Users className="w-3.5 h-3.5 text-[#D1D1D1]" />
          </div>
          <div className="text-3xl font-light text-white font-mono mb-1">{metrics.active_residents}</div>
          <div className="text-xs text-[#6B6B76] font-medium">{metrics.former_residents} Archived</div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Utilization</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-3xl font-light text-white font-mono mb-1">{metrics.occupancy_rate}<span className="text-[#D4AF37]">%</span></div>
          <div className="h-1 w-full bg-[#1F1F23] rounded-full mt-2">
            <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${Math.min(100, metrics.occupancy_rate)}%` }} />
          </div>
        </div>

        {/* Expected Monthly Collection */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Expected Fees</span>
            <CreditCard className="w-3.5 h-3.5 text-[#6B6B76]" />
          </div>
          <div className="text-2xl font-light text-white font-mono mb-1">
            {formatINR(metrics.expected_monthly_collection)}
          </div>
          <div className="text-xs text-[#6B6B76] font-medium">August Gross</div>
        </div>

        {/* Collected This Month */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#4CAF50]/40 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#4CAF50] mb-2 flex items-center justify-between">
            <span>Realized (Aug)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
          </div>
          <div className="text-2xl font-light text-white font-mono mb-1">
            {formatINR(metrics.collected_this_month)}
          </div>
          <div className="text-xs text-[#4CAF50] font-medium">Direct Bank & Cash</div>
        </div>

        {/* Pending Amount */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/40 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-2 flex items-center justify-between">
            <span>Outstanding Dues</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-light text-[#D4AF37] font-mono mb-1">
            {formatINR(metrics.pending_amount)}
          </div>
          <div className="text-xs text-[#6B6B76] font-medium">{pendingResidents.length} Residents Pending</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/30 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] mb-2 flex items-center justify-between">
            <span>Aug Expenses</span>
            <Receipt className="w-3.5 h-3.5 text-[#6B6B76]" />
          </div>
          <div className="text-2xl font-light text-white font-mono mb-1">
            {formatINR(metrics.total_expenses)}
          </div>
          <div className="text-xs text-[#6B6B76] font-medium">Mess, Utilities, Payroll</div>
        </div>

        {/* Net Operating Income */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-5 rounded-2xl hover:border-[#D4AF37]/50 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-2 flex items-center justify-between">
            <span>Net Surplus</span>
            <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-light text-white font-mono mb-1">
            {formatINR(metrics.net_operating_amount)}
          </div>
          <div className="text-xs text-[#D4AF37] font-medium">Net Realized Margin</div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Trend (2 columns) */}
        <div className="lg:col-span-2 bg-[#0F0F12] border border-[#1F1F23] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] font-bold mb-1">Cashflow Trajectory</div>
              <h3 className="text-base font-semibold text-white">Monthly Revenue vs Operating Outflow</h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-[10px] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-colors"
            >
              Detailed P&L
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsExpenseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#6B6B76" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6B6B76"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#15151A', borderColor: '#23232A', borderRadius: '12px', color: '#FFF' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                <Bar dataKey="Revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#6B6B76" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution (1 column) */}
        <div className="bg-[#0F0F12] border border-[#1F1F23] p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] font-bold mb-1">Allocation</div>
                <h3 className="text-base font-semibold text-white">August Expense Distribution</h3>
              </div>
              <span className="text-xs font-mono text-[#D4AF37]">{formatINR(metrics.total_expenses)}</span>
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
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#15151A', borderColor: '#23232A', borderRadius: '12px', color: '#FFF' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#1F1F23]">
            {expensePieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                <span className="text-[#A1A1AA] truncate">{entry.name}:</span>
                <span className="font-mono text-white font-medium">{formatINR(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ATTENTION REQUIRED SECTION */}
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#6B6B76] font-bold mb-1">Operational Diagnostics</div>
            <h3 className="text-base font-semibold text-white">Priority Action Queue & Triage</h3>
          </div>
          <span className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full uppercase tracking-widest">
            {pendingResidents.length + missingKycResidents.length + openComplaints.length + openMaintenance.length} Pending Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overdue / Pending Fees */}
          <div className="bg-[#15151A] p-4 rounded-xl border border-[#23232A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4AF37] flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pending Dues ({pendingResidents.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#6B6B76]">Aug 2026</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {pendingResidents.length === 0 ? (
                  <p className="text-xs text-[#4CAF50] py-3 text-center">All fees reconciled</p>
                ) : (
                  pendingResidents.slice(0, 3).map(({ resident, balance }) => (
                    <div key={resident.id} className="p-2.5 bg-[#0F0F12] rounded-lg border border-[#1F1F23] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-medium text-white truncate">{resident.name}</p>
                        <p className="text-[10px] text-[#6B6B76] font-mono">Rm {resident.current_room_number} • Bed {resident.current_bed_number}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-[#D4AF37]">₹{(balance || 0).toLocaleString('en-IN')}</p>
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
                            className="p-1 rounded bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 transition-colors"
                          >
                            <Send className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPreselectedResidentForPayment(resident);
                              setRecordPaymentModalOpen(true);
                            }}
                            className="text-[10px] text-[#D1D1D1] hover:text-[#D4AF37] hover:underline"
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
              className="mt-3 pt-2 border-t border-[#1F1F23] text-xs text-[#D4AF37] hover:text-white flex items-center justify-between w-full font-medium"
            >
              <span>View All Dues</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Missing / Pending KYC */}
          <div className="bg-[#15151A] p-4 rounded-xl border border-[#23232A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D1D1D1] flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Pending KYC ({missingKycResidents.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#6B6B76]">Audit</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {missingKycResidents.length === 0 ? (
                  <p className="text-xs text-[#4CAF50] py-3 text-center">100% KYC Verified</p>
                ) : (
                  missingKycResidents.slice(0, 3).map(res => (
                    <div key={res.id} className="p-2.5 bg-[#0F0F12] rounded-lg border border-[#1F1F23] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-medium text-white truncate">{res.name}</p>
                        <p className="text-[10px] text-[#D4AF37] font-mono">{res.kyc_status}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedResidentId(res.id);
                          setActiveTab('residents');
                        }}
                        className="px-2.5 py-1 bg-[#1F1F23] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-white rounded text-[10px] font-medium transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('kyc')}
              className="mt-3 pt-2 border-t border-[#1F1F23] text-xs text-[#D1D1D1] hover:text-[#D4AF37] flex items-center justify-between w-full font-medium"
            >
              <span>Open KYC Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Unresolved Complaints */}
          <div className="bg-[#15151A] p-4 rounded-xl border border-[#23232A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <MessageSquareWarning className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Open Complaints ({openComplaints.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#6B6B76]">SLA</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {openComplaints.length === 0 ? (
                  <p className="text-xs text-[#4CAF50] py-3 text-center">Zero grievances active</p>
                ) : (
                  openComplaints.slice(0, 3).map(cmp => (
                    <div key={cmp.id} className="p-2.5 bg-[#0F0F12] rounded-lg border border-[#1F1F23] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-medium text-white truncate">{cmp.category} - Rm {cmp.room_number}</p>
                        <p className="text-[10px] text-[#6B6B76] truncate">{cmp.description}</p>
                      </div>
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1F1F23] text-[#D4AF37] uppercase">
                        {cmp.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('complaints')}
              className="mt-3 pt-2 border-t border-[#1F1F23] text-xs text-[#D1D1D1] hover:text-[#D4AF37] flex items-center justify-between w-full font-medium"
            >
              <span>Manage Complaints</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pending Maintenance */}
          <div className="bg-[#15151A] p-4 rounded-xl border border-[#23232A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D1D1D1] flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Work Orders ({openMaintenance.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#6B6B76]">Repairs</span>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                {openMaintenance.length === 0 ? (
                  <p className="text-xs text-[#4CAF50] py-3 text-center">All assets optimal</p>
                ) : (
                  openMaintenance.slice(0, 3).map(mnt => (
                    <div key={mnt.id} className="p-2.5 bg-[#0F0F12] rounded-lg border border-[#1F1F23] flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-medium text-white truncate">{mnt.category} (Rm {mnt.room_number})</p>
                        <p className="text-[10px] text-[#6B6B76] font-mono">Assigned: {mnt.assigned_staff}</p>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#1F1F23] text-[#A1A1AA] uppercase">
                        {mnt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="mt-3 pt-2 border-t border-[#1F1F23] text-xs text-[#D1D1D1] hover:text-[#D4AF37] flex items-center justify-between w-full font-medium"
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
