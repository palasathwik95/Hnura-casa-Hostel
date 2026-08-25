import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Resident, Room, Bed, Payment } from '../types';
import {
  X,
  Plus,
  UserPlus,
  CreditCard,
  ArrowRightLeft,
  UserMinus,
  Receipt,
  Search,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Trash2,
  Send,
  Upload,
  FileCheck,
  ShieldCheck,
  Camera,
  FileText
} from 'lucide-react';

// ==========================================
// 1. ADD RESIDENT MODAL
// ==========================================
export const AddResidentModal: React.FC = () => {
  const {
    addResidentModalOpen,
    setAddResidentModalOpen,
    rooms,
    createResident,
    addToast
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [academicYear, setAcademicYear] = useState('2nd Year');
  const [dob, setDob] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');

  // Allocation
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedNumber, setSelectedBedNumber] = useState<number>(1);
  const [monthlyFee, setMonthlyFee] = useState<number>(7500);
  const [initialAdvance, setInitialAdvance] = useState<number>(5000);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80');

  // Filter available rooms with at least 1 vacant bed
  const availableRooms = rooms.filter(r => r.vacant_beds_count > 0 && r.status !== 'MAINTENANCE');

  // When room is selected, update default fee and find available bed numbers
  const currentRoom = rooms.find(r => r.id === selectedRoomId);
  const vacantBedsInSelectedRoom = currentRoom
    ? currentRoom.beds.filter(b => b.status === 'VACANT')
    : [];

  useEffect(() => {
    if (currentRoom) {
      setMonthlyFee(currentRoom.monthly_fee);
      if (vacantBedsInSelectedRoom.length > 0) {
        setSelectedBedNumber(vacantBedsInSelectedRoom[0].bed_number);
      }
    }
  }, [selectedRoomId]);

  if (!addResidentModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedRoomId || !selectedBedNumber) {
      addToast('error', 'Missing Information', 'Please fill in all required fields and assign a room.');
      return;
    }

    try {
      await createResident({
        name,
        phone,
        whatsapp: whatsapp || phone,
        email,
        college,
        course,
        academic_year: academicYear,
        date_of_birth: dob,
        parent_name: parentName,
        parent_phone: parentPhone,
        emergency_contact: emergencyContact,
        permanent_address: permanentAddress,
        room_id: selectedRoomId,
        bed_number: Number(selectedBedNumber),
        monthly_fee: Number(monthlyFee),
        initial_advance: Number(initialAdvance),
        photo_url: photoUrl
      });
      setAddResidentModalOpen(false);
      // Reset form
      setName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setCollege('');
      setSelectedRoomId('');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF1E9A]/15 text-[#FF1E9A] flex items-center justify-center border border-[#FF1E9A]/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Enroll New Resident</h3>
              <p className="text-[10px] text-[#8E8E9F] font-mono">Real-time Check-In & Room Matrix Synchronization</p>
            </div>
          </div>
          <button
            onClick={() => setAddResidentModalOpen(false)}
            className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Basic Profile */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#0CC6FF] font-bold">1. Personal & Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sathwik Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">Primary Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF1E9A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="Optional if same as phone"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#0CC6FF]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="resident@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#0CC6FF]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: College & Work */}
          <div className="space-y-2 pt-2 border-t border-white/[0.05]">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#6C4CFF] font-bold">2. Academic / Professional Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">College / Employer</label>
                <input
                  type="text"
                  placeholder="e.g. CBIT / TCS"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#6C4CFF]"
                />
              </div>
              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">Course / Role</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#6C4CFF]"
                />
              </div>
              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#6C4CFF]"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Room & Bed Allocation */}
          <div className="space-y-2 pt-2 border-t border-white/[0.05]">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#FF6F3C] font-bold">3. Room & Bed Allocation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[#8E8E9F] mb-1 font-medium">Assign Room (Vacant Only) *</label>
                <select
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6F3C]"
                  required
                >
                  <option value="">-- Choose Available Room --</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} (Floor {r.floor_number} • {r.sharing_type} • ₹{r.monthly_fee}/mo • {r.vacant_beds_count} beds free)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8E8E9F] mb-1 font-medium">Bed Number *</label>
                <select
                  value={selectedBedNumber}
                  onChange={e => setSelectedBedNumber(Number(e.target.value))}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF6F3C]"
                  disabled={!selectedRoomId}
                  required
                >
                  {vacantBedsInSelectedRoom.map(b => (
                    <option key={b.id} value={b.bed_number}>
                      Bed #{b.bed_number} (Available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[#8E8E9F] mb-1 font-medium">Monthly Rent Fee (₹) *</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={e => setMonthlyFee(Number(e.target.value))}
                  className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[#0CC6FF] font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAddResidentModalOpen(false)}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
            >
              Enroll & Confirm Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. EDIT RESIDENT MODAL
// ==========================================
interface EditResidentModalProps {
  resident?: Resident | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const EditResidentModal: React.FC<EditResidentModalProps> = ({
  resident: propResident,
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const {
    editingResident,
    editResidentModalOpen,
    closeEditResidentModal,
    updateResident,
    addToast
  } = useApp();

  const resident = propResident || editingResident;
  const isOpen = propIsOpen !== undefined ? propIsOpen : editResidentModalOpen;
  const handleClose = propOnClose || closeEditResidentModal;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(6500);

  useEffect(() => {
    if (resident) {
      setName(resident.name || '');
      setPhone(resident.phone || '');
      setWhatsapp(resident.whatsapp || resident.phone || '');
      setEmail(resident.email || '');
      setCollege(resident.college || '');
      setCourse(resident.course || '');
      setMonthlyFee(resident.monthly_fee || 6500);
    }
  }, [resident]);

  if (!isOpen || !resident) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateResident({
        id: resident.id,
        name,
        phone,
        whatsapp,
        email,
        college,
        course,
        monthly_fee: Number(monthlyFee)
      });
      handleClose();
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base font-heading font-bold text-white">Edit Resident Profile</h3>
            <p className="text-[10px] text-[#8E8E9F] font-mono">{resident.id} • Room {resident.current_room_number}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF1E9A]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF1E9A]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#0CC6FF]"
              />
            </div>
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Monthly Fee (₹)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={e => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[#0CC6FF] font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[#8E8E9F] mb-1 font-medium">College / Employer</label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#6C4CFF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl text-xs hover:brightness-110 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. TRANSFER ROOM MODAL
// ==========================================
interface TransferModalProps {
  resident?: Resident | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TransferRoomModal: React.FC<TransferModalProps> = ({
  resident: propResident,
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const {
    transferResident,
    transferModalOpen,
    closeTransferResidentModal,
    rooms,
    transferRoom,
    addToast
  } = useApp();

  const resident = propResident || transferResident;
  const isOpen = propIsOpen !== undefined ? propIsOpen : transferModalOpen;
  const handleClose = propOnClose || closeTransferResidentModal;

  const [newRoomId, setNewRoomId] = useState('');
  const [newBedNumber, setNewBedNumber] = useState<number>(1);
  const [transferReason, setTransferReason] = useState('Resident requested single/double sharing upgrade');

  const selectedNewRoom = rooms.find(r => r.id === newRoomId);
  const vacantBedsInNewRoom = selectedNewRoom
    ? selectedNewRoom.beds.filter(b => b.status === 'VACANT')
    : [];

  useEffect(() => {
    if (vacantBedsInNewRoom.length > 0) {
      setNewBedNumber(vacantBedsInNewRoom[0].bed_number);
    }
  }, [newRoomId]);

  if (!isOpen || !resident) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomId || !newBedNumber) {
      addToast('error', 'Selection Required', 'Please choose the target room and bed.');
      return;
    }

    try {
      await transferRoom({
        resident_id: resident.id,
        new_room_id: newRoomId,
        new_bed_number: Number(newBedNumber),
        reason: transferReason
      });
      handleClose();
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0CC6FF]/15 text-[#0CC6FF] flex items-center justify-center border border-[#0CC6FF]/30">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Transfer Room</h3>
              <p className="text-[10px] text-[#8E8E9F] font-mono">{resident.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0B0B0C] p-3.5 rounded-xl border border-white/[0.08] text-xs font-mono">
          <p className="text-[#8E8E9F]">Current Assignment:</p>
          <p className="text-white font-bold text-sm mt-0.5">
            Room {resident.current_room_number || 'N/A'} (Bed {resident.current_bed_number || 'N/A'}) • Floor {resident.floor_number || 1}
          </p>
        </div>

        <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Select Destination Room</label>
            <select
              value={newRoomId}
              onChange={e => setNewRoomId(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#0CC6FF]"
              required
            >
              <option value="">-- Choose Target Room --</option>
              {rooms
                .filter(r => r.id !== resident.current_room_id && r.vacant_beds_count > 0)
                .map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} (Floor {r.floor_number} • {r.sharing_type} • {r.vacant_beds_count} free bed)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Select Destination Bed Slot</label>
            <select
              value={newBedNumber}
              onChange={e => setNewBedNumber(Number(e.target.value))}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#0CC6FF]"
              disabled={!newRoomId}
              required
            >
              {vacantBedsInNewRoom.map(b => (
                <option key={b.id} value={b.bed_number}>
                  Bed #{b.bed_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Transfer Reason / Note</label>
            <input
              type="text"
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#0CC6FF]"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#0CC6FF] to-[#6C4CFF] text-white font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Confirm Room Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. MARK VACATED MODAL (NON-DESTRUCTIVE)
// ==========================================
interface VacateModalProps {
  resident?: Resident | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const VacateResidentModal: React.FC<VacateModalProps> = ({
  resident: propResident,
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const {
    vacateResidentTarget,
    vacateModalOpen,
    closeVacateResidentModal,
    vacateResident
  } = useApp();

  const resident = propResident || vacateResidentTarget;
  const isOpen = propIsOpen !== undefined ? propIsOpen : vacateModalOpen;
  const handleClose = propOnClose || closeVacateResidentModal;

  const [vacateDate, setVacateDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen || !resident) return null;

  const handleVacate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vacateResident({
        resident_id: resident.id,
        vacate_date: vacateDate,
        refund_advance: false,
        deductions_amount: 0,
        deductions_reason: ''
      });
      handleClose();
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <UserMinus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Vacate Resident</h3>
              <p className="text-[10px] text-[#8E8E9F] font-mono">{resident.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0B0B0C] border border-[#FF6F3C]/20 p-3.5 rounded-xl text-xs space-y-1">
          <p className="font-bold text-[#FF6F3C] flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Non-Destructive Move-Out</span>
          </p>
          <p className="text-[11px] text-[#8E8E9F] leading-relaxed">
            Vacating frees Bed #{resident.current_bed_number} in Room {resident.current_room_number} for new occupants while preserving 100% of payment history, records, and documents.
          </p>
        </div>

        <form onSubmit={handleVacate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Official Move-Out Date</label>
            <input
              type="date"
              value={vacateDate}
              onChange={e => setVacateDate(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF1E9A]"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-500 to-[#FF1E9A] text-white font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              Confirm Move-Out & Release Bed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. UPLOAD DIGITAL KYC MODAL
// ==========================================
export const UploadKYCModal: React.FC = () => {
  const {
    uploadKYCModalOpen,
    setUploadKYCModalOpen,
    uploadKYCResident,
    setUploadKYCResident,
    residents,
    uploadKYC,
    addToast
  } = useApp();

  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [docType, setDocType] = useState('AADHAAR');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadKYCResident) {
      setSelectedResidentId(uploadKYCResident.id);
    }
  }, [uploadKYCResident]);

  if (!uploadKYCModalOpen) return null;

  const currentResident = residents.find(r => r.id === (uploadKYCResident?.id || selectedResidentId));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFilePreview(result);
      setDocUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResident) {
      addToast('error', 'Missing Resident', 'Please select a resident to attach this document to.');
      return;
    }

    setIsUploading(true);
    try {
      const finalDocUrl = docUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
      const finalDocName = docName || `${docType}_Document_${currentResident.name.replace(/\s+/g, '_')}.pdf`;

      await uploadKYC({
        resident_id: currentResident.id,
        document_type: docType,
        document_name: finalDocName,
        document_url: finalDocUrl
      });

      addToast('success', 'Document Uploaded', `${docType} document successfully added to vault.`);
      setUploadKYCModalOpen(false);
      setUploadKYCResident(null);
      setFilePreview(null);
      setDocUrl('');
      setDocName('');
    } catch (err) {
      // handled
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0CC6FF]/15 text-[#0CC6FF] flex items-center justify-center border border-[#0CC6FF]/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Upload Digital KYC Document</h3>
              <p className="text-[10px] text-[#8E8E9F] font-mono">Encrypted resident verification vault</p>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadKYCModalOpen(false);
              setUploadKYCResident(null);
            }}
            className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Target Resident *</label>
            <select
              value={selectedResidentId}
              onChange={e => setSelectedResidentId(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#0CC6FF]"
              required
            >
              <option value="">-- Choose Resident --</option>
              {residents.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id}) • Room {r.current_room_number || 'Vacated'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Document Classification *</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF1E9A]"
              >
                <option value="AADHAAR">Aadhaar Card (Front & Back)</option>
                <option value="PAN">PAN Card</option>
                <option value="COLLEGE_ID">College / University ID</option>
                <option value="EMPLOYEE_ID">Company Employee ID</option>
                <option value="PASSPORT">Passport / Driving License</option>
                <option value="RENTAL_AGREEMENT">Signed Rental Agreement</option>
                <option value="POLICE_VERIFICATION">Police Verification Slip</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Document Title / Label</label>
              <input
                type="text"
                placeholder="e.g. Aadhaar_Original_Scan"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF1E9A]"
              />
            </div>
          </div>

          {/* File Picker & Drag-Drop */}
          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Select Image / PDF File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/[0.15] hover:border-[#0CC6FF]/50 bg-[#0B0B0C] rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-white/[0.02] group"
            >
              {filePreview ? (
                <div className="space-y-2">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-36 mx-auto rounded-xl border border-white/[0.1] object-contain shadow-lg"
                  />
                  <p className="text-[11px] text-[#0CC6FF] font-mono">{docName}</p>
                  <p className="text-[10px] text-[#8E8E9F]">Click to choose a different file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#0CC6FF]/10 text-[#0CC6FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white">Click or drag & drop document here</p>
                  <p className="text-[10px] text-[#8E8E9F]">Supports PNG, JPG, WEBP, or PDF scans (up to 10MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setUploadKYCModalOpen(false);
                setUploadKYCResident(null);
              }}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-gradient-to-r from-[#0CC6FF] to-[#6C4CFF] text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(12,198,255,0.35)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Save to KYC Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. RECORD PAYMENT MODAL
// ==========================================
export const RecordPaymentModal: React.FC = () => {
  const {
    recordPaymentModalOpen,
    setRecordPaymentModalOpen,
    preselectedResidentForPayment,
    setPreselectedResidentForPayment,
    residents,
    payments,
    recordPayment,
    addToast
  } = useApp();

  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [billingMonth, setBillingMonth] = useState('2026-08');
  const [amountPaid, setAmountPaid] = useState<number>(6500);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD'>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const currentResident = residents.find(r => r.id === (preselectedResidentForPayment?.id || selectedResidentId));
  const existingPayment = payments.find(p => p.resident_id === currentResident?.id && p.month === billingMonth);

  useEffect(() => {
    if (preselectedResidentForPayment) {
      setSelectedResidentId(preselectedResidentForPayment.id);
      const expected = preselectedResidentForPayment.monthly_fee;
      const alreadyPaid = existingPayment ? existingPayment.amount_paid : 0;
      setAmountPaid(Math.max(0, expected - alreadyPaid));
      setTransactionRef(`UPI-${Date.now().toString().slice(-6)}`);
    }
  }, [preselectedResidentForPayment, existingPayment]);

  if (!recordPaymentModalOpen) return null;

  const expectedAmount = currentResident?.monthly_fee || 0;
  const balanceAfter = Math.max(0, expectedAmount - amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResident || amountPaid < 0) {
      addToast('error', 'Invalid Payment', 'Please select a resident and enter payment details.');
      return;
    }

    try {
      await recordPayment({
        resident_id: currentResident.id,
        month: billingMonth,
        amount_paid: Number(amountPaid),
        advance_used: 0,
        payment_method: paymentMethod,
        transaction_reference: transactionRef || `REF-${Date.now().toString().slice(-6)}`,
        notes: notes || 'Monthly rent fee collection'
      });
      setRecordPaymentModalOpen(false);
      setPreselectedResidentForPayment(null);
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF1E9A]/15 text-[#FF1E9A] flex items-center justify-center border border-[#FF1E9A]/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Record Fee Collection</h3>
              <p className="text-[10px] text-[#8E8E9F] font-mono">Instant digital receipt generation</p>
            </div>
          </div>
          <button
            onClick={() => {
              setRecordPaymentModalOpen(false);
              setPreselectedResidentForPayment(null);
            }}
            className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Select Resident *</label>
            <select
              value={selectedResidentId}
              onChange={e => {
                setSelectedResidentId(e.target.value);
                const r = residents.find(res => res.id === e.target.value);
                if (r) setAmountPaid(r.monthly_fee);
              }}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF1E9A]"
              required
            >
              <option value="">-- Choose Resident --</option>
              {residents.filter(r => r.status === 'ACTIVE').map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (Room {r.current_room_number} - Bed {r.current_bed_number}) • ₹{r.monthly_fee}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Billing Month</label>
              <select
                value={billingMonth}
                onChange={e => setBillingMonth(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF1E9A]"
              >
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Amount Paid (₹) *</label>
              <input
                type="number"
                value={amountPaid}
                onChange={e => setAmountPaid(Number(e.target.value))}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[#0CC6FF] font-mono font-bold focus:outline-none focus:border-[#0CC6FF]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#6C4CFF]"
              >
                <option value="UPI">UPI (GPay / PhonePe)</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                <option value="CASH">Cash Collection</option>
                <option value="CARD">Credit / Debit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Ref / Txn ID</label>
              <input
                type="text"
                placeholder="UPI-123456"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#6C4CFF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setRecordPaymentModalOpen(false);
                setPreselectedResidentForPayment(null);
              }}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(255,30,154,0.35)] hover:brightness-110 active:scale-95 transition-all"
            >
              Record & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 7. ADD EXPENSE MODAL
// ==========================================
export const AddExpenseModal: React.FC = () => {
  const { addExpenseModalOpen, setAddExpenseModalOpen, createExpense, addToast } = useApp();

  const [category, setCategory] = useState<'MESS_FOOD' | 'ELECTRICITY' | 'WATER' | 'STAFF_SALARY' | 'MAINTENANCE' | 'INTERNET' | 'OTHER'>('MESS_FOOD');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER'>('UPI');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  if (!addExpenseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) {
      addToast('error', 'Incomplete Form', 'Please specify description and a valid expense amount.');
      return;
    }

    try {
      await createExpense({
        category,
        description,
        amount: Number(amount),
        paid_to: paidTo || 'Vendor',
        payment_mode: paymentMode,
        expense_date: expenseDate
      });
      setAddExpenseModalOpen(false);
      setDescription('');
      setAmount(1500);
      setPaidTo('');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6F3C]/15 text-[#FF6F3C] flex items-center justify-center border border-[#FF6F3C]/30">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Log Operational Expense</h3>
              <p className="text-[10px] text-[#8E8E9F] font-mono">P&L and Mess Ledger Audit</p>
            </div>
          </div>
          <button
            onClick={() => setAddExpenseModalOpen(false)}
            className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6F3C]"
            >
              <option value="MESS_FOOD">Mess / Food & Groceries</option>
              <option value="ELECTRICITY">Electricity Bill (TSSPDCL)</option>
              <option value="WATER">Water Tanker & Supplies</option>
              <option value="MAINTENANCE">Repairs & Plumbing</option>
              <option value="INTERNET">Wi-Fi / Fiber Broadband</option>
              <option value="STAFF_SALARY">Staff Salary Advance</option>
              <option value="OTHER">Other Operational Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8E8E9F] mb-1 font-medium">Expense Description *</label>
            <input
              type="text"
              placeholder="e.g. Rice, Dal & Vegetables for Mess"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6F3C]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Amount (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[#FF6F3C] font-mono font-bold focus:outline-none focus:border-[#FF6F3C]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Paid To (Vendor)</label>
              <input
                type="text"
                placeholder="e.g. Modern Supermarket"
                value={paidTo}
                onChange={e => setPaidTo(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6F3C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value as any)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6F3C]"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-[#8E8E9F] mb-1 font-medium">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF6F3C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAddExpenseModalOpen(false)}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#FF6F3C] to-[#FF1E9A] text-white font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 8. GLOBAL SPOTLIGHT SEARCH MODAL
// ==========================================
export const SearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    residents,
    rooms,
    setSelectedResidentId,
    setSelectedRoomId,
    setActiveTab
  } = useApp();

  const [query, setQuery] = useState('');

  if (!searchModalOpen) return null;

  const q = query.trim().toLowerCase();
  const matchedResidents = q
    ? residents.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.current_room_number && r.current_room_number.includes(q))
      )
    : [];

  const matchedRooms = q
    ? rooms.filter(
        rm =>
          rm.room_number.toLowerCase().includes(q) ||
          rm.sharing_type.toLowerCase().includes(q) ||
          `floor ${rm.floor_number}`.includes(q)
      )
    : [];

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-md"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="bg-[#141414] border border-white/[0.1] rounded-2xl max-w-xl w-full p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <Search className="w-4 h-4 text-[#0CC6FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search residents, rooms, phone numbers, dues... (ESC to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#0CC6FF]"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.05] text-xs">
          {!q ? (
            <p className="text-[#8E8E9F] text-center py-6">
              Type resident name, room number, or phone number to search across Hanura Casa.
            </p>
          ) : matchedResidents.length === 0 && matchedRooms.length === 0 ? (
            <p className="text-[#8E8E9F] text-center py-6">No matching records found for "{query}".</p>
          ) : (
            <>
              {matchedResidents.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedResidentId(r.id);
                    setActiveTab('residents');
                    setSearchModalOpen(false);
                  }}
                  className="p-3 hover:bg-white/[0.04] rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.photo_url}
                      alt={r.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/[0.1]"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{r.name}</p>
                      <p className="text-[10px] text-[#8E8E9F] font-mono">
                        {r.id} • Room {r.current_room_number || 'Vacated'} • {r.phone}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FF1E9A]/15 border border-[#FF1E9A]/30 text-[#FF1E9A] text-[10px] font-mono font-bold">
                    View Profile →
                  </span>
                </div>
              ))}

              {matchedRooms.map(rm => (
                <div
                  key={rm.id}
                  onClick={() => {
                    setSelectedRoomId(rm.id);
                    setActiveTab('rooms');
                    setSearchModalOpen(false);
                  }}
                  className="p-3 hover:bg-white/[0.04] rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0B0B0C] border border-white/[0.08] flex items-center justify-center font-bold text-[#0CC6FF] font-mono text-xs">
                      {rm.room_number}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">Room {rm.room_number}</p>
                      <p className="text-[10px] text-[#8E8E9F]">
                        Floor {rm.floor_number} • {rm.sharing_type} • {rm.occupied_beds_count}/{rm.capacity} Beds Occupied
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#0CC6FF]/15 border border-[#0CC6FF]/30 text-[#0CC6FF] text-[10px] font-mono font-bold">
                    Room Matrix →
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. OFFICIAL PRINTABLE PAYMENT RECEIPT MODAL
// ==========================================
export const ReceiptModal: React.FC = () => {
  const { printReceiptPayment, setPrintReceiptPayment, settings, residents, sendDirectWhatsApp } = useApp();

  if (!printReceiptPayment) return null;

  const resident = residents.find(r => r.id === printReceiptPayment.resident_id);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppSend = () => {
    if (resident) {
      sendDirectWhatsApp({
        resident,
        payment: printReceiptPayment,
        type: 'PAYMENT_CONFIRMATION',
        month: printReceiptPayment.month,
        openDirect: true
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#141414] border border-white/[0.1] text-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl my-8 print:m-0 print:p-0 print:shadow-none print:w-full print:bg-white print:text-black">
        {/* Header with Logo */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF1E9A] to-[#6C4CFF] flex items-center justify-center text-white font-brand font-black text-xs">
              HM
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-white text-base">HANURA CASA</h3>
              <p className="text-[10px] font-mono text-[#8E8E9F]">Smart Living OS Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider">
              OFFICIAL RECEIPT
            </span>
            <p className="text-[10px] text-[#8E8E9F] font-mono mt-1">#{printReceiptPayment.id}</p>
          </div>
        </div>

        {/* Property & Bill-to details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#8E8E9F] uppercase font-mono text-[9px] tracking-wider">Received From:</span>
            <p className="font-bold text-white text-sm mt-0.5">{printReceiptPayment.resident_name}</p>
            <p className="text-[#8E8E9F] font-mono text-[10px]">ID: {printReceiptPayment.resident_id}</p>
            <p className="text-[#8E8E9F] font-mono text-[10px]">Room {printReceiptPayment.room_number || 'N/A'}</p>
          </div>
          <div className="text-right">
            <span className="text-[#8E8E9F] uppercase font-mono text-[9px] tracking-wider">Payment Details:</span>
            <p className="font-bold text-white mt-0.5">Month: {printReceiptPayment.month}</p>
            <p className="text-[#8E8E9F] font-mono text-[10px]">
              Date: {new Date(printReceiptPayment.payment_date).toLocaleDateString()}
            </p>
            <p className="text-[#8E8E9F] font-mono text-[10px]">Mode: {printReceiptPayment.payment_method}</p>
          </div>
        </div>

        {/* Itemized Line Table */}
        <div className="border border-white/[0.08] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#0B0B0C] text-[#8E8E9F] font-mono text-[9px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-mono">
              <tr>
                <td className="p-3 font-sans">
                  <p className="text-white font-semibold">Monthly Hostel Fee ({printReceiptPayment.month})</p>
                  <p className="text-[10px] text-[#8E8E9F]">Accommodation, Mess, High-Speed Wi-Fi & Housekeeping</p>
                </td>
                <td className="p-3 text-right text-white">
                  ₹{printReceiptPayment.expected_amount.toLocaleString('en-IN')}
                </td>
              </tr>
              {printReceiptPayment.advance_used > 0 && (
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-[#8E8E9F] font-sans">Adjusted from Security Advance</td>
                  <td className="p-3 text-right text-[#FF6F3C]">
                    -₹{printReceiptPayment.advance_used.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              <tr className="bg-emerald-500/5">
                <td className="p-3 font-sans text-white font-bold">Total Amount Paid (Received)</td>
                <td className="p-3 text-right text-sm text-emerald-400 font-bold">
                  ₹{printReceiptPayment.amount_paid.toLocaleString('en-IN')}
                </td>
              </tr>
              {printReceiptPayment.balance > 0 && (
                <tr className="bg-rose-500/5">
                  <td className="p-3 font-sans text-rose-400 font-medium">Outstanding Balance Due</td>
                  <td className="p-3 text-right text-rose-400 font-bold">
                    ₹{printReceiptPayment.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Stamp & Footer */}
        <div className="pt-2 flex items-center justify-between text-[10px] text-[#8E8E9F] border-t border-white/[0.08]">
          <div>
            <p className="font-bold text-white">Hanura Casa Living & Property Management</p>
            <p className="font-mono text-[9px]">Ref: {printReceiptPayment.transaction_reference}</p>
          </div>
          <div className="text-right">
            <div className="w-24 h-9 border border-emerald-400 rounded-lg text-emerald-400 font-mono font-bold flex items-center justify-center text-[8px] uppercase tracking-wider -rotate-3">
              PAID & VERIFIED
            </div>
          </div>
        </div>

        {/* Print / WhatsApp / Close Actions */}
        <div className="flex items-center justify-between pt-2 print:hidden">
          <button
            onClick={() => setPrintReceiptPayment(null)}
            className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            {resident && (
              <button
                onClick={handleWhatsAppSend}
                className="px-4 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/35 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. ADD ROOM MODAL
// ==========================================
export const AddRoomModal: React.FC = () => {
  const { addRoomModalOpen, setAddRoomModalOpen, createRoom, addToast } = useApp();
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [roomNumber, setRoomNumber] = useState<string>('101');
  const [capacity, setCapacity] = useState<number>(3);
  const [monthlyFee, setMonthlyFee] = useState<number>(8500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!addRoomModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      addToast('error', 'Validation Error', 'Please enter a valid room number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRoom({
        floor_number: Number(floorNumber),
        room_number: roomNumber.trim(),
        capacity: Number(capacity),
        monthly_fee: Number(monthlyFee),
        sharing_type: capacity === 1 ? 'Single Private' : `${capacity}-Sharing`
      });
      setAddRoomModalOpen(false);
    } catch (err) {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF1E9A]/20 border border-[#FF1E9A]/40 flex items-center justify-center text-[#FF1E9A]">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Add New Suite / Room</h3>
          </div>
          <button
            onClick={() => setAddRoomModalOpen(false)}
            className="text-[#8E8E9F] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">
                Floor Number *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={floorNumber}
                onChange={e => setFloorNumber(Number(e.target.value))}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                required
              />
            </div>

            <div>
              <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">
                Room / Suite No. *
              </label>
              <input
                type="text"
                placeholder="e.g. 101, 201"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">
                Beds (Capacity) *
              </label>
              <select
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
              >
                <option value={1}>1 Bed (Private)</option>
                <option value={2}>2 Beds (2-Sharing)</option>
                <option value={3}>3 Beds (3-Sharing)</option>
                <option value={4}>4 Beds (4-Sharing)</option>
                <option value={5}>5 Beds (5-Sharing)</option>
                <option value={6}>6 Beds (6-Sharing)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8E8E9F] font-bold uppercase text-[10px] mb-1">
                Monthly Rent / Bed (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyFee}
                onChange={e => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-[#0B0B0C] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#FF1E9A]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAddRoomModalOpen(false)}
              className="px-4 py-2 bg-[#0B0B0C] text-[#8E8E9F] hover:text-white rounded-xl font-medium border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-[#FF1E9A] to-[#6C4CFF] text-white font-bold rounded-xl hover:brightness-110 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Suite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
