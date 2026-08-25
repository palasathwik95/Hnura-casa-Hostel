import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceRequest } from '../types';
import {
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  DollarSign,
  Sparkles
} from 'lucide-react';

export const Maintenance: React.FC = () => {
  const { maintenanceRequests, rooms, updateMaintenanceStatus, createMaintenanceRequest, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [roomId, setRoomId] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('Ramesh Yadav (Maintenance)');
  const [estimatedCost, setEstimatedCost] = useState(500);

  const filteredRequests = maintenanceRequests.filter(m => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.room_number && m.room_number.includes(q)) ||
      m.assigned_staff.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      addToast('error', 'Missing description', 'Please specify maintenance details.');
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    try {
      await createMaintenanceRequest({
        room_id: roomId || undefined,
        room_number: room ? room.room_number : undefined,
        floor_number: room ? room.floor_number : undefined,
        title: `${category} Repair - ${room ? `Room ${room.room_number}` : 'Common Area'}`,
        category,
        priority,
        description,
        assigned_staff: assignedStaff,
        estimated_cost: estimatedCost
      });
      setModalOpen(false);
      setDescription('');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0CC6FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              FACILITY ASSETS & HARDWARE OPERATIONS
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono font-bold">• Active Work Orders</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Asset Maintenance & Work Orders
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Preventative maintenance scheduling, technician dispatch, and expenditure tracking.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all z-10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search maintenance jobs by room, issue, category or staff..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#0CC6FF] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-md'
                  : 'bg-[#0B0B0C] text-[#8E8E9F] hover:text-white border border-white/[0.05]'
              }`}
            >
              {st === 'ALL' ? 'All Jobs' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map(req => (
          <div
            key={req.id}
            className="bg-[#141414] p-5 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#0B0B0C] text-[#0CC6FF] border border-white/[0.08]">
                  {req.id}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    req.priority === 'EMERGENCY'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : req.priority === 'HIGH'
                      ? 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                      : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08]'
                  }`}
                >
                  {req.priority}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-3">{req.title}</h4>
              <p className="text-xs text-[#E4E4E7] mt-1 leading-relaxed">{req.description}</p>

              <div className="mt-3.5 space-y-1.5 text-xs text-[#8E8E9F] font-mono bg-[#0B0B0C] p-3 rounded-xl border border-white/[0.06]">
                <p className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-white font-bold">
                    {req.room_number ? `Room ${req.room_number} (Floor ${req.floor_number})` : 'Common Area'}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Assigned Tech:</span>
                  <span className="text-[#0CC6FF] font-bold">{req.assigned_staff}</span>
                </p>
                <p className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <span className="text-emerald-400 font-bold">₹{(req.estimated_cost || 0).toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  req.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : req.status === 'IN_PROGRESS'
                    ? 'bg-[#FF6F3C]/15 text-[#FF6F3C] border border-[#FF6F3C]/30'
                    : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08]'
                }`}
              >
                {req.status}
              </span>

              <div className="flex items-center space-x-1.5">
                {req.status === 'PENDING' && (
                  <button
                    onClick={() => updateMaintenanceStatus({ request_id: req.id, status: 'IN_PROGRESS' })}
                    className="px-3 py-1.5 bg-[#0B0B0C] text-[#E4E4E7] hover:text-white border border-white/[0.08] rounded-xl text-xs font-bold transition-colors"
                  >
                    Start Job
                  </button>
                )}
                {req.status !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      const cost = prompt('Actual Cost (₹):', String(req.estimated_cost || 500));
                      updateMaintenanceStatus({
                        request_id: req.id,
                        status: 'COMPLETED',
                        actual_cost: cost ? Number(cost) : undefined
                      });
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Work Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/[0.08] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Maintenance Work Order</h3>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Room / Asset</label>
                  <select
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A]"
                  >
                    <option value="">Common Area / Facility</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} (Floor {r.floor_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A]"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical & Geyser</option>
                    <option value="CARPENTRY">Carpentry & Lock</option>
                    <option value="WIFI_ROUTER">Wi-Fi & Network</option>
                    <option value="APPLIANCE">Washing Machine / RO</option>
                    <option value="PEST_CONTROL">Pest Control</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency (SLA 2h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={e => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Assigned Technician / Staff</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={e => setAssignedStaff(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Geyser tripping breaker on floor 2 bathroom; replace thermostat element"
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl p-3 text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md transition-all"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
