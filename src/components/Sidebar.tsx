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
  LogOut
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
    resetDemoDatabase
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
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'residents',
      label: 'Residents',
      icon: Users,
      badge: metrics?.active_residents || 0,
      badgeColor: 'bg-[#6C4CFF]/20 text-[#0CC6FF] border border-[#0CC6FF]/30'
    },
    {
      id: 'rooms',
      label: 'Rooms & Beds',
      icon: Building2,
      badge: `${metrics?.occupied_beds || 0}/${metrics?.total_beds || 0}`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: metrics?.pending_amount && metrics.pending_amount > 0 ? 'Dues' : undefined,
      badgeColor: 'bg-[#FF6F3C]/20 text-[#FF6F3C] border border-[#FF6F3C]/30'
    },
    { id: 'advances', label: 'Advance Ledger', icon: Wallet },
    { id: 'expenses', label: 'Expenses & Mess', icon: Receipt },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: metrics?.pending_maintenance && metrics.pending_maintenance > 0 ? metrics.pending_maintenance : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: MessageSquareWarning,
      badge: metrics?.unresolved_complaints && metrics.unresolved_complaints > 0 ? metrics.unresolved_complaints : undefined,
      badgeColor: 'bg-[#FF1E9A]/20 text-[#FF1E9A] border border-[#FF1E9A]/30'
    },
    { id: 'staff', label: 'Staff & Salaries', icon: UserCheck },
    {
      id: 'kyc',
      label: 'Digital KYC',
      icon: ShieldCheck,
      badge: metrics?.pending_kyc_count && metrics.pending_kyc_count > 0 ? `${metrics.pending_kyc_count} req` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    },
    { id: 'whatsapp', label: 'WhatsApp Center', icon: Send },
    { id: 'reports', label: 'Reports & P&L', icon: FileBarChart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'audit_logs', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="hanura-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F0F12] border-r border-[#1F1F23] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#F2E3B5] rounded-sm flex items-center justify-center shadow-md">
              <span className="font-brand font-bold text-black text-sm tracking-wider">HC</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white tracking-tight text-base font-brand">HANURA CASA</span>
                <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/30 px-1.5 py-0.2 rounded-full uppercase tracking-widest font-mono">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-[#6B6B76] uppercase tracking-[0.15em] font-medium">
                Hostel Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#6B6B76] hover:text-white hover:bg-[#15151A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
            Operations & Control
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all group ${
                  isActive
                    ? 'bg-[#1F1F23] text-white font-medium shadow-xs'
                    : 'text-[#6B6B76] hover:text-white hover:bg-[#15151A]/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {isActive ? (
                    <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shrink-0 shadow-sm shadow-[#D4AF37]" />
                  ) : (
                    <Icon className="w-4 h-4 text-[#6B6B76] group-hover:text-[#D1D1D1] transition-colors" />
                  )}
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#15151A] text-[#D4AF37] border border-[#D4AF37]/30'
                          : 'bg-[#15151A] text-[#8E8E98] border border-[#23232A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* System Status & Admin Profile */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#0F0F12] space-y-3">
          {/* Live Node Status widget */}
          <div className="bg-[#15151A] p-3 rounded-xl border border-[#23232A] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#6B6B76] uppercase tracking-widest font-bold mb-0.5">
                SYSTEM STATUS
              </div>
              <div className="text-xs text-[#4CAF50] font-medium flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CAF50] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4CAF50]"></span>
                </span>
                Madhapur Node Active
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset database to clean default demonstration state?')) {
                  resetDemoDatabase();
                }
              }}
              title="Reset sample seed data"
              className="text-[#6B6B76] hover:text-[#D4AF37] p-1.5 rounded-lg hover:bg-[#1F1F23] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Profile Widget */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#15151A] border border-[#23232A]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 p-0.5">
                <div className="w-full h-full rounded-full bg-[#1F1F23] flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                  SP
                </div>
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {settings?.admin_name || 'Sathwik Pala'}
                </p>
                <p className="text-[10px] text-[#6B6B76] font-mono flex items-center">
                  Executive Director
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNav('settings')}
              title="Account Settings"
              className="text-[#6B6B76] hover:text-white p-1.5 hover:bg-[#1F1F23] rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
