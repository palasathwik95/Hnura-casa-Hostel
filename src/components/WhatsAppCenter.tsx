import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Settings,
  ExternalLink,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Phone,
  Copy,
  Check,
  AlertCircle,
  Play,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  buildWhatsAppMessage,
  launchDirectWhatsApp,
  getDirectWhatsAppUrl,
  cleanWhatsAppPhone
} from '../utils/whatsapp';
import { Resident } from '../types';

export const WhatsAppCenter: React.FC = () => {
  const {
    whatsappMessages,
    residents,
    payments,
    settings,
    sendWhatsApp,
    sendDirectWhatsApp,
    addToast
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'KYC_REQUEST' | 'GENERAL_ANNOUNCEMENT' | 'CUSTOM'>('PAYMENT_REMINDER');
  const [recipientTarget, setRecipientTarget] = useState<'PENDING_DUES' | 'ALL_ACTIVE' | 'KYC_PENDING' | 'SPECIFIC'>('PENDING_DUES');
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [customNoticeText, setCustomNoticeText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [batchRunnerIndex, setBatchRunnerIndex] = useState<number | null>(null);

  // Direct Number Test State
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testRecipientName, setTestRecipientName] = useState('Valued Resident');

  // Compute pending residents for August
  const pendingResidents = residents.filter(r => {
    if (r.status !== 'ACTIVE') return false;
    const payment = payments.find(p => p.resident_id === r.id && p.month === '2026-08');
    const paid = payment ? payment.amount_paid : 0;
    return (r.monthly_fee || 0) - paid > 0;
  });

  const kycPendingResidents = residents.filter(
    r => r.status === 'ACTIVE' && r.kyc_status !== 'VERIFIED'
  );

  const getTargetRecipients = (): Resident[] => {
    switch (recipientTarget) {
      case 'PENDING_DUES': return pendingResidents;
      case 'KYC_PENDING': return kycPendingResidents;
      case 'ALL_ACTIVE': return residents.filter(r => r.status === 'ACTIVE');
      case 'SPECIFIC': return residents.filter(r => selectedResidentIds.includes(r.id));
      default: return [];
    }
  };

  const targets = getTargetRecipients();
  const sampleResident = targets[0] || pendingResidents[0] || residents[0];

  const getTemplatePreviewForResident = (resident: Resident | null) => {
    if (!resident) return 'No recipient selected.';
    const p = payments.find(pay => pay.resident_id === resident.id && pay.month === '2026-08');
    const paid = p ? p.amount_paid : 0;
    const bal = Math.max(0, (resident.monthly_fee || 0) - paid);

    return buildWhatsAppMessage({
      type: selectedTemplate,
      resident,
      payment: p,
      settings,
      month: 'August 2026',
      customText: customNoticeText,
      balance: bal
    });
  };

  const currentPreviewText = getTemplatePreviewForResident(sampleResident);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(currentPreviewText);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
    addToast('info', 'Copied to Clipboard', 'WhatsApp message content copied.');
  };

  // Launch Direct WhatsApp for single resident
  const handleDirectSendOne = async (resident: Resident) => {
    await sendDirectWhatsApp({
      resident,
      type: selectedTemplate,
      customText: customNoticeText,
      month: 'August 2026',
      openDirect: true
    });
  };

  // Direct test message to any custom phone number
  const handleDirectSendCustomNumber = () => {
    if (!testPhoneNumber.trim()) {
      addToast('error', 'Phone Required', 'Please enter a mobile number to test.');
      return;
    }

    const testResidentMock: any = {
      id: 'TEST-TEMP',
      name: testRecipientName.trim() || 'Resident',
      phone: testPhoneNumber.trim(),
      whatsapp: testPhoneNumber.trim(),
      current_room_number: '101',
      current_bed_number: '1',
      monthly_fee: 8500,
      kyc_status: 'PENDING',
      kyc_doc_type: 'AADHAAR'
    };

    const msg = buildWhatsAppMessage({
      type: selectedTemplate,
      resident: testResidentMock,
      settings,
      month: 'August 2026',
      customText: customNoticeText,
      balance: 8500
    });

    launchDirectWhatsApp(testPhoneNumber.trim(), msg);
    addToast('success', 'WhatsApp Launched', `Opened WhatsApp chat for ${testPhoneNumber.trim()}`);
  };

  // Dispatch all & open first in direct tab
  const handleDispatchAll = async () => {
    if (targets.length === 0) {
      addToast('error', 'No Recipients', 'No residents match the selected group.');
      return;
    }

    setIsSending(true);
    try {
      if (targets.length === 1) {
        await sendDirectWhatsApp({
          resident: targets[0],
          type: selectedTemplate,
          customText: customNoticeText,
          month: 'August 2026',
          openDirect: true
        });
      } else {
        await sendWhatsApp({
          resident_ids: targets.map(r => r.id),
          message_type: selectedTemplate,
          month: 'August 2026',
          custom_text: customNoticeText,
          autoOpenDirect: false
        });

        setBatchRunnerIndex(0);
        addToast('success', 'Broadcast Logged', `Recorded ${targets.length} messages. Ready for direct dispatch.`);
      }
    } catch (err) {
      // handled
    } finally {
      setIsSending(false);
    }
  };

  // Batch runner helper
  const handleBatchSendNext = (index: number) => {
    const resident = targets[index];
    if (resident) {
      const msg = getTemplatePreviewForResident(resident);
      launchDirectWhatsApp(resident.phone || resident.whatsapp, msg);
      if (index + 1 < targets.length) {
        setBatchRunnerIndex(index + 1);
      } else {
        setBatchRunnerIndex(null);
        addToast('success', 'Batch Finished', 'All direct WhatsApp chats opened.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              OMNICHANNEL BROADCAST & AUTOMATION
            </span>
            <span className="text-xs text-[#25D366] font-mono font-bold">• WhatsApp Engine</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            WhatsApp Dispatch & Automation Hub
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Instant direct WhatsApp messaging (wa.me), pre-filled rent reminders, digital receipts & KYC alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2 z-10">
          <span className="px-4 py-2 rounded-xl bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-xs font-mono font-bold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Direct WhatsApp Ready (wa.me)</span>
          </span>
        </div>
      </div>

      {/* Sequential Batch Dispatcher Modal / Overlay */}
      {batchRunnerIndex !== null && targets[batchRunnerIndex] && (
        <div className="bg-gradient-to-r from-[#141414] to-[#1a1a24] border-2 border-[#25D366]/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-[#25D366] text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                Direct Dispatcher ({batchRunnerIndex + 1} of {targets.length})
              </span>
              <span className="text-xs text-white font-medium">
                Next Recipient: <strong className="text-[#FF1E9A]">{targets[batchRunnerIndex].name}</strong> ({targets[batchRunnerIndex].phone})
              </span>
            </div>
            <p className="text-xs text-[#8E8E9F]">
              Click the button below to open this resident's WhatsApp chat with their tailored message pre-filled.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleBatchSendNext(batchRunnerIndex)}
              className="px-5 py-2.5 bg-[#25D366] text-black text-xs font-bold rounded-xl hover:brightness-110 flex items-center space-x-2 shadow-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open WhatsApp for {targets[batchRunnerIndex].name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBatchRunnerIndex(null)}
              className="px-4 py-2.5 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-bold border border-white/[0.08]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Message Settings & Target Selector */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0CC6FF] flex items-center space-x-2">
            <Send className="w-3.5 h-3.5 text-[#0CC6FF]" />
            <span>1. Configure Message & Audience</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-2">Select Message Template</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'PAYMENT_REMINDER', label: 'Rent Reminder' },
                  { id: 'PAYMENT_CONFIRMATION', label: 'Payment Receipt' },
                  { id: 'KYC_REQUEST', label: 'KYC Alert' },
                  { id: 'GENERAL_ANNOUNCEMENT', label: 'Notice Board' },
                  { id: 'CUSTOM', label: 'Custom Text' }
                ].map(tmpl => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id as any)}
                    className={`p-3 rounded-xl text-left border transition-all text-xs font-bold ${
                      selectedTemplate === tmpl.id
                        ? 'bg-[#0B0B0C] border-[#25D366] text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.2)]'
                        : 'bg-[#0B0B0C]/60 border-white/[0.06] text-[#8E8E9F] hover:text-white'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-2">Target Recipient Audience</label>
              <select
                value={recipientTarget}
                onChange={e => setRecipientTarget(e.target.value as any)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A] cursor-pointer"
              >
                <option value="PENDING_DUES" className="bg-[#141414]">
                  August Dues Pending Residents ({pendingResidents.length} Residents)
                </option>
                <option value="KYC_PENDING" className="bg-[#141414]">
                  Unverified KYC Residents ({kycPendingResidents.length} Residents)
                </option>
                <option value="ALL_ACTIVE" className="bg-[#141414]">
                  All Active Residents ({residents.filter(r => r.status === 'ACTIVE').length} Residents)
                </option>
              </select>
            </div>

            {(selectedTemplate === 'GENERAL_ANNOUNCEMENT' || selectedTemplate === 'CUSTOM') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[#8E8E9F] font-bold uppercase text-[10px]">Custom Message Body</label>
                  <span className="text-[10px] text-[#8E8E9F] font-mono">Use {'{{name}}'}, {'{{room}}'}, {'{{balance}}'}, {'{{upi}}'}</span>
                </div>
                <textarea
                  rows={4}
                  value={customNoticeText}
                  onChange={e => setCustomNoticeText(e.target.value)}
                  placeholder={selectedTemplate === 'CUSTOM' ? 'Hello {{name}}, your balance for Room {{room}} is {{balance}}.' : 'Enter notice to broadcast to residents...'}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl p-3 text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#25D366] text-xs font-mono"
                />
              </div>
            )}

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[#8E8E9F] font-mono text-xs">
                Target count: <strong className="text-white font-bold">{targets.length}</strong> resident(s)
              </span>
              <button
                onClick={handleDispatchAll}
                disabled={isSending || targets.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50 shadow-lg text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching...' : targets.length === 1 ? 'Send Direct WhatsApp' : `Broadcast WhatsApp (${targets.length})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real WhatsApp Simulator & Live Preview */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E9F]">
                2. Live WhatsApp Preview
              </span>
              <span className="text-[10px] font-mono text-[#25D366] flex items-center space-x-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span>Format: WhatsApp Markdown</span>
              </span>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="mt-3 bg-[#0B141A] p-4 rounded-2xl border border-[#1F2C34] space-y-2">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-[#1F2C34]">
                <div className="w-8 h-8 rounded-full bg-[#FF1E9A] flex items-center justify-center text-white font-bold text-xs font-mono">
                  HM
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Hanura Casa Official</p>
                  <p className="text-[9px] text-[#25D366] font-mono">Recipient: {sampleResident ? `${sampleResident.name} (${sampleResident.phone})` : 'Sample'}</p>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/[0.08] p-4 rounded-xl text-white text-xs whitespace-pre-wrap font-sans leading-relaxed shadow-md max-h-56 overflow-y-auto">
                {currentPreviewText}
                <div className="text-[9px] text-[#8E8E9F] text-right mt-2 flex items-center justify-end space-x-1 font-mono">
                  <span>10:45 AM</span>
                  <span className="text-[#25D366]">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0B0B0C] rounded-xl border border-white/[0.08] text-xs text-[#E4E4E7] flex items-center justify-between gap-2">
            <button
              onClick={handleCopyPreview}
              className="flex items-center space-x-1.5 text-[#8E8E9F] hover:text-white transition-colors font-bold"
            >
              {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPreview ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {sampleResident && (
              <button
                onClick={() => handleDirectSendOne(sampleResident)}
                className="px-4 py-1.5 bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/30 rounded-xl font-bold transition-all flex items-center space-x-1.5 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Chat to {sampleResident.name.split(' ')[0]}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Direct Quick Mobile Number Tester */}
      <div className="bg-gradient-to-r from-[#141414] to-[#121c16] p-6 rounded-2xl border border-[#25D366]/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct WhatsApp Sandbox & Mobile Tester</h4>
              <p className="text-xs text-[#8E8E9F]">
                Test real WhatsApp dispatching immediately on any mobile number with current selected template.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#25D366] bg-[#25D366]/10 px-3 py-1 rounded-full border border-[#25D366]/30 font-bold w-fit">
            • Instant wa.me Link
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">
              Mobile Number (with country code if needed)
            </label>
            <input
              type="text"
              placeholder="e.g. 9876543210 or 919876543210"
              value={testPhoneNumber}
              onChange={e => setTestPhoneNumber(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#25D366]"
            />
          </div>

          <div>
            <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">
              Recipient Name (for template preview)
            </label>
            <input
              type="text"
              placeholder="e.g. Sathwik Pala"
              value={testRecipientName}
              onChange={e => setTestRecipientName(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-[#25D366]"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleDirectSendCustomNumber}
              className="w-full py-2 bg-[#25D366] text-black font-bold rounded-xl text-xs hover:brightness-110 shadow-[0_0_20px_rgba(37,211,102,0.35)] active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Test WhatsApp Chat</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Target Recipient List with 1-Click Direct WhatsApp Action */}
      <div className="bg-[#141414] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0B0B0C] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Target Recipients ({targets.length})</h3>
            <p className="text-[11px] text-[#8E8E9F]">Click "Direct WhatsApp" to instantly launch chat in WhatsApp Web or App.</p>
          </div>
          <span className="text-xs font-mono text-[#0CC6FF] bg-[#141414] px-3 py-1 rounded-xl border border-white/[0.08] font-bold">
            Audience: {recipientTarget.replace('_', ' ')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E4E4E7]">
            <thead className="bg-[#0B0B0C] text-[#8E8E9F] uppercase font-mono font-bold text-[10px] tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-3">Room / Bed</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Aug Balance</th>
                <th className="py-3.5 px-3">KYC Status</th>
                <th className="py-3.5 px-4 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8E8E9F]">
                    No residents in this target group.
                  </td>
                </tr>
              ) : (
                targets.slice(0, 15).map(r => {
                  const p = payments.find(pay => pay.resident_id === r.id && pay.month === '2026-08');
                  const paid = p ? p.amount_paid : 0;
                  const bal = Math.max(0, (r.monthly_fee || 0) - paid);

                  return (
                    <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={r.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                            alt={r.name}
                            className="w-8 h-8 rounded-xl object-cover border border-white/[0.08]"
                          />
                          <div>
                            <p className="font-bold text-white">{r.name}</p>
                            <p className="text-[10px] text-[#8E8E9F] font-mono">{r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-white font-bold">Rm {r.current_room_number || 'N/A'}</span>
                        <span className="text-[#8E8E9F] text-[10px] ml-1.5">(Bed #{r.current_bed_number || '1'})</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[#E4E4E7]">
                        {r.phone}
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        {(bal || 0) > 0 ? (
                          <span className="text-[#FF6F3C] font-bold">₹{(bal || 0).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">Cleared</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          r.kyc_status === 'VERIFIED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                        }`}>
                          {r.kyc_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDirectSendOne(r)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-bold transition-all text-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Direct WhatsApp</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
