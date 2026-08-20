import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building2,
  Phone,
  CreditCard,
  Send,
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoDatabase, addToast } = useApp();

  const [propertyName, setPropertyName] = useState(settings?.property_name || 'Hanura Casa Luxury Hostel');
  const [propertyAddress, setPropertyAddress] = useState(settings?.property_address || 'Plot 42, Silicon Valley Layout, Madhapur, Hyderabad');
  const [propertyPhone, setPropertyPhone] = useState(settings?.property_phone || '9876543210');
  const [propertyUpi, setPropertyUpi] = useState(settings?.property_upi_id || 'hanuracasa@icici');
  const [whatsappApiKey, setWhatsappApiKey] = useState(settings?.whatsapp_api_key || 'wh_live_hc_98472918347239');
  const [adminName, setAdminName] = useState(settings?.admin_name || 'Sathwik Pala');
  const [defaultAdvance, setDefaultAdvance] = useState(settings?.default_advance_amount || 5000);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        property_name: propertyName,
        property_address: propertyAddress,
        property_phone: propertyPhone,
        property_upi_id: propertyUpi,
        whatsapp_api_key: whatsappApiKey,
        admin_name: adminName,
        default_advance_amount: defaultAdvance
      });
      addToast('success', 'Settings Saved', 'Property configuration updated successfully.');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              System Preferences
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Configuration</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            System Settings & Property Configuration
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Global properties, WhatsApp credentials, UPI IDs & database reset utilities.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset to demo seed data? All custom entries will be reverted.')) {
              resetDemoDatabase();
            }
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#15151A] text-[#6B6B76] hover:text-white border border-[#23232A] text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Database</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Info */}
          <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center space-x-2 pb-2 border-b border-[#1F1F23]">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Property & Campus Identity</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#6B6B76] mb-1.5 font-medium">Property Name</label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={e => setPropertyName(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1.5 font-medium">Physical Address</label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={e => setPropertyAddress(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B6B76] mb-1.5 font-medium">Helpdesk Phone</label>
                  <input
                    type="text"
                    value={propertyPhone}
                    onChange={e => setPropertyPhone(e.target.value)}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#6B6B76] mb-1.5 font-medium">Director / Admin Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment & API Credentials */}
          <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center space-x-2 pb-2 border-b border-[#1F1F23]">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span>Payments & API Integration</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#6B6B76] mb-1.5 font-medium">Hostel Official UPI ID</label>
                <input
                  type="text"
                  value={propertyUpi}
                  onChange={e => setPropertyUpi(e.target.value)}
                  placeholder="e.g. hanuracasa@icici"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1.5 font-medium">Default Security Advance (₹)</label>
                <input
                  type="number"
                  value={defaultAdvance}
                  onChange={e => setDefaultAdvance(Number(e.target.value))}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1.5 font-medium">WhatsApp Cloud API Key</label>
                <input
                  type="password"
                  value={whatsappApiKey}
                  onChange={e => setWhatsappApiKey(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-full text-xs hover:brightness-110 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Property Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
