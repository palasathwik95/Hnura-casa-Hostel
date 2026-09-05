import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Bell,
  Menu,
  CreditCard,
  UserPlus,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

interface HeaderProps {
  setMobileOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    notifications,
    setSearchModalOpen,
    setAddResidentModalOpen,
    setRecordPaymentModalOpen,
    setAddExpenseModalOpen,
    setSelectedResidentId,
    metrics,
    cloudDbStatus
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !(n.is_read || n.read)).length;

  // Keyboard shortcut listener for Command/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Overview';
      case 'residents': return 'Resident Directory & Lifecycle';
      case 'rooms': return 'Floors, Rooms & Bed Occupancy';
      case 'payments': return 'Fee Collection & Payment Ledger';
      case 'advances': return 'Advance & Security Deposit Vault';
      case 'expenses': return 'Operating Expenses & Mess Procurement';
      case 'maintenance': return 'Asset Maintenance & Work Orders';
      case 'complaints': return 'Resident Grievance & SLA Resolution';
      case 'staff': return 'Staff Management & Payroll';
      case 'kyc': return 'Digital KYC & Identity Vault';
      case 'whatsapp': return 'WhatsApp Automation Center';
      case 'reports': return 'Financial Reports, Analytics & P&L';
      case 'notifications': return 'System Alerts Feed';
      case 'audit_logs': return 'Immutable Audit Trail';
      case 'settings': return 'System Settings & Property Configuration';
      default: return 'Management Portal';
    }
  };

  return (
    <header
      id="hanura-header"
      className="sticky top-0 z-30 bg-[#0B0B0C]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 py-3.5 flex items-center justify-between"
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#8E8E9F] hover:text-white bg-[#141414] border border-white/[0.08] hover:border-[#FF1E9A]/40 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8E8E9F] mb-0.5">
            HANURA CASA OS
          </h1>
          <div className="flex items-center space-x-2.5">
            <p className="text-lg lg:text-2xl font-heading font-bold text-white tracking-tight">
              {getPageTitle()}
            </p>
            {cloudDbStatus.connected ? (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                title="Supabase Cloud Database Connected - Click to view settings"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono hover:bg-emerald-500/20 transition-colors"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                </span>
                CLOUD SYNCED
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                title="Supabase Cloud Database - Click to configure multi-device sync"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#141414] text-[#8E8E9F] border border-white/[0.08] font-mono hover:border-[#0CC6FF]/40 hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                CONNECT SUPABASE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Global Search, Quick Actions & Notification Bell */}
      <div className="flex items-center space-x-2 lg:space-x-3">
        {/* Global Search Button */}
        <button
          id="global-search-btn"
          onClick={() => setSearchModalOpen(true)}
          className="h-9 sm:h-10 bg-[#141414] border border-white/[0.08] rounded-xl px-3 sm:px-4 flex items-center text-xs text-[#8E8E9F] hover:border-[#0CC6FF]/40 hover:text-white transition-all group shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-[#8E8E9F] group-hover:text-[#0CC6FF] transition-colors mr-2 shrink-0" />
          <span className="hidden md:inline text-[#8E8E9F] group-hover:text-[#E4E4E7]">Search resident, room, ledger...</span>
          <span className="md:hidden text-xs">Search</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-[#0B0B0C] text-[#8E8E9F] rounded border border-white/[0.08] ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action: Record Payment */}
        <button
          id="quick-record-payment"
          onClick={() => setRecordPaymentModalOpen(true)}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] px-3.5 sm:px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-sans">Record Payment</span>
          <span className="sm:hidden font-sans">Pay</span>
        </button>

        {/* Quick Action: Add Resident */}
        <button
          id="quick-add-resident"
          onClick={() => setAddResidentModalOpen(true)}
          className="hidden md:inline-flex items-center space-x-1.5 text-xs text-[#0CC6FF] bg-[#141414] border border-[#0CC6FF]/30 px-3.5 py-2 rounded-xl hover:bg-[#0CC6FF]/10 transition-all font-medium"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#0CC6FF]" />
          <span>Add Resident</span>
        </button>

        {/* Quick Action: Add Expense */}
        <button
          id="quick-add-expense"
          onClick={() => setAddExpenseModalOpen(true)}
          className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-white/[0.06] border border-white/[0.08] text-[#E4E4E7] hover:text-white text-xs font-medium transition-all"
        >
          <Receipt className="w-3.5 h-3.5 text-[#FF6F3C]" />
          <span>Add Expense</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-[#8E8E9F] hover:text-white hover:border-[#FF1E9A]/40 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF1E9A] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#FF1E9A]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141414] border border-white/[0.1] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <span className="font-heading font-bold text-white text-sm">System Alerts</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0B0B0C] text-[#0CC6FF] border border-[#0CC6FF]/30">
                    {notifications.length} Total
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs text-[#FF1E9A] hover:underline font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05] py-2">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.link_tab) setActiveTab(n.link_tab as any);
                      if (n.related_id && n.link_tab === 'residents') setSelectedResidentId(n.related_id);
                      setNotifOpen(false);
                    }}
                    className="py-2.5 px-2 hover:bg-white/[0.04] rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF1E9A] mt-1.5 shrink-0 shadow-[0_0_6px_#FF1E9A]" />
                      <div className="space-y-0.5 flex-1">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        <p className="text-[11px] text-[#8E8E9F] line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[#6B6B76] font-mono flex items-center pt-1">
                          <Clock className="w-2.5 h-2.5 mr-1 text-[#6B6B76]" />
                          {new Date(n.timestamp || n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.08] text-center">
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs text-[#8E8E9F] hover:text-[#0CC6FF] py-1 block w-full text-center transition-colors font-medium"
                >
                  Go to Notification Center →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
