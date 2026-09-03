import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Room, Bed } from '../types';
import { api } from '../services/api';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ChevronRight,
  CreditCard,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  X,
  Layers,
  Plus,
  BedDouble,
  Settings
} from 'lucide-react';

interface RoomsProps {
  onSelectResident?: (residentId: string) => void;
}

export const Rooms: React.FC<RoomsProps> = ({ onSelectResident }) => {
  const {
    floors,
    rooms,
    beds,
    residents,
    payments,
    setPrintReceiptPayment,
    setSelectedResidentId,
    setActiveTab,
    setAddRoomModalOpen
  } = useApp();

  // Dynamic available floors from floors and rooms
  const availableFloors = useMemo(() => {
    const floorSet = new Set<number>();
    floors.forEach(f => floorSet.add(f.floor_number));
    rooms.forEach(r => floorSet.add(r.floor_number));
    const arr = Array.from(floorSet).sort((a, b) => a - b);
    return arr.length > 0 ? arr : [1];
  }, [floors, rooms]);

  const [selectedFloor, setSelectedFloor] = useState<number>(availableFloors[0] || 1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [paymentMatrixData, setPaymentMatrixData] = useState<any | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [selectedMatrixMonth, setSelectedMatrixMonth] = useState<string>('2026-08');
  const [viewMode, setViewMode] = useState<'single' | 'full'>('single');

  // Sync selected floor if availableFloors changes
  useEffect(() => {
    if (!availableFloors.includes(selectedFloor) && availableFloors.length > 0) {
      setSelectedFloor(availableFloors[0]);
    }
  }, [availableFloors, selectedFloor]);

  // Set default selected room on load or floor change
  useEffect(() => {
    const floorRooms = rooms.filter(r => r.floor_number === selectedFloor);
    if (floorRooms.length > 0) {
      if (!selectedRoom || selectedRoom.floor_number !== selectedFloor || !floorRooms.some(r => r.id === selectedRoom.id)) {
        setSelectedRoom(floorRooms[0]);
      }
    } else {
      setSelectedRoom(null);
    }
  }, [selectedFloor, rooms]);

  // Load signature Room Payment Matrix whenever selected room or payments/residents changes
  useEffect(() => {
    if (selectedRoom) {
      setMatrixLoading(true);
      api
        .getRoomPaymentMatrix(selectedRoom.id)
        .then(data => {
          setPaymentMatrixData(data);
          if (data?.active_month && !selectedMatrixMonth) {
            setSelectedMatrixMonth(data.active_month);
          }
        })
        .catch(err => {
          console.error('Error fetching room payment matrix:', err);
        })
        .finally(() => {
          setMatrixLoading(false);
        });
    } else {
      setPaymentMatrixData(null);
    }
  }, [selectedRoom?.id, payments, residents]);

  const handleSelectResident = (id: string) => {
    setSelectedResidentId(id);
    if (onSelectResident) onSelectResident(id);
    else setActiveTab('residents');
  };

  const filteredRooms = rooms.filter(r => r.floor_number === selectedFloor);

  const getRoomBadgeColor = (room: Room) => {
    if (room.status === 'MAINTENANCE') return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (room.occupied_beds_count === room.capacity) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (room.occupied_beds_count > 0) return 'bg-[#0CC6FF]/15 text-[#0CC6FF] border-[#0CC6FF]/30';
    return 'bg-[#141414] text-[#8E8E9F] border-white/[0.08]';
  };

  const getRoomCardBorder = (room: Room, isSelected: boolean) => {
    if (isSelected) return 'border-[#FF1E9A] ring-1 ring-[#FF1E9A]/40 shadow-[0_0_20px_rgba(255,30,154,0.25)]';
    if (room.status === 'MAINTENANCE') return 'border-rose-500/30';
    if (room.occupied_beds_count === room.capacity) return 'border-emerald-500/30';
    if (room.occupied_beds_count > 0) return 'border-[#0CC6FF]/30';
    return 'border-white/[0.08]';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Floor Selector */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0CC6FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              SPATIAL CONFIGURATION & INVENTORIES
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono font-bold">• {rooms.length} Suites Configured</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Floor & Suite Space Management
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Live occupancy tracking, bed allocations, and historical room payment matrix.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          {/* Floor Selection Tabs */}
          {availableFloors.length > 0 && rooms.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-[#0B0B0C] p-1.5 rounded-2xl border border-white/[0.08]">
              {availableFloors.map(flNum => (
                <button
                  key={flNum}
                  onClick={() => setSelectedFloor(flNum)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                    selectedFloor === flNum
                      ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white shadow-[0_0_15px_rgba(255,30,154,0.35)]'
                      : 'text-[#8E8E9F] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {flNum === 0 ? 'Ground Floor' : `Floor ${flNum}`}
                </button>
              ))}
            </div>
          )}

          {/* Quick Configure / Add Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configure in Settings</span>
          </button>
        </div>
      </div>

      {/* When NO rooms configured yet */}
      {rooms.length === 0 ? (
        <div className="bg-[#141414] p-12 rounded-2xl border border-white/[0.08] text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#FF1E9A]/10 border border-[#FF1E9A]/30 text-[#FF1E9A] flex items-center justify-center mx-auto shadow-lg">
            <BedDouble className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-heading font-extrabold text-white">No Rooms or Suites Added Yet</h3>
            <p className="text-xs text-[#8E8E9F] leading-relaxed">
              You have a clean database ready for configuration. Go to the Settings section to manually add floors, suites, bed counts, and tariffs. All newly added rooms will instantly populate here and in resident check-in!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl text-xs hover:brightness-110 shadow-[0_0_25px_rgba(255,30,154,0.4)] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rooms & Floors in Settings</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Color Status Legend */}
          <div className="flex items-center space-x-6 text-xs text-[#8E8E9F] px-1 overflow-x-auto scrollbar-none font-mono">
            <span className="font-bold text-white uppercase text-[10px]">Legend:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Full (100% Occupied)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0CC6FF]" />
              <span>Partial (Beds Available)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]" />
              <span>Vacant (All Beds Free)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Maintenance</span>
            </span>
          </div>

          {/* Floor Room Cards Grid */}
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center bg-[#141414] rounded-2xl border border-white/[0.08] text-xs text-[#8E8E9F]">
              No rooms configured on Floor {selectedFloor}. Go to Settings to add suites to Floor {selectedFloor}.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {filteredRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const badgeClass = getRoomBadgeColor(room);
                const borderClass = getRoomCardBorder(room, isSelected);

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`bg-[#141414] p-4 rounded-2xl border ${borderClass} cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between shadow-lg`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold font-mono text-white">
                          {room.room_number}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {room.occupied_beds_count}/{room.capacity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8E9F] mt-1">{room.sharing_type}</p>
                      <p className="text-[11px] font-mono text-[#0CC6FF] font-bold mt-0.5">
                        ₹{(room.monthly_fee || 0).toLocaleString('en-IN')}/mo
                      </p>
                    </div>

                    {/* Bed Dots */}
                    <div className="flex items-center space-x-1.5 mt-3 pt-2.5 border-t border-white/[0.06]">
                      {room.beds.map((b, idx) => (
                        <span
                          key={b.id || idx}
                          className={`w-2.5 h-2.5 rounded-full ${
                            b.status === 'OCCUPIED'
                              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                              : 'bg-white/10'
                          }`}
                          title={`Bed ${b.bed_number}: ${b.status} ${b.current_resident_name ? `(${b.current_resident_name})` : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SELECTED ROOM DEEP VIEW & SIGNATURE ROOM PAYMENT TABLE */}
          {selectedRoom && (
            <div className="space-y-6">
              {/* Room Header & Bed Details */}
              <div className="bg-[#141414] p-6 rounded-2xl border border-white/[0.08] space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold font-mono text-white">
                        Suite {selectedRoom.room_number}
                      </h3>
                      <span className="px-3 py-1 bg-[#0B0B0C] text-[#E4E4E7] rounded-xl text-xs font-mono border border-white/[0.08]">
                        {selectedRoom.floor_number === 0 ? 'Ground Floor' : `Floor ${selectedRoom.floor_number}`} • {selectedRoom.sharing_type}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase ${getRoomBadgeColor(
                          selectedRoom
                        )}`}
                      >
                        {selectedRoom.occupied_beds_count === selectedRoom.capacity
                          ? 'Fully Occupied'
                          : `${selectedRoom.vacant_beds_count} Bed(s) Available`}
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E9F] mt-1.5">
                      Monthly Tariff: <span className="text-[#0CC6FF] font-mono font-bold">₹{(selectedRoom.monthly_fee || 0).toLocaleString('en-IN')}</span> per resident
                    </p>
                  </div>
                </div>

                {/* Bed Allocation Cards */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E9F] mb-3">
                    Allocated Beds & Assigned Occupants
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedRoom.beds.map(bed => {
                      // Actively find resident assigned to this bed
                      const residentForBed = residents.find(r => 
                        r.status === 'ACTIVE' && (
                          (r.current_bed_id && r.current_bed_id === bed.id) ||
                          (r.current_room_id === selectedRoom.id && (r.current_bed_id === bed.id || r.current_bed_number === bed.bed_number)) ||
                          (r.current_room_number === selectedRoom.room_number && (r.current_bed_number === bed.bed_number || r.current_bed_id === bed.id))
                        )
                      );
                      const isOccupied = bed.status === 'OCCUPIED' || !!residentForBed;
                      const occupantName = residentForBed ? residentForBed.name : bed.current_resident_name || 'Resident';
                      const occupantId = residentForBed ? residentForBed.id : bed.current_resident_id;

                      return (
                        <div
                          key={bed.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isOccupied
                              ? 'bg-[#0B0B0C] border-emerald-500/30 shadow-md'
                              : 'bg-[#0B0B0C]/50 border-white/[0.06] border-dashed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-white">
                              Bed {bed.bed_number}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                isOccupied
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-white/[0.04] text-[#8E8E9F] border-white/[0.08]'
                              }`}
                            >
                              {isOccupied ? 'OCCUPIED' : 'VACANT'}
                            </span>
                          </div>

                          {isOccupied ? (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF1E9A] to-[#6C4CFF] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {occupantName.charAt(0)}
                                </div>
                                <p className="text-sm font-bold text-white truncate">
                                  {occupantName}
                                </p>
                              </div>
                              {occupantId && (
                                <button
                                  onClick={() => handleSelectResident(occupantId)}
                                  className="flex items-center space-x-1 text-xs text-[#FF1E9A] hover:underline font-medium"
                                >
                                  <span>View Profile</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="mt-3 text-xs text-[#8E8E9F] space-y-1">
                              <p>Vacant Slot</p>
                              <p className="font-mono text-[#0CC6FF] font-bold">
                                ₹{(bed.price || selectedRoom.monthly_fee || 0).toLocaleString('en-IN')}/mo
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Room Payment Matrix History */}
              <div className="bg-[#141414] p-5 sm:p-6 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-4 h-4 text-[#0CC6FF]" />
                    <div>
                      <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                        Suite {selectedRoom.room_number} Payment Ledger Matrix
                      </h4>
                      <p className="text-[11px] text-[#8E8E9F]">
                        Live bed-by-bed collection status & financial audit
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Month selector */}
                    <div className="flex items-center space-x-1.5 bg-[#0B0B0C] px-2.5 py-1 rounded-xl border border-white/[0.08]">
                      <span className="text-[10px] text-[#8E8E9F] uppercase font-mono font-bold">Month:</span>
                      <select
                        value={selectedMatrixMonth}
                        onChange={e => setSelectedMatrixMonth(e.target.value)}
                        className="bg-transparent text-xs text-white font-mono font-bold focus:outline-none cursor-pointer"
                      >
                        {(paymentMatrixData?.months || ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']).map((m: string) => (
                          <option key={m} value={m} className="bg-[#141414] text-white">
                            {m} {m === '2026-08' ? '(Current)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* View mode toggle */}
                    <div className="flex items-center bg-[#0B0B0C] p-0.5 rounded-xl border border-white/[0.08] text-[11px] font-medium">
                      <button
                        onClick={() => setViewMode('single')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          viewMode === 'single'
                            ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold'
                            : 'text-[#8E8E9F] hover:text-white'
                        }`}
                      >
                        Active Month
                      </button>
                      <button
                        onClick={() => setViewMode('full')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          viewMode === 'full'
                            ? 'bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold'
                            : 'text-[#8E8E9F] hover:text-white'
                        }`}
                      >
                        Multi-Month Grid
                      </button>
                    </div>
                  </div>
                </div>

                {matrixLoading && !paymentMatrixData ? (
                  <div className="py-8 text-center text-xs text-[#8E8E9F] font-mono animate-pulse">
                    Loading Room Suite Payment Ledger...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {viewMode === 'single' ? (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F]">
                            <th className="py-2.5 px-3">Bed</th>
                            <th className="py-2.5 px-3">Resident</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Monthly Rent</th>
                            <th className="py-2.5 px-3 font-bold text-white">{selectedMatrixMonth} Paid</th>
                            <th className="py-2.5 px-3 font-bold text-white">{selectedMatrixMonth} Balance</th>
                            <th className="py-2.5 px-3">Total Paid</th>
                            <th className="py-2.5 px-3 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] font-medium">
                          {(paymentMatrixData?.matrix && paymentMatrixData.matrix.length > 0
                            ? paymentMatrixData.matrix
                            : selectedRoom.beds.map(b => {
                                const occ = residents.find(r => r.id === b.current_resident_id);
                                const resPays = payments.filter(p => p.resident_id === occ?.id);
                                const curPay = resPays.find(p => p.month === selectedMatrixMonth);
                                const paid = curPay ? curPay.amount_paid : 0;
                                const monthlyFee = occ?.monthly_fee || selectedRoom.monthly_fee;
                                const bal = occ ? Math.max(0, monthlyFee - paid) : 0;
                                return {
                                  bed_number: b.bed_number,
                                  resident_id: occ?.id,
                                  resident_name: occ?.name || (b.status === 'OCCUPIED' ? 'Occupied' : 'Vacant Bed'),
                                  status: b.status,
                                  monthly_fee: monthlyFee,
                                  months: { [selectedMatrixMonth]: { paid, balance: bal } },
                                  paid_amount: paid,
                                  due_balance: bal,
                                  total_paid: resPays.reduce((s, p) => s + p.amount_paid, 0),
                                  total_balance: bal
                                };
                              })
                          ).map((row: any, idx: number) => {
                            // Dynamically calculate payments from live global context
                            const matchingPayments = row.resident_id
                              ? payments.filter(p => p.resident_id === row.resident_id && p.month === selectedMatrixMonth)
                              : [];
                            const liveMonthPaid = matchingPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
                            const monthInfo = row.months?.[selectedMatrixMonth];
                            const monthPaid = matchingPayments.length > 0 ? liveMonthPaid : (monthInfo?.paid || 0);
                            const fee = Number(row.monthly_fee) || Number(selectedRoom.monthly_fee) || 6500;
                            const hasResident = row.resident_id && row.status !== 'VACANT';
                            const monthBal = hasResident ? Math.max(0, fee - monthPaid) : 0;

                            const allResidentPayments = row.resident_id
                              ? payments.filter(p => p.resident_id === row.resident_id)
                              : [];
                            const liveTotalPaid = allResidentPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
                            const totalPaid = allResidentPayments.length > 0 ? liveTotalPaid : (row.total_paid || 0);

                            // Find matching payment for receipt print
                            const paymentRecord = payments.find(
                              p => p.resident_id === row.resident_id && p.month === selectedMatrixMonth
                            );

                            return (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 font-mono text-white font-bold">
                                  Bed {row.bed_number}
                                </td>
                                <td className="py-3 px-3">
                                  {hasResident ? (
                                    <button
                                      onClick={() => handleSelectResident(row.resident_id)}
                                      className="text-left font-bold text-white hover:text-[#0CC6FF] transition-colors"
                                    >
                                      {row.resident_name}
                                    </button>
                                  ) : (
                                    <span className="text-[#8E8E9F] italic">{row.resident_name || 'Vacant'}</span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                      row.status === 'OCCUPIED'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white/[0.04] text-[#8E8E9F] border border-white/[0.08]'
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono text-[#8E8E9F]">
                                  ₹{fee.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 font-mono font-bold">
                                  <span className={monthPaid > 0 ? 'text-emerald-400' : 'text-[#8E8E9F]'}>
                                    ₹{monthPaid.toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono font-bold">
                                  {monthBal > 0 ? (
                                    <span className="text-rose-400">₹{monthBal.toLocaleString('en-IN')} Due</span>
                                  ) : hasResident ? (
                                    <span className="text-emerald-400">Cleared</span>
                                  ) : (
                                    <span className="text-[#8E8E9F]">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 font-mono text-[#8E8E9F]">
                                  ₹{totalPaid.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {paymentRecord ? (
                                    <button
                                      onClick={() => setPrintReceiptPayment(paymentRecord)}
                                      title="Print Official Payment Receipt"
                                      className="p-1.5 bg-[#0B0B0C] hover:bg-white/[0.08] text-[#FF1E9A] border border-white/[0.08] rounded-xl transition-colors inline-flex items-center space-x-1 text-[10px]"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Receipt</span>
                                    </button>
                                  ) : (
                                    <span className="text-[#8E8E9F] text-[10px] font-mono">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      /* Multi-Month Grid View */
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F]">
                            <th className="py-2.5 px-3 sticky left-0 bg-[#141414] z-10">Bed / Resident</th>
                            {(paymentMatrixData?.months || ['2026-05', '2026-06', '2026-07', '2026-08']).map((m: string) => (
                              <th key={m} className="py-2.5 px-3 font-mono text-center">
                                {m}
                              </th>
                            ))}
                            <th className="py-2.5 px-3 font-mono text-right">Total Paid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] font-medium font-mono text-xs">
                          {paymentMatrixData?.matrix?.map((row: any, idx: number) => {
                            const resAllPayments = row.resident_id
                              ? payments.filter(p => p.resident_id === row.resident_id)
                              : [];
                            const resTotalPaid = resAllPayments.length > 0
                              ? resAllPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0)
                              : (row.total_paid || 0);

                            return (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="py-2.5 px-3 sticky left-0 bg-[#141414] z-10 whitespace-nowrap">
                                  <span className="font-bold text-white">Bed {row.bed_number}</span>
                                  <span className="text-[#8E8E9F] ml-2 text-[11px]">({row.resident_name})</span>
                                </td>
                                {(paymentMatrixData?.months || []).map((m: string) => {
                                  const matchingCellPayments = row.resident_id
                                    ? payments.filter(p => p.resident_id === row.resident_id && p.month === m)
                                    : [];
                                  const liveCellPaid = matchingCellPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
                                  const cell = row.months?.[m];
                                  const paid = matchingCellPayments.length > 0 ? liveCellPaid : (cell?.paid || 0);
                                  const monthlyRent = Number(row.monthly_fee) || Number(selectedRoom.monthly_fee) || 6500;
                                  const bal = row.status === 'VACANT' ? 0 : Math.max(0, monthlyRent - paid);

                                  return (
                                    <td key={m} className="py-2.5 px-3 text-center whitespace-nowrap">
                                      {paid > 0 ? (
                                        <span className="text-emerald-400 font-bold">₹{paid.toLocaleString('en-IN')}</span>
                                      ) : bal > 0 ? (
                                        <span className="text-rose-400/80">₹{bal.toLocaleString('en-IN')} due</span>
                                      ) : (
                                        <span className="text-white/20">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="py-2.5 px-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                                  ₹{resTotalPaid.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
