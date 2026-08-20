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

  // Compute pending residents for August
  const pendingResidents = residents.filter(r => {
    if (r.status !== 'ACTIVE') return false;
    const payment = payments.find(p => p.resident_id === r.id && p.month === '2026-08');
    const paid = payment ? payment.amount_paid : 0;
    return r.monthly_fee - paid > 0;
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

  // Dispatch all & open first in direct tab
  const handleDispatchAll = async () => {
    if (targets.length === 0) {
      addToast('error', 'No Recipients', 'No residents match the selected group.');
      return;
    }

    setIsSending(true);
    try {
      // 1. If 1 recipient, directly launch WhatsApp
      if (targets.length === 1) {
        await sendDirectWhatsApp({
          resident: targets[0],
          type: selectedTemplate,
          customText: customNoticeText,
          month: 'August 2026',
          openDirect: true
        });
      } else {
        // Multi-recipient: Log all to database
        await sendWhatsApp({
          resident_ids: targets.map(r => r.id),
          message_type: selectedTemplate,
          month: 'August 2026',
          custom_text: customNoticeText,
          autoOpenDirect: false
        });

        // Start interactive sequential batch launcher
        setBatchRunnerIndex(0);
        addToast('success', 'Broadcast Logged', `Recorded ${targets.length} messages. Launching direct WhatsApp dispatcher.`);
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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Communication Engine
            </span>
            <span className="text-xs text-[#25D366] font-mono">• Direct WhatsApp & Cloud API</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            WhatsApp Dispatch & Automation Center
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Instant direct WhatsApp messaging (wa.me), pre-filled rent reminders, digital receipts & KYC alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 text-xs font-mono font-medium flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Direct WhatsApp Ready (wa.me)</span>
          </span>
        </div>
      </div>

      {/* Sequential Batch Dispatcher Modal / Overlay */}
      {batchRunnerIndex !== null && targets[batchRunnerIndex] && (
        <div className="bg-gradient-to-r from-[#15151A] to-[#1F1F23] border-2 border-[#25D366]/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#25D366] text-black text-[10px] font-bold uppercase tracking-wider">
                Direct Dispatcher ({batchRunnerIndex + 1} of {targets.length})
              </span>
              <span className="text-xs text-white font-medium">
                Next Recipient: <strong className="text-[#D4AF37]">{targets[batchRunnerIndex].name}</strong> ({targets[batchRunnerIndex].phone})
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Click the button below to open this resident's WhatsApp chat with their tailored message pre-filled.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleBatchSendNext(batchRunnerIndex)}
              className="px-5 py-2.5 bg-[#25D366] text-black text-xs font-bold rounded-full hover:brightness-110 flex items-center space-x-2 shadow-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open WhatsApp for {targets[batchRunnerIndex].name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBatchRunnerIndex(null)}
              className="px-3 py-2 bg-[#15151A] text-[#6B6B76] hover:text-white rounded-full text-xs border border-[#23232A]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Message Settings & Target Selector */}
        <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center space-x-2">
            <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>1. Configure Message & Audience</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#6B6B76] mb-1.5 font-medium">Select Message Template</label>
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
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      selectedTemplate === tmpl.id
                        ? 'bg-[#15151A] border-[#25D366] text-[#25D366] font-medium shadow-sm'
                        : 'bg-[#15151A]/50 border-[#23232A] text-[#6B6B76] hover:text-white'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1.5 font-medium">Target Recipient Audience</label>
              <select
                value={recipientTarget}
                onChange={e => setRecipientTarget(e.target.value as any)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="PENDING_DUES" className="bg-[#15151A]">
                  August Dues Pending Residents ({pendingResidents.length} Residents)
                </option>
                <option value="KYC_PENDING" className="bg-[#15151A]">
                  Unverified KYC Residents ({kycPendingResidents.length} Residents)
                </option>
                <option value="ALL_ACTIVE" className="bg-[#15151A]">
                  All Active Residents ({residents.filter(r => r.status === 'ACTIVE').length} Residents)
                </option>
              </select>
            </div>

            {(selectedTemplate === 'GENERAL_ANNOUNCEMENT' || selectedTemplate === 'CUSTOM') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[#6B6B76] font-medium">Custom Message Body</label>
                  <span className="text-[10px] text-[#6B6B76] font-mono">Use {'{{name}}'}, {'{{room}}'}, {'{{balance}}'}, {'{{upi}}'}</span>
                </div>
                <textarea
                  rows={4}
                  value={customNoticeText}
                  onChange={e => setCustomNoticeText(e.target.value)}
                  placeholder={selectedTemplate === 'CUSTOM' ? 'Hello {{name}}, your balance for Room {{room}} is {{balance}}.' : 'Enter notice to broadcast to residents...'}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl p-3 text-white focus:outline-none focus:border-[#25D366] text-xs font-mono"
                />
              </div>
            )}

            <div className="pt-3 border-t border-[#1F1F23] flex items-center justify-between">
              <span className="text-[#6B6B76] font-mono text-xs">
                Target count: <strong className="text-white font-bold">{targets.length}</strong> resident(s)
              </span>
              <button
                onClick={handleDispatchAll}
                disabled={isSending || targets.length === 0}
                className="px-5 py-2 bg-[#25D366] text-black font-semibold rounded-full hover:brightness-110 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50 shadow-md text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching...' : targets.length === 1 ? 'Send Direct WhatsApp' : `Broadcast WhatsApp (${targets.length})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real WhatsApp Simulator & Live Preview */}
        <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6B6B76]">
                2. Live WhatsApp Preview
              </span>
              <span className="text-[10px] font-mono text-[#25D366] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span>Format: WhatsApp Markdown</span>
              </span>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="mt-3 bg-[#0B141A] p-4 rounded-2xl border border-[#1F2C34] space-y-2">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#1F2C34]">
                <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-serif font-bold text-xs">
                  HC
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Hanura Casa Official</p>
                  <p className="text-[9px] text-[#25D366]">Recipient: {sampleResident ? `${sampleResident.name} (${sampleResident.phone})` : 'Sample'}</p>
                </div>
              </div>

              <div className="bg-[#15151A] border border-[#23232A] p-3.5 rounded-xl text-white text-xs whitespace-pre-wrap font-sans leading-relaxed shadow max-h-56 overflow-y-auto">
                {currentPreviewText}
                <div className="text-[9px] text-[#6B6B76] text-right mt-2 flex items-center justify-end space-x-1 font-mono">
                  <span>10:45 AM</span>
                  <span className="text-[#25D366]">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#15151A] rounded-xl border border-[#23232A] text-xs text-[#D1D1D1] flex items-center justify-between gap-2">
            <button
              onClick={handleCopyPreview}
              className="flex items-center space-x-1.5 text-[#6B6B76] hover:text-white transition-colors"
            >
              {copiedPreview ? <Check className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPreview ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {sampleResident && (
              <button
                onClick={() => handleDirectSendOne(sampleResident)}
                className="px-3.5 py-1.5 bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/30 rounded-full font-semibold transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Chat to {sampleResident.name.split(' ')[0]}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Recipient List with 1-Click Direct WhatsApp Action */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
        <div className="p-4 bg-[#15151A] border-b border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Target Recipients ({targets.length})</h3>
            <p className="text-[11px] text-[#6B6B76]">Click "Direct WhatsApp" to instantly open the chat in WhatsApp Web or Desktop.</p>
          </div>
          <span className="text-xs font-mono text-[#D4AF37] bg-[#15151A] px-3 py-1 rounded-full border border-[#23232A]">
            Audience: {recipientTarget.replace('_', ' ')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D1D1]">
            <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-mono text-[10px] tracking-wider border-b border-[#1F1F23]">
              <tr>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-3">Room / Bed</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Aug Balance</th>
                <th className="py-3 px-3">KYC Status</th>
                <th className="py-3 px-4 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B6B76]">
                    No residents in this target group.
                  </td>
                </tr>
              ) : (
                targets.slice(0, 15).map(r => {
                  const p = payments.find(pay => pay.resident_id === r.id && pay.month === '2026-08');
                  const paid = p ? p.amount_paid : 0;
                  const bal = Math.max(0, (r.monthly_fee || 0) - paid);

                  return (
                    <tr key={r.id} className="hover:bg-[#15151A]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={r.photo_url}
                            alt={r.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#23232A]"
                          />
                          <div>
                            <p className="font-semibold text-white">{r.name}</p>
                            <p className="text-[10px] text-[#6B6B76] font-mono">{r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-white">Rm {r.current_room_number || 'N/A'}</span>
                        <span className="text-[#6B6B76] text-[10px] ml-1.5">(Bed {r.current_bed_number || '1'})</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#D1D1D1]">
                        {r.phone}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {(bal || 0) > 0 ? (
                          <span className="text-[#D4AF37] font-bold">₹{(bal || 0).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-[#4CAF50]">Cleared</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                          r.kyc_status === 'VERIFIED'
                            ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                            : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                        }`}>
                          {r.kyc_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDirectSendOne(r)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-medium transition-all"
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

      {/* Dispatched History Logs Table */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
        <div className="p-4 bg-[#15151A] border-b border-[#1F1F23] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Broadcast Delivery & Transmission Logs</h3>
            <p className="text-[11px] text-[#6B6B76]">Audit trail of all WhatsApp messages dispatched through the system.</p>
          </div>
          <span className="text-xs font-mono text-[#6B6B76]">{whatsappMessages.length} Messages Dispatched</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D1D1]">
            <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-mono text-[10px] tracking-wider border-b border-[#1F1F23]">
              <tr>
                <th className="py-3 px-4">Message ID</th>
                <th className="py-3 px-3">Resident</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Message Content</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {whatsappMessages.slice(0, 10).map(msg => (
                <tr key={msg.id} className="hover:bg-[#15151A]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">{msg.id}</td>
                  <td className="py-3 px-3 font-medium text-white">{msg.resident_name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#15151A] text-[#D4AF37] border border-[#23232A] font-mono text-[10px]">
                      {msg.message_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#D1D1D1] truncate max-w-xs">
                    {msg.message_content}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#6B6B76]">{msg.phone}</td>
                  <td className="py-3 px-3 font-mono text-[10px] text-[#6B6B76]">
                    {new Date(msg?.sent_at || Date.now()).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20 font-mono text-[9px] uppercase font-medium">
                      {msg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
