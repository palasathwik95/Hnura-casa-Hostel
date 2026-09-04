import {
  DatabaseSchema,
  DashboardMetrics,
  Floor,
  Room,
  Bed,
  Resident,
  Payment,
  Expense,
  Staff,
  SalaryPayment,
  MaintenanceRequest,
  Complaint,
  ResidentDocument,
  RoomAssignment,
  WhatsAppMessage,
  NotificationItem,
  AuditLog,
  AdvanceAccount
} from '../types';
import { initialSettings } from '../../server/initialData';

const LOCAL_STORAGE_KEY = 'hanura_casa_db_v4_scratch';

export interface BootstrapResponse extends DatabaseSchema {
  metrics: DashboardMetrics;
}

export class LocalDbService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseSchema {
    if (typeof window === 'undefined') {
      return this.generateInitialData();
    }

    try {
      // Clear legacy storage keys containing sample data
      localStorage.removeItem('hanura_casa_db_v1');
      localStorage.removeItem('hanura_casa_db_v2');
      localStorage.removeItem('hanura_casa_db_v3');
      localStorage.removeItem('hanura_casa_db_v3_clean');

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.floors)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }

    const initial = this.generateInitialData();
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(data: DatabaseSchema) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private persist() {
    this.saveToStorage(this.data);
  }

  public generateInitialData(): DatabaseSchema {
    return {
      settings: initialSettings,
      floors: [],
      rooms: [],
      beds: [],
      residents: [],
      payments: [],
      advances: [],
      expenses: [],
      staff: [],
      salary_payments: [],
      maintenance_requests: [],
      complaints: [],
      resident_documents: [],
      room_assignments: [],
      whatsapp_messages: [],
      notifications: [],
      audit_logs: [
        {
          id: `AUD-${Date.now()}`,
          admin_user: 'Sathwik Pala',
          action: 'SYSTEM_BOOTSTRAP',
          entity_type: 'SYSTEM',
          entity_id: 'HC-HYD-01',
          details: 'Hanura Casa Property Management Database initialized ready for manual floor and room setup.',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  public getDashboardMetrics(): DashboardMetrics {
    const activeResidents = this.data.residents.filter(r => r.status === 'ACTIVE');
    const formerResidents = this.data.residents.filter(r => r.status === 'VACATED');

    const totalBeds = this.data.beds.length;
    const occupiedBeds = this.data.beds.filter(b =>
      activeResidents.some(r =>
        r.current_bed_id === b.id ||
        (r.current_room_id === b.room_id && (r.current_bed_number === b.bed_number || r.current_bed_id === b.id))
      )
    ).length;
    const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

    // Expected Monthly Collection for Current Month (from active residents)
    const expectedMonthly = activeResidents.reduce((sum, r) => sum + r.monthly_fee, 0);

    // Current month is Aug 2026 ('2026-08')
    const currentMonth = '2026-08';
    const currentMonthPayments = this.data.payments.filter(p => p.month === currentMonth);
    const collectedThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount_paid, 0);

    const pendingAmount = Math.max(0, expectedMonthly - collectedThisMonth);

    // Total expenses for current month
    const currentMonthExpenses = this.data.expenses.filter(e => e.date.startsWith(currentMonth));
    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const groceryExpenses = currentMonthExpenses
      .filter(e => e.category === 'GROCERY')
      .reduce((sum, e) => sum + e.amount, 0);

    const salaryExpenses = currentMonthExpenses
      .filter(e => e.category === 'SALARIES' || e.category === 'STAFF_SALARY')
      .reduce((sum, e) => sum + e.amount, 0);

    const netOperatingAmount = collectedThisMonth - totalExpenses;
    const collectionRate = expectedMonthly > 0 ? Number(((collectedThisMonth / expectedMonthly) * 100).toFixed(1)) : 0;

    const unresolvedComplaints = this.data.complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
    const pendingMaintenance = this.data.maintenance_requests.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length;
    const pendingKycCount = activeResidents.filter(r => r.kyc_status === 'NOT_STARTED' || r.kyc_status === 'PENDING' || r.kyc_status === 'SUBMITTED').length;

    return {
      total_beds: totalBeds,
      occupied_beds: occupiedBeds,
      vacant_beds: vacantBeds,
      occupancy_rate: occupancyRate,
      active_residents: activeResidents.length,
      former_residents: formerResidents.length,
      expected_monthly_collection: expectedMonthly,
      collected_this_month: collectedThisMonth,
      pending_amount: pendingAmount,
      total_expenses: totalExpenses,
      net_operating_amount: netOperatingAmount,
      collection_rate: collectionRate,
      grocery_expenses_month: groceryExpenses,
      salaries_paid_month: salaryExpenses,
      unresolved_complaints: unresolvedComplaints,
      pending_maintenance: pendingMaintenance,
      pending_kyc_count: pendingKycCount
    };
  }

  public getBootstrap(): BootstrapResponse {
    return {
      ...this.getSnapshot(),
      metrics: this.getDashboardMetrics()
    };
  }

  private sanitizeAndSyncOccupancy() {
    const activeResidents = this.data.residents.filter(r => r.status === 'ACTIVE');

    this.data.beds.forEach(bed => {
      const resident = activeResidents.find(r =>
        r.current_bed_id === bed.id ||
        (r.current_room_id === bed.room_id && (r.current_bed_number === bed.bed_number || r.current_bed_id === bed.id))
      );
      if (resident) {
        bed.status = 'OCCUPIED';
        bed.current_resident_id = resident.id;
        bed.current_resident_name = resident.name;
      } else {
        bed.status = 'VACANT';
        bed.current_resident_id = null;
        bed.current_resident_name = null;
      }
    });

    this.data.rooms.forEach(room => {
      const roomBeds = this.data.beds.filter(b => b.room_id === room.id);
      const occupied = roomBeds.filter(b => b.status === 'OCCUPIED').length;
      room.occupied_beds_count = occupied;
      room.vacant_beds_count = Math.max(0, room.capacity - occupied);
      room.beds = roomBeds;
      if (occupied >= room.capacity && room.capacity > 0) {
        room.status = 'FULL';
      } else {
        room.status = 'AVAILABLE';
      }
    });

    this.data.floors.forEach(floor => {
      floor.rooms = this.data.rooms.filter(r => r.floor_id === floor.id || r.floor_number === floor.floor_number);
    });
  }

  public createResident(payload: any): { data: Resident; metrics: DashboardMetrics } {
    const id = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const room = this.data.rooms.find(r => r.id === payload.current_room_id || r.room_number === payload.current_room_number);
    const bed = this.data.beds.find(b => b.id === payload.current_bed_id);

    const newRes: Resident = {
      id,
      name: payload.name,
      photo_url: payload.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`,
      phone: payload.phone,
      whatsapp: payload.whatsapp || payload.phone,
      email: payload.email || '',
      college: payload.college || '',
      course: payload.course || '',
      academic_year: payload.academic_year || '1st Year',
      date_of_birth: payload.date_of_birth || '',
      parent_name: payload.parent_name || '',
      parent_phone: payload.parent_phone || '',
      emergency_contact: payload.emergency_contact || payload.parent_phone || '',
      permanent_address: payload.permanent_address || '',
      joining_date: payload.joining_date || new Date().toISOString().split('T')[0],
      floor_number: room ? room.floor_number : null,
      vacated_date: null,
      vacated_reason: null,
      status: 'ACTIVE',
      monthly_fee: Number(payload.monthly_fee) || 6000,
      sharing_type: payload.sharing_type || '4-Sharing',
      current_room_id: room ? room.id : null,
      current_room_number: room ? room.room_number : null,
      current_bed_id: bed ? bed.id : null,
      current_bed_number: bed ? bed.bed_number : (payload.current_bed_number ? Number(payload.current_bed_number) : null),
      kyc_status: 'SUBMITTED',
      kyc_completion: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.residents.push(newRes);

    if (payload.security_deposit_amount) {
      const deposit = Number(payload.security_deposit_amount);
      this.data.advances.push({
        id: `ADV-${newRes.id}`,
        resident_id: newRes.id,
        resident_name: newRes.name,
        opening_advance: deposit,
        current_advance: deposit,
        transactions: [
          {
            id: `ADV-TXN-${newRes.id}-01`,
            type: 'DEPOSIT',
            amount: deposit,
            date: newRes.joining_date,
            reference: `ADV-INIT-${newRes.id}`,
            notes: 'Security deposit received at admission',
            balance_after: deposit
          }
        ]
      });
    }

    this.data.audit_logs.push({
      id: `AUD-${Date.now()}`,
      admin_user: 'Sathwik Pala',
      action: 'RESIDENT_CREATED',
      entity_type: 'RESIDENT',
      entity_id: newRes.id,
      details: `Admitted ${newRes.name} to Room ${newRes.current_room_number || 'N/A'} Bed ${newRes.current_bed_number || 'N/A'}.`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: newRes, metrics: this.getDashboardMetrics() };
  }

  public editResident(id: string, payload: Partial<Resident>): { data: Resident } {
    const res = this.data.residents.find(r => r.id === id);
    if (!res) throw new Error('Resident not found');
    Object.assign(res, payload);
    res.updated_at = new Date().toISOString();
    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: res };
  }

  public transferRoom(residentId: string, payload: {
    new_room_id: string;
    new_bed_id?: string;
    new_bed_number?: number;
    transfer_reason?: string;
    admin_user?: string;
  }) {
    const resident = this.data.residents.find(r => r.id === residentId);
    if (!resident) throw new Error('Resident not found');

    const newRoom = this.data.rooms.find(r => r.id === payload.new_room_id);
    if (!newRoom) throw new Error('Target room not found');

    const prevRoom = resident.current_room_number;
    const prevBed = resident.current_bed_number;

    resident.current_room_id = newRoom.id;
    resident.current_room_number = newRoom.room_number;
    resident.floor_number = newRoom.floor_number;
    resident.current_bed_id = payload.new_bed_id || null;
    resident.current_bed_number = payload.new_bed_number || 1;
    resident.updated_at = new Date().toISOString();

    this.data.audit_logs.push({
      id: `AUD-${Date.now()}`,
      admin_user: payload.admin_user || 'Sathwik Pala',
      action: 'ROOM_TRANSFER',
      entity_type: 'RESIDENT',
      entity_id: resident.id,
      details: `Transferred ${resident.name} from Room ${prevRoom} Bed ${prevBed} to Room ${newRoom.room_number} Bed ${resident.current_bed_number}. Reason: ${payload.transfer_reason || 'Administrative transfer'}`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: resident, metrics: this.getDashboardMetrics() };
  }

  public markResidentVacated(residentId: string, payload: { vacated_reason?: string; admin_user?: string }) {
    const resident = this.data.residents.find(r => r.id === residentId);
    if (!resident) throw new Error('Resident not found');

    resident.status = 'VACATED';
    resident.vacated_date = new Date().toISOString().split('T')[0];
    resident.vacated_reason = payload.vacated_reason || 'Checkout completed';
    resident.current_room_id = null;
    resident.current_room_number = null;
    resident.current_bed_id = null;
    resident.current_bed_number = null;
    resident.updated_at = new Date().toISOString();

    this.data.audit_logs.push({
      id: `AUD-${Date.now()}`,
      admin_user: payload.admin_user || 'Sathwik Pala',
      action: 'RESIDENT_VACATED',
      entity_type: 'RESIDENT',
      entity_id: resident.id,
      details: `Marked ${resident.name} as vacated on ${resident.vacated_date}. Reason: ${resident.vacated_reason}`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: resident, metrics: this.getDashboardMetrics() };
  }

  public deleteResident(residentId: string, adminUser?: string) {
    const idx = this.data.residents.findIndex(r => r.id === residentId);
    if (idx !== -1) {
      const removed = this.data.residents[idx];
      this.data.residents.splice(idx, 1);
      this.data.audit_logs.push({
        id: `AUD-${Date.now()}`,
        admin_user: adminUser || 'Sathwik Pala',
        action: 'RESIDENT_DELETED',
        entity_type: 'RESIDENT',
        entity_id: residentId,
        details: `Deleted resident record for ${removed.name}`,
        timestamp: new Date().toISOString()
      });
    }
    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { success: true, metrics: this.getDashboardMetrics() };
  }

  public recordPayment(payload: any): { data: Payment; metrics: DashboardMetrics } {
    const id = `PAY-${Date.now()}`;
    const payment: Payment = {
      id,
      resident_id: payload.resident_id,
      resident_name: payload.resident_name || 'Resident',
      room_id: payload.room_id || '',
      room_number: payload.room_number || '',
      month: payload.month || '2026-08',
      expected_amount: Number(payload.expected_amount) || Number(payload.amount_paid) || 0,
      amount_paid: Number(payload.amount_paid) || 0,
      advance_used: Number(payload.advance_used) || 0,
      balance: Math.max(0, (Number(payload.expected_amount) || 0) - (Number(payload.amount_paid) || 0)),
      payment_date: payload.payment_date || new Date().toISOString().split('T')[0],
      payment_method: payload.payment_method || payload.payment_mode || 'UPI',
      transaction_reference: payload.transaction_reference || payload.transaction_id || `TXN${Date.now()}`,
      notes: payload.notes || 'Monthly hostel rent payment',
      recorded_by: payload.recorded_by || 'Sathwik Pala',
      created_at: new Date().toISOString()
    };

    this.data.payments.push(payment);
    this.persist();
    return { data: payment, metrics: this.getDashboardMetrics() };
  }

  public addExpense(payload: Partial<Expense>): { data: Expense; metrics: DashboardMetrics } {
    const id = `EXP-${Date.now()}`;
    const expense: Expense = {
      id,
      title: payload.title || payload.description || 'Operational Outflow',
      category: payload.category || 'OTHER',
      subcategory: payload.subcategory || 'General',
      amount: Number(payload.amount) || 0,
      date: payload.date || new Date().toISOString(),
      vendor: payload.vendor || payload.paid_to || 'Vendor',
      paid_to: payload.paid_to || payload.vendor || 'Vendor',
      payment_method: payload.payment_method || 'UPI',
      payment_mode: payload.payment_mode || 'UPI',
      description: payload.description || payload.title || 'Hostel operations expenditure',
      created_by: payload.created_by || 'Sathwik Pala',
      created_at: new Date().toISOString()
    };

    this.data.expenses.push(expense);
    this.persist();
    return { data: expense, metrics: this.getDashboardMetrics() };
  }

  public deleteExpense(id: string, adminUser?: string) {
    const idx = this.data.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.expenses.splice(idx, 1);
    }
    this.persist();
    return { success: true, metrics: this.getDashboardMetrics() };
  }

  public uploadKYC(payload: any): { data: ResidentDocument } {
    const id = `DOC-${Date.now()}`;
    const doc: ResidentDocument = {
      id,
      resident_id: payload.resident_id,
      document_type: payload.document_type || 'AADHAAR',
      document_name: payload.document_name || 'KYC_Document.pdf',
      document_url: payload.document_url || payload.file_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      file_size: payload.file_size || '1.2 MB',
      status: 'PENDING',
      uploaded_at: new Date().toISOString(),
      verified_by: null,
      verified_at: null
    };
    this.data.resident_documents.push(doc);
    this.persist();
    return { data: doc };
  }

  public verifyKYC(payload: {
    document_id: string;
    status: 'VERIFIED' | 'REJECTED';
    rejection_reason?: string;
    verified_by?: string;
  }): { data: ResidentDocument } {
    const doc = this.data.resident_documents.find(d => d.id === payload.document_id);
    if (!doc) throw new Error('Document not found');
    doc.status = payload.status;
    if (payload.rejection_reason) doc.rejection_reason = payload.rejection_reason;
    doc.verified_at = new Date().toISOString();
    doc.verified_by = payload.verified_by || 'Sathwik Pala';

    const resident = this.data.residents.find(r => r.id === doc.resident_id);
    if (resident) {
      resident.kyc_status = payload.status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED';
      resident.kyc_completion = payload.status === 'VERIFIED' ? 100 : 50;
    }

    this.persist();
    return { data: doc };
  }

  public sendWhatsApp(payload: {
    resident_ids: string[];
    message_type: any;
    custom_text?: string;
    month?: string;
  }): { data: { success_count: number; failed_count: number; messages: WhatsAppMessage[] } } {
    const messages: WhatsAppMessage[] = [];
    payload.resident_ids.forEach(resId => {
      const res = this.data.residents.find(r => r.id === resId);
      const msg: WhatsAppMessage = {
        id: `WA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        resident_id: resId,
        resident_name: res?.name || 'Resident',
        phone: res?.phone || res?.whatsapp || '',
        message_type: payload.message_type || 'CUSTOM',
        template_name: 'template_hanura',
        message_content: payload.custom_text || 'Hanura Casa Notification',
        sent_at: new Date().toISOString(),
        status: 'DELIVERED'
      };
      messages.push(msg);
      this.data.whatsapp_messages.push(msg);
    });
    this.persist();
    return { data: { success_count: messages.length, failed_count: 0, messages } };
  }

  public createComplaint(payload: Partial<Complaint>): { data: Complaint } {
    const id = `CMP-${Date.now()}`;
    const cmp: Complaint = {
      id,
      resident_id: payload.resident_id || 'RES-1001',
      resident_name: payload.resident_name || 'Resident',
      room_number: payload.room_number || '',
      category: payload.category || 'General',
      description: payload.description || '',
      priority: payload.priority || 'MEDIUM',
      status: 'PENDING',
      assigned_person: payload.assigned_person || 'Hostel Staff',
      created_at: new Date().toISOString(),
      resolved_at: null,
      resolution_notes: ''
    };
    this.data.complaints.push(cmp);
    this.persist();
    return { data: cmp };
  }

  public updateComplaint(id: string, payload: Partial<Complaint>): { data: Complaint } {
    const cmp = this.data.complaints.find(c => c.id === id);
    if (!cmp) throw new Error('Complaint not found');
    Object.assign(cmp, payload);
    this.persist();
    return { data: cmp };
  }

  public createMaintenance(payload: Partial<MaintenanceRequest>): { data: MaintenanceRequest } {
    const id = `MNT-${Date.now()}`;
    const mnt: MaintenanceRequest = {
      id,
      room_number: payload.room_number || '',
      category: payload.category || 'General Repair',
      description: payload.description || '',
      priority: payload.priority || 'MEDIUM',
      status: 'PENDING',
      assigned_staff: payload.assigned_staff || 'Maintenance Team',
      estimated_cost: payload.estimated_cost || 0,
      created_at: new Date().toISOString(),
      completion_date: null,
      resolution: ''
    };
    this.data.maintenance_requests.push(mnt);
    this.persist();
    return { data: mnt };
  }

  public updateMaintenance(id: string, payload: Partial<MaintenanceRequest>): { data: MaintenanceRequest } {
    const mnt = this.data.maintenance_requests.find(m => m.id === id);
    if (!mnt) throw new Error('Maintenance request not found');
    Object.assign(mnt, payload);
    this.persist();
    return { data: mnt };
  }

  public addStaff(payload: Partial<Staff>): { data: Staff } {
    const id = `STF-${Date.now()}`;
    const member: Staff = {
      id,
      name: payload.name || 'New Staff',
      role: payload.role || 'Cook',
      phone: payload.phone || '+91 98765 00000',
      monthly_salary: Number(payload.monthly_salary) || Number(payload.salary) || 15000,
      salary: Number(payload.salary) || Number(payload.monthly_salary) || 15000,
      joining_date: payload.joining_date || new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    };
    this.data.staff.push(member);
    this.persist();
    return { data: member };
  }

  public recordSalary(payload: any): { data: SalaryPayment; metrics: DashboardMetrics } {
    const id = `SAL-${Date.now()}`;
    const sal: SalaryPayment = {
      id,
      staff_id: payload.staff_id,
      staff_name: payload.staff_name || 'Staff Member',
      staff_role: payload.staff_role || 'Staff',
      month: payload.month || '2026-08',
      salary: Number(payload.amount) || Number(payload.salary) || 15000,
      advance: 0,
      deduction: 0,
      paid: Number(payload.amount) || Number(payload.salary) || 15000,
      balance: 0,
      payment_date: payload.payment_date || new Date().toISOString().split('T')[0],
      payment_method: payload.payment_method || payload.payment_mode || 'Bank Transfer',
      transaction_ref: payload.transaction_ref || payload.reference_id || `NEFT-${Date.now()}`,
      status: 'PAID'
    };
    this.data.salary_payments.push(sal);

    // Also record an expense for this salary so financial reports reconcile
    this.data.expenses.push({
      id: `EXP-SAL-${id}`,
      title: `Salary - ${sal.staff_name} (${sal.month})`,
      category: 'STAFF_SALARY',
      subcategory: 'Staff Salary Disbursal',
      amount: sal.paid,
      date: sal.payment_date,
      vendor: sal.staff_name,
      paid_to: sal.staff_name,
      payment_method: sal.payment_method,
      description: `Staff salary disbursed to ${sal.staff_name} for ${sal.month}`,
      created_by: 'Sathwik Pala',
      created_at: new Date().toISOString()
    });

    this.persist();
    return { data: sal, metrics: this.getDashboardMetrics() };
  }

  public createFloor(payload: { floor_number: number; name?: string; description?: string }): { data: Floor; metrics: DashboardMetrics } {
    const floorId = `floor_${payload.floor_number}`;
    const floor: Floor = {
      id: floorId,
      floor_number: payload.floor_number,
      name: payload.name || `Floor ${payload.floor_number}`,
      rooms: []
    };
    this.data.floors.push(floor);
    this.data.floors.sort((a, b) => a.floor_number - b.floor_number);
    this.persist();
    return { data: floor, metrics: this.getDashboardMetrics() };
  }

  public deleteFloor(floorId: string): { metrics: DashboardMetrics } {
    const floor = this.data.floors.find(f => f.id === floorId);
    if (!floor) throw new Error('Floor not found');

    const roomsOnFloor = this.data.rooms.filter(r => r.floor_id === floor.id || r.floor_number === floor.floor_number);
    const roomIds = roomsOnFloor.map(r => r.id);

    const hasActiveResidents = this.data.residents.some(r => r.status === 'ACTIVE' && r.current_room_id && roomIds.includes(r.current_room_id));
    if (hasActiveResidents) {
      throw new Error('Cannot delete floor with active residents. Please transfer them first.');
    }

    this.data.beds = this.data.beds.filter(b => !roomIds.includes(b.room_id));
    this.data.rooms = this.data.rooms.filter(r => !roomIds.includes(r.id));
    this.data.floors = this.data.floors.filter(f => f.id !== floorId);

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { metrics: this.getDashboardMetrics() };
  }

  public createRoom(payload: {
    floor_number: number;
    room_number: string;
    sharing_type?: string;
    capacity: number;
    monthly_fee: number;
    amenities?: string[];
  }): { data: Room; metrics: DashboardMetrics } {
    const floor = this.data.floors.find(f => f.floor_number === payload.floor_number);
    const roomId = `room_${payload.room_number}`;

    const newBeds: Bed[] = [];
    for (let i = 1; i <= payload.capacity; i++) {
      newBeds.push({
        id: `bed_${payload.room_number}_${i}`,
        room_id: roomId,
        bed_number: i,
        status: 'VACANT',
        price: payload.monthly_fee,
        room_number: payload.room_number,
        floor_number: payload.floor_number,
        current_resident_id: null,
        current_resident_name: null
      });
    }

    const room: Room = {
      id: roomId,
      room_number: payload.room_number,
      floor_id: floor ? floor.id : `floor_${payload.floor_number}`,
      floor_number: payload.floor_number,
      sharing_type: payload.sharing_type || `${payload.capacity}-Sharing`,
      capacity: payload.capacity,
      monthly_fee: payload.monthly_fee,
      status: 'AVAILABLE',
      amenities: payload.amenities || ['Attached Bathroom', 'Study Table', 'Cupboard', 'Wi-Fi'],
      beds: newBeds,
      occupied_beds_count: 0,
      vacant_beds_count: payload.capacity
    };

    this.data.rooms.push(room);
    this.data.beds.push(...newBeds);
    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: room, metrics: this.getDashboardMetrics() };
  }

  public bulkCreateRooms(payload: {
    floor_number: number;
    room_numbers?: string[];
    prefix?: string;
    start_number?: number;
    end_number?: number;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }): { data: Room[]; metrics: DashboardMetrics } {
    const roomsCreated: Room[] = [];
    const roomNumbers: string[] = [];

    if (payload.room_numbers && payload.room_numbers.length > 0) {
      roomNumbers.push(...payload.room_numbers);
    } else if (payload.start_number && payload.end_number) {
      for (let i = payload.start_number; i <= payload.end_number; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const roomNum = payload.prefix ? `${payload.prefix}${numStr}` : `${payload.floor_number}${numStr}`;
        roomNumbers.push(roomNum);
      }
    }

    roomNumbers.forEach(rNum => {
      const res = this.createRoom({
        floor_number: payload.floor_number,
        room_number: rNum,
        capacity: payload.capacity,
        monthly_fee: payload.monthly_fee,
        sharing_type: payload.sharing_type,
        amenities: payload.amenities
      });
      roomsCreated.push(res.data);
    });

    return { data: roomsCreated, metrics: this.getDashboardMetrics() };
  }

  public updateRoom(id: string, payload: Partial<Room>): { data: Room; metrics: DashboardMetrics } {
    const room = this.data.rooms.find(r => r.id === id);
    if (!room) throw new Error('Room not found');
    Object.assign(room, payload);
    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: room, metrics: this.getDashboardMetrics() };
  }

  public deleteRoom(id: string): { metrics: DashboardMetrics } {
    const room = this.data.rooms.find(r => r.id === id);
    if (!room) throw new Error('Room not found');

    const hasResidents = this.data.residents.some(r => r.status === 'ACTIVE' && r.current_room_id === id);
    if (hasResidents) throw new Error('Cannot delete room with active residents. Please transfer them first.');

    this.data.beds = this.data.beds.filter(b => b.room_id !== id);
    this.data.rooms = this.data.rooms.filter(r => r.id !== id);
    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { metrics: this.getDashboardMetrics() };
  }

  public addBedToRoom(roomId: string, price?: number): { data: Bed; metrics: DashboardMetrics } {
    const room = this.data.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');

    const nextBedNumber = room.capacity + 1;
    const newBed: Bed = {
      id: `bed_${room.room_number}_${nextBedNumber}`,
      room_id: room.id,
      bed_number: nextBedNumber,
      status: 'VACANT',
      price: price || room.monthly_fee,
      room_number: room.room_number,
      floor_number: room.floor_number,
      current_resident_id: null,
      current_resident_name: null
    };

    room.capacity = nextBedNumber;
    room.sharing_type = `${nextBedNumber}-Sharing`;
    this.data.beds.push(newBed);

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: newBed, metrics: this.getDashboardMetrics() };
  }

  public decreaseBedInRoom(roomId: string): { data: Bed; metrics: DashboardMetrics } {
    const room = this.data.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');

    if (room.capacity <= 1) {
      throw new Error('Cannot decrease bed: room capacity is already at minimum 1 bed.');
    }

    const roomBeds = this.data.beds.filter(b => b.room_id === room.id).sort((a, b) => b.bed_number - a.bed_number);
    const lastBed = roomBeds[0];

    if (!lastBed) throw new Error('No beds found in room');

    const activeRes = this.data.residents.find(r => r.status === 'ACTIVE' && r.current_bed_id === lastBed.id);
    if (activeRes) {
      throw new Error(`Bed ${lastBed.bed_number} in Room ${room.room_number} is occupied by ${activeRes.name}. Please transfer resident first.`);
    }

    this.data.beds = this.data.beds.filter(b => b.id !== lastBed.id);
    room.capacity = room.capacity - 1;
    room.sharing_type = `${room.capacity}-Sharing`;

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { data: lastBed, metrics: this.getDashboardMetrics() };
  }

  public deleteBed(bedId: string): { metrics: DashboardMetrics } {
    const bed = this.data.beds.find(b => b.id === bedId);
    if (!bed) throw new Error('Bed not found');

    const activeRes = this.data.residents.find(r => r.status === 'ACTIVE' && r.current_bed_id === bedId);
    if (activeRes) {
      throw new Error(`Bed is occupied by ${activeRes.name}. Please transfer resident first.`);
    }

    this.data.beds = this.data.beds.filter(b => b.id !== bedId);
    const room = this.data.rooms.find(r => r.id === bed.room_id);
    if (room) {
      room.capacity = Math.max(1, room.capacity - 1);
      room.sharing_type = `${room.capacity}-Sharing`;
    }

    this.sanitizeAndSyncOccupancy();
    this.persist();
    return { metrics: this.getDashboardMetrics() };
  }

  public updateSettings(payload: any): { data: any } {
    this.data.settings = { ...this.data.settings, ...payload };
    this.persist();
    return { data: this.data.settings };
  }

  public resetDemoDatabase(): BootstrapResponse {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.data = this.generateInitialData();
    this.persist();
    return this.getBootstrap();
  }

  public clearAllData(): BootstrapResponse {
    this.data = {
      settings: initialSettings,
      floors: [],
      rooms: [],
      beds: [],
      residents: [],
      payments: [],
      advances: [],
      expenses: [],
      staff: [],
      salary_payments: [],
      maintenance_requests: [],
      complaints: [],
      resident_documents: [],
      room_assignments: [],
      whatsapp_messages: [],
      notifications: [],
      audit_logs: [
        {
          id: `AUD-${Date.now()}`,
          admin_user: 'Sathwik Pala',
          action: 'DATABASE_CLEARED',
          entity_type: 'SYSTEM',
          entity_id: 'HC-HYD-01',
          details: 'All floors, rooms, beds, residents and financial records wiped clean.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    this.persist();
    return this.getBootstrap();
  }

  public removeSampleData(): BootstrapResponse {
    const beds = this.data.beds.map(b => ({
      ...b,
      status: 'VACANT' as const,
      current_resident_id: null,
      current_resident_name: null
    }));
    const rooms = this.data.rooms.map(r => ({
      ...r,
      occupied_beds_count: 0,
      vacant_beds_count: r.capacity,
      status: 'AVAILABLE' as const,
      beds: beds.filter(b => b.room_id === r.id)
    }));
    const floors = this.data.floors.map(f => ({
      ...f,
      occupied_beds: 0,
      vacant_beds: f.total_beds,
      rooms: rooms.filter(r => r.floor_id === f.id)
    }));

    this.data = {
      settings: this.data.settings || initialSettings,
      floors,
      rooms,
      beds,
      residents: [],
      payments: [],
      advances: [],
      expenses: [],
      staff: this.data.staff || [],
      salary_payments: [],
      maintenance_requests: [],
      complaints: [],
      resident_documents: [],
      room_assignments: [],
      whatsapp_messages: [],
      notifications: [],
      audit_logs: [
        {
          id: `AUD-${Date.now()}`,
          admin_user: 'Sathwik Pala',
          action: 'SAMPLE_DATA_REMOVED',
          entity_type: 'SYSTEM',
          entity_id: 'HC-HYD-01',
          details: 'Sample residents and transactions wiped clean. Space layout preserved.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    this.persist();
    return this.getBootstrap();
  }
}

export const localDb = new LocalDbService();
