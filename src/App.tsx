import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Residents } from './components/Residents';
import { Rooms } from './components/Rooms';
import { Payments } from './components/Payments';
import { Expenses } from './components/Expenses';
import { Maintenance } from './components/Maintenance';
import { Complaints } from './components/Complaints';
import { StaffView } from './components/Staff';
import { WhatsAppCenter } from './components/WhatsAppCenter';
import { DigitalKYC } from './components/DigitalKYC';
import { Reports } from './components/Reports';
import { AuditLogs } from './components/AuditLogs';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import {
  AddRoomModal,
  AddResidentModal,
  EditResidentModal,
  TransferRoomModal,
  VacateResidentModal,
  UploadKYCModal,
  RecordPaymentModal,
  AddExpenseModal,
  SearchModal,
  ReceiptModal
} from './components/Modals';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toasts, removeToast, setSearchModalOpen } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K search spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'residents':
        return <Residents />;
      case 'rooms':
        return <Rooms />;
      case 'payments':
        return <Payments />;
      case 'expenses':
        return <Expenses />;
      case 'maintenance':
        return <Maintenance />;
      case 'complaints':
        return <Complaints />;
      case 'staff':
        return <StaffView />;
      case 'whatsapp':
        return <WhatsAppCenter />;
      case 'kyc':
        return <DigitalKYC />;
      case 'reports':
        return <Reports />;
      case 'audit_logs':
      case 'audit':
        return <AuditLogs />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0B0C] text-[#E4E4E7] overflow-hidden font-sans antialiased selection:bg-[#FF1E9A] selection:text-white">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area with Desktop Sidebar Offset */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#0B0B0C] lg:pl-72">
        {/* Sticky Top Header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Dynamic Main Body with smooth scroll & mobile responsiveness */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 space-y-6 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals (Mounted at Root Level to avoid any prop drilling errors) */}
      <AddRoomModal />
      <AddResidentModal />
      <EditResidentModal />
      <TransferRoomModal />
      <VacateResidentModal />
      <UploadKYCModal />
      <RecordPaymentModal />
      <AddExpenseModal />
      <SearchModal />
      <ReceiptModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start justify-between space-x-3 transition-all animate-in slide-in-from-bottom-5 bg-[#141414]/95 backdrop-blur-xl ${
              t.type === 'success'
                ? 'border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : t.type === 'error'
                ? 'border-rose-500/40 text-white shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : 'border-[#0CC6FF]/40 text-white shadow-[0_0_20px_rgba(12,198,255,0.15)]'
            }`}
          >
            <div className="flex items-start space-x-3">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-[#0CC6FF] mt-0.5 shrink-0" />}
              <div>
                <h5 className="text-xs font-bold text-white tracking-wide">{t.title}</h5>
                {t.message && <p className="text-[11px] text-[#8E8E9F] mt-0.5">{t.message}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#8E8E9F] hover:text-white p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
