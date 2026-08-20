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
  User
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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Service SLA & Hospitality
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Active Ticketing</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Resident Grievance & SLA Resolution
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Real-time complaint ticketing, SLA timers, and automated WhatsApp resolution broadcasts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono">
            {complaints.filter(c => c.status !== 'RESOLVED').length} Unresolved
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grievances by resident name, room, category, description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                  : 'bg-[#15151A] text-[#6B6B76] hover:text-white'
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
            className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#15151A] text-[#D4AF37] border border-[#23232A]">
                  {c.id}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                    c.priority === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : c.priority === 'HIGH'
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                      : 'bg-[#15151A] text-[#6B6B76] border border-[#23232A]'
                  }`}
                >
                  {c.priority}
                </span>
              </div>

              <div className="mt-2.5">
                <h4 className="text-sm font-semibold text-white">
                  {c.category} • {c.room_number ? `Room ${c.room_number}` : 'Common Area'}
                </h4>
                <p className="text-xs text-[#D1D1D1] mt-1">{c.description}</p>
              </div>

              <div className="mt-3 text-xs text-[#6B6B76] font-mono bg-[#15151A] p-3 rounded-xl border border-[#23232A] space-y-1">
                <p className="flex justify-between">
                  <span>Resident:</span>
                  <span className="text-white font-medium">{c.resident_name}</span>
                </p>
                <p className="flex justify-between">
                  <span>Assigned:</span>
                  <span className="text-[#D4AF37]">{c.assigned_person}</span>
                </p>
                <p className="flex justify-between">
                  <span>SLA Target:</span>
                  <span className="text-[#4CAF50]">{c.sla_hours} Hours</span>
                </p>
              </div>

              {c.resolution_notes && (
                <div className="mt-2 bg-[#4CAF50]/10 border border-[#4CAF50]/20 p-2 rounded-xl text-[11px] text-[#4CAF50]">
                  <p className="font-semibold">Resolution Note:</p>
                  <p>{c.resolution_notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1F1F23]">
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                  c.status === 'RESOLVED'
                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                    : c.status === 'IN_PROGRESS'
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                    : 'bg-[#15151A] text-[#6B6B76] border border-[#23232A]'
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
                  className="px-3 py-1.5 bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20 border border-[#4CAF50]/20 rounded-full text-xs font-medium flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Resolve Grievance #{selectedComplaint.id}</h3>
            <p className="text-xs text-[#6B6B76]">
              Resident: {selectedComplaint.resident_name} (Room {selectedComplaint.room_number})
            </p>
            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6B76] mb-1">Resolution Summary & Action Taken</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Technician replaced bathroom geyser coil. Hot water supply restored and tested."
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F23]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110"
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
