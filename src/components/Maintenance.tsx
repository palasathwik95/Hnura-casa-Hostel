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
  DollarSign
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
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Facility & Asset Operations
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• Active Work Orders</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Asset Maintenance & Work Orders
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Preventative maintenance scheduling, technician dispatch, and expenditure tracking.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B6B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search maintenance jobs by room, issue, category or staff..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                  : 'bg-[#15151A] text-[#6B6B76] hover:text-white'
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
            className="bg-[#0F0F12] p-5 rounded-2xl border border-[#1F1F23] space-y-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#15151A] text-[#D4AF37] border border-[#23232A]">
                  {req.id}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                    req.priority === 'EMERGENCY'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : req.priority === 'HIGH'
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                      : 'bg-[#15151A] text-[#6B6B76] border border-[#23232A]'
                  }`}
                >
                  {req.priority}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mt-2.5">{req.title}</h4>
              <p className="text-xs text-[#D1D1D1] mt-1">{req.description}</p>

              <div className="mt-3 space-y-1 text-xs text-[#6B6B76] font-mono bg-[#15151A] p-3 rounded-xl border border-[#23232A]">
                <p className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-white font-medium">
                    {req.room_number ? `Room ${req.room_number} (Floor ${req.floor_number})` : 'Common Area'}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Assigned Tech:</span>
                  <span className="text-[#4CAF50]">{req.assigned_staff}</span>
                </p>
                <p className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <span className="text-[#D4AF37] font-semibold">₹{(req.estimated_cost || 0).toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1F1F23]">
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                  req.status === 'COMPLETED'
                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                    : req.status === 'IN_PROGRESS'
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                    : 'bg-[#15151A] text-[#6B6B76] border border-[#23232A]'
                }`}
              >
                {req.status}
              </span>

              <div className="flex items-center space-x-1.5">
                {req.status === 'PENDING' && (
                  <button
                    onClick={() => updateMaintenanceStatus({ request_id: req.id, status: 'IN_PROGRESS' })}
                    className="px-3 py-1 bg-[#15151A] text-[#D1D1D1] hover:bg-[#1F1F23] border border-[#23232A] rounded-full text-xs font-medium"
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
                    className="px-3 py-1 bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20 border border-[#4CAF50]/20 rounded-full text-xs font-medium flex items-center space-x-1"
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Create Maintenance Work Order</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B6B76] mb-1">Room / Asset</label>
                  <select
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
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
                  <label className="block text-[#6B6B76] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
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
                  <label className="block text-[#6B6B76] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency (SLA 2h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B6B76] mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={e => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1">Assigned Technician / Staff</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={e => setAssignedStaff(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Geyser tripping breaker on floor 2 bathroom; replace thermostat element"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F23]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110"
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
