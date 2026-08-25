import React from 'react';
import { useApp, ActiveNavTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Wallet,
  Receipt,
  Wrench,
  MessageSquareWarning,
  UserCheck,
  Send,
  FileBarChart,
  ShieldCheck,
  Bell,
  History,
  Settings,
  X,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Trash2,
  Flame
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    setSelectedResidentId,
    setSelectedRoomId,
    metrics,
    settings,
    resetDemoDatabase,
    clearAllData
  } = useApp();

  const handleNav = (tab: ActiveNavTab) => {
    setSelectedResidentId(null);
    setSelectedRoomId(null);
    setActiveTab(tab);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const navItems: Array<{
    id: ActiveNavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    accentColor: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, accentColor: '#FF1E9A' },
    {
      id: 'residents',
      label: 'Residents',
      icon: Users,
      badge: metrics?.active_residents || 0,
      badgeColor: 'bg-[#FF1E9A]/15 text-[#FF1E9A] border border-[#FF1E9A]/30',
      accentColor: '#FF1E9A'
    },
    {
      id: 'rooms',
      label: 'Rooms & Beds',
      icon: Building2,
      badge: `${metrics?.occupied_beds || 0}/${metrics?.total_beds || 0}`,
      badgeColor: 'bg-[#0CC6FF]/15 text-[#0CC6FF] border border-[#0CC6FF]/30',
      accentColor: '#0CC6FF'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: metrics?.pending_amount && metrics.pending_amount > 0 ? 'Dues' : undefined,
      badgeColor: 'bg-[#FF6F3C]/20 text-[#FF6F3C] border border-[#FF6F3C]/30',
      accentColor: '#FF6F3C'
    },
    { id: 'expenses', label: 'Expenses & Mess', icon: Receipt, accentColor: '#FF6F3C' },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: metrics?.pending_maintenance && metrics.pending_maintenance > 0 ? metrics.pending_maintenance : undefined,
      badgeColor: 'bg-[#FF6F3C]/20 text-[#FF6F3C] border border-[#FF6F3C]/30',
      accentColor: '#FF6F3C'
    },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: MessageSquareWarning,
      badge: metrics?.unresolved_complaints && metrics.unresolved_complaints > 0 ? metrics.unresolved_complaints : undefined,
      badgeColor: 'bg-[#FF1E9A]/20 text-[#FF1E9A] border border-[#FF1E9A]/30',
      accentColor: '#FF1E9A'
    },
    { id: 'staff', label: 'Staff & Payroll', icon: UserCheck, accentColor: '#6C4CFF' },
    {
      id: 'kyc',
      label: 'Digital KYC Vault',
      icon: ShieldCheck,
      badge: metrics?.pending_kyc_count && metrics.pending_kyc_count > 0 ? `${metrics.pending_kyc_count} req` : undefined,
      badgeColor: 'bg-[#0CC6FF]/20 text-[#0CC6FF] border border-[#0CC6FF]/30',
      accentColor: '#0CC6FF'
    },
    { id: 'whatsapp', label: 'WhatsApp Center', icon: Send, accentColor: '#25D366' },
    { id: 'reports', label: 'Reports & P&L', icon: FileBarChart, accentColor: '#6C4CFF' },
    { id: 'notifications', label: 'Notifications', icon: Bell, accentColor: '#0CC6FF' },
    { id: 'audit_logs', label: 'Audit Trail', icon: History, accentColor: '#8E8E9F' },
    { id: 'settings', label: 'Settings', icon: Settings, accentColor: '#8E8E9F' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/85 z-40 lg:hidden backdrop-blur-md transition-opacity"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="hanura-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B0B0C]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF1E9A] via-[#6C4CFF] to-[#0CC6FF] p-[1.5px] shadow-[0_0_20px_rgba(255,30,154,0.35)]">
              <div className="w-full h-full bg-[#141414] rounded-[10px] flex items-center justify-center">
                <span className="font-brand font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF1E9A] to-[#0CC6FF] text-base tracking-wider">
                  HM
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-heading font-extrabold text-white tracking-tight text-base">
                  HANURA CASA
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#FF1E9A]/15 text-[#FF1E9A] border border-[#FF1E9A]/30 uppercase font-bold tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-[#8E8E9F] font-mono uppercase tracking-[0.18em]">
                Smart Living OS
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#8E8E9F] flex items-center justify-between">
            <span>OPERATIONS & CONTROL</span>
            <span className="text-[9px] text-[#0CC6FF]">LIVE</span>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#141414] text-white font-medium shadow-[0_0_25px_-5px_rgba(255,30,154,0.25)] border border-white/[0.1]'
                    : 'text-[#8E8E9F] hover:text-white hover:bg-[#141414]/60'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-[#FF1E9A] to-[#6C4CFF] shadow-[0_0_10px_#FF1E9A]" />
                )}
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#FF1E9A]'
                        : 'text-[#8E8E9F] group-hover:text-white'
                    }`}
                  />
                  <span className={isActive ? 'font-semibold text-white tracking-wide' : 'tracking-normal'}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-[#FF1E9A]/20 text-[#FF1E9A]' : 'bg-[#141414] text-[#8E8E9F] border border-white/[0.05]')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0CC6FF]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* System Management & Admin Status */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0B0B0C] space-y-3">
          {/* Quick Database Action Bar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (confirm('Clear all demo residents, payments, and records to start fresh for real check-ins?')) {
                  clearAllData();
                }
              }}
              title="Wipe demo data (Clean Slate)"
              className="px-2.5 py-1.5 rounded-xl bg-[#141414] hover:bg-rose-950/40 text-rose-400 border border-rose-500/20 text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clean Slate</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Load demo seed dataset with synchronized mock residents?')) {
                  resetDemoDatabase();
                }
              }}
              title="Reset Demo Dataset"
              className="px-2.5 py-1.5 rounded-xl bg-[#141414] hover:bg-[#6C4CFF]/20 text-[#0CC6FF] border border-[#0CC6FF]/20 text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Demo Seed</span>
            </button>
          </div>

          {/* Admin Profile Widget */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141414] border border-white/[0.08]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF1E9A] to-[#6C4CFF] p-[1px]">
                <div className="w-full h-full rounded-full bg-[#141414] flex items-center justify-center text-xs font-bold text-white">
                  HM
                </div>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {settings?.admin_name || 'Hanura Media Admin'}
                </p>
                <p className="text-[10px] text-[#8E8E9F] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Management Live
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNav('settings')}
              title="Account Settings"
              className="text-[#8E8E9F] hover:text-white p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
