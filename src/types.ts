export type SharingType = 
  | 'Single Private' 
  | '1-Sharing' 
  | '2-Sharing' 
  | '3-Sharing' 
  | '4-Sharing' 
  | '5-Sharing' 
  | '6-Sharing' 
  | string;

export type RoomStatus = 'AVAILABLE' | 'FULL' | 'MAINTENANCE';

export type BedStatus = 'OCCUPIED' | 'VACANT' | 'MAINTENANCE';

export type ResidentStatus = 'ACTIVE' | 'VACATED' | 'INACTIVE';

export type KYCStatus = 'NOT_STARTED' | 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Credit/Debit Card' | 'Other';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';

export type ExpenseCategory = 
  | 'GROCERY' 
  | 'ELECTRICITY' 
  | 'WATER' 
  | 'INTERNET' 
  | 'GAS' 
  | 'SALARIES' 
  | 'STAFF_SALARY'
  | 'MAINTENANCE' 
  | 'CLEANING' 
  | 'OFFICE' 
  | 'REPAIRS' 
  | 'MESS_FOOD'
  | 'OTHER'
  | 'MISCELLANEOUS';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'EMERGENCY';

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'COMPLETED';

export type StaffRole = 'Cook' | 'Warden' | 'Security' | 'Cleaning' | 'Maintenance Tech' | 'Manager';

export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING';

export type NotificationType = 
  | 'OVERDUE' 
  | 'PENDING_PAYMENT' 
  | 'KYC_INCOMPLETE' 
  | 'COMPLAINT' 
  | 'MAINTENANCE' 
  | 'NEW_RESIDENT' 
  | 'ROOM_VACANT' 
  | 'SALARY_DUE' 
  | 'SYSTEM';

export interface Bed {
  id: string;
  room_id: string;
  bed_number: number;
  status: BedStatus;
  price?: number;
  room_number?: string;
  floor_number?: number;
  current_resident_id: string | null;
  current_resident_name?: string | null;
}

export interface Room {
  id: string;
  room_number: string;
  floor_id: string;
  floor_number: number;
  sharing_type: SharingType;
  capacity: number;
  monthly_fee: number;
  status: RoomStatus;
  amenities: string[];
  beds: Bed[];
  occupied_beds_count: number;
  vacant_beds_count: number;
}

export interface Floor {
  id: string;
  floor_number: number;
  name: string;
  description?: string;
  total_rooms?: number;
  total_beds?: number;
  occupied_beds?: number;
  vacant_beds?: number;
  rooms: Room[];
}

export interface ResidentDocument {
  id: string;
  resident_id: string;
  document_type: 'AADHAAR' | 'PAN' | 'COLLEGE_ID' | 'PASSPORT' | 'ADDRESS_PROOF' | 'PHOTO';
  document_name: string;
  document_url: string;
  file_size: string;
  uploaded_at: string;
  verified_by: string | null;
  verified_at: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejection_reason?: string;
}

export interface RoomAssignment {
  id: string;
  resident_id: string;
  resident_name: string;
  room_id: string;
  room_number: string;
  bed_id: string;
  bed_number: number;
  start_date: string;
  end_date: string | null;
  status: 'ACTIVE' | 'TRANSFERRED' | 'VACATED';
  transfer_reason?: string;
}

export interface Resident {
  id: string;
  name: string;
  photo_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  college: string;
  college_id?: string;
  course: string;
  academic_year: string;
  date_of_birth: string;
  aadhaar_number?: string;
  parent_name: string;
  parent_phone: string;
  emergency_contact: string;
  permanent_address: string;
  joining_date: string;
  current_room_id: string | null;
  current_room_number: string | null;
  current_bed_id: string | null;
  current_bed_number: number | null;
  floor_number: number | null;
  sharing_type: SharingType;
  monthly_fee: number;
  status: ResidentStatus;
  vacated_date: string | null;
  vacated_reason: string | null;
  kyc_status: KYCStatus;
  kyc_completion: number; // 0-100%
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  resident_id: string;
  resident_name: string;
  room_id: string;
  room_number: string;
  month: string; // "YYYY-MM"
  expected_amount: number;
  amount_paid: number;
  advance_used: number;
  balance: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_reference: string;
  notes: string;
  recorded_by: string;
  created_at: string;
}

export interface AdvanceTransaction {
  id: string;
  type: 'DEPOSIT' | 'DEDUCTION' | 'REFUND' | 'MONTHLY_ADJUSTMENT';
  amount: number;
  date: string;
  reference: string;
  notes: string;
  balance_after: number;
}

export interface AdvanceAccount {
  id: string;
  resident_id: string;
  resident_name: string;
  opening_advance: number;
  current_advance: number;
  transactions: AdvanceTransaction[];
}

export interface GroceryItem {
  id: string;
  name: string;
  item_name?: string;
  quantity: number;
  unit: string; // "kg", "liters", "units", "packets", "bags"
  unit_price: number;
  total: number;
  total_price?: number;
}

export interface Expense {
  id: string;
  title?: string;
  category: ExpenseCategory;
  subcategory: string;
  amount: number;
  date: string;
  vendor: string;
  paid_to?: string;
  payment_method: PaymentMethod;
  payment_mode?: string;
  expense_date?: string;
  description: string;
  receipt_url?: string;
  items?: GroceryItem[];
  created_by: string;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  joining_date: string;
  monthly_salary: number;
  salary?: number;
  status: StaffStatus;
  photo_url?: string;
  address?: string;
  emergency_contact?: string;
}

export interface SalaryPayment {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  month: string; // "YYYY-MM"
  salary: number;
  advance: number;
  deduction: number;
  paid: number;
  balance: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_ref: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
}

export interface MaintenanceRequest {
  id: string;
  title?: string;
  resident_id?: string;
  resident_name?: string;
  room_id?: string;
  room_number: string;
  floor_number?: number;
  bed_number?: number;
  category: string;
  description: string;
  priority: PriorityLevel;
  assigned_staff: string;
  estimated_cost?: number;
  actual_cost?: number;
  status: TicketStatus;
  created_at: string;
  completion_date: string | null;
  resolution: string;
}

export interface Complaint {
  id: string;
  resident_id: string;
  resident_name: string;
  room_number: string;
  category: string;
  description: string;
  priority: PriorityLevel;
  status: TicketStatus;
  assigned_person: string;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string;
}

export interface WhatsAppMessage {
  id: string;
  resident_id: string;
  resident_name: string;
  phone: string;
  message_type: 'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'OVERDUE_ALERT' | 'KYC_REQUEST' | 'CUSTOM';
  template_name: string;
  message_content: string;
  sent_at: string;
  status: MessageStatus;
  error_message?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  read?: boolean;
  created_at?: string;
  link_tab?: string;
  related_id?: string;
}

export interface AuditLog {
  id: string;
  admin_user: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface SystemSettings {
  property_name: string;
  hostel_name?: string;
  hostel_code: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  upi_id: string;
  currency: string;
  default_due_day: number;
  late_fee_grace_days: number;
  late_fee_amount: number;
  whatsapp_api_configured: boolean;
  whatsapp_phone_number_id: string;
  whatsapp_business_account_id: string;
  whatsapp_access_token: string;
  whatsapp_webhook_secret: string;
  admin_name: string;
  admin_email: string;
  admin_role: string;
}

export interface DashboardMetrics {
  total_beds: number;
  occupied_beds: number;
  vacant_beds: number;
  occupancy_rate: number;
  active_residents: number;
  former_residents: number;
  expected_monthly_collection: number;
  collected_this_month: number;
  pending_amount: number;
  total_expenses: number;
  net_operating_amount: number;
  collection_rate: number;
  grocery_expenses_month: number;
  salaries_paid_month: number;
  unresolved_complaints: number;
  pending_maintenance: number;
  pending_kyc_count: number;
}

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

export interface BootstrapResponse extends DatabaseSchema {
  metrics: DashboardMetrics;
}
