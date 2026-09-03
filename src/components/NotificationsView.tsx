import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, Clock, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, setActiveTab, setSelectedResidentId } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF1E9A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              REAL-TIME OPERATIONAL FEEDS
            </span>
            <span className="text-xs text-[#FF1E9A] font-mono font-bold">• System Alerts</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Notifications & Event Broadcasts
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Triggers for rent collections, maintenance work orders, grievance SLA limits, and Digital KYC.
          </p>
        </div>

        <div className="flex items-center space-x-2 z-10">
          <span className="px-4 py-2 rounded-xl bg-[#0B0B0C] text-[#FF1E9A] border border-white/[0.08] text-xs font-mono font-bold">
            {notifications.length} Alerts
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[#141414] rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden shadow-xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-[#8E8E9F]">
            No notifications in your feed.
          </div>
        ) : (
          notifications.map((n, index) => (
            <div
              key={`${n.id || 'notif'}-${index}`}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors ${
                !n.is_read ? 'bg-[#FF1E9A]/[0.02]' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    !n.is_read ? 'bg-[#FF1E9A] shadow-[0_0_10px_#FF1E9A]' : 'bg-white/20'
                  }`}
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-[#E4E4E7] mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-[#8E8E9F] font-mono flex items-center mt-1.5">
                    <Clock className="w-3 h-3 mr-1 text-[#8E8E9F]" />
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {n.link_tab && (
                  <button
                    onClick={() => {
                      markNotificationRead(n.id);
                      setActiveTab(n.link_tab as any);
                      if (n.related_id && n.link_tab === 'residents') {
                        setSelectedResidentId(n.related_id);
                      }
                    }}
                    className="px-4 py-1.5 bg-[#0B0B0C] hover:bg-white/10 text-[#0CC6FF] border border-white/[0.08] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>View Record</span>
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
