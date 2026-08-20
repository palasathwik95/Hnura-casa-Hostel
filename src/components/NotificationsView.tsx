import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, Clock, Trash2, ArrowRight } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, setActiveTab, setSelectedResidentId } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Real-time Feeds
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Alerts & Webhooks</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            System Notifications & Operational Alerts
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Real-time triggers for payments, complaints, maintenance SLA, and KYC verifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#15151A] text-[#D4AF37] border border-[#23232A] text-xs font-mono">
            {notifications.length} Alerts
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] divide-y divide-[#1F1F23] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-[#6B6B76]">
            No notifications in your feed.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between hover:bg-[#15151A]/60 transition-colors ${
                !n.is_read ? 'bg-[#15151A]/40' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    !n.is_read ? 'bg-[#D4AF37] ring-2 ring-[#D4AF37]/20' : 'bg-[#23232A]'
                  }`}
                />
                <div>
                  <h4 className="text-sm font-medium text-white">{n.title}</h4>
                  <p className="text-xs text-[#D1D1D1] mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-[#6B6B76] font-mono flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1 text-[#6B6B76]" />
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {n.link_tab && (
                  <button
                    onClick={() => {
                      markNotificationRead(n.id);
                      setActiveTab(n.link_tab as any);
                      if (n.related_id && n.link_tab === 'residents') {
                        setSelectedResidentId(n.related_id);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#15151A] hover:bg-[#1F1F28] text-[#D4AF37] border border-[#23232A] rounded-full text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
