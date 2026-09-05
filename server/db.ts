import fs from 'fs';
import path from 'path';
import {
  Floor,
  Room,
  Bed,
  Resident,
  Payment,
  AdvanceAccount,
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
  SystemSettings,
  DashboardMetrics
} from '../src/types';
import {
  generateFloorsAndRooms,
  initialResidentsData,
  initialStaffData,
  initialComplaintsData,
  initialMaintenanceData,
  initialSettings
} from './initialData';
import {
  isSupabaseConfigured,
  fetchCloudState,
  saveCloudState,
  fetchAllTablesFromSupabase,
  syncAllTablesToSupabase
} from './supabase';

export interface DatabaseSchema {
  settings: SystemSettings;
  floors: Floor[];
  rooms: Room[];
  beds: Bed[];
  residents: Resident[];
  payments: Payment[];
  advances: AdvanceAccount[];
  expenses: Expense[];
  staff: Staff[];
  salary_payments: SalaryPayment[];
  maintenance_requests: MaintenanceRequest[];
  complaints: Complaint[];
  resident_documents: ResidentDocument[];
  room_assignments: RoomAssignment[];
  whatsapp_messages: WhatsAppMessage[];
  notifications: NotificationItem[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hanuradb.json');

let idCounter = 0;
export function generateUniqueId(prefix: string): string {
  idCounter = (idCounter + 1) % 1000000;
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${idCounter}-${rand}`;
}

class DatabaseService {
  private data!: DatabaseSchema;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (this.data && this.data.settings) {
          this.data.settings.whatsapp_api_configured = true;
          this.data.settings.contact_phone = '+91 8882997700';
          this.data.settings.whatsapp_phone_number_id = '8882997700';
        }

        // Automatic Deduplication Pass: Ensure all audit logs and notifications have globally unique keys
        if (Array.isArray(this.data.audit_logs)) {
          const seenIds = new Set<string>();
          this.data.audit_logs = this.data.audit_logs.map((log, idx) => {
            if (!log.id || seenIds.has(log.id)) {
              const uniqueKey = `LOG-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
              seenIds.add(uniqueKey);
              return { ...log, id: uniqueKey };
            }
            seenIds.add(log.id);
            return log;
          });
        }

        if (Array.isArray(this.data.notifications)) {
          const seenNotifIds = new Set<string>();
          this.data.notifications = this.data.notifications.map((notif, idx) => {
            if (!notif.id || seenNotifIds.has(notif.id)) {
              const uniqueKey = `NOTIF-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
              seenNotifIds.add(uniqueKey);
              return { ...notif, id: uniqueKey };
            }
            seenNotifIds.add(notif.id);
            return notif;
          });
        }

        this.sanitizeAndSyncOccupancy();
        this.saveToDisk(false);
        console.log('✅ Hanura Casa database loaded from persistent disk storage with verified unique keys.');
        
        if (isSupabaseConfigured()) {
          fetchAllTablesFromSupabase().then(cloudData => {
            if (cloudData && typeof cloudData === 'object') {
              const hasData = (cloudData.residents && cloudData.residents.length > 0) || 
                              (cloudData.rooms && cloudData.rooms.length > 0) ||
                              (cloudData.floors && cloudData.floors.length > 0);
              if (hasData || (this.data.residents.length === 0 && this.data.rooms.length === 0)) {
                this.data = { ...this.data, ...cloudData };
                this.sanitizeAndSyncOccupancy();
                this.saveToDisk(false);
                console.log('☁️ Hanura Casa database synchronized from Supabase cloud tables.');
              }
            }
          }).catch(e => console.warn('[Supabase Sync Error]', e.message));
        }
        return;
      } catch (err) {
        console.error('⚠️ Could not parse existing db file, reseeding fresh dataset...', err);
      }
    }

    this.seedInitialDatabase();
    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    console.log('✅ Hanura Casa database initialized with clean production data.');

    if (isSupabaseConfigured()) {
      fetchAllTablesFromSupabase().then(cloudData => {
        if (cloudData && typeof cloudData === 'object') {
          this.data = { ...this.data, ...cloudData };
          this.sanitizeAndSyncOccupancy();
          this.saveToDisk(false);
          console.log('☁️ Hanura Casa database synchronized from Supabase cloud on initialization.');
        }
      }).catch(e => console.warn('[Supabase Initial Sync Error]', e.message));
    }
  }

  private saveToDisk(syncCloud: boolean = true) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      if (syncCloud && isSupabaseConfigured()) {
        syncAllTablesToSupabase(this.data).catch(err => {
          console.error('[Supabase Cloud Tables Sync Error]:', err.message);
        });
      }
    } catch (err) {
      console.error('Failed to write to db file:', err);
    }
  }

  public async syncWithSupabase(): Promise<{ success: boolean; message: string; syncedTables?: string[] }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase credentials not found in environment.' };
    }
    const cloud = await fetchAllTablesFromSupabase();
    if (cloud && ((cloud.residents && cloud.residents.length > 0) || (cloud.rooms && cloud.rooms.length > 0) || (cloud.floors && cloud.floors.length > 0))) {
      this.data = { ...this.data, ...cloud };
      this.sanitizeAndSyncOccupancy();
      this.saveToDisk(false);
      return { success: true, message: 'Successfully pulled latest data from Supabase cloud database.' };
    } else {
      const res = await syncAllTablesToSupabase(this.data);
      return { 
        success: res.success, 
        message: res.success 
          ? `Successfully synced data to Supabase (${res.syncedTables.length} tables active: ${res.syncedTables.join(', ')})` 
          : 'Failed to push records to Supabase.',
        syncedTables: res.syncedTables
      };
    }
  }

  public async pushToSupabase(): Promise<{ success: boolean; message: string; syncedTables?: string[] }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured.' };
    }
    const res = await syncAllTablesToSupabase(this.data);
    return { 
      success: res.success, 
      message: res.success 
        ? `Successfully pushed all records to Supabase (${res.syncedTables.length} tables updated: ${res.syncedTables.join(', ')})` 
        : 'Failed to push records to Supabase.',
      syncedTables: res.syncedTables
    };
  }

  public seedInitialDatabase() {
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
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          title: 'System Initialized',
          message: 'Hanura Casa OS is ready. Please configure your floors, rooms and beds in Settings.',
          type: 'SYSTEM',
          timestamp: new Date().toISOString(),
          is_read: false
        }
      ],
      audit_logs: [
        {
          id: `LOG-${Date.now()}`,
          action: 'SYSTEM_INITIALIZED',
          entity_type: 'SYSTEM',
          entity_id: 'ALL',
          details: 'System initialized with clean database ready for manual configuration.',
          admin_user: 'Administrator',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.saveToDisk();
    console.log('✨ Clean database ready.');
  }

  public seedDemoData() {
    const { floors, rooms, beds } = generateFloorsAndRooms();
    const residents: Resident[] = [];
    const payments: Payment[] = [];
    const advances: AdvanceAccount[] = [];
    const room_assignments: RoomAssignment[] = [];
    const resident_documents: ResidentDocument[] = [];
    const audit_logs: AuditLog[] = [];
    const notifications: NotificationItem[] = [];

    // Helper map for fast room lookup
    const roomMap = new Map<string, Room>();
    rooms.forEach(r => roomMap.set(r.room_number, r));

    const bedMap = new Map<string, Bed>();
    beds.forEach(b => bedMap.set(b.id, b));

    // Seed Residents
    initialResidentsData.forEach(item => {
      const room = roomMap.get(item.targetRoom);
      let assignedBedId: string | null = null;
      let assignedBedNumber: number | null = null;

      if (room && !item.isVacated) {
        const targetBed = room.beds.find(b => b.bed_number === item.targetBed);
        if (targetBed) {
          targetBed.status = 'OCCUPIED';
          targetBed.current_resident_id = item.id!;
          targetBed.current_resident_name = item.name!;
          assignedBedId = targetBed.id;
          assignedBedNumber = targetBed.bed_number;
          
          const bedInGlobal = bedMap.get(targetBed.id);
          if (bedInGlobal) {
            bedInGlobal.status = 'OCCUPIED';
            bedInGlobal.current_resident_id = item.id!;
            bedInGlobal.current_resident_name = item.name!;
          }
        }
      }

      const resident: Resident = {
        id: item.id!,
        name: item.name!,
        photo_url: item.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        phone: item.phone!,
        whatsapp: item.whatsapp || item.phone!,
        email: item.email || '',
        college: item.college || '',
        course: item.course || '',
        academic_year: item.academic_year || '3rd Year',
        date_of_birth: item.date_of_birth || '2004-01-01',
        parent_name: item.parent_name || '',
        parent_phone: item.parent_phone || '',
        emergency_contact: item.emergency_contact || '',
        permanent_address: item.permanent_address || '',
        joining_date: item.joining_date || '2025-08-01',
        current_room_id: item.isVacated ? null : (room ? room.id : null),
        current_room_number: item.isVacated ? null : (room ? room.room_number : null),
        current_bed_id: item.isVacated ? null : assignedBedId,
        current_bed_number: item.isVacated ? null : assignedBedNumber,
        floor_number: item.isVacated ? null : (room ? room.floor_number : null),
        sharing_type: item.sharing_type || (room ? room.sharing_type : '4-Sharing'),
        monthly_fee: item.monthly_fee || (room ? room.monthly_fee : 6500),
        status: item.isVacated ? 'VACATED' : 'ACTIVE',
        vacated_date: item.isVacated ? '2026-06-30' : null,
        vacated_reason: item.isVacated ? 'Course Completed / Relocated' : null,
        kyc_status: item.kyc_status || 'VERIFIED',
        kyc_completion: item.kyc_completion || 100,
        created_at: item.joining_date ? `${item.joining_date}T10:00:00.000Z` : '2025-08-01T10:00:00.000Z',
        updated_at: new Date().toISOString()
      };

      residents.push(resident);

      // Room assignment history
      if (room) {
        room_assignments.push({
          id: `ASN-${item.id}-01`,
          resident_id: resident.id,
          resident_name: resident.name,
          room_id: room.id,
          room_number: room.room_number,
          bed_id: assignedBedId || `bed_${room.room_number}_${item.targetBed}`,
          bed_number: item.targetBed,
          start_date: resident.joining_date,
          end_date: item.isVacated ? '2026-06-30' : null,
          status: item.isVacated ? 'VACATED' : 'ACTIVE'
        });
      }

      // Advances
      const advAccount: AdvanceAccount = {
        id: `ADV-${resident.id}`,
        resident_id: resident.id,
        resident_name: resident.name,
        opening_advance: item.openAdvance || 6000,
        current_advance: item.openAdvance || 6000,
        transactions: [
          {
            id: `ADV-TXN-${resident.id}-01`,
            type: 'DEPOSIT',
            amount: item.openAdvance || 6000,
            date: resident.joining_date,
            reference: `ADV-INIT-${resident.id}`,
            notes: 'Security deposit received at check-in',
            balance_after: item.openAdvance || 6000
          }
        ]
      };
      advances.push(advAccount);

      // Seed Documents
      resident_documents.push(
        {
          id: `DOC-${resident.id}-01`,
          resident_id: resident.id,
          document_type: 'AADHAAR',
          document_name: 'Aadhaar_Card_Front_Back.pdf',
          document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          file_size: '1.4 MB',
          uploaded_at: resident.created_at,
          verified_by: 'Sathwik Pala',
          verified_at: '2025-08-05T14:30:00.000Z',
          status: 'VERIFIED'
        },
        {
          id: `DOC-${resident.id}-02`,
          resident_id: resident.id,
          document_type: 'COLLEGE_ID',
          document_name: 'College_Student_ID.jpg',
          document_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&auto=format&fit=crop&q=80',
          file_size: '850 KB',
          uploaded_at: resident.created_at,
          verified_by: 'Sathwik Pala',
          verified_at: '2025-08-05T14:31:00.000Z',
          status: 'VERIFIED'
        }
      );

      // Seed Payments for months (2026-05, 2026-06, 2026-07, 2026-08)
      const months = ['2026-05', '2026-06', '2026-07', '2026-08'];
      months.forEach((m, idx) => {
        let paid = resident.monthly_fee;
        let bal = 0;

        if (resident.id === 'RES-1001' && m === '2026-08') {
          paid = 5000; // Partial payment for Rahul in Aug 2026 test
          bal = 1500;
        } else if (resident.id === 'RES-1004' && m === '2026-08') {
          paid = 0; // Pending for Suresh
          bal = resident.monthly_fee;
        } else if (resident.id === 'RES-1009' && m === '2026-08') {
          paid = 3000;
          bal = 2500;
        }

        if (item.isVacated && (m === '2026-07' || m === '2026-08')) {
          return; // No payments after vacated
        }

        if (paid > 0) {
          payments.push({
            id: `PAY-${m.replace('-', '')}-${resident.id.replace('RES-', '')}`,
            resident_id: resident.id,
            resident_name: resident.name,
            room_id: room ? room.id : 'room_204',
            room_number: room ? room.room_number : '204',
            month: m,
            expected_amount: resident.monthly_fee,
            amount_paid: paid,
            advance_used: 0,
            balance: bal,
            payment_date: `${m}-0${idx + 3}T11:00:00.000Z`,
            payment_method: idx % 2 === 0 ? 'UPI' : 'Bank Transfer',
            transaction_reference: `UPI/${m.replace('-', '')}/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            notes: `Monthly fee for ${m}`,
            recorded_by: 'Sathwik Pala',
            created_at: `${m}-0${idx + 3}T11:05:00.000Z`
          });
        }
      });
    });

    // Recalculate room counts
    rooms.forEach(r => {
      const occ = r.beds.filter(b => b.status === 'OCCUPIED').length;
      r.occupied_beds_count = occ;
      r.vacant_beds_count = r.capacity - occ;
      if (occ === r.capacity) {
        r.status = 'FULL';
      } else {
        r.status = 'AVAILABLE';
      }
    });

    // Expenses Seed Data
    const expenses: Expense[] = [
      {
        id: 'EXP-2026-08-01',
        category: 'GROCERY',
        subcategory: 'Vegetables & Provisions',
        amount: 14500,
        date: '2026-08-02T08:30:00.000Z',
        vendor: 'Sri Lakshmi Wholesale Mandi',
        payment_method: 'UPI',
        description: 'Bi-weekly bulk grocery purchase for hostel mess',
        created_by: 'Sathwik Pala',
        created_at: '2026-08-02T08:35:00.000Z',
        items: [
          { id: '1', name: 'Sonamasuri Rice (25kg bags)', quantity: 4, unit: 'bags', unit_price: 1450, total: 5800 },
          { id: '2', name: 'Nandini Toned Milk', quantity: 80, unit: 'liters', unit_price: 44, total: 3520 },
          { id: '3', name: 'Fresh Farm Chicken', quantity: 15, unit: 'kg', unit_price: 220, total: 3300 },
          { id: '4', name: 'Assorted Fresh Vegetables', quantity: 45, unit: 'kg', unit_price: 42, total: 1880 }
        ]
      },
      {
        id: 'EXP-2026-08-02',
        category: 'ELECTRICITY',
        subcategory: 'Commercial Electricity Bill',
        amount: 42800,
        date: '2026-08-05T10:00:00.000Z',
        vendor: 'TSSPDCL Hyderabad',
        payment_method: 'Bank Transfer',
        description: 'Monthly electricity bill for all 4 floors (Meter #772910)',
        created_by: 'Sathwik Pala',
        created_at: '2026-08-05T10:05:00.000Z'
      },
      {
        id: 'EXP-2026-08-03',
        category: 'INTERNET',
        subcategory: 'Dedicated Leased Fiber Line',
        amount: 9440,
        date: '2026-08-01T12:00:00.000Z',
        vendor: 'ACT Fibernet Commercial',
        payment_method: 'UPI',
        description: '500 Mbps high speed dedicated line with static IP',
        created_by: 'Sathwik Pala',
        created_at: '2026-08-01T12:05:00.000Z'
      },
      {
        id: 'EXP-2026-08-04',
        category: 'GAS',
        subcategory: 'Commercial LPG Cylinders',
        amount: 12600,
        date: '2026-08-06T15:00:00.000Z',
        vendor: 'Indane Commercial Gas Agency',
        payment_method: 'UPI',
        description: '7 commercial 19kg gas cylinders for kitchen',
        created_by: 'Sathwik Pala',
        created_at: '2026-08-06T15:05:00.000Z'
      },
      {
        id: 'EXP-2026-08-05',
        category: 'MAINTENANCE',
        subcategory: 'AC Servicing & Plumbing',
        amount: 4500,
        date: '2026-08-11T16:30:00.000Z',
        vendor: 'Naveen Chary / Metro Spares',
        payment_method: 'Cash',
        description: 'AC gas refill and washroom spare replacement',
        created_by: 'Sathwik Pala',
        created_at: '2026-08-11T16:35:00.000Z'
      }
    ];

    // Staff Salaries Seed
    const staff = initialStaffData;
    const salary_payments: SalaryPayment[] = [];
    staff.forEach(s => {
      salary_payments.push({
        id: `SAL-2026-07-${s.id}`,
        staff_id: s.id,
        staff_name: s.name,
        staff_role: s.role,
        month: '2026-07',
        salary: s.monthly_salary,
        advance: 0,
        deduction: 0,
        paid: s.monthly_salary,
        balance: 0,
        payment_date: '2026-08-01T10:00:00.000Z',
        payment_method: 'Bank Transfer',
        transaction_ref: `SAL-REF-${s.id}-JULY`,
        status: 'PAID'
      });
      // Also add staff salary into total expenses for July
      expenses.push({
        id: `EXP-SAL-2026-07-${s.id}`,
        category: 'SALARIES',
        subcategory: `Monthly Salary - ${s.role}`,
        amount: s.monthly_salary,
        date: '2026-08-01T10:00:00.000Z',
        vendor: s.name,
        payment_method: 'Bank Transfer',
        description: `July 2026 salary for ${s.name} (${s.role})`,
        created_by: 'Sathwik Pala',
        created_at: '2026-08-01T10:00:00.000Z'
      });
    });

    // WhatsApp Message History
    const whatsapp_messages: WhatsAppMessage[] = [
      {
        id: 'WA-2026-001',
        resident_id: 'RES-1001',
        resident_name: 'Rahul Sharma',
        phone: '+91 98451 22345',
        message_type: 'PAYMENT_CONFIRMATION',
        template_name: 'payment_confirmation_v1',
        message_content: 'Hi Rahul Sharma,\n\nYour payment of ₹5,000 for August 2026 has been recorded successfully.\n\nThank you for choosing Hanura Casa.',
        sent_at: '2026-08-04T11:10:00.000Z',
        status: 'DELIVERED'
      },
      {
        id: 'WA-2026-002',
        resident_id: 'RES-1004',
        resident_name: 'Suresh Kumar',
        phone: '+91 94401 23456',
        message_type: 'PAYMENT_REMINDER',
        template_name: 'payment_reminder_v1',
        message_content: 'Hi Suresh Kumar,\n\nYour Hanura Casa fee for August 2026 is ₹5,500.\nPaid: ₹0\nBalance: ₹5,500\n\nPlease clear the pending amount.\n\nThank you,\nHanura Casa',
        sent_at: '2026-08-10T10:00:00.000Z',
        status: 'DELIVERED'
      }
    ];

    // Notifications
    notifications.push(
      {
        id: 'NOTIF-01',
        type: 'PENDING_PAYMENT',
        title: 'Pending Fee for August',
        message: 'Rahul Sharma has a remaining balance of ₹1,500 for August 2026.',
        timestamp: '2026-08-15T09:00:00.000Z',
        is_read: false,
        link_tab: 'payments',
        related_id: 'RES-1001'
      },
      {
        id: 'NOTIF-02',
        type: 'COMPLAINT',
        title: 'New Complaint Logged',
        message: 'Washroom tap dripping in Room 102 reported by Sneha Patel.',
        timestamp: '2026-08-19T14:20:00.000Z',
        is_read: false,
        link_tab: 'complaints',
        related_id: 'CMP-2026-003'
      },
      {
        id: 'NOTIF-03',
        type: 'KYC_INCOMPLETE',
        title: 'KYC Action Required',
        message: 'Ananya Rao (Room 102) has submitted partial KYC documents.',
        timestamp: '2026-08-12T11:00:00.000Z',
        is_read: false,
        link_tab: 'kyc',
        related_id: 'RES-1009'
      }
    );

    // Initial Audit Logs
    audit_logs.push(
      {
        id: 'AUD-001',
        admin_user: 'Sathwik Pala',
        action: 'SYSTEM_BOOT',
        entity_type: 'SYSTEM',
        entity_id: 'HC-HYD-01',
        details: 'Hanura Casa Smart Hostel Management & Monitoring Core System initialized.',
        timestamp: '2026-08-01T00:00:00.000Z'
      },
      {
        id: 'AUD-002',
        admin_user: 'Sathwik Pala',
        action: 'RECORD_PAYMENT',
        entity_type: 'PAYMENT',
        entity_id: 'PAY-202608-1001',
        details: 'Recorded payment of ₹5,000 for Rahul Sharma (Room 204 Bed 3) for August 2026.',
        timestamp: '2026-08-04T11:05:00.000Z'
      }
    );

    this.data = {
      settings: initialSettings,
      floors,
      rooms,
      beds,
      residents,
      payments,
      advances,
      expenses,
      staff,
      salary_payments,
      maintenance_requests: initialMaintenanceData,
      complaints: initialComplaintsData,
      resident_documents,
      room_assignments,
      whatsapp_messages,
      notifications,
      audit_logs
    };
  }

  // GET DATA
  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  // DASHBOARD METRICS CALCULATION
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
      .filter(e => e.category === 'SALARIES')
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

  // RECORD PAYMENT (TEST 1 Workflow)
  public recordPayment(paymentData: {
    resident_id: string;
    month: string;
    expected_amount: number;
    amount_paid: number;
    advance_used?: number;
    payment_date: string;
    payment_method: any;
    transaction_reference: string;
    notes?: string;
    recorded_by?: string;
  }): Payment {
    const resident = this.data.residents.find(r => r.id === paymentData.resident_id);
    if (!resident) {
      throw new Error(`Resident ${paymentData.resident_id} not found.`);
    }

    const advanceUsed = Number(paymentData.advance_used || 0);
    const amountPaid = Number(paymentData.amount_paid || 0);
    const expected = Number(paymentData.expected_amount || resident.monthly_fee);
    const balance = Math.max(0, expected - amountPaid - advanceUsed);

    const paymentId = generateUniqueId('PAY');
    const newPayment: Payment = {
      id: paymentId,
      resident_id: resident.id,
      resident_name: resident.name,
      room_id: resident.current_room_id || 'unassigned',
      room_number: resident.current_room_number || 'N/A',
      month: paymentData.month,
      expected_amount: expected,
      amount_paid: amountPaid,
      advance_used: advanceUsed,
      balance: balance,
      payment_date: paymentData.payment_date || new Date().toISOString(),
      payment_method: paymentData.payment_method || 'UPI',
      transaction_reference: paymentData.transaction_reference || `UPI/${Date.now()}`,
      notes: paymentData.notes || '',
      recorded_by: paymentData.recorded_by || this.data.settings.admin_name,
      created_at: new Date().toISOString()
    };

    this.data.payments.push(newPayment);

    // If advance was used, record in advance ledger
    if (advanceUsed > 0) {
      let advAcc = this.data.advances.find(a => a.resident_id === resident.id);
      if (advAcc) {
        advAcc.current_advance = Math.max(0, advAcc.current_advance - advanceUsed);
        advAcc.transactions.push({
          id: generateUniqueId('ADV-TXN'),
          type: 'MONTHLY_ADJUSTMENT',
          amount: advanceUsed,
          date: newPayment.payment_date,
          reference: newPayment.id,
          notes: `Adjusted towards rent for ${newPayment.month}`,
          balance_after: advAcc.current_advance
        });
      }
    }

    // Add immutable audit log
    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: newPayment.recorded_by,
      action: 'RECORD_PAYMENT',
      entity_type: 'PAYMENT',
      entity_id: newPayment.id,
      details: `Recorded ₹${amountPaid.toLocaleString('en-IN')} payment from ${resident.name} for ${newPayment.month}. (Balance: ₹${balance.toLocaleString('en-IN')})`,
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return newPayment;
  }

  // ROOM TRANSFER (TEST 2 Workflow)
  public transferRoom(data: {
    resident_id: string;
    new_room_id: string;
    new_bed_id?: string;
    new_bed_number?: number;
    transfer_reason?: string;
    admin_user?: string;
  }): { resident: Resident; old_room: Room | null; new_room: Room } {
    const resident = this.data.residents.find(r => r.id === data.resident_id);
    if (!resident) throw new Error('Resident not found.');

    const newRoom = this.data.rooms.find(r => r.id === data.new_room_id);
    if (!newRoom) throw new Error('Target room not found.');

    // Flexible bed lookup by ID or bed number or first vacant bed
    let newBed = newRoom.beds.find(
      b => (data.new_bed_id && b.id === data.new_bed_id) || 
           (data.new_bed_number !== undefined && b.bed_number === Number(data.new_bed_number))
    );

    if (!newBed) {
      newBed = newRoom.beds.find(b => b.status === 'VACANT');
    }

    if (!newBed) throw new Error(`No vacant bed available in Room ${newRoom.room_number}.`);
    if (newBed.status === 'OCCUPIED' && newBed.current_resident_id !== resident.id) {
      throw new Error(`Bed ${newBed.bed_number} in Room ${newRoom.room_number} is already occupied.`);
    }

    const oldRoomNumber = resident.current_room_number;
    const oldBedId = resident.current_bed_id;
    let oldRoom: Room | null = null;

    // Free old bed if any
    if (resident.current_room_id && oldBedId) {
      oldRoom = this.data.rooms.find(r => r.id === resident.current_room_id) || null;
      if (oldRoom) {
        const oldBed = oldRoom.beds.find(b => b.id === oldBedId);
        if (oldBed) {
          oldBed.status = 'VACANT';
          oldBed.current_resident_id = null;
          oldBed.current_resident_name = null;
        }
        // Update old room count
        const occ = oldRoom.beds.filter(b => b.status === 'OCCUPIED').length;
        oldRoom.occupied_beds_count = occ;
        oldRoom.vacant_beds_count = oldRoom.capacity - occ;
        oldRoom.status = occ === oldRoom.capacity ? 'FULL' : 'AVAILABLE';
      }

      // Update in global beds array
      const globalOldBed = this.data.beds.find(b => b.id === oldBedId);
      if (globalOldBed) {
        globalOldBed.status = 'VACANT';
        globalOldBed.current_resident_id = null;
        globalOldBed.current_resident_name = null;
      }

      // Mark old active assignment as transferred
      const currentAssignment = this.data.room_assignments.find(
        a => a.resident_id === resident.id && a.status === 'ACTIVE'
      );
      if (currentAssignment) {
        currentAssignment.status = 'TRANSFERRED';
        currentAssignment.end_date = new Date().toISOString().split('T')[0];
        currentAssignment.transfer_reason = data.transfer_reason || 'Admin room reallocation';
      }
    }

    // Occupy new bed
    newBed.status = 'OCCUPIED';
    newBed.current_resident_id = resident.id;
    newBed.current_resident_name = resident.name;

    const globalNewBed = this.data.beds.find(b => b.id === newBed.id);
    if (globalNewBed) {
      globalNewBed.status = 'OCCUPIED';
      globalNewBed.current_resident_id = resident.id;
      globalNewBed.current_resident_name = resident.name;
    }

    // Update new room count
    const occNew = newRoom.beds.filter(b => b.status === 'OCCUPIED').length;
    newRoom.occupied_beds_count = occNew;
    newRoom.vacant_beds_count = newRoom.capacity - occNew;
    newRoom.status = occNew === newRoom.capacity ? 'FULL' : 'AVAILABLE';

    // Update resident profile
    resident.current_room_id = newRoom.id;
    resident.current_room_number = newRoom.room_number;
    resident.current_bed_id = newBed.id;
    resident.current_bed_number = newBed.bed_number;
    resident.floor_number = newRoom.floor_number;
    resident.sharing_type = newRoom.sharing_type;
    resident.monthly_fee = newRoom.monthly_fee;
    resident.updated_at = new Date().toISOString();

    // Create new room assignment history entry
    this.data.room_assignments.push({
      id: generateUniqueId(`ASN-${resident.id}`),
      resident_id: resident.id,
      resident_name: resident.name,
      room_id: newRoom.id,
      room_number: newRoom.room_number,
      bed_id: newBed.id,
      bed_number: newBed.bed_number,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      status: 'ACTIVE'
    });

    // Immutable audit log
    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: data.admin_user || this.data.settings.admin_name,
      action: 'ROOM_TRANSFER',
      entity_type: 'RESIDENT',
      entity_id: resident.id,
      details: `Transferred ${resident.name} from Room ${oldRoomNumber || 'None'} to Room ${newRoom.room_number} (Bed ${newBed.bed_number}).`,
      old_value: `Room ${oldRoomNumber || 'None'}`,
      new_value: `Room ${newRoom.room_number} Bed ${newBed.bed_number}`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    return { resident, old_room: oldRoom, new_room: newRoom };
  }

  // MARK RESIDENT VACATED (TEST 3 Workflow)
  public markResidentVacated(data: {
    resident_id: string;
    vacated_reason?: string;
    admin_user?: string;
  }): Resident {
    const resident = this.data.residents.find(r => r.id === data.resident_id);
    if (!resident) throw new Error('Resident not found.');

    const oldRoomNumber = resident.current_room_number;
    const oldBedId = resident.current_bed_id;

    // Free assigned bed
    if (resident.current_room_id && oldBedId) {
      const room = this.data.rooms.find(r => r.id === resident.current_room_id);
      if (room) {
        const bed = room.beds.find(b => b.id === oldBedId);
        if (bed) {
          bed.status = 'VACANT';
          bed.current_resident_id = null;
          bed.current_resident_name = null;
        }
        const occ = room.beds.filter(b => b.status === 'OCCUPIED').length;
        room.occupied_beds_count = occ;
        room.vacant_beds_count = room.capacity - occ;
        room.status = occ === room.capacity ? 'FULL' : 'AVAILABLE';
      }

      const globalBed = this.data.beds.find(b => b.id === oldBedId);
      if (globalBed) {
        globalBed.status = 'VACANT';
        globalBed.current_resident_id = null;
        globalBed.current_resident_name = null;
      }
    }

    // Close active room assignment
    const activeAssignment = this.data.room_assignments.find(
      a => a.resident_id === resident.id && a.status === 'ACTIVE'
    );
    if (activeAssignment) {
      activeAssignment.status = 'VACATED';
      activeAssignment.end_date = new Date().toISOString().split('T')[0];
    }

    // Update resident state
    resident.status = 'VACATED';
    resident.vacated_date = new Date().toISOString().split('T')[0];
    resident.vacated_reason = data.vacated_reason || 'Resident checked out';
    resident.current_room_id = null;
    resident.current_room_number = null;
    resident.current_bed_id = null;
    resident.current_bed_number = null;
    resident.floor_number = null;
    resident.updated_at = new Date().toISOString();

    // Audit log
    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: data.admin_user || this.data.settings.admin_name,
      action: 'MARK_VACATED',
      entity_type: 'RESIDENT',
      entity_id: resident.id,
      details: `Marked ${resident.name} as VACATED from Room ${oldRoomNumber || 'N/A'}. Bed released. All financial transaction history permanently preserved.`,
      old_value: 'ACTIVE',
      new_value: 'VACATED',
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    return resident;
  }

  public deleteResident(residentId: string, adminUser?: string): { success: boolean; id: string } {
    const resIndex = this.data.residents.findIndex(r => r.id === residentId);
    if (resIndex === -1) {
      throw new Error('Resident not found.');
    }
    const resident = this.data.residents[resIndex];

    // Remove from array
    this.data.residents.splice(resIndex, 1);

    // Remove or clean up assignments
    this.data.room_assignments = this.data.room_assignments.filter(a => a.resident_id !== residentId);

    // Audit log
    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: adminUser || this.data.settings?.admin_name || 'Administrator',
      action: 'DELETE_RESIDENT',
      entity_type: 'RESIDENT',
      entity_id: residentId,
      details: `Permanently deleted resident ${resident.name}. Released any room/bed assignments.`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    return { success: true, id: residentId };
  }

  // ADD EXPENSE (TEST 4 Workflow)
  public addExpense(expenseData: Partial<Expense>): Expense {
    if (!expenseData.amount || Number(expenseData.amount) <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }

    const newExpense: Expense = {
      id: generateUniqueId('EXP'),
      category: expenseData.category || 'MISCELLANEOUS',
      subcategory: expenseData.subcategory || 'General',
      amount: Number(expenseData.amount),
      date: expenseData.date || new Date().toISOString(),
      vendor: expenseData.vendor || 'General Vendor',
      payment_method: expenseData.payment_method || 'UPI',
      description: expenseData.description || '',
      receipt_url: expenseData.receipt_url,
      items: expenseData.items || [],
      created_by: expenseData.created_by || this.data.settings.admin_name,
      created_at: new Date().toISOString()
    };

    this.data.expenses.unshift(newExpense);

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: newExpense.created_by,
      action: 'ADD_EXPENSE',
      entity_type: 'EXPENSE',
      entity_id: newExpense.id,
      details: `Added ${newExpense.category} expense of ₹${newExpense.amount.toLocaleString('en-IN')} paid to ${newExpense.vendor}.`,
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return newExpense;
  }

  // DELETE / ARCHIVE EXPENSE
  public deleteExpense(expenseId: string, adminUser?: string): boolean {
    const index = this.data.expenses.findIndex(e => e.id === expenseId);
    if (index === -1) throw new Error('Expense not found.');

    const exp = this.data.expenses[index];
    this.data.expenses.splice(index, 1);

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: adminUser || this.data.settings.admin_name,
      action: 'DELETE_EXPENSE',
      entity_type: 'EXPENSE',
      entity_id: expenseId,
      details: `Deleted expense record ₹${exp.amount.toLocaleString('en-IN')} (${exp.category} - ${exp.description}).`,
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return true;
  }

  // CREATE RESIDENT
  public createResident(residentData: Partial<Resident> & {
    target_room_id?: string;
    target_bed_id?: string;
    room_id?: string;
    room_number?: string;
    bed_id?: string;
    bed_number?: number;
    advance_amount?: number;
  }): Resident {
    const residentId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let room: Room | null = null;
    let bed: Bed | null = null;

    const targetRoomId = residentData.target_room_id || residentData.current_room_id || residentData.room_id;
    const targetRoomNumber = residentData.current_room_number || residentData.room_number;
    const targetBedId = residentData.target_bed_id || residentData.current_bed_id || residentData.bed_id;
    const targetBedNum = residentData.current_bed_number !== undefined ? residentData.current_bed_number : residentData.bed_number;

    if (targetRoomId || targetRoomNumber) {
      room = this.data.rooms.find(r => 
        (targetRoomId && (r.id === targetRoomId || r.room_number === targetRoomId)) ||
        (targetRoomNumber && (r.room_number === targetRoomNumber || r.id === targetRoomNumber))
      ) || null;

      if (room) {
        if (targetBedId) {
          bed = (room.beds || []).find(b => b.id === targetBedId) || this.data.beds.find(b => b.id === targetBedId) || null;
        }
        if (!bed && targetBedNum !== undefined) {
          bed = (room.beds || []).find(b => b.bed_number === Number(targetBedNum)) || 
                this.data.beds.find(b => (b.room_id === room.id || b.room_number === room.room_number) && b.bed_number === Number(targetBedNum)) || null;
        }
        if (!bed) {
          bed = (room.beds || []).find(b => b.status === 'VACANT') || 
                this.data.beds.find(b => (b.room_id === room.id || b.room_number === room.room_number) && b.status === 'VACANT') || null;
        }
      }
    }

    const newResident: Resident = {
      id: residentId,
      name: residentData.name || 'New Resident',
      photo_url: residentData.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      phone: residentData.phone || '',
      whatsapp: residentData.whatsapp || residentData.phone || '',
      email: residentData.email || '',
      college: residentData.college || '',
      college_id: residentData.college_id || '',
      course: residentData.course || '',
      academic_year: residentData.academic_year || '1st Year',
      date_of_birth: residentData.date_of_birth || '2004-01-01',
      aadhaar_number: residentData.aadhaar_number || '',
      parent_name: residentData.parent_name || '',
      parent_phone: residentData.parent_phone || '',
      emergency_contact: residentData.emergency_contact || '',
      permanent_address: residentData.permanent_address || '',
      joining_date: residentData.joining_date || new Date().toISOString().split('T')[0],
      current_room_id: room ? room.id : null,
      current_room_number: room ? room.room_number : null,
      current_bed_id: bed ? bed.id : null,
      current_bed_number: bed ? bed.bed_number : null,
      floor_number: room ? room.floor_number : null,
      sharing_type: room ? room.sharing_type : '4-Sharing',
      monthly_fee: residentData.monthly_fee || (room ? room.monthly_fee : 6500),
      status: 'ACTIVE',
      vacated_date: null,
      vacated_reason: null,
      kyc_status: 'PENDING',
      kyc_completion: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (room && bed) {
      bed.status = 'OCCUPIED';
      bed.current_resident_id = newResident.id;
      bed.current_resident_name = newResident.name;

      const globalBed = this.data.beds.find(b => b.id === bed!.id);
      if (globalBed) {
        globalBed.status = 'OCCUPIED';
        globalBed.current_resident_id = newResident.id;
        globalBed.current_resident_name = newResident.name;
      }

      const occ = room.beds.filter(b => b.status === 'OCCUPIED').length;
      room.occupied_beds_count = occ;
      room.vacant_beds_count = Math.max(0, room.capacity - occ);
      room.status = occ === room.capacity ? 'FULL' : 'AVAILABLE';

      // Room assignment history
      this.data.room_assignments.push({
        id: generateUniqueId(`ASN-${newResident.id}`),
        resident_id: newResident.id,
        resident_name: newResident.name,
        room_id: room.id,
        room_number: room.room_number,
        bed_id: bed.id,
        bed_number: bed.bed_number,
        start_date: newResident.joining_date,
        end_date: null,
        status: 'ACTIVE'
      });

      // Recalculate floor stats
      this.recalculateFloorStats(room.floor_id);
    }

    this.data.residents.unshift(newResident);

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: this.data.settings?.admin_name || 'Administrator',
      action: 'ADD_RESIDENT',
      entity_type: 'RESIDENT',
      entity_id: newResident.id,
      details: `Created new resident ${newResident.name} assigned to Room ${newResident.current_room_number || 'Unassigned'}.`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    return newResident;
  }

  // EDIT RESIDENT
  public editResident(residentId: string, updates: Partial<Resident>): Resident {
    const resident = this.data.residents.find(r => r.id === residentId);
    if (!resident) throw new Error('Resident not found.');

    Object.assign(resident, updates);
    resident.updated_at = new Date().toISOString();

    // If name changed, update across references
    if (updates.name) {
      this.data.beds.forEach(b => {
        if (b.current_resident_id === resident.id) b.current_resident_name = updates.name!;
      });
      this.data.rooms.forEach(rm => {
        rm.beds.forEach(b => {
          if (b.current_resident_id === resident.id) b.current_resident_name = updates.name!;
        });
      });
    }

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: this.data.settings.admin_name,
      action: 'EDIT_RESIDENT',
      entity_type: 'RESIDENT',
      entity_id: resident.id,
      details: `Updated resident profile for ${resident.name}.`,
      timestamp: new Date().toISOString()
    });

    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    return resident;
  }

  // UPLOAD / VERIFY KYC (TEST 5 Workflow)
  public uploadKYCDocument(data: {
    resident_id: string;
    document_type: 'AADHAAR' | 'PAN' | 'COLLEGE_ID' | 'PASSPORT' | 'ADDRESS_PROOF' | 'PHOTO';
    document_name: string;
    document_url: string;
    file_size?: string;
  }): ResidentDocument {
    const resident = this.data.residents.find(r => r.id === data.resident_id);
    if (!resident) throw new Error('Resident not found.');

    const newDoc: ResidentDocument = {
      id: generateUniqueId('DOC'),
      resident_id: resident.id,
      document_type: data.document_type,
      document_name: data.document_name,
      document_url: data.document_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      file_size: data.file_size || '1.2 MB',
      uploaded_at: new Date().toISOString(),
      verified_by: null,
      verified_at: null,
      status: 'PENDING'
    };

    this.data.resident_documents.push(newDoc);
    this.recalculateResidentKYC(resident);

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: this.data.settings.admin_name,
      action: 'UPLOAD_KYC_DOC',
      entity_type: 'KYC_DOCUMENT',
      entity_id: newDoc.id,
      details: `Uploaded ${data.document_type} (${data.document_name}) for ${resident.name}.`,
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return newDoc;
  }

  public updateKYCStatus(data: {
    document_id: string;
    status: 'VERIFIED' | 'REJECTED';
    rejection_reason?: string;
    verified_by?: string;
  }): ResidentDocument {
    const doc = this.data.resident_documents.find(d => d.id === data.document_id);
    if (!doc) throw new Error('Document not found.');

    doc.status = data.status;
    doc.verified_by = data.verified_by || this.data.settings.admin_name;
    doc.verified_at = new Date().toISOString();
    if (data.status === 'REJECTED') {
      doc.rejection_reason = data.rejection_reason || 'Document unclear or invalid';
    } else {
      doc.rejection_reason = undefined;
    }

    const resident = this.data.residents.find(r => r.id === doc.resident_id);
    if (resident) {
      this.recalculateResidentKYC(resident);
    }

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: doc.verified_by,
      action: 'VERIFY_KYC_DOC',
      entity_type: 'KYC_DOCUMENT',
      entity_id: doc.id,
      details: `Marked ${doc.document_type} for ${resident?.name || 'Resident'} as ${data.status}.`,
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return doc;
  }

  private recalculateResidentKYC(resident: Resident) {
    const residentDocs = this.data.resident_documents.filter(d => d.resident_id === resident.id);
    const verifiedDocs = residentDocs.filter(d => d.status === 'VERIFIED');

    if (residentDocs.length === 0) {
      resident.kyc_status = 'NOT_STARTED';
      resident.kyc_completion = 0;
    } else if (verifiedDocs.length >= 2) {
      resident.kyc_status = 'VERIFIED';
      resident.kyc_completion = 100;
    } else if (verifiedDocs.length === 1) {
      resident.kyc_status = 'SUBMITTED';
      resident.kyc_completion = 60;
    } else if (residentDocs.some(d => d.status === 'REJECTED')) {
      resident.kyc_status = 'REJECTED';
      resident.kyc_completion = 30;
    } else {
      resident.kyc_status = 'PENDING';
      resident.kyc_completion = 40;
    }
  }

  // SEND WHATSAPP MESSAGE (TEST 6 Workflow)
  public sendWhatsAppMessage(data: {
    resident_ids: string[];
    message_type: 'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'OVERDUE_ALERT' | 'KYC_REQUEST' | 'CUSTOM';
    custom_text?: string;
    month?: string;
  }): { success_count: number; failed_count: number; messages: WhatsAppMessage[] } {
    const resultMessages: WhatsAppMessage[] = [];
    let success = 0;
    let failed = 0;

    const monthStr = data.month || 'August 2026';
    const monthKey = '2026-08';

    data.resident_ids.forEach(resId => {
      const resident = this.data.residents.find(r => r.id === resId);
      if (!resident) {
        failed++;
        return;
      }

      // Calculate actual payment details from database for this resident and month
      const payment = this.data.payments.find(p => p.resident_id === resId && p.month === monthKey);
      const paidAmount = payment ? payment.amount_paid : 0;
      const expectedAmount = resident.monthly_fee;
      const balance = Math.max(0, expectedAmount - paidAmount);

      let content = '';
      if (data.custom_text) {
        content = data.custom_text
          .replace(/{{name}}/g, resident.name)
          .replace(/{{month}}/g, monthStr)
          .replace(/{{expected}}/g, expectedAmount.toLocaleString('en-IN'))
          .replace(/{{paid}}/g, paidAmount.toLocaleString('en-IN'))
          .replace(/{{balance}}/g, balance.toLocaleString('en-IN'));
      } else if (data.message_type === 'PAYMENT_REMINDER') {
        content = `Hi ${resident.name},\n\nYour Hanura Casa fee for ${monthStr} is ₹${expectedAmount.toLocaleString('en-IN')}.\n\nPaid: ₹${paidAmount.toLocaleString('en-IN')}\nBalance: ₹${balance.toLocaleString('en-IN')}\n\nPlease clear the pending amount.\n\nThank you,\nHanura Casa`;
      } else if (data.message_type === 'OVERDUE_ALERT') {
        content = `Hi ${resident.name},\n\nYour Hanura Casa fee of ₹${balance.toLocaleString('en-IN')} for ${monthStr} is overdue.\n\nPlease clear the pending amount at the earliest.\n\nThank you,\nHanura Casa Management`;
      } else if (data.message_type === 'PAYMENT_CONFIRMATION') {
        content = `Hi ${resident.name},\n\nYour payment of ₹${paidAmount.toLocaleString('en-IN')} for ${monthStr} has been recorded successfully.\n\nThank you for choosing Hanura Casa.`;
      } else {
        content = `Hi ${resident.name},\n\nThis is an official communication from Hanura Casa regarding your stay.`;
      }

      const isConfigured = this.data.settings.whatsapp_api_configured !== false;
      const status: 'DELIVERED' | 'FAILED' = isConfigured ? 'DELIVERED' : 'FAILED';

      if (isConfigured) {
        success++;
      } else {
        failed++;
      }

      const msg: WhatsAppMessage = {
        id: generateUniqueId('WA'),
        resident_id: resident.id,
        resident_name: resident.name,
        phone: resident.whatsapp || resident.phone,
        message_type: data.message_type,
        template_name: `${data.message_type.toLowerCase()}_template`,
        message_content: content,
        sent_at: new Date().toISOString(),
        status: status,
        error_message: isConfigured ? undefined : 'WhatsApp Business API credentials not configured in settings.'
      };

      this.data.whatsapp_messages.unshift(msg);
      resultMessages.push(msg);
    });

    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: this.data.settings.admin_name,
      action: 'WHATSAPP_BROADCAST',
      entity_type: 'WHATSAPP',
      entity_id: generateUniqueId('BATCH'),
      details: `Sent ${data.message_type} to ${data.resident_ids.length} resident(s). (Delivered: ${success}, Failed: ${failed})`,
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return { success_count: success, failed_count: failed, messages: resultMessages };
  }

  // SIGNATURE FEATURE: ROOM PAYMENT MATRIX
  public getRoomPaymentMatrix(roomId: string) {
    const room = this.data.rooms.find(r => r.id === roomId || r.room_number === roomId);
    if (!room) throw new Error('Room not found');

    // Get all assignments for this room (current and historical) for known residents
    const roomAssignments = this.data.room_assignments.filter(
      a => (a.room_id === room.id || a.room_number === room.room_number) &&
           this.data.residents.some(r => r.id === a.resident_id)
    );
    const residentIds = Array.from(new Set(roomAssignments.map(a => a.resident_id)));

    // Also include current active occupants in this room by room id or room number
    const currentResidents = this.data.residents.filter(r => 
      r.status === 'ACTIVE' && (
        r.current_room_id === room.id || 
        (r.current_room_number && r.current_room_number.toString() === room.room_number.toString())
      )
    );
    currentResidents.forEach(r => {
      if (!residentIds.includes(r.id)) residentIds.push(r.id);
    });

    // Also check occupants assigned to beds in this room if they exist in residents
    if (room.beds) {
      room.beds.forEach(b => {
        if (b.current_resident_id && !residentIds.includes(b.current_resident_id)) {
          if (this.data.residents.some(r => r.id === b.current_resident_id)) {
            residentIds.push(b.current_resident_id);
          }
        }
      });
    }

    // Dynamic month range: ensure recent months + any month with payments
    const standardMonths = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const paymentMonths = Array.from(new Set(this.data.payments.map(p => p.month))).filter(Boolean);
    const allMonthsSet = new Set([...standardMonths, ...paymentMonths]);
    const months = Array.from(allMonthsSet).sort();

    // Default primary active month for fast ledger inspection (August 2026 or latest)
    const activeLedgerMonth = months.includes('2026-08') ? '2026-08' : months[months.length - 1];

    if (residentIds.length === 0) {
      const emptyMatrix = (room.beds || []).map(b => {
        const monthlyAmounts: Record<string, { paid: number; expected: number; balance: number; paymentId?: string }> = {};
        months.forEach(m => {
          monthlyAmounts[m] = { paid: 0, expected: room.monthly_fee || 0, balance: 0 };
        });
        return {
          bed_number: b.bed_number,
          resident_id: null,
          resident_name: 'Vacant Bed',
          status: 'VACANT',
          monthly_fee: room.monthly_fee || 0,
          months: monthlyAmounts,
          paid_amount: 0,
          due_balance: 0,
          total_paid: 0,
          total_balance: 0,
          active_month: activeLedgerMonth,
          current_advance: 0
        };
      });

      return {
        room,
        months,
        active_month: activeLedgerMonth,
        matrix: emptyMatrix
      };
    }

    const matrix = residentIds.map(resId => {
      const res = this.data.residents.find(r => r.id === resId);
      const adv = this.data.advances.find(a => a.resident_id === resId);
      const resPayments = this.data.payments.filter(p => p.resident_id === resId);

      const monthlyAmounts: Record<string, { paid: number; expected: number; balance: number; paymentId?: string }> = {};
      let totalPaid = 0;
      let totalBalance = 0;

      months.forEach(m => {
        const matchingPayments = resPayments.filter(pay => pay.month === m);
        const paid = matchingPayments.reduce((sum, pay) => sum + (Number(pay.amount_paid) || 0), 0);
        const expected = res ? res.monthly_fee : (room.monthly_fee || 6000);
        const bal = matchingPayments.length > 0
          ? Math.max(0, expected - paid)
          : (res && res.status === 'ACTIVE' ? expected : 0);

        monthlyAmounts[m] = {
          paid,
          expected,
          balance: bal,
          paymentId: matchingPayments[matchingPayments.length - 1]?.id
        };

        totalPaid += paid;
        totalBalance += bal;
      });

      const activeMonthData = monthlyAmounts[activeLedgerMonth] || { paid: 0, balance: 0 };

      return {
        resident_id: resId,
        resident_name: res ? res.name : 'Former Resident',
        photo_url: res?.photo_url,
        bed_number: res?.current_bed_number || 'N/A',
        status: res?.status || 'VACATED',
        current_advance: adv?.current_advance || 0,
        monthly_fee: res?.monthly_fee || room.monthly_fee || 6000,
        months: monthlyAmounts,
        paid_amount: activeMonthData.paid,
        due_balance: activeMonthData.balance,
        active_month: activeLedgerMonth,
        total_paid: totalPaid,
        total_balance: totalBalance
      };
    });

    // Sort matrix rows by bed number
    matrix.sort((a, b) => {
      const bedA = Number(a.bed_number) || 999;
      const bedB = Number(b.bed_number) || 999;
      return bedA - bedB;
    });

    return {
      room,
      months,
      active_month: activeLedgerMonth,
      matrix
    };
  }

  // UPDATE SETTINGS
  public updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    Object.assign(this.data.settings, settings);
    this.data.audit_logs.push({
      id: generateUniqueId('AUD'),
      admin_user: this.data.settings.admin_name,
      action: 'UPDATE_SETTINGS',
      entity_type: 'SETTINGS',
      entity_id: 'SYSTEM',
      details: 'System settings and property configuration updated.',
      timestamp: new Date().toISOString()
    });
    this.saveToDisk();
    return this.data.settings;
  }

  // COMPLAINT & MAINTENANCE CRUD
  public createComplaint(data: Partial<Complaint>): Complaint {
    const newComplaint: Complaint = {
      id: generateUniqueId('CMP'),
      resident_id: data.resident_id || 'RES-GUEST',
      resident_name: data.resident_name || 'Resident',
      room_number: data.room_number || '101',
      category: data.category || 'General',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      status: 'PENDING',
      assigned_person: data.assigned_person || 'Warden Lakshmi Prasad',
      created_at: new Date().toISOString(),
      resolved_at: null,
      resolution_notes: ''
    };
    this.data.complaints.unshift(newComplaint);
    this.saveToDisk();
    return newComplaint;
  }

  public updateComplaint(id: string, updates: Partial<Complaint>): Complaint {
    const comp = this.data.complaints.find(c => c.id === id);
    if (!comp) throw new Error('Complaint not found.');
    Object.assign(comp, updates);
    if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
      comp.resolved_at = new Date().toISOString();
    }
    this.saveToDisk();
    return comp;
  }

  public createMaintenance(data: Partial<MaintenanceRequest>): MaintenanceRequest {
    const newMnt: MaintenanceRequest = {
      id: generateUniqueId('MNT'),
      resident_id: data.resident_id,
      resident_name: data.resident_name,
      room_number: data.room_number || '101',
      bed_number: data.bed_number,
      category: data.category || 'General Repair',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      assigned_staff: data.assigned_staff || 'Naveen Chary',
      estimated_cost: data.estimated_cost || 0,
      actual_cost: data.actual_cost,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      completion_date: null,
      resolution: ''
    };
    this.data.maintenance_requests.unshift(newMnt);
    this.saveToDisk();
    return newMnt;
  }

  public updateMaintenance(id: string, updates: Partial<MaintenanceRequest>): MaintenanceRequest {
    const mnt = this.data.maintenance_requests.find(m => m.id === id);
    if (!mnt) throw new Error('Maintenance request not found.');
    Object.assign(mnt, updates);
    if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
      mnt.completion_date = new Date().toISOString();
    }
    this.saveToDisk();
    return mnt;
  }

  // STAFF & SALARY
  public addStaff(staffData: Partial<Staff>): Staff {
    const salary = Number(staffData.monthly_salary || (staffData as any).salary || 18000);
    const newStaff: any = {
      id: generateUniqueId('STF'),
      name: staffData.name || 'New Staff',
      phone: staffData.phone || '',
      role: staffData.role || 'Cleaning',
      joining_date: staffData.joining_date || new Date().toISOString().split('T')[0],
      monthly_salary: salary,
      salary: salary,
      salary_history: (staffData as any).salary_history || [],
      status: staffData.status || 'ACTIVE',
      photo_url: staffData.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      address: staffData.address || '',
      emergency_contact: staffData.emergency_contact || ''
    };
    this.data.staff.push(newStaff);
    this.saveToDisk();
    return newStaff;
  }

  public recordSalaryPayment(data: {
    staff_id: string;
    month: string;
    paid: number;
    payment_method: any;
    advance?: number;
    deduction?: number;
    transaction_ref?: string;
  }): SalaryPayment {
    const stf = this.data.staff.find(s => s.id === data.staff_id);
    if (!stf) throw new Error('Staff not found.');

    const salary = stf.monthly_salary;
    const paid = Number(data.paid || salary);
    const balance = Math.max(0, salary - paid - Number(data.deduction || 0));

    const newSal: SalaryPayment = {
      id: generateUniqueId('SAL'),
      staff_id: stf.id,
      staff_name: stf.name,
      staff_role: stf.role,
      month: data.month,
      salary: salary,
      advance: Number(data.advance || 0),
      deduction: Number(data.deduction || 0),
      paid: paid,
      balance: balance,
      payment_date: new Date().toISOString(),
      payment_method: data.payment_method || 'Bank Transfer',
      transaction_ref: data.transaction_ref || generateUniqueId('SAL-TXN'),
      status: balance === 0 ? 'PAID' : 'PARTIAL'
    };

    this.data.salary_payments.unshift(newSal);

    // Auto-record in expenses
    this.data.expenses.unshift({
      id: generateUniqueId('EXP-SAL'),
      category: 'SALARIES',
      subcategory: `Salary - ${stf.role}`,
      amount: paid,
      date: new Date().toISOString(),
      vendor: stf.name,
      payment_method: data.payment_method || 'Bank Transfer',
      description: `Disbursed ${data.month} salary to ${stf.name} (${stf.role})`,
      created_by: this.data.settings.admin_name,
      created_at: new Date().toISOString()
    });

    this.saveToDisk();
    return newSal;
  }

  // ==========================================
  // FLOORS, ROOMS & BEDS MANAGEMENT
  // ==========================================

  public createFloor(data: { floor_number: number; name?: string; description?: string }): Floor {
    const existing = this.data.floors.find(f => f.floor_number === Number(data.floor_number));
    if (existing) {
      throw new Error(`Floor ${data.floor_number} already exists.`);
    }

    const floorId = `floor_${data.floor_number}`;
    const newFloor: Floor = {
      id: floorId,
      floor_number: Number(data.floor_number),
      name: data.name || (data.floor_number === 0 ? 'Ground Floor' : `Floor ${data.floor_number}`),
      description: data.description || '',
      total_rooms: 0,
      total_beds: 0,
      occupied_beds: 0,
      vacant_beds: 0,
      rooms: []
    };

    this.data.floors.push(newFloor);
    this.data.floors.sort((a, b) => a.floor_number - b.floor_number);

    this.data.audit_logs.unshift({
      id: generateUniqueId('LOG'),
      action: 'FLOOR_CREATED',
      entity_type: 'FLOOR',
      entity_id: floorId,
      details: `Created Floor ${newFloor.floor_number} (${newFloor.name})`,
      admin_user: this.data.settings?.admin_name || 'Administrator',
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return newFloor;
  }

  public deleteFloor(floorId: string): void {
    const floorIndex = this.data.floors.findIndex(f => f.id === floorId);
    if (floorIndex === -1) throw new Error('Floor not found.');
    const floor = this.data.floors[floorIndex];

    // Check if any occupied rooms
    const occupiedRoom = this.data.rooms.find(r => r.floor_id === floorId && r.occupied_beds_count > 0);
    if (occupiedRoom) {
      throw new Error(`Cannot delete floor ${floor.floor_number} because Room ${occupiedRoom.room_number} has active residents.`);
    }

    // Remove associated rooms and beds
    const floorRoomIds = this.data.rooms.filter(r => r.floor_id === floorId).map(r => r.id);
    this.data.rooms = this.data.rooms.filter(r => r.floor_id !== floorId);
    this.data.beds = this.data.beds.filter(b => !floorRoomIds.includes(b.room_id));
    this.data.floors.splice(floorIndex, 1);

    this.data.audit_logs.unshift({
      id: generateUniqueId('LOG'),
      action: 'FLOOR_DELETED',
      entity_type: 'FLOOR',
      entity_id: floorId,
      details: `Deleted Floor ${floor.floor_number} and all vacant suites`,
      admin_user: this.data.settings?.admin_name || 'Administrator',
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
  }

  public createRoom(data: {
    floor_number: number;
    room_number: string;
    sharing_type?: string;
    capacity: number;
    monthly_fee: number;
    amenities?: string[];
  }): Room {
    const cleanRoomNo = data.room_number.trim().toUpperCase();
    const existing = this.data.rooms.find(r => r.room_number.toLowerCase() === cleanRoomNo.toLowerCase());
    if (existing) {
      throw new Error(`Room ${cleanRoomNo} already exists.`);
    }

    const floorNum = Number(data.floor_number);
    let floor = this.data.floors.find(f => f.floor_number === floorNum);
    if (!floor) {
      floor = this.createFloor({
        floor_number: floorNum,
        name: floorNum === 0 ? 'Ground Floor' : `Floor ${floorNum}`
      });
    }

    const cap = Math.max(1, Number(data.capacity) || 1);
    const fee = Number(data.monthly_fee) || 8000;
    const sharingType = data.sharing_type || (cap === 1 ? 'Single Private' : `${cap}-Sharing`);
    const roomId = `room_${cleanRoomNo}`;

    // Create Beds
    const createdBeds: Bed[] = [];
    for (let b = 1; b <= cap; b++) {
      const bedId = `bed_${cleanRoomNo}_${b}`;
      const bed: Bed = {
        id: bedId,
        bed_number: b,
        room_id: roomId,
        room_number: cleanRoomNo,
        floor_number: floorNum,
        status: 'VACANT',
        price: fee,
        current_resident_id: null,
        current_resident_name: null
      };
      createdBeds.push(bed);
      this.data.beds.push(bed);
    }

    const defaultAmenities = ['Attached Washroom', 'Wi-Fi', 'Wardrobe', 'Study Desk'];
    const newRoom: Room = {
      id: roomId,
      floor_id: floor.id,
      room_number: cleanRoomNo,
      floor_number: floorNum,
      capacity: cap,
      occupied_beds_count: 0,
      vacant_beds_count: cap,
      sharing_type: sharingType,
      monthly_fee: fee,
      status: 'AVAILABLE',
      amenities: data.amenities && data.amenities.length > 0 ? data.amenities : defaultAmenities,
      beds: createdBeds
    };

    this.data.rooms.push(newRoom);
    this.data.rooms.sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }));

    // Update floor statistics
    this.recalculateFloorStats(floor.id);

    this.data.audit_logs.unshift({
      id: generateUniqueId('LOG'),
      action: 'ROOM_CREATED',
      entity_type: 'ROOM',
      entity_id: roomId,
      details: `Created Suite ${cleanRoomNo} on Floor ${floorNum} with ${cap} beds at ₹${fee}/mo`,
      admin_user: this.data.settings?.admin_name || 'Administrator',
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
    return newRoom;
  }

  public bulkCreateRooms(data: {
    floor_number: number;
    room_numbers?: string[];
    prefix?: string;
    start_number?: number;
    end_number?: number;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }): Room[] {
    const floorNum = Number(data.floor_number);
    let floor = this.data.floors.find(f => f.floor_number === floorNum);
    if (!floor) {
      floor = this.createFloor({
        floor_number: floorNum,
        name: floorNum === 0 ? 'Ground Floor' : `Floor ${floorNum}`
      });
    }

    let targetRoomNumbers: string[] = [];
    if (data.room_numbers && data.room_numbers.length > 0) {
      targetRoomNumbers = data.room_numbers;
    } else if (data.start_number !== undefined && data.end_number !== undefined) {
      const prefix = data.prefix !== undefined ? data.prefix.trim() : `${floorNum}`;
      const start = Number(data.start_number);
      const end = Number(data.end_number);
      for (let i = start; i <= end; i++) {
        // If start/end are 1 to 9 and prefix is floor number (e.g. 1), pad to 2 digits -> 101, 102
        let numStr = String(i);
        if (prefix && /^\d+$/.test(prefix) && prefix.length === 1 && i < 10) {
          numStr = String(i).padStart(2, '0');
        }
        targetRoomNumbers.push(`${prefix}${numStr}`);
      }
    }

    if (targetRoomNumbers.length === 0) {
      throw new Error('No room numbers specified for bulk creation.');
    }

    const createdRooms: Room[] = [];
    for (const rNo of targetRoomNumbers) {
      const clean = rNo.trim().toUpperCase();
      if (!clean) continue;
      if (this.data.rooms.some(r => r.room_number.toLowerCase() === clean.toLowerCase())) {
        continue; // skip duplicate
      }

      const room = this.createRoom({
        floor_number: floorNum,
        room_number: clean,
        capacity: data.capacity,
        monthly_fee: data.monthly_fee,
        sharing_type: data.sharing_type,
        amenities: data.amenities
      });
      createdRooms.push(room);
    }

    return createdRooms;
  }

  public updateRoom(id: string, updates: Partial<Room>): Room {
    const room = this.data.rooms.find(r => r.id === id);
    if (!room) throw new Error('Room not found.');

    if (updates.monthly_fee !== undefined) {
      room.monthly_fee = Number(updates.monthly_fee);
      // Update vacant beds price
      room.beds.forEach(b => {
        if (b.status === 'VACANT') {
          b.price = room.monthly_fee;
        }
      });
      this.data.beds.forEach(b => {
        if (b.room_id === id && b.status === 'VACANT') {
          b.price = room.monthly_fee;
        }
      });
    }

    if (updates.sharing_type) room.sharing_type = updates.sharing_type;
    if (updates.status) room.status = updates.status;
    if (updates.amenities) room.amenities = updates.amenities;

    this.saveToDisk();
    return room;
  }

  public deleteRoom(id: string): void {
    const roomIndex = this.data.rooms.findIndex(r => r.id === id);
    if (roomIndex === -1) throw new Error('Room not found.');
    const room = this.data.rooms[roomIndex];

    if (room.occupied_beds_count > 0) {
      throw new Error(`Cannot delete Room ${room.room_number} because it has ${room.occupied_beds_count} active resident(s).`);
    }

    // Remove beds
    this.data.beds = this.data.beds.filter(b => b.room_id !== id);
    this.data.rooms.splice(roomIndex, 1);

    // Update floor stats
    this.recalculateFloorStats(room.floor_id);

    this.data.audit_logs.unshift({
      id: generateUniqueId('LOG'),
      action: 'ROOM_DELETED',
      entity_type: 'ROOM',
      entity_id: id,
      details: `Deleted Room ${room.room_number} from Floor ${room.floor_number}`,
      admin_user: this.data.settings?.admin_name || 'Administrator',
      timestamp: new Date().toISOString()
    });

    this.saveToDisk();
  }

  public addBedToRoom(roomId: string, price?: number): Bed {
    const room = this.data.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found.');

    const nextBedNum = (room.beds.length > 0 ? Math.max(...room.beds.map(b => b.bed_number)) : 0) + 1;
    const bedId = `bed_${room.room_number}_${nextBedNum}`;
    const bedFee = price !== undefined ? Number(price) : room.monthly_fee;

    const newBed: Bed = {
      id: bedId,
      bed_number: nextBedNum,
      room_id: room.id,
      room_number: room.room_number,
      floor_number: room.floor_number,
      status: 'VACANT',
      price: bedFee,
      current_resident_id: null,
      current_resident_name: null
    };

    room.beds.push(newBed);
    this.data.beds.push(newBed);
    room.capacity = room.beds.length;
    room.vacant_beds_count += 1;
    room.sharing_type = `${room.capacity}-Sharing`;

    this.recalculateFloorStats(room.floor_id);
    this.saveToDisk();
    return newBed;
  }

  public deleteBed(bedId: string): void {
    const bedIndex = this.data.beds.findIndex(b => b.id === bedId);
    if (bedIndex === -1) throw new Error('Bed not found.');
    const bed = this.data.beds[bedIndex];

    if (bed.status === 'OCCUPIED') {
      throw new Error(`Cannot delete Bed ${bed.bed_number} because it is occupied by ${bed.current_resident_name || 'a resident'}.`);
    }

    const room = this.data.rooms.find(r => r.id === bed.room_id);
    if (room) {
      room.beds = room.beds.filter(b => b.id !== bedId);
      room.capacity = Math.max(0, room.beds.length);
      room.vacant_beds_count = room.beds.filter(b => b.status === 'VACANT').length;
      room.occupied_beds_count = room.beds.filter(b => b.status === 'OCCUPIED').length;
      room.sharing_type = room.capacity === 1 ? 'Single Private' : `${room.capacity}-Sharing`;
      this.recalculateFloorStats(room.floor_id);
    }

    this.data.beds.splice(bedIndex, 1);
    this.saveToDisk();
  }

  public decreaseBedInRoom(roomId: string): Bed {
    const room = this.data.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found.');

    const vacantBeds = room.beds.filter(b => b.status === 'VACANT');
    if (vacantBeds.length === 0) {
      throw new Error(`Cannot decrease beds in Room ${room.room_number}: all ${room.capacity} beds are currently occupied by active residents.`);
    }

    const bedToRemove = vacantBeds[vacantBeds.length - 1];
    this.deleteBed(bedToRemove.id);
    return bedToRemove;
  }

  private recalculateFloorStats(floorId: string) {
    const floor = this.data.floors.find(f => f.id === floorId);
    if (!floor) return;

    const floorRooms = this.data.rooms.filter(r => r.floor_id === floorId);
    floor.total_rooms = floorRooms.length;
    floor.total_beds = floorRooms.reduce((sum, r) => sum + r.capacity, 0);
    floor.occupied_beds = floorRooms.reduce((sum, r) => sum + r.occupied_beds_count, 0);
    floor.vacant_beds = floor.total_beds - floor.occupied_beds;
    floor.rooms = floorRooms;
  }

  public sanitizeAndSyncOccupancy(): void {
    // 0. Auto-heal active residents with their rooms and beds
    if (Array.isArray(this.data.residents)) {
      this.data.residents.forEach(res => {
        if (res.status === 'ACTIVE') {
          const room = (this.data.rooms || []).find(r =>
            (res.current_room_id && r.id === res.current_room_id) ||
            (res.current_room_number && r.room_number === res.current_room_number)
          );
          if (room) {
            res.current_room_id = room.id;
            res.current_room_number = room.room_number;
            if (res.floor_number === null || res.floor_number === undefined) {
              res.floor_number = room.floor_number;
            }
            if (!res.sharing_type) {
              res.sharing_type = room.sharing_type;
            }
            if (res.current_bed_id || res.current_bed_number !== undefined) {
              const bNum = Number(res.current_bed_number);
              const bed = (room.beds || []).find(b =>
                (res.current_bed_id && b.id === res.current_bed_id) ||
                (!isNaN(bNum) && b.bed_number === bNum)
              );
              if (bed) {
                res.current_bed_id = bed.id;
                res.current_bed_number = bed.bed_number;
              }
            }
          }
        }
      });
    }

    const activeResidents = Array.isArray(this.data.residents)
      ? this.data.residents.filter(r => r.status === 'ACTIVE')
      : [];

    // 1. Sync global beds array
    if (Array.isArray(this.data.beds)) {
      this.data.beds.forEach(b => {
        const assigned = activeResidents.find(r => 
          (r.current_bed_id && r.current_bed_id === b.id) ||
          (r.current_room_id === b.room_id && (r.current_bed_number === b.bed_number || r.current_bed_id === b.id)) ||
          (r.current_room_number === b.room_number && (r.current_bed_number === b.bed_number || r.current_bed_id === b.id))
        );
        if (assigned) {
          b.status = 'OCCUPIED';
          b.current_resident_id = assigned.id;
          b.current_resident_name = assigned.name;
        } else {
          b.status = 'VACANT';
          b.current_resident_id = null;
          b.current_resident_name = null;
        }
      });
    }

    // 2. Sync rooms and embedded room.beds
    if (Array.isArray(this.data.rooms)) {
      this.data.rooms.forEach(r => {
        if (Array.isArray(r.beds)) {
          r.beds.forEach(b => {
            const assigned = activeResidents.find(res => 
              res.current_bed_id === b.id ||
              (res.current_room_id === r.id && (res.current_bed_number === b.bed_number || res.current_bed_id === b.id)) ||
              (res.current_room_number === r.room_number && (res.current_bed_number === b.bed_number || res.current_bed_id === b.id))
            );
            if (assigned) {
              b.status = 'OCCUPIED';
              b.current_resident_id = assigned.id;
              b.current_resident_name = assigned.name;
            } else {
              b.status = 'VACANT';
              b.current_resident_id = null;
              b.current_resident_name = null;
            }
          });
        } else {
          r.beds = [];
        }
        r.occupied_beds_count = r.beds.filter(b => b.status === 'OCCUPIED').length;
        r.vacant_beds_count = Math.max(0, (r.capacity || 0) - r.occupied_beds_count);
        r.status = r.occupied_beds_count === r.capacity && r.capacity > 0 ? 'FULL' : 'AVAILABLE';
      });
    }

    // 3. Sync floors and floor.rooms
    if (Array.isArray(this.data.floors)) {
      this.data.floors.forEach(f => {
        const floorRooms = (this.data.rooms || []).filter(
          r => r.floor_id === f.id || r.floor_number === f.floor_number
        );
        f.total_rooms = floorRooms.length;
        f.total_beds = floorRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
        f.occupied_beds = floorRooms.reduce((sum, r) => sum + (r.occupied_beds_count || 0), 0);
        f.vacant_beds = Math.max(0, f.total_beds - f.occupied_beds);
        f.rooms = floorRooms;
      });
    }
  }

  public removeSampleData(): void {
    this.data.residents = [];
    this.data.payments = [];
    this.data.advances = [];
    this.data.expenses = [];
    this.data.staff = [];
    this.data.salary_payments = [];
    this.data.maintenance_requests = [];
    this.data.complaints = [];
    this.data.resident_documents = [];
    this.data.room_assignments = [];
    this.data.whatsapp_messages = [];

    // Reset all beds in all rooms to VACANT
    this.data.beds.forEach(b => {
      b.status = 'VACANT';
      b.current_resident_id = null;
      b.current_resident_name = null;
    });

    this.data.rooms.forEach(r => {
      r.occupied_beds_count = 0;
      r.vacant_beds_count = r.capacity;
      r.status = 'AVAILABLE';
      r.beds.forEach(b => {
        b.status = 'VACANT';
        b.current_resident_id = null;
        b.current_resident_name = null;
      });
    });

    this.data.floors.forEach(f => {
      f.occupied_beds = 0;
      f.vacant_beds = f.total_beds;
      if (Array.isArray(f.rooms)) {
        f.rooms.forEach(r => {
          r.occupied_beds_count = 0;
          r.vacant_beds_count = r.capacity;
          r.status = 'AVAILABLE';
          r.beds.forEach(b => {
            b.status = 'VACANT';
            b.current_resident_id = null;
            b.current_resident_name = null;
          });
        });
      }
    });

    this.data.notifications = [
      {
        id: generateUniqueId('NOTIF'),
        title: 'Sample Data Removed',
        message: 'All test residents, payments, and sample records have been cleared. All rooms and beds are now vacant and ready for real residents.',
        type: 'SYSTEM',
        timestamp: new Date().toISOString(),
        is_read: false
      }
    ];

    this.data.audit_logs = [
      {
        id: generateUniqueId('LOG'),
        action: 'SAMPLE_DATA_REMOVED',
        entity_type: 'SYSTEM',
        entity_id: 'ALL',
        details: 'All sample residents and payments cleared. All beds reset to vacant.',
        admin_user: this.data.settings?.admin_name || 'Administrator',
        timestamp: new Date().toISOString()
      }
    ];

    this.sanitizeAndSyncOccupancy();
    this.saveToDisk();
    console.log('🧹 Sample data removed. All rooms & beds are vacant and ready.');
  }

  public clearAllData(): void {
    this.data = {
      settings: this.data.settings || initialSettings,
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
      notifications: [
        {
          id: generateUniqueId('NOTIF'),
          title: 'System Initialized',
          message: 'All dummy records removed. Add your floors, rooms and beds in Settings.',
          type: 'SYSTEM',
          timestamp: new Date().toISOString(),
          is_read: false
        }
      ],
      audit_logs: [
        {
          id: generateUniqueId('LOG'),
          action: 'DATABASE_CLEARED',
          entity_type: 'SYSTEM',
          entity_id: 'ALL',
          details: 'All data cleared. System ready for manual entry.',
          admin_user: this.data.settings?.admin_name || 'Administrator',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.saveToDisk();
    console.log('🧹 Cleaned all records. System is now 100% fresh with 0 dummy records.');
  }
}

export const db = new DatabaseService();
