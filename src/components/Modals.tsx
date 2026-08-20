import React, { useState, useEffect } from 'react';
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
  Send
} from 'lucide-react';

// ==========================================
// 1. ADD RESIDENT MODAL
// ==========================================
export const AddResidentModal: React.FC = () => {
  const {
    addResidentModalOpen,
    setAddResidentModalOpen,
    rooms,
    beds,
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
  const [monthlyFee, setMonthlyFee] = useState<number>(6500);
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
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-serif italic text-white">Enroll New Resident (Check-In)</h3>
          </div>
          <button
            onClick={() => setAddResidentModalOpen(false)}
            className="p-1.5 rounded-full text-[#6B6B76] hover:text-white hover:bg-[#15151A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#D4AF37]">
              1. Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Primary Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="Optional (defaults to phone)"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. student@college.edu"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">College / Institute</label>
                <input
                  type="text"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  placeholder="e.g. CBIT / JNTU Hyderabad"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Course & Year</label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech CSE (3rd Year)"
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Parent / Emergency */}
          <div className="space-y-3 pt-3 border-t border-[#1F1F23]">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#D4AF37]">
              2. Guardian & Permanent Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Parent Contact</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Permanent Home Address</label>
              <input
                type="text"
                value={permanentAddress}
                onChange={e => setPermanentAddress(e.target.value)}
                placeholder="House No, City, State, PIN"
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Room Allocation */}
          <div className="space-y-3 pt-3 border-t border-[#1F1F23]">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#D4AF37]">
              3. Room Allocation & Financial Setup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[#6B6B76] mb-1 font-medium">Assign Room *</label>
                <select
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  <option value="">-- Choose Available Room --</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} (Floor {r.floor_number} • {r.sharing_type} • {r.vacant_beds_count} free bed)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Assign Bed Slot *</label>
                <select
                  value={selectedBedNumber}
                  onChange={e => setSelectedBedNumber(Number(e.target.value))}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  disabled={!selectedRoomId}
                  required
                >
                  {vacantBedsInSelectedRoom.map(b => (
                    <option key={b.id} value={b.bed_number}>
                      Bed #{b.bed_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Monthly Fee (₹) *</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={e => setMonthlyFee(Number(e.target.value))}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono font-medium focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] mb-1 font-medium">Security Advance (₹) *</label>
                <input
                  type="number"
                  value={initialAdvance}
                  onChange={e => setInitialAdvance(Number(e.target.value))}
                  className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-[#4CAF50] font-mono font-medium focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#1F1F23]">
            <button
              type="button"
              onClick={() => setAddResidentModalOpen(false)}
              className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110 active:scale-95 transition-all"
            >
              Complete Check-In
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
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditResidentModal: React.FC<EditResidentModalProps> = ({ resident, isOpen, onClose }) => {
  const { updateResident } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(6500);

  useEffect(() => {
    if (resident) {
      setName(resident.name);
      setPhone(resident.phone);
      setWhatsapp(resident.whatsapp || resident.phone);
      setEmail(resident.email || '');
      setCollege(resident.college || '');
      setCourse(resident.course || '');
      setMonthlyFee(resident.monthly_fee);
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
      onClose();
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <h3 className="text-base font-serif italic text-white">Edit Resident: {resident.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#6B6B76] hover:text-white hover:bg-[#15151A] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Monthly Fee (₹)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={e => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono font-medium focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Update Profile
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
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferRoomModal: React.FC<TransferModalProps> = ({ resident, isOpen, onClose }) => {
  const { rooms, transferRoom, addToast } = useApp();

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
      onClose();
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-serif italic text-white">Transfer Room: {resident.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#6B6B76] hover:text-white hover:bg-[#15151A] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#15151A] p-3.5 rounded-xl border border-[#23232A] text-xs font-mono">
          <p className="text-[#6B6B76]">Current Assignment:</p>
          <p className="text-white font-medium text-sm mt-0.5">
            Room {resident.current_room_number} (Bed {resident.current_bed_number}) • Floor {resident.floor_number}
          </p>
        </div>

        <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#6B6B76] mb-1 font-medium">Select Destination Room</label>
            <select
              value={newRoomId}
              onChange={e => setNewRoomId(e.target.value)}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
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
            <label className="block text-[#6B6B76] mb-1 font-medium">Select Destination Bed Slot</label>
            <select
              value={newBedNumber}
              onChange={e => setNewBedNumber(Number(e.target.value))}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
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
            <label className="block text-[#6B6B76] mb-1 font-medium">Transfer Reason / Note</label>
            <input
              type="text"
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs hover:brightness-110 active:scale-95 transition-all"
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
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VacateResidentModal: React.FC<VacateModalProps> = ({ resident, isOpen, onClose }) => {
  const { vacateResident, advances } = useApp();

  const [refundAdvance, setRefundAdvance] = useState(true);
  const [deductions, setDeductions] = useState(0);
  const [deductionReason, setDeductionReason] = useState('Room deep cleaning / key replacement');
  const [vacateDate, setVacateDate] = useState(new Date().toISOString().split('T')[0]);

  const advanceAccount = advances.find(a => a.resident_id === resident?.id);
  const currentAdvance = advanceAccount?.current_advance || 0;
  const netRefund = Math.max(0, currentAdvance - deductions);

  if (!isOpen || !resident) return null;

  const handleVacate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vacateResident({
        resident_id: resident.id,
        vacate_date: vacateDate,
        refund_advance: refundAdvance,
        deductions_amount: refundAdvance ? deductions : 0,
        deductions_reason: deductionReason
      });
      onClose();
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <div className="flex items-center space-x-2">
            <UserMinus className="w-4 h-4 text-[#E53935]" />
            <h3 className="text-base font-serif italic text-white">Vacate Resident: {resident.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#6B6B76] hover:text-white hover:bg-[#15151A] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#15151A] border border-[#D4AF37]/20 p-3.5 rounded-xl text-xs space-y-1">
          <p className="font-medium text-[#D4AF37] flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Non-Destructive Historical Preservation</span>
          </p>
          <p className="text-[11px] text-[#6B6B76] leading-relaxed">
            Vacating frees Bed #{resident.current_bed_number} in Room {resident.current_room_number} for new occupants while preserving 100% of payment history, ledger entries, and documents.
          </p>
        </div>

        <form onSubmit={handleVacate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#6B6B76] mb-1 font-medium">Official Move-Out Date</label>
            <input
              type="date"
              value={vacateDate}
              onChange={e => setVacateDate(e.target.value)}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div className="bg-[#15151A] p-3.5 rounded-xl border border-[#23232A] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[#D1D1D1]">Security Deposit in Escrow:</span>
              <span className="font-mono font-medium text-[#4CAF50]">₹{currentAdvance.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="refundCheckbox"
                checked={refundAdvance}
                onChange={e => setRefundAdvance(e.target.checked)}
                className="rounded accent-[#D4AF37]"
              />
              <label htmlFor="refundCheckbox" className="text-[#D1D1D1] font-medium">
                Process Advance Settlement / Refund
              </label>
            </div>

            {refundAdvance && (
              <div className="space-y-2.5 pt-2.5 border-t border-[#1F1F23]">
                <div>
                  <label className="block text-[#6B6B76] mb-1 font-medium">Deductions (Damages/Cleaning) (₹)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={e => setDeductions(Number(e.target.value))}
                    max={currentAdvance}
                    min={0}
                    className="w-full bg-[#0F0F12] border border-[#23232A] rounded-xl px-3.5 py-1.5 text-[#E53935] font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B6B76] mb-1 font-medium">Net Refund to Resident (₹)</label>
                  <p className="font-mono font-medium text-[#4CAF50] text-base">
                    ₹{netRefund.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E53935] hover:bg-[#D32F2F] text-white font-semibold rounded-full text-xs transition-colors"
            >
              Confirm Vacate & Release Bed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. RECORD PAYMENT MODAL
// ==========================================
export const RecordPaymentModal: React.FC = () => {
  const {
    recordPaymentModalOpen,
    setRecordPaymentModalOpen,
    preselectedResidentForPayment,
    setPreselectedResidentForPayment,
    residents,
    advances,
    payments,
    recordPayment,
    addToast
  } = useApp();

  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [billingMonth, setBillingMonth] = useState('2026-08');
  const [amountPaid, setAmountPaid] = useState<number>(6500);
  const [advanceUsed, setAdvanceUsed] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD'>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const currentResident = residents.find(r => r.id === (preselectedResidentForPayment?.id || selectedResidentId));
  const advanceAccount = advances.find(a => a.resident_id === currentResident?.id);
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
  const balanceAfter = Math.max(0, expectedAmount - (amountPaid + advanceUsed));

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
        advance_used: Number(advanceUsed),
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
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-serif italic text-white">Record Fee Collection</h3>
          </div>
          <button
            onClick={() => {
              setRecordPaymentModalOpen(false);
              setPreselectedResidentForPayment(null);
            }}
            className="p-1.5 rounded-full text-[#6B6B76] hover:text-white hover:bg-[#15151A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#6B6B76] mb-1 font-medium">Select Resident</label>
            <select
              value={selectedResidentId}
              onChange={e => {
                setSelectedResidentId(e.target.value);
                const r = residents.find(res => res.id === e.target.value);
                if (r) setAmountPaid(r.monthly_fee);
              }}
              className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
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
              <label className="block text-[#6B6B76] mb-1 font-medium">Billing Month</label>
              <select
                value={billingMonth}
                onChange={e => setBillingMonth(e.target.value)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Amount Paid (₹) *</label>
              <input
                type="number"
                value={amountPaid}
                onChange={e => setAmountPaid(Number(e.target.value))}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-[#4CAF50] font-mono font-medium focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>

          {advanceAccount && advanceAccount.current_advance > 0 && (
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">
                Use Security Advance (Available: ₹{advanceAccount.current_advance.toLocaleString('en-IN')})
              </label>
              <input
                type="number"
                value={advanceUsed}
                onChange={e => setAdvanceUsed(Number(e.target.value))}
                max={advanceAccount.current_advance}
                min={0}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-[#D4AF37] font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="UPI">UPI (GPay / PhonePe)</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                <option value="CASH">Cash Collection</option>
                <option value="CARD">Credit / Debit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Transaction Ref</label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI-984729"
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="bg-[#15151A] p-3 rounded-xl border border-[#23232A] flex items-center justify-between font-mono">
            <span className="text-[#6B6B76]">Remaining Balance:</span>
            <span className={`font-medium text-sm ${balanceAfter > 0 ? 'text-[#FF6F3C]' : 'text-[#4CAF50]'}`}>
              ₹{balanceAfter.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
            <button
              type="button"
              onClick={() => {
                setRecordPaymentModalOpen(false);
                setPreselectedResidentForPayment(null);
              }}
              className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Save & Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. ADD EXPENSE MODAL (WITH GROCERY ITEMIZATION)
// ==========================================
export const AddExpenseModal: React.FC = () => {
  const { addExpenseModalOpen, setAddExpenseModalOpen, createExpense, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GROCERY');
  const [amount, setAmount] = useState<number>(4500);
  const [vendor, setVendor] = useState('Sri Laxmi Kirana & Provisions');
  const [paymentMode, setPaymentMode] = useState('UPI');

  // Grocery line items
  const [items, setItems] = useState<Array<{ item_name: string; quantity: number; unit: string; unit_price: number; total_price: number }>>([
    { item_name: 'Basmati Rice', quantity: 25, unit: 'kg', unit_price: 90, total_price: 2250 },
    { item_name: 'Cooking Oil', quantity: 15, unit: 'L', unit_price: 150, total_price: 2250 }
  ]);

  if (!addExpenseModalOpen) return null;

  const addItemRow = () => {
    setItems(prev => [...prev, { item_name: '', quantity: 1, unit: 'kg', unit_price: 100, total_price: 100 }]);
  };

  const updateItem = (index: number, field: string, val: any) => {
    setItems(prev => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: val };
      if (field === 'quantity' || field === 'unit_price') {
        current.total_price = (current.quantity || 0) * (current.unit_price || 0);
      }
      updated[index] = current;
      const sum = updated.reduce((s, it) => s + (it.total_price || 0), 0);
      if (category === 'GROCERY' && sum > 0) {
        setAmount(sum);
      }
      return updated;
    });
  };

  const removeItemRow = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) {
      addToast('error', 'Missing Information', 'Please provide a title and amount.');
      return;
    }

    try {
      await createExpense({
        title,
        category,
        amount: Number(amount),
        date: new Date().toISOString().split('T')[0],
        vendor,
        payment_mode: paymentMode,
        items: category === 'GROCERY' ? items.filter(i => i.item_name) : undefined
      });
      setAddExpenseModalOpen(false);
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-serif italic text-white">Record Operating / Mess Expense</h3>
          </div>
          <button onClick={() => setAddExpenseModalOpen(false)} className="p-1.5 rounded-full text-[#6B6B76] hover:text-white hover:bg-[#15151A] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Expense Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Mess Weekly Grocery Provisions"
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="GROCERY">Mess / Grocery Provisions</option>
                <option value="ELECTRICITY">Electricity Bill</option>
                <option value="GAS">Gas / LPG Cylinders</option>
                <option value="INTERNET">High-Speed Wi-Fi</option>
                <option value="SALARIES">Staff Salary</option>
                <option value="MAINTENANCE">Maintenance & Repairs</option>
                <option value="CLEANING">Cleaning & Housekeeping Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Vendor / Merchant</label>
              <input
                type="text"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="e.g. Sri Laxmi Kirana"
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[#6B6B76] mb-1 font-medium">Total Amount (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-[#15151A] border border-[#23232A] rounded-xl px-3.5 py-2 text-[#D4AF37] font-mono font-medium focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>

          {/* Grocery Itemization */}
          {category === 'GROCERY' && (
            <div className="space-y-2.5 pt-2.5 border-t border-[#1F1F23]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#D4AF37]">
                  Mess Item Breakdown
                </span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-3 py-1 bg-[#15151A] hover:bg-[#1F1F28] text-[#D4AF37] border border-[#23232A] rounded-full text-[10px] font-medium transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-[#15151A] p-2.5 rounded-xl border border-[#23232A]">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={it.item_name}
                      onChange={e => updateItem(idx, 'item_name', e.target.value)}
                      className="flex-1 bg-transparent text-white border-b border-[#23232A] pb-0.5 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-14 bg-transparent text-white border-b border-[#23232A] font-mono pb-0.5 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={it.unit}
                      onChange={e => updateItem(idx, 'unit', e.target.value)}
                      className="w-12 bg-transparent text-[#6B6B76] border-b border-[#23232A] pb-0.5 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={it.unit_price}
                      onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                      className="w-16 bg-transparent text-[#4CAF50] border-b border-[#23232A] font-mono pb-0.5 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="text-[#6B6B76] hover:text-[#E53935] p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1F1F23]">
            <button
              type="button"
              onClick={() => setAddExpenseModalOpen(false)}
              className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Record Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 7. GLOBAL SEARCH SPOTLIGHT MODAL (⌘K)
// ==========================================
export const SearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    residents,
    rooms,
    payments,
    setSelectedResidentId,
    setActiveTab,
    setPrintReceiptPayment
  } = useApp();

  const [query, setQuery] = useState('');

  if (!searchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedResidents = q
    ? residents.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          (r.current_room_number && r.current_room_number.includes(q))
      )
    : [];

  const matchedRooms = q
    ? rooms.filter(
        r =>
          r.room_number.includes(q) ||
          r.sharing_type.toLowerCase().includes(q) ||
          r.beds.some(b => b.current_resident_name?.toLowerCase().includes(q))
      )
    : [];

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-xs"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="bg-[#0F0F12] border border-[#1F1F23] rounded-2xl max-w-xl w-full p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search residents, rooms, phone, payments, receipts... (ESC to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-[#15151A] border border-[#23232A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B6B76] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#1F1F23] text-xs">
          {!q ? (
            <p className="text-[#6B6B76] text-center py-6">
              Type resident name, room number, or phone number to search across Hanura Casa.
            </p>
          ) : matchedResidents.length === 0 && matchedRooms.length === 0 ? (
            <p className="text-[#6B6B76] text-center py-6">No matching records found for "{query}".</p>
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
                  className="p-3 hover:bg-[#15151A] rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.photo_url}
                      alt={r.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#23232A]"
                    />
                    <div>
                      <p className="font-medium text-white text-xs">{r.name}</p>
                      <p className="text-[10px] text-[#6B6B76] font-mono">
                        {r.id} • Room {r.current_room_number || 'Vacated'} • {r.phone}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#15151A] border border-[#23232A] text-[#D4AF37] text-[10px] font-mono uppercase">
                    Resident →
                  </span>
                </div>
              ))}

              {matchedRooms.map(rm => (
                <div
                  key={rm.id}
                  onClick={() => {
                    setActiveTab('rooms');
                    setSearchModalOpen(false);
                  }}
                  className="p-3 hover:bg-[#15151A] rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#15151A] border border-[#23232A] flex items-center justify-center font-medium text-[#D4AF37] font-mono text-xs">
                      {rm.room_number}
                    </div>
                    <div>
                      <p className="font-medium text-white text-xs">Room {rm.room_number}</p>
                      <p className="text-[10px] text-[#6B6B76]">
                        Floor {rm.floor_number} • {rm.sharing_type} • {rm.occupied_beds_count}/{rm.capacity} Beds
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#15151A] border border-[#23232A] text-[#4CAF50] text-[10px] font-mono uppercase">
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
// 8. OFFICIAL PRINTABLE PAYMENT RECEIPT MODAL
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
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F0F12] border border-[#1F1F23] text-[#D1D1D1] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl my-8 print:m-0 print:p-0 print:shadow-none print:w-full print:bg-white print:text-black">
        {/* Header with Logo */}
        <div className="flex items-center justify-between border-b border-[#1F1F23] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-black font-serif font-bold text-xs">
              HC
            </div>
            <div>
              <h3 className="font-serif italic font-normal text-white text-base">HANURA CASA</h3>
              <p className="text-[10px] font-mono text-[#6B6B76]">Smart Luxury Hostel System</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-0.5 bg-[#4CAF50]/10 border border-[#4CAF50]/20 text-[#4CAF50] rounded-full font-mono text-[9px] font-medium uppercase tracking-wider">
              OFFICIAL RECEIPT
            </span>
            <p className="text-[10px] text-[#6B6B76] font-mono mt-1">#{printReceiptPayment.id}</p>
          </div>
        </div>

        {/* Property & Bill-to details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#6B6B76] uppercase font-mono text-[9px] tracking-wider">Received From:</span>
            <p className="font-medium text-white text-sm mt-0.5">{printReceiptPayment.resident_name}</p>
            <p className="text-[#6B6B76] font-mono text-[10px]">ID: {printReceiptPayment.resident_id}</p>
            <p className="text-[#6B6B76] font-mono text-[10px]">Room {printReceiptPayment.room_number || 'N/A'}</p>
          </div>
          <div className="text-right">
            <span className="text-[#6B6B76] uppercase font-mono text-[9px] tracking-wider">Payment Details:</span>
            <p className="font-medium text-white mt-0.5">Month: {printReceiptPayment.month}</p>
            <p className="text-[#6B6B76] font-mono text-[10px]">
              Date: {new Date(printReceiptPayment.payment_date).toLocaleDateString()}
            </p>
            <p className="text-[#6B6B76] font-mono text-[10px]">Mode: {printReceiptPayment.payment_method}</p>
          </div>
        </div>

        {/* Itemized Line Table */}
        <div className="border border-[#1F1F23] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#15151A] text-[#6B6B76] font-mono text-[9px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23] font-mono">
              <tr>
                <td className="p-3 font-sans">
                  <p className="text-white font-medium">Monthly Hostel Fee ({printReceiptPayment.month})</p>
                  <p className="text-[10px] text-[#6B6B76]">Accommodation, Mess, Wi-Fi & Maintenance</p>
                </td>
                <td className="p-3 text-right text-[#D1D1D1]">
                  ₹{printReceiptPayment.expected_amount.toLocaleString('en-IN')}
                </td>
              </tr>
              {printReceiptPayment.advance_used > 0 && (
                <tr className="bg-[#15151A]/50">
                  <td className="p-3 text-[#6B6B76] font-sans">Adjusted from Security Advance</td>
                  <td className="p-3 text-right text-[#D4AF37]">
                    -₹{printReceiptPayment.advance_used.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              <tr className="bg-[#4CAF50]/5">
                <td className="p-3 font-sans text-white font-medium">Total Amount Paid (Received)</td>
                <td className="p-3 text-right text-sm text-[#4CAF50] font-medium">
                  ₹{printReceiptPayment.amount_paid.toLocaleString('en-IN')}
                </td>
              </tr>
              {printReceiptPayment.balance > 0 && (
                <tr className="bg-[#E53935]/5">
                  <td className="p-3 font-sans text-[#E53935] font-medium">Outstanding Balance Due</td>
                  <td className="p-3 text-right text-[#E53935] font-medium">
                    ₹{printReceiptPayment.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Stamp & Footer */}
        <div className="pt-2 flex items-center justify-between text-[10px] text-[#6B6B76] border-t border-[#1F1F23]">
          <div>
            <p className="font-medium text-white">Hanura Casa Property Office</p>
            <p className="font-mono text-[9px]">Ref: {printReceiptPayment.transaction_reference}</p>
          </div>
          <div className="text-right">
            <div className="w-24 h-9 border border-[#4CAF50] rounded-lg text-[#4CAF50] font-mono font-bold flex items-center justify-center text-[8px] uppercase tracking-wider -rotate-3">
              PAID & VERIFIED
            </div>
          </div>
        </div>

        {/* Print / WhatsApp / Close Actions (hidden during print) */}
        <div className="flex items-center justify-between pt-2 print:hidden">
          <button
            onClick={() => setPrintReceiptPayment(null)}
            className="px-4 py-2 bg-[#15151A] text-[#D1D1D1] rounded-full text-xs font-medium hover:bg-[#1F1F28] border border-[#23232A] transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            {resident && (
              <button
                onClick={handleWhatsAppSend}
                className="px-4 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/35 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send on WhatsApp</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#D4AF37] text-black rounded-full text-xs font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
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
