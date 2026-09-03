import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building2,
  Phone,
  CreditCard,
  Send,
  RefreshCw,
  Save,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  BedDouble,
  Search,
  Check,
  Edit2,
  UserX
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    floors,
    rooms,
    beds,
    residents,
    updateSettings,
    createFloor,
    deleteFloor,
    createRoom,
    bulkCreateRooms,
    updateRoom,
    deleteRoom,
    addBedToRoom,
    decreaseBedInRoom,
    resetDemoDatabase,
    clearAllData,
    removeSampleData,
    addToast
  } = useApp();

  // Settings State
  const [propertyName, setPropertyName] = useState(settings?.property_name || 'Hanura Casa Luxury Living');
  const [propertyAddress, setPropertyAddress] = useState(settings?.address || 'Plot 42, Silicon Valley Layout, Madhapur, Hyderabad');
  const [propertyPhone, setPropertyPhone] = useState(settings?.contact_phone || '+91 8882997700');
  const [propertyUpi, setPropertyUpi] = useState(settings?.upi_id || 'hanuracasa@icici');
  const [whatsappApiKey, setWhatsappApiKey] = useState(settings?.whatsapp_access_token || 'wh_live_hc_98472918347239');
  const [adminName, setAdminName] = useState(settings?.admin_name || 'Sathwik Pala (Director)');

  // Room & Floor Management Tab
  const [builderTab, setBuilderTab] = useState<'SINGLE_ROOM' | 'BULK_ROOMS' | 'NEW_FLOOR' | 'INVENTORY'>('SINGLE_ROOM');

  // Single Room Form State
  const [singleFloorNum, setSingleFloorNum] = useState<number>(1);
  const [singleRoomNumber, setSingleRoomNumber] = useState<string>('101');
  const [singleCapacity, setSingleCapacity] = useState<number>(3);
  const [singleMonthlyFee, setSingleMonthlyFee] = useState<number>(8500);
  const [singleSharingType, setSingleSharingType] = useState<string>('3-Sharing');
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);

  // Bulk Rooms Form State
  const [bulkFloorNum, setBulkFloorNum] = useState<number>(1);
  const [bulkPrefix, setBulkPrefix] = useState<string>('10');
  const [bulkStartNum, setBulkStartNum] = useState<number>(1);
  const [bulkEndNum, setBulkEndNum] = useState<number>(6);
  const [bulkCapacity, setBulkCapacity] = useState<number>(3);
  const [bulkMonthlyFee, setBulkMonthlyFee] = useState<number>(8500);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [customRoomListInput, setCustomRoomListInput] = useState<string>('');
  const [bulkMode, setBulkMode] = useState<'RANGE' | 'CUSTOM'>('RANGE');

  // Floor Form State
  const [newFloorNum, setNewFloorNum] = useState<number>(1);
  const [newFloorName, setNewFloorName] = useState<string>('1st Floor - Executive');
  const [newFloorDesc, setNewFloorDesc] = useState<string>('Deluxe residential suites');
  const [isSubmittingFloor, setIsSubmittingFloor] = useState(false);

  // Inventory Search & Edit State
  const [inventorySearchQuery, setInventorySearchQuery] = useState<string>('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState<number>(8500);
  const [actionLoadingRoomId, setActionLoadingRoomId] = useState<string | null>(null);

  // Generate Preview of Bulk Room Numbers
  const generatedBulkRoomNumbers = useMemo(() => {
    if (bulkMode === 'CUSTOM') {
      return customRoomListInput
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }

    if (bulkStartNum > bulkEndNum) return [];

    const list: string[] = [];
    const p = bulkPrefix.trim();

    for (let i = bulkStartNum; i <= bulkEndNum; i++) {
      let rNum = '';
      if (!p) {
        rNum = String(i);
      } else if (/^\d+$/.test(p)) {
        // If prefix is single digit (like 1), and suffix is 1..9, make 101, 102. If suffix is 10..99, make 110, 111 (3 digits)
        if (p.length === 1) {
          const suffixStr = i < 10 ? `0${i}` : `${i}`;
          rNum = `${p}${suffixStr}`;
        } else if (p.length === 2 && p.endsWith('0')) {
          // If prefix is 10, 20, 30:
          // For suffix 1..9 -> 101, 102.. 109
          // For suffix 10..99 -> use prefix base (e.g. 1) + suffix -> 110, 111.. 199 (avoids 1010 4-digit bug)
          const baseFloor = p.slice(0, -1);
          if (i < 10) {
            rNum = `${p}${i}`;
          } else {
            rNum = `${baseFloor}${i}`;
          }
        } else {
          rNum = `${p}${i}`;
        }
      } else {
        rNum = `${p}${i}`;
      }
      list.push(rNum);
    }
    return list;
  }, [bulkMode, customRoomListInput, bulkPrefix, bulkStartNum, bulkEndNum]);

  // Filtered rooms for configured inventory
  const filteredConfiguredRooms = useMemo(() => {
    if (!inventorySearchQuery.trim()) return rooms;
    const q = inventorySearchQuery.trim().toLowerCase();
    return rooms.filter(r => 
      r.room_number.toLowerCase().includes(q) ||
      `floor ${r.floor_number}`.toLowerCase().includes(q) ||
      `${r.floor_number}` === q ||
      (r.sharing_type && r.sharing_type.toLowerCase().includes(q))
    );
  }, [rooms, inventorySearchQuery]);

  // Handle Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        property_name: propertyName,
        address: propertyAddress,
        contact_phone: propertyPhone,
        upi_id: propertyUpi,
        whatsapp_access_token: whatsappApiKey,
        admin_name: adminName
      });
    } catch (err) {
      // handled in context
    }
  };

  // Handle Single Room Submit
  const handleCreateSingleRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleRoomNumber.trim()) {
      addToast('error', 'Validation Error', 'Please enter a valid room number.');
      return;
    }

    setIsSubmittingRoom(true);
    try {
      await createRoom({
        floor_number: Number(singleFloorNum),
        room_number: singleRoomNumber.trim(),
        capacity: Number(singleCapacity),
        monthly_fee: Number(singleMonthlyFee),
        sharing_type: singleSharingType || `${singleCapacity}-Sharing`
      });
      // Increment room number suggestion
      const numericPart = parseInt(singleRoomNumber, 10);
      if (!isNaN(numericPart)) {
        setSingleRoomNumber(String(numericPart + 1));
      }
    } catch (err) {
      // handled
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  // Handle Bulk Rooms Submit
  const handleCreateBulkRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedBulkRoomNumbers.length === 0) {
      addToast('error', 'No Rooms Generated', 'Please check your room number range or custom list.');
      return;
    }

    setIsSubmittingBulk(true);
    try {
      await bulkCreateRooms({
        floor_number: Number(bulkFloorNum),
        room_numbers: generatedBulkRoomNumbers,
        capacity: Number(bulkCapacity),
        monthly_fee: Number(bulkMonthlyFee),
        sharing_type: `${bulkCapacity}-Sharing`
      });
      setBuilderTab('INVENTORY');
    } catch (err) {
      // handled
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Handle Floor Submit
  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFloor(true);
    try {
      await createFloor({
        floor_number: Number(newFloorNum),
        name: newFloorName || `Floor ${newFloorNum}`,
        description: newFloorDesc
      });
      setNewFloorNum(newFloorNum + 1);
      setNewFloorName(`Floor ${newFloorNum + 1}`);
    } catch (err) {
      // handled
    } finally {
      setIsSubmittingFloor(false);
    }
  };

  // Handle Quick Edit Room Fee
  const handleSaveRoomFee = async (roomId: string) => {
    try {
      await updateRoom(roomId, { monthly_fee: Number(editFee) });
      setEditingRoomId(null);
    } catch (err) {
      // handled
    }
  };

  // Handle Bed Increase
  const handleIncreaseBed = async (roomId: string) => {
    setActionLoadingRoomId(roomId);
    try {
      await addBedToRoom(roomId);
    } catch (err) {
      // handled
    } finally {
      setActionLoadingRoomId(null);
    }
  };

  // Handle Bed Decrease
  const handleDecreaseBed = async (roomId: string) => {
    setActionLoadingRoomId(roomId);
    try {
      await decreaseBedInRoom(roomId);
    } catch (err) {
      // handled
    } finally {
      setActionLoadingRoomId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="bg-[#141414] p-6 lg:p-8 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6C4CFF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#8E8E9F]">
              SYSTEM PREFERENCES & PROPERTY ARCHITECTURE
            </span>
            <span className="text-xs text-[#0CC6FF] font-mono font-bold">
              • {floors.length} Floors • {rooms.length} Suites • {beds.length} Total Beds
            </span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            Property Settings & Space Builder
          </h2>
          <p className="text-xs text-[#8E8E9F] mt-1">
            Configure floors, rooms, and live bed inventory with dynamic capacity scaling and instant global synchronization.
          </p>
        </div>

        {/* Database Management Fast Actions */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => {
              if (
                confirm(
                  'Remove all sample residents, payments, and test data?\n\nThis leaves your configured floors and rooms intact, with all beds reset to vacant and ready for real residents.'
                )
              ) {
                removeSampleData();
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#FF6F3C]/10 text-[#FF6F3C] hover:bg-[#FF6F3C]/20 border border-[#FF6F3C]/30 text-xs font-bold transition-all shadow-sm"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Remove Sample Data</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to CLEAR ALL DATA?\n\nThis will remove all rooms, beds, floors, residents, and payments so you can build your custom hostel structure from scratch.'
                )
              ) {
                clearAllData();
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data (Clean Slate)</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Load sample demo dataset? This will populate sample rooms, residents, and payments for testing.'
                )
              ) {
                resetDemoDatabase();
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0B0B0C] text-[#8E8E9F] hover:text-white border border-white/[0.08] text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FLOOR & ROOM INVENTORY BUILDER */}
      {/* ========================================================================= */}
      <div className="bg-[#141414] rounded-2xl border border-white/[0.08] p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF1E9A]/20 to-[#6C4CFF]/20 border border-[#FF1E9A]/40 flex items-center justify-center text-[#FF1E9A] shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-extrabold text-white">
                Floor, Suite & Bed Inventory Management
              </h3>
              <p className="text-xs text-[#8E8E9F]">
                Provision single or bulk rooms, adjust live bed capacity per room, and manage floors.
              </p>
            </div>
          </div>

          {/* Builder Sub-Tabs */}
          <div className="flex items-center space-x-1 bg-[#0B0B0C] p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
            <button
              onClick={() => setBuilderTab('SINGLE_ROOM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                builderTab === 'SINGLE_ROOM'
                  ? 'bg-[#FF1E9A] text-white shadow-md'
                  : 'text-[#8E8E9F] hover:text-white'
              }`}
            >
              + Add Single Room
            </button>
            <button
              onClick={() => setBuilderTab('BULK_ROOMS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                builderTab === 'BULK_ROOMS'
                  ? 'bg-[#0CC6FF] text-black shadow-md'
                  : 'text-[#8E8E9F] hover:text-white'
              }`}
            >
              ⚡ Bulk Rooms Setup
            </button>
            <button
              onClick={() => setBuilderTab('NEW_FLOOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                builderTab === 'NEW_FLOOR'
                  ? 'bg-[#6C4CFF] text-white shadow-md'
                  : 'text-[#8E8E9F] hover:text-white'
              }`}
            >
              + Add Floor
            </button>
            <button
              onClick={() => setBuilderTab('INVENTORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                builderTab === 'INVENTORY'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#8E8E9F] hover:text-white'
              }`}
            >
              📋 View Configured ({rooms.length} Suites)
            </button>
          </div>
        </div>

        {/* TAB 1: ADD SINGLE ROOM */}
        {builderTab === 'SINGLE_ROOM' && (
          <form onSubmit={handleCreateSingleRoom} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Floor Number *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={singleFloorNum}
                  onChange={e => setSingleFloorNum(Number(e.target.value))}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
                <p className="text-[10px] text-[#8E8E9F] mt-1">Floor 0 = Ground Floor</p>
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Room / Suite Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 101, 102, G01"
                  value={singleRoomNumber}
                  onChange={e => setSingleRoomNumber(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
                <p className="text-[10px] text-[#8E8E9F] mt-1">Unique room identifier</p>
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Number of Beds (Capacity) *
                </label>
                <select
                  value={singleCapacity}
                  onChange={e => {
                    const cap = Number(e.target.value);
                    setSingleCapacity(cap);
                    setSingleSharingType(cap === 1 ? 'Single Private' : `${cap}-Sharing`);
                  }}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                >
                  <option value={1}>1 Bed (Single Private)</option>
                  <option value={2}>2 Beds (2-Sharing)</option>
                  <option value={3}>3 Beds (3-Sharing)</option>
                  <option value={4}>4 Beds (4-Sharing)</option>
                  <option value={5}>5 Beds (5-Sharing)</option>
                  <option value={6}>6 Beds (6-Sharing)</option>
                </select>
                <p className="text-[10px] text-[#8E8E9F] mt-1">Creates Bed 1 to Bed {singleCapacity}</p>
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Monthly Rent / Bed (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={singleMonthlyFee}
                  onChange={e => setSingleMonthlyFee(Number(e.target.value))}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
                <p className="text-[10px] text-[#8E8E9F] mt-1">Default rate for each bed slot</p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
              <span className="text-xs text-[#8E8E9F]">
                Will create <strong className="text-white">Suite {singleRoomNumber}</strong> on Floor {singleFloorNum} with {singleCapacity} bed slots @ ₹{singleMonthlyFee.toLocaleString('en-IN')}/mo.
              </span>
              <button
                type="submit"
                disabled={isSubmittingRoom}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl text-xs hover:brightness-110 shadow-[0_0_20px_rgba(255,30,154,0.35)] active:scale-95 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingRoom ? 'Adding Room...' : 'Add Room to Property'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BULK ROOMS PROVISIONER */}
        {builderTab === 'BULK_ROOMS' && (
          <form onSubmit={handleCreateBulkRooms} className="space-y-6">
            <div className="bg-[#0B0B0C] p-4 rounded-xl border border-[#0CC6FF]/30 flex items-start space-x-3 text-xs text-[#0CC6FF]">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Fast Batch Room Provisioner</p>
                <p className="text-[#8E8E9F] text-[11px] mt-0.5">
                  Generate an entire wing of rooms in one click with accurate 3-digit numbering (e.g. 101–112 on Floor 1, 201–212 on Floor 2).
                </p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBulkMode('RANGE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  bulkMode === 'RANGE'
                    ? 'bg-[#0CC6FF] text-black shadow-md'
                    : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08] hover:text-white'
                }`}
              >
                Range Mode (Floor + Prefix + Range)
              </button>
              <button
                type="button"
                onClick={() => setBulkMode('CUSTOM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  bulkMode === 'CUSTOM'
                    ? 'bg-[#0CC6FF] text-black shadow-md'
                    : 'bg-[#0B0B0C] text-[#8E8E9F] border border-white/[0.08] hover:text-white'
                }`}
              >
                Custom List Mode (Comma-Separated)
              </button>
            </div>

            {bulkMode === 'RANGE' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Target Floor *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={bulkFloorNum}
                    onChange={e => {
                      const fl = Number(e.target.value);
                      setBulkFloorNum(fl);
                      setBulkPrefix(`${fl}0`);
                    }}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                    required
                  />
                  <p className="text-[10px] text-[#8E8E9F] mt-1">Floor index</p>
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Room Prefix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10, 20, 1, G"
                    value={bulkPrefix}
                    onChange={e => setBulkPrefix(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                  />
                  <p className="text-[10px] text-[#8E8E9F] mt-1">Prefix added to room no.</p>
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Room Range (Start & End) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      value={bulkStartNum}
                      onChange={e => setBulkStartNum(Number(e.target.value))}
                      className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-2.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                      placeholder="Start (1)"
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      value={bulkEndNum}
                      onChange={e => setBulkEndNum(Number(e.target.value))}
                      className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-2.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                      placeholder="End (6)"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-[#8E8E9F] mt-1">e.g. 1 to 12</p>
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Beds Per Room *
                  </label>
                  <select
                    value={bulkCapacity}
                    onChange={e => setBulkCapacity(Number(e.target.value))}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                  >
                    <option value={1}>1 Bed (Single)</option>
                    <option value={2}>2 Beds (2-Sharing)</option>
                    <option value={3}>3 Beds (3-Sharing)</option>
                    <option value={4}>4 Beds (4-Sharing)</option>
                    <option value={5}>5 Beds (5-Sharing)</option>
                    <option value={6}>6 Beds (6-Sharing)</option>
                  </select>
                  <p className="text-[10px] text-[#8E8E9F] mt-1">Bed slots per suite</p>
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Monthly Rent / Bed (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={bulkMonthlyFee}
                    onChange={e => setBulkMonthlyFee(Number(e.target.value))}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                    required
                  />
                  <p className="text-[10px] text-[#8E8E9F] mt-1">Rent per bed slot</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Target Floor *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={bulkFloorNum}
                    onChange={e => setBulkFloorNum(Number(e.target.value))}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Custom Room Numbers (Comma-Separated) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101, 102, 103, 104, 105, 106, 107, 108"
                    value={customRoomListInput}
                    onChange={e => setCustomRoomListInput(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                    Monthly Rent / Bed (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={bulkMonthlyFee}
                    onChange={e => setBulkMonthlyFee(Number(e.target.value))}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Live Room Numbers Preview Box */}
            <div className="bg-[#0B0B0C] p-4 rounded-xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8E8E9F] font-bold">
                  Generated Suite Numbers Preview ({generatedBulkRoomNumbers.length} Rooms):
                </span>
                <span className="text-[11px] text-[#0CC6FF] font-mono">
                  {generatedBulkRoomNumbers.length * bulkCapacity} Total Beds
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {generatedBulkRoomNumbers.length > 0 ? (
                  generatedBulkRoomNumbers.map((rNo, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.1] rounded-lg text-xs font-mono font-bold text-white"
                    >
                      Suite {rNo}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#8E8E9F] italic">No room numbers generated yet. Adjust range or prefix.</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8E8E9F]">
                Ready to provision <strong className="text-white">{generatedBulkRoomNumbers.length} suites</strong> on Floor {bulkFloorNum}.
              </span>
              <button
                type="submit"
                disabled={isSubmittingBulk || generatedBulkRoomNumbers.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0CC6FF] to-[#6C4CFF] text-black font-bold rounded-xl text-xs hover:brightness-110 shadow-[0_0_20px_rgba(12,198,255,0.35)] active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>
                  {isSubmittingBulk
                    ? 'Generating...'
                    : `Batch Generate ${generatedBulkRoomNumbers.length} Rooms`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ADD FLOOR */}
        {builderTab === 'NEW_FLOOR' && (
          <form onSubmit={handleCreateFloor} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Floor Number *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={newFloorNum}
                  onChange={e => setNewFloorNum(Number(e.target.value))}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#6C4CFF]"
                  required
                />
                <p className="text-[10px] text-[#8E8E9F] mt-1">Floor index</p>
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Floor Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st Floor - Executive"
                  value={newFloorName}
                  onChange={e => setNewFloorName(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#6C4CFF]"
                  required
                />
                <p className="text-[10px] text-[#8E8E9F] mt-1">Label shown across system</p>
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">
                  Description / Wing Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe student suites"
                  value={newFloorDesc}
                  onChange={e => setNewFloorDesc(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#6C4CFF]"
                />
                <p className="text-[10px] text-[#8E8E9F] mt-1">Optional floor notes</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8E8E9F]">
                Will create new floor record for organizing suites.
              </span>
              <button
                type="submit"
                disabled={isSubmittingFloor}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#6C4CFF] to-[#FF1E9A] text-white font-bold rounded-xl text-xs hover:brightness-110 shadow-[0_0_20px_rgba(108,76,255,0.35)] active:scale-95 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingFloor ? 'Creating Floor...' : 'Create Floor'}</span>
              </button>
            </div>

            {/* List Existing Floors with Delete Option */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8E8E9F]">
                Existing Floors ({floors.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {floors.map(fl => {
                  const floorRooms = rooms.filter(r => r.floor_id === fl.id || r.floor_number === fl.floor_number);
                  const floorOccupied = floorRooms.reduce((sum, r) => {
                    return sum + (r.beds || []).filter(b => 
                      residents.some(res => 
                        res.status === 'ACTIVE' && (
                          res.current_bed_id === b.id ||
                          (res.current_room_id === r.id && (res.current_bed_id === b.id || res.current_bed_number === b.bed_number)) ||
                          (res.current_room_number === r.room_number && (res.current_bed_number === b.bed_number || res.current_bed_id === b.id))
                        )
                      )
                    ).length;
                  }, 0);
                  const floorTotalBeds = floorRooms.reduce((sum, r) => sum + r.capacity, 0);

                  return (
                    <div
                      key={fl.id}
                      className="p-3.5 bg-[#0B0B0C] border border-white/[0.08] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white text-xs">
                            Floor {fl.floor_number}
                          </span>
                          <span className="text-xs text-[#8E8E9F]">({fl.name})</span>
                        </div>
                        <p className="text-[10px] text-[#8E8E9F] mt-0.5 font-mono">
                          {floorRooms.length} Suites • {floorOccupied}/{floorTotalBeds} Beds Occupied
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (floorOccupied > 0) {
                            alert(`Cannot delete Floor ${fl.floor_number} because it contains active residents.`);
                            return;
                          }
                          if (confirm(`Delete Floor ${fl.floor_number} (${fl.name}) and all its rooms?`)) {
                            deleteFloor(fl.id);
                          }
                        }}
                        className="p-1.5 text-[#8E8E9F] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete floor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {/* TAB 4: CONFIGURED INVENTORY LIST & SEARCH & BED CONTROLS */}
        {builderTab === 'INVENTORY' && (
          <div className="space-y-4">
            {/* Search Bar and Live Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B0B0C] p-3 rounded-xl border border-white/[0.08]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#8E8E9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Room No. (e.g. 101, 204) or Floor..."
                  value={inventorySearchQuery}
                  onChange={e => setInventorySearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-white text-xs font-medium placeholder-[#8E8E9F] focus:outline-none focus:border-[#FF1E9A]"
                />
                {inventorySearchQuery && (
                  <button
                    onClick={() => setInventorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8E8E9F] hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[#8E8E9F]">
                  Showing <strong className="text-white">{filteredConfiguredRooms.length}</strong> of {rooms.length} Suites
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {residents.filter(res => res.status === 'ACTIVE').length}/{beds.length} Total Beds Occupied
                </span>
              </div>
            </div>

            {filteredConfiguredRooms.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0B0C] rounded-2xl border border-white/[0.08] space-y-3">
                <BedDouble className="w-8 h-8 text-[#8E8E9F] mx-auto opacity-50" />
                <h4 className="text-base font-bold text-white">No Suites Match Search</h4>
                <p className="text-xs text-[#8E8E9F] max-w-md mx-auto">
                  {inventorySearchQuery
                    ? `No suites found matching "${inventorySearchQuery}". Try clearing the search bar.`
                    : "You haven't configured any rooms yet. Use '+ Add Single Room' or '⚡ Bulk Rooms Setup' above."}
                </p>
                {inventorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setInventorySearchQuery('')}
                    className="px-4 py-2 bg-white/[0.06] text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1.5 hover:bg-white/[0.1]"
                  >
                    <span>Clear Search</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F]">
                        <th className="py-3 px-3 font-bold">Floor</th>
                        <th className="py-3 px-3 font-bold">Suite No.</th>
                        <th className="py-3 px-3 font-bold">Capacity & Bed Controls</th>
                        <th className="py-3 px-3 font-bold">Occupancy</th>
                        <th className="py-3 px-3 font-bold">Monthly Fee / Bed</th>
                        <th className="py-3 px-3 font-bold text-right">Room Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] font-medium">
                      {filteredConfiguredRooms.map(r => {
                        const isEditing = editingRoomId === r.id;
                        const isBusy = actionLoadingRoomId === r.id;
                        const roomOccupiedCount = (r.beds || []).filter(b => 
                          residents.some(res => 
                            res.status === 'ACTIVE' && (
                              res.current_bed_id === b.id ||
                              (res.current_room_id === r.id && (res.current_bed_id === b.id || res.current_bed_number === b.bed_number)) ||
                              (res.current_room_number === r.room_number && (res.current_bed_number === b.bed_number || res.current_bed_id === b.id))
                            )
                          )
                        ).length;
                        const vacantCount = Math.max(0, r.capacity - roomOccupiedCount);

                        return (
                          <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-3 font-mono text-white">
                              Floor {r.floor_number}
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-[#FF1E9A] text-sm">
                              Suite {r.room_number}
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-white font-bold">{r.capacity} Beds</span>
                                <span className="text-[10px] text-[#8E8E9F]">({r.sharing_type})</span>
                                
                                {/* Quick Bed Stepper Controls */}
                                <div className="inline-flex items-center bg-[#0B0B0C] border border-white/[0.1] rounded-lg p-0.5 ml-2">
                                  <button
                                    onClick={() => handleDecreaseBed(r.id)}
                                    disabled={vacantCount === 0 || isBusy}
                                    className={`p-1 rounded text-white transition-all ${
                                      vacantCount === 0
                                        ? 'opacity-30 cursor-not-allowed text-[#8E8E9F]'
                                        : 'hover:bg-rose-500/20 hover:text-rose-400'
                                    }`}
                                    title={
                                      vacantCount === 0
                                        ? 'Cannot decrease beds: all beds are occupied by residents'
                                        : 'Decrease 1 bed from this suite'
                                    }
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-1.5 font-mono text-[11px] font-bold text-white">
                                    {r.capacity}
                                  </span>
                                  <button
                                    onClick={() => handleIncreaseBed(r.id)}
                                    disabled={isBusy}
                                    className="p-1 rounded text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
                                    title="Increase 1 bed in this suite"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Bed Slot Visual Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {r.beds.map((b, idx) => {
                                  const hasResident = residents.some(res => 
                                    res.status === 'ACTIVE' && (
                                      res.current_bed_id === b.id ||
                                      (res.current_room_id === r.id && (res.current_bed_id === b.id || res.current_bed_number === b.bed_number)) ||
                                      (res.current_room_number === r.room_number && (res.current_bed_number === b.bed_number || res.current_bed_id === b.id))
                                    )
                                  );
                                  return (
                                    <span
                                      key={b.id || idx}
                                      title={`Bed ${b.bed_number}: ${hasResident ? 'OCCUPIED' : 'VACANT'}`}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center space-x-1 ${
                                        hasResident
                                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-white/[0.04] text-[#8E8E9F] border border-white/[0.08]'
                                      }`}
                                    >
                                      <span>B{b.bed_number}</span>
                                      {hasResident && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                  roomOccupiedCount === r.capacity && r.capacity > 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : roomOccupiedCount > 0
                                    ? 'bg-[#0CC6FF]/10 text-[#0CC6FF] border-[#0CC6FF]/30'
                                    : 'bg-white/[0.04] text-[#8E8E9F] border-white/[0.08]'
                                }`}
                              >
                                {roomOccupiedCount}/{r.capacity} Occupied
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-[#0CC6FF]">
                              {isEditing ? (
                                <div className="flex items-center space-x-1">
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    value={editFee}
                                    onChange={e => setEditFee(Number(e.target.value))}
                                    className="w-20 bg-[#0B0B0C] border border-[#0CC6FF] rounded px-1.5 py-0.5 text-white font-mono text-xs"
                                  />
                                  <button
                                    onClick={() => handleSaveRoomFee(r.id)}
                                    className="p-1 rounded bg-[#0CC6FF] text-black hover:brightness-110"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1.5">
                                  <span>₹{(r.monthly_fee || 0).toLocaleString('en-IN')}/mo</span>
                                  <button
                                    onClick={() => {
                                      setEditingRoomId(r.id);
                                      setEditFee(r.monthly_fee || 8000);
                                    }}
                                    className="p-0.5 text-[#8E8E9F] hover:text-white"
                                    title="Edit rent fee"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleIncreaseBed(r.id)}
                                  className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-white rounded-lg text-[10px] font-bold transition-colors"
                                  title="Add 1 Bed Slot to this Room"
                                >
                                  + Bed
                                </button>
                                <button
                                  onClick={() => handleDecreaseBed(r.id)}
                                  disabled={vacantCount === 0}
                                  className={`px-2.5 py-1 bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-400 text-white rounded-lg text-[10px] font-bold transition-colors ${
                                    vacantCount === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title={
                                    vacantCount === 0
                                      ? 'No vacant beds to remove'
                                      : 'Remove 1 vacant bed slot'
                                  }
                                >
                                  - Bed
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete Room ${r.room_number}? This will remove the suite and its vacant beds.`)) {
                                      deleteRoom(r.id);
                                    }
                                  }}
                                  disabled={roomOccupiedCount > 0}
                                  className={`p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors ${
                                    roomOccupiedCount > 0 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title={
                                    roomOccupiedCount > 0
                                      ? 'Cannot delete room with active residents'
                                      : 'Delete Room'
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: GLOBAL PROPERTY & PAYMENT SETTINGS */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Info */}
          <div className="bg-[#141414] p-6 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF1E9A] flex items-center space-x-2 pb-2 border-b border-white/[0.08]">
              <Building2 className="w-4 h-4 text-[#FF1E9A]" />
              <span>Property & Campus Identity</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">Property Name</label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={e => setPropertyName(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">Physical Address</label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={e => setPropertyAddress(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">Helpdesk Phone</label>
                  <input
                    type="text"
                    value={propertyPhone}
                    onChange={e => setPropertyPhone(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#FF1E9A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">Director / Admin Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF1E9A]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment & API Credentials */}
          <div className="bg-[#141414] p-6 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0CC6FF] flex items-center space-x-2 pb-2 border-b border-white/[0.08]">
              <CreditCard className="w-4 h-4 text-[#0CC6FF]" />
              <span>Payments & WhatsApp API Integration</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">Hostel Official UPI ID</label>
                <input
                  type="text"
                  value={propertyUpi}
                  onChange={e => setPropertyUpi(e.target.value)}
                  placeholder="e.g. hanuracasa@icici"
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#0CC6FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1.5">WhatsApp Cloud API Key</label>
                <input
                  type="password"
                  value={whatsappApiKey}
                  onChange={e => setWhatsappApiKey(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#0CC6FF]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl text-xs hover:brightness-110 shadow-[0_0_20px_rgba(255,30,154,0.35)] active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Property Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
