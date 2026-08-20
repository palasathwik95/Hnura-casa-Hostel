import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

interface RoomsProps {
  onSelectResident: (residentId: string) => void;
}

export const Rooms: React.FC<RoomsProps> = ({ onSelectResident }) => {
  const { floors, rooms, beds, setPrintReceiptPayment, setSelectedResidentId } = useApp();

  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [paymentMatrixData, setPaymentMatrixData] = useState<any | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);

  // Set default selected room on load or floor change
  useEffect(() => {
    const floorRooms = rooms.filter(r => r.floor_number === selectedFloor);
    if (floorRooms.length > 0 && (!selectedRoom || selectedRoom.floor_number !== selectedFloor)) {
      setSelectedRoom(floorRooms[0]);
    }
  }, [selectedFloor, rooms]);

  // Load signature Room Payment Matrix whenever selected room changes
  useEffect(() => {
    if (selectedRoom) {
      setMatrixLoading(true);
      api
        .getRoomPaymentMatrix(selectedRoom.id)
        .then(data => {
          setPaymentMatrixData(data);
        })
        .catch(err => {
          console.error('Error fetching room payment matrix:', err);
        })
        .finally(() => {
          setMatrixLoading(false);
        });
    }
  }, [selectedRoom?.id]);

  const filteredRooms = rooms.filter(r => r.floor_number === selectedFloor);

  const getRoomBadgeColor = (room: Room) => {
    if (room.status === 'MAINTENANCE') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (room.occupied_beds_count === room.capacity) return 'bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20';
    if (room.occupied_beds_count > 0) return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
    return 'bg-[#15151A] text-[#6B6B76] border-[#1F1F23]';
  };

  const getRoomCardBorder = (room: Room, isSelected: boolean) => {
    if (isSelected) return 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30 shadow-lg';
    if (room.status === 'MAINTENANCE') return 'border-rose-500/30';
    if (room.occupied_beds_count === room.capacity) return 'border-[#4CAF50]/30';
    if (room.occupied_beds_count > 0) return 'border-[#D4AF37]/30';
    return 'border-[#1F1F23]';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Floor Selector */}
      <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B6B76]">
              Architectural Spatial Mapping
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">• {rooms.length} Suites Configured</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white mt-1">
            Floor & Room Asset Management
          </h2>
          <p className="text-xs text-[#6B6B76] mt-1">
            Real-time occupancy tracking, bed allocations and historical room payment matrix.
          </p>
        </div>

        {/* Floor Selection Tabs */}
        <div className="flex items-center space-x-2 bg-[#15151A] p-1.5 rounded-full border border-[#23232A]">
          {[1, 2, 3, 4].map(flNum => (
            <button
              key={flNum}
              onClick={() => setSelectedFloor(flNum)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                selectedFloor === flNum
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                  : 'text-[#6B6B76] hover:text-white hover:bg-[#1F1F23]'
              }`}
            >
              Floor {flNum}
            </button>
          ))}
        </div>
      </div>

      {/* Color Status Legend */}
      <div className="flex items-center space-x-6 text-xs text-[#6B6B76] px-1 overflow-x-auto">
        <span className="font-semibold text-[#D1D1D1]">Legend:</span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
          <span>Full (100% Occupied)</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {filteredRooms.map(room => {
          const isSelected = selectedRoom?.id === room.id;
          const badgeClass = getRoomBadgeColor(room);
          const borderClass = getRoomCardBorder(room, isSelected);

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`bg-[#0F0F12] p-4 rounded-2xl border ${borderClass} cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-light font-mono text-white">
                    {room.room_number}
                  </span>
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {room.occupied_beds_count}/{room.capacity}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B76] mt-1">{room.sharing_type}</p>
                <p className="text-[10px] font-mono text-[#D4AF37] font-medium mt-0.5">
                  ₹{(room.monthly_fee || 0).toLocaleString('en-IN')}/mo
                </p>
              </div>

              {/* Bed Dots */}
              <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-[#1F1F23]">
                {room.beds.map((b, idx) => (
                  <span
                    key={b.id || idx}
                    className={`w-2 h-2 rounded-full ${
                      b.status === 'OCCUPIED'
                        ? 'bg-[#4CAF50]'
                        : 'bg-[#27272A]'
                    }`}
                    title={`Bed ${b.bed_number}: ${b.status} ${b.current_resident_name ? `(${b.current_resident_name})` : ''}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED ROOM DEEP VIEW & SIGNATURE ROOM PAYMENT TABLE */}
      {selectedRoom && (
        <div className="space-y-6">
          {/* Room Header & Bed Details */}
          <div className="bg-[#0F0F12] p-6 rounded-2xl border border-[#1F1F23] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F23]">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-light font-mono text-white">
                    Suite {selectedRoom.room_number}
                  </h3>
                  <span className="px-3 py-1 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-mono border border-[#23232A]">
                    Floor {selectedRoom.floor_number} • {selectedRoom.sharing_type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${getRoomBadgeColor(
                      selectedRoom
                    )}`}
                  >
                    {selectedRoom.occupied_beds_count === selectedRoom.capacity
                      ? 'Fully Occupied'
                      : `${selectedRoom.vacant_beds_count} Bed(s) Available`}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B76] mt-1">
                  Monthly Tariff: <span className="text-[#D4AF37] font-mono">₹{(selectedRoom.monthly_fee || 0).toLocaleString('en-IN')}</span> per resident • Amenities:{' '}
                  {selectedRoom.amenities.join(', ')}
                </p>
              </div>
            </div>

            {/* Bed Slots Visual Row */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#6B6B76] mb-3">
                Assigned Suite Inventories ({selectedRoom.beds.length} Bed Capacity)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {selectedRoom.beds.map(bed => {
                  const isOcc = bed.status === 'OCCUPIED';
                  return (
                    <div
                      key={bed.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isOcc
                          ? 'bg-[#15151A] border-[#23232A]'
                          : 'bg-[#0F0F12] border-[#1F1F23] border-dashed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#D1D1D1]">
                          Bed #{bed.bed_number}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase ${
                            isOcc
                              ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                              : 'bg-[#15151A] text-[#6B6B76]'
                          }`}
                        >
                          {bed.status}
                        </span>
                      </div>

                      {isOcc && bed.current_resident_name ? (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-white truncate">
                            {bed.current_resident_name}
                          </p>
                          <button
                            onClick={() => {
                              if (bed.current_resident_id) {
                                onSelectResident(bed.current_resident_id);
                              }
                            }}
                            className="text-[10px] text-[#D4AF37] hover:underline block mt-1 uppercase tracking-wider"
                          >
                            Open Profile →
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#6B6B76] mt-3 italic">Vacant (Available)</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIGNATURE FEATURE: ROOM PAYMENT TABLE */}
          <div className="bg-[#0F0F12] rounded-2xl border border-[#1F1F23] overflow-hidden">
            <div className="p-5 bg-[#15151A] border-b border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <h3 className="text-base font-semibold text-white">
                    Room {selectedRoom.room_number} Financial & Payment Matrix
                  </h3>
                  <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] uppercase tracking-widest">
                    Signature Matrix
                  </span>
                </div>
                <p className="text-xs text-[#6B6B76] mt-1">
                  Complete historical month-by-month financial ledger of all occupants. Preserves historical revenue even after vacating.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {matrixLoading ? (
                <div className="p-8 text-center text-[#6B6B76]">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D4AF37] mx-auto" />
                  <p className="text-xs mt-2">Loading room financial matrix...</p>
                </div>
              ) : !paymentMatrixData || paymentMatrixData.matrix.length === 0 ? (
                <div className="p-8 text-center text-[#6B6B76] text-xs">
                  No payment records registered for Room {selectedRoom.room_number}.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-[#D1D1D1]">
                  <thead className="bg-[#15151A] text-[#6B6B76] uppercase font-semibold text-[10px] tracking-widest border-b border-[#1F1F23]">
                    <tr>
                      <th className="py-3.5 px-4">Resident</th>
                      <th className="py-3.5 px-3">Bed</th>
                      <th className="py-3.5 px-3">Advance</th>
                      {paymentMatrixData.months.map((m: string) => (
                        <th key={m} className="py-3.5 px-3 text-center">
                          {m.split('-')[1] === '01' ? 'Jan' :
                           m.split('-')[1] === '02' ? 'Feb' :
                           m.split('-')[1] === '03' ? 'Mar' :
                           m.split('-')[1] === '04' ? 'Apr' :
                           m.split('-')[1] === '05' ? 'May' :
                           m.split('-')[1] === '06' ? 'Jun' :
                           m.split('-')[1] === '07' ? 'Jul' : 'Aug'}
                        </th>
                      ))}
                      <th className="py-3.5 px-4 font-bold text-[#4CAF50]">Total Paid</th>
                      <th className="py-3.5 px-4 font-bold text-[#D4AF37]">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F23]">
                    {paymentMatrixData.matrix.map((row: any) => (
                      <tr key={row.resident_id} className="hover:bg-[#15151A]/60 transition-colors">
                        {/* Resident */}
                        <td className="py-3 px-4">
                          <div
                            className="cursor-pointer group flex items-center space-x-2.5"
                            onClick={() => onSelectResident(row.resident_id)}
                          >
                            <img
                              src={row.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                              alt={row.resident_name}
                              className="w-7 h-7 rounded-full object-cover border border-[#23232A]"
                            />
                            <div>
                              <p className="font-semibold text-white group-hover:text-[#D4AF37] text-xs">
                                {row.resident_name}
                              </p>
                              <span className="text-[9px] font-mono text-[#6B6B76] uppercase">{row.status}</span>
                            </div>
                          </div>
                        </td>

                        {/* Bed */}
                        <td className="py-3 px-3 font-mono text-white">
                          #{row.bed_number}
                        </td>

                        {/* Advance */}
                        <td className="py-3 px-3 font-mono text-[#D4AF37]">
                          ₹{(row.current_advance || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Months Jan-Aug with EXACT AMOUNT PAID */}
                        {paymentMatrixData.months.map((m: string) => {
                          const cell = row.months[m];
                          const paid = cell ? cell.paid : 0;
                          return (
                            <td key={m} className="py-3 px-3 text-center font-mono">
                              {paid > 0 ? (
                                <span className="px-2 py-1 rounded bg-[#4CAF50]/10 text-[#4CAF50] font-medium border border-[#4CAF50]/20 text-[10px]">
                                  ₹{(paid || 0).toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-[#3F3F46] text-[10px]">₹0</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total Paid */}
                        <td className="py-3 px-4 font-mono font-medium text-[#4CAF50] text-sm">
                          ₹{(row.total_paid || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 font-mono font-medium">
                          {(row.total_balance || 0) > 0 ? (
                            <span className="text-[#D4AF37]">₹{(row.total_balance || 0).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-[#4CAF50]">₹0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
