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
  Sparkles
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
    metrics
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

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
      case 'advances': return 'Advance & Security Deposit Ledger';
      case 'expenses': return 'Operating Expenses & Mess Procurement';
      case 'maintenance': return 'Asset Maintenance & Work Orders';
      case 'complaints': return 'Resident Grievance & SLA Resolution';
      case 'staff': return 'Staff Management & Payroll';
      case 'kyc': return 'Digital KYC & Identity Verification';
      case 'whatsapp': return 'WhatsApp Business Automation Center';
      case 'reports': return 'Financial Reports, Analytics & P&L';
      case 'notifications': return 'System Activity & Alerts Feed';
      case 'audit_logs': return 'Immutable Audit Trail';
      case 'settings': return 'System Settings & Property Configuration';
      default: return 'Management Portal';
    }
  };

  return (
    <header
      id="hanura-header"
      className="sticky top-0 z-30 bg-[#0F0F12]/95 backdrop-blur-md border-b border-[#1F1F23] px-4 lg:px-8 py-3.5 flex items-center justify-between"
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#6B6B76] hover:text-white bg-[#15151A] border border-[#1F1F23] transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B76] mb-0.5">
            Operational Matrix
          </h1>
          <div className="flex items-center space-x-2.5">
            <p className="text-xl lg:text-2xl font-serif italic text-white">
              {getPageTitle()}
            </p>
            {activeTab === 'dashboard' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#15151A] text-[#4CAF50] border border-[#4CAF50]/30 font-mono">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CAF50] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4CAF50]"></span>
                </span>
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Global Search, Quick Actions & Notification Bell */}
      <div className="flex items-center space-x-2.5 lg:space-x-3.5">
        {/* Global Search Button */}
        <button
          id="global-search-btn"
          onClick={() => setSearchModalOpen(true)}
          className="h-10 bg-[#0F0F12] border border-[#1F1F23] rounded-full px-4 flex items-center text-xs text-[#6B6B76] hover:border-[#D4AF37]/50 hover:text-[#D1D1D1] transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-[#6B6B76] group-hover:text-[#D4AF37] transition-colors mr-2" />
          <span className="hidden md:inline text-[#6B6B76] group-hover:text-[#D1D1D1]">Search resident, room, ledger...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-[#15151A] text-[#6B6B76] rounded border border-[#23232A] ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action: Record Payment */}
        <button
          id="quick-record-payment"
          onClick={() => setRecordPaymentModalOpen(true)}
          className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-semibold text-black bg-gradient-to-tr from-[#D4AF37] to-[#F2E3B5] px-4 py-2 rounded-full uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all"
        >
          <CreditCard className="w-3.5 h-3.5 text-black" />
          <span>Record Payment</span>
        </button>

        {/* Quick Action: Add Resident */}
        <button
          id="quick-add-resident"
          onClick={() => setAddResidentModalOpen(true)}
          className="hidden md:inline-flex items-center space-x-1.5 text-[10px] text-[#D4AF37] border border-[#D4AF37]/30 px-3.5 py-2 rounded-full uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all font-medium"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Add Resident</span>
        </button>

        {/* Quick Action: Add Expense */}
        <button
          id="quick-add-expense"
          onClick={() => setAddExpenseModalOpen(true)}
          className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#15151A] hover:bg-[#1F1F23] border border-[#1F1F23] text-[#D1D1D1] hover:text-white text-[10px] uppercase tracking-widest font-medium transition-all"
        >
          <Receipt className="w-3.5 h-3.5 text-[#A1A1AA]" />
          <span>Add Expense</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-full bg-[#15151A] border border-[#1F1F23] text-[#D1D1D1] hover:text-white hover:border-[#D4AF37]/40 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#D4AF37] text-black text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F0F12] border border-[#1F1F23] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white text-sm">Notifications & Alerts</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15151A] text-[#D4AF37] border border-[#D4AF37]/30">
                    {notifications.length} Total
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs text-[#D4AF37] hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#1F1F23] py-2">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.link_tab) setActiveTab(n.link_tab as any);
                      if (n.related_id && n.link_tab === 'residents') setSelectedResidentId(n.related_id);
                      setNotifOpen(false);
                    }}
                    className="py-2.5 px-2 hover:bg-[#15151A] rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <div className="space-y-0.5 flex-1">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        <p className="text-[11px] text-[#A1A1AA] line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[#6B6B76] font-mono flex items-center pt-1">
                          <Clock className="w-2.5 h-2.5 mr-1 text-[#6B6B76]" />
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1F1F23] text-center">
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs text-[#6B6B76] hover:text-[#D4AF37] py-1 block w-full text-center transition-colors"
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
