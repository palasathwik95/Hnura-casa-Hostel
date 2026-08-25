import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint } from '../types';
import {
  MessageSquareWarning,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  User,
  Sparkles
} from 'lucide-react';

export const Complaints: React.FC = () => {
  const { complaints, residents, resolveComplaint, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      c.resident_name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.room_number && c.room_number.includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await resolveComplaint({
        complaint_id: selectedComplaint.id,
        resolution_notes: resolutionNotes || 'Resolved by Warden on duty.'
      });
      setResolveModalOpen(false);
      setSelectedComplaint(null);
      setResolutionNotes('');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF1E9A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              HOSPITALITY SLA & TICKETING
            </span>
            <span className="text-xs text-[#FF1E9A] font-mono font-bold">• Active Grievances</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Resident Grievance & SLA Resolution
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Complaint ticketing, SLA response timers, and automated WhatsApp notifications.
          </p>
        </div>

        <div className="flex items-center space-x-2 z-10">
          <span className="px-4 py-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
            {complaints.filter(c => c.status !== 'RESOLVED').length} Unresolved
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grievances by resident name, room, category, description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-md'
                  : 'bg-[#0B0B0C] text-[#8E8E9F] hover:text-white border border-white/[0.05]'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComplaints.map(c => (
          <div
            key={c.id}
            className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#0B0B0C] text-[#0CC6FF] border border-white/[0.08]">
                  {c.id}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    c.priority === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : c.priority === 'HIGH'
                      ? 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                      : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08]'
                  }`}
                >
                  {c.priority}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-white">
                  {c.category} • {c.room_number ? `Room ${c.room_number}` : 'Common Area'}
                </h4>
                <p className="text-xs text-[#E4E4E7] mt-1 leading-relaxed">{c.description}</p>
              </div>

              <div className="mt-3.5 text-xs text-[#8E8E9F] font-mono bg-[#0B0B0C] p-3 rounded-xl border border-white/[0.06] space-y-1.5">
                <p className="flex justify-between">
                  <span>Resident:</span>
                  <span className="text-white font-bold">{c.resident_name}</span>
                </p>
                <p className="flex justify-between">
                  <span>Assigned Staff:</span>
                  <span className="text-[#0CC6FF] font-bold">{c.assigned_person}</span>
                </p>
                <p className="flex justify-between">
                  <span>SLA Target:</span>
                  <span className="text-emerald-400 font-bold">{c.sla_hours} Hours</span>
                </p>
              </div>

              {c.resolution_notes && (
                <div className="mt-2.5 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-[11px] text-emerald-400">
                  <p className="font-bold">Resolution Note:</p>
                  <p className="mt-0.5">{c.resolution_notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  c.status === 'RESOLVED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : c.status === 'IN_PROGRESS'
                    ? 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                    : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08]'
                }`}
              >
                {c.status}
              </span>

              {c.status !== 'RESOLVED' && (
                <button
                  onClick={() => {
                    setSelectedComplaint(c);
                    setResolveModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve Ticket</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/[0.08] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Resolve Grievance #{selectedComplaint.id}</h3>
            <p className="text-xs text-[#8E8E9F]">
              Resident: {selectedComplaint.resident_name} (Room {selectedComplaint.room_number})
            </p>
            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Resolution Summary & Action Taken</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Technician replaced bathroom geyser coil. Hot water supply restored and tested."
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl p-3 text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md transition-all"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
