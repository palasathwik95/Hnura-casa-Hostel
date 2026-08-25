import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
} from '../types';
import { api, BootstrapResponse } from '../services/api';
import {
  buildWhatsAppMessage,
  launchDirectWhatsApp,
  getDirectWhatsAppUrl,
  cleanWhatsAppPhone
} from '../utils/whatsapp';

export type ActiveNavTab = 
  | 'dashboard'
  | 'residents'
  | 'rooms'
  | 'payments'
  | 'advances'
  | 'expenses'
  | 'maintenance'
  | 'complaints'
  | 'staff'
  | 'whatsapp'
  | 'reports'
  | 'kyc'
  | 'notifications'
  | 'audit_logs'
  | 'settings';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  loading: boolean;
  error: string | null;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  
  // Entities
  settings: SystemSettings | null;
  floors: Floor[];
  rooms: Room[];
  beds: Bed[];
  residents: Resident[];
  payments: Payment[];
  advances: AdvanceAccount[];
  expenses: Expense[];
  staff: Staff[];
  salaryPayments: SalaryPayment[];
  maintenanceRequests: MaintenanceRequest[];
  complaints: Complaint[];
  residentDocuments: ResidentDocument[];
  roomAssignments: RoomAssignment[];
  whatsappMessages: WhatsAppMessage[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  metrics: DashboardMetrics | null;

  // Selected for modals / deep views
  selectedResidentId: string | null;
  setSelectedResidentId: (id: string | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  printReceiptPayment: Payment | null;
  setPrintReceiptPayment: (payment: Payment | null) => void;

  // Global Search Modal
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Quick Action Modals
  addRoomModalOpen: boolean;
  setAddRoomModalOpen: (open: boolean) => void;
  addResidentModalOpen: boolean;
  setAddResidentModalOpen: (open: boolean) => void;
  editResidentModalOpen: boolean;
  setEditResidentModalOpen: (open: boolean) => void;
  editingResident: Resident | null;
  setEditingResident: (r: Resident | null) => void;
  transferModalOpen: boolean;
  setTransferModalOpen: (open: boolean) => void;
  transferringResident: Resident | null;
  setTransferringResident: (r: Resident | null) => void;
  vacateModalOpen: boolean;
  setVacateModalOpen: (open: boolean) => void;
  vacatingResident: Resident | null;
  setVacatingResident: (r: Resident | null) => void;
  uploadKYCModalOpen: boolean;
  setUploadKYCModalOpen: (open: boolean) => void;
  uploadKYCResident: Resident | null;
  setUploadKYCResident: (r: Resident | null) => void;

  openEditResidentModal: (r: Resident) => void;
  openTransferResidentModal: (r: Resident) => void;
  openVacateResidentModal: (r: Resident) => void;
  openUploadKYCModal: (r?: Resident) => void;

  recordPaymentModalOpen: boolean;
  setRecordPaymentModalOpen: (open: boolean) => void;
  preselectedResidentForPayment: Resident | null;
  setPreselectedResidentForPayment: (r: Resident | null) => void;
  addExpenseModalOpen: boolean;
  setAddExpenseModalOpen: (open: boolean) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Actions
  refreshData: () => Promise<void>;
  recordPayment: (payload: any) => Promise<Payment>;
  transferRoom: (residentId: string, payload: { new_room_id: string; new_bed_id: string; transfer_reason?: string }) => Promise<any>;
  markResidentVacated: (residentId: string, payload: { vacated_reason?: string }) => Promise<Resident>;
  createResident: (payload: any) => Promise<Resident>;
  editResident: (id: string, payload: Partial<Resident>) => Promise<Resident>;
  addExpense: (payload: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  uploadKYC: (payload: any) => Promise<ResidentDocument>;
  verifyKYC: (payload: { document_id: string; status: 'VERIFIED' | 'REJECTED'; rejection_reason?: string }) => Promise<ResidentDocument>;
  sendWhatsApp: (payload: { resident_ids: string[]; message_type: any; custom_text?: string; month?: string; autoOpenDirect?: boolean }) => Promise<any>;
  sendDirectWhatsApp: (payload: {
    resident: Resident;
    type?: 'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'KYC_REQUEST' | 'COMPLAINT_UPDATE' | 'GENERAL_ANNOUNCEMENT' | 'CUSTOM';
    payment?: Payment | null;
    customText?: string;
    month?: string;
    balance?: number;
    complaintTitle?: string;
    complaintStatus?: string;
    complaintResolution?: string;
    openDirect?: boolean;
  }) => Promise<{ message: string; url: string; success: boolean }>;
  createComplaint: (payload: Partial<Complaint>) => Promise<Complaint>;
  updateComplaint: (id: string, payload: Partial<Complaint>) => Promise<Complaint>;
  createMaintenance: (payload: Partial<MaintenanceRequest>) => Promise<MaintenanceRequest>;
  updateMaintenance: (id: string, payload: Partial<MaintenanceRequest>) => Promise<MaintenanceRequest>;
  createFloor: (payload: { floor_number: number; name?: string; description?: string }) => Promise<Floor>;
  deleteFloor: (floorId: string) => Promise<void>;
  createRoom: (payload: {
    floor_number: number;
    room_number: string;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }) => Promise<Room>;
  bulkCreateRooms: (payload: {
    floor_number: number;
    room_numbers?: string[];
    prefix?: string;
    start_number?: number;
    end_number?: number;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }) => Promise<Room[]>;
  updateRoom: (id: string, payload: Partial<Room>) => Promise<Room>;
  deleteRoom: (id: string) => Promise<void>;
  addBedToRoom: (roomId: string, price?: number) => Promise<Bed>;
  decreaseBedInRoom: (roomId: string) => Promise<Bed>;
  deleteBed: (bedId: string) => Promise<void>;

  addStaff: (payload: Partial<Staff>) => Promise<Staff>;
  recordSalary: (payload: any) => Promise<SalaryPayment>;
  updateSettings: (payload: Partial<SystemSettings>) => Promise<SystemSettings>;
  resetDemoDatabase: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // State entities
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [advances, setAdvances] = useState<AdvanceAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [residentDocuments, setResidentDocuments] = useState<ResidentDocument[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Selection states
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [printReceiptPayment, setPrintReceiptPayment] = useState<Payment | null>(null);

  // Modal states
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [addResidentModalOpen, setAddResidentModalOpen] = useState(false);
  const [editResidentModalOpen, setEditResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferringResident, setTransferringResident] = useState<Resident | null>(null);
  const [vacateModalOpen, setVacateModalOpen] = useState(false);
  const [vacatingResident, setVacatingResident] = useState<Resident | null>(null);
  const [uploadKYCModalOpen, setUploadKYCModalOpen] = useState(false);
  const [uploadKYCResident, setUploadKYCResident] = useState<Resident | null>(null);

  const openEditResidentModal = useCallback((r: Resident) => {
    setEditingResident(r);
    setEditResidentModalOpen(true);
  }, []);

  const openTransferResidentModal = useCallback((r: Resident) => {
    setTransferringResident(r);
    setTransferModalOpen(true);
  }, []);

  const openVacateResidentModal = useCallback((r: Resident) => {
    setVacatingResident(r);
    setVacateModalOpen(true);
  }, []);

  const openUploadKYCModal = useCallback((r?: Resident) => {
    if (r) setUploadKYCResident(r);
    setUploadKYCModalOpen(true);
  }, []);

  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [preselectedResidentForPayment, setPreselectedResidentForPayment] = useState<Resident | null>(null);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const applySnapshot = useCallback((data: BootstrapResponse) => {
    setSettings(data.settings);
    setFloors(data.floors);
    setRooms(data.rooms);
    setBeds(data.beds);
    setResidents(data.residents);
    setPayments(data.payments);
    setAdvances(data.advances);
    setExpenses(data.expenses);
    setStaff(data.staff);
    setSalaryPayments(data.salary_payments);
    setMaintenanceRequests(data.maintenance_requests);
    setComplaints(data.complaints);
    setResidentDocuments(data.resident_documents);
    setRoomAssignments(data.room_assignments);
    setWhatsappMessages(data.whatsapp_messages);
    setNotifications(data.notifications);
    setAuditLogs(data.audit_logs);
    setMetrics(data.metrics);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const data = await api.getBootstrap();
      applySnapshot(data);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing backend data:', err);
      setError(err.message || 'Failed to sync with backend');
    } finally {
      setLoading(false);
    }
  }, [applySnapshot]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ACTION: Record Payment
  const recordPayment = async (payload: any) => {
    try {
      const res = await api.recordPayment(payload);
      await refreshData();
      addToast('success', 'Payment Recorded', `₹${Number(payload.amount_paid).toLocaleString('en-IN')} payment received successfully.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Payment Failed', err.message);
      throw err;
    }
  };

  // ACTION: Transfer Room
  const transferRoom = async (residentId: string, payload: any) => {
    try {
      const res = await api.transferRoom(residentId, payload);
      await refreshData();
      addToast('success', 'Room Transferred', 'Resident has been reassigned to the new room and bed successfully.');
      return res.data;
    } catch (err: any) {
      addToast('error', 'Transfer Failed', err.message);
      throw err;
    }
  };

  // ACTION: Mark Resident Vacated
  const markResidentVacated = async (residentId: string, payload: any) => {
    try {
      const res = await api.markResidentVacated(residentId, payload);
      await refreshData();
      addToast('success', 'Resident Marked as Vacated', 'Bed released. All financial transaction history has been permanently preserved.');
      return res.data;
    } catch (err: any) {
      addToast('error', 'Vacating Action Failed', err.message);
      throw err;
    }
  };

  // ACTION: Create Resident
  const createResident = async (payload: any) => {
    try {
      const res = await api.createResident(payload);
      await refreshData();
      addToast('success', 'Resident Added', `${res.data.name} has been enrolled into Hanura Casa.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Add Resident', err.message);
      throw err;
    }
  };

  // ACTION: Edit Resident
  const editResident = async (id: string, payload: any) => {
    try {
      const res = await api.editResident(id, payload);
      await refreshData();
      addToast('success', 'Profile Updated', 'Resident profile changes saved successfully.');
      return res.data;
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  // ACTION: Add Expense
  const addExpense = async (payload: any) => {
    try {
      const res = await api.addExpense(payload);
      await refreshData();
      addToast('success', 'Expense Recorded', `₹${Number(res.data.amount).toLocaleString('en-IN')} logged under ${res.data.category}.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Add Expense', err.message);
      throw err;
    }
  };

  // ACTION: Delete Expense
  const deleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id, settings?.admin_name);
      await refreshData();
      addToast('info', 'Expense Deleted', 'Expense record removed and reports updated.');
    } catch (err: any) {
      addToast('error', 'Failed to Delete', err.message);
      throw err;
    }
  };

  // ACTION: Upload KYC
  const uploadKYC = async (payload: any) => {
    try {
      const res = await api.uploadKYC(payload);
      await refreshData();
      addToast('success', 'Document Uploaded', `${res.data.document_type} uploaded for verification.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Upload Failed', err.message);
      throw err;
    }
  };

  // ACTION: Verify KYC
  const verifyKYC = async (payload: any) => {
    try {
      const res = await api.verifyKYC(payload);
      await refreshData();
      addToast('success', 'KYC Updated', `Document status marked as ${payload.status}.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Verification Failed', err.message);
      throw err;
    }
  };

  // ACTION: Send Direct WhatsApp (One-Click Deep Link + Backend Log)
  const sendDirectWhatsApp = async (payload: {
    resident: Resident;
    type?: 'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'KYC_REQUEST' | 'COMPLAINT_UPDATE' | 'GENERAL_ANNOUNCEMENT' | 'CUSTOM';
    payment?: Payment | null;
    customText?: string;
    month?: string;
    balance?: number;
    complaintTitle?: string;
    complaintStatus?: string;
    complaintResolution?: string;
    openDirect?: boolean;
  }) => {
    const {
      resident,
      type = 'PAYMENT_REMINDER',
      payment,
      customText,
      month = 'August 2026',
      balance,
      complaintTitle,
      complaintStatus,
      complaintResolution,
      openDirect = true
    } = payload;

    // Calculate balance if not provided
    let calculatedBalance = balance;
    if (calculatedBalance === undefined) {
      const p = payments.find(pay => pay.resident_id === resident.id && pay.month === (month === 'August 2026' ? '2026-08' : month));
      const paid = p ? p.amount_paid : 0;
      calculatedBalance = Math.max(0, (resident.monthly_fee || 0) - paid);
    }

    const messageText = buildWhatsAppMessage({
      type,
      resident,
      payment,
      settings,
      month,
      customText,
      balance: calculatedBalance,
      complaintTitle,
      complaintStatus,
      complaintResolution
    });

    const phone = resident.phone || resident.whatsapp || '';
    const directUrl = getDirectWhatsAppUrl(phone, messageText);

    let opened = false;
    if (openDirect && phone) {
      opened = launchDirectWhatsApp(phone, messageText);
    }

    try {
      // Also record message in backend database / audit trail
      await api.sendWhatsApp({
        resident_ids: [resident.id],
        message_type: type,
        custom_text: messageText,
        month
      });
      await refreshData();

      if (opened) {
        addToast('success', 'Direct WhatsApp Launched', `WhatsApp chat opened for ${resident.name} (${phone}).`);
      } else {
        addToast('success', 'WhatsApp Dispatched', `Message recorded and dispatched to ${resident.name}.`);
      }
      return { message: messageText, url: directUrl, success: true };
    } catch (err: any) {
      // Even if backend fails, the direct WhatsApp chat was opened
      if (opened) {
        addToast('info', 'Direct WhatsApp Opened', `Chat launched directly to ${phone}.`);
        return { message: messageText, url: directUrl, success: true };
      }
      addToast('error', 'WhatsApp Error', err.message);
      throw err;
    }
  };

  // ACTION: Send WhatsApp (Broadcast / Multi-Resident)
  const sendWhatsApp = async (payload: any) => {
    try {
      // If single resident and autoOpenDirect is requested, launch directly
      if (payload.resident_ids && payload.resident_ids.length === 1 && payload.autoOpenDirect !== false) {
        const targetResident = residents.find(r => r.id === payload.resident_ids[0]);
        if (targetResident) {
          const res = await sendDirectWhatsApp({
            resident: targetResident,
            type: payload.message_type || 'PAYMENT_REMINDER',
            customText: payload.custom_text,
            month: payload.month || 'August 2026',
            openDirect: true
          });
          return { success_count: 1, failed_count: 0, directUrl: res.url };
        }
      }

      const res = await api.sendWhatsApp(payload);
      await refreshData();
      if (res.data.failed_count === 0) {
        addToast('success', 'WhatsApp Broadcast Sent', `Successfully dispatched to ${res.data.success_count} resident(s).`);
      } else {
        addToast('warning', 'Broadcast Result', `Delivered: ${res.data.success_count}, Failed: ${res.data.failed_count}. Check WhatsApp configuration.`);
      }
      return res.data;
    } catch (err: any) {
      addToast('error', 'WhatsApp Dispatch Error', err.message);
      throw err;
    }
  };

  // ACTION: Complaints
  const createComplaint = async (payload: any) => {
    try {
      const res = await api.createComplaint(payload);
      await refreshData();
      addToast('success', 'Complaint Logged', 'Ticket created and assigned to staff.');
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Create Ticket', err.message);
      throw err;
    }
  };

  const updateComplaint = async (id: string, payload: any) => {
    try {
      const res = await api.updateComplaint(id, payload);
      await refreshData();
      addToast('success', 'Ticket Updated', `Complaint status is now ${payload.status || 'Updated'}.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Update Ticket', err.message);
      throw err;
    }
  };

  // ACTION: Maintenance
  const createMaintenance = async (payload: any) => {
    try {
      const res = await api.createMaintenance(payload);
      await refreshData();
      addToast('success', 'Maintenance Request Created', 'Work order logged and assigned.');
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Create Request', err.message);
      throw err;
    }
  };

  const updateMaintenance = async (id: string, payload: any) => {
    try {
      const res = await api.updateMaintenance(id, payload);
      await refreshData();
      addToast('success', 'Maintenance Updated', `Work order status is now ${payload.status || 'Updated'}.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Update', err.message);
      throw err;
    }
  };

  // ACTION: Floors & Rooms Management
  const createFloor = async (payload: { floor_number: number; name?: string; description?: string }) => {
    try {
      const res = await api.createFloor(payload);
      await refreshData();
      addToast('success', 'Floor Created', `Floor ${res.data.floor_number} (${res.data.name}) added.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Create Floor', err.message);
      throw err;
    }
  };

  const deleteFloor = async (floorId: string) => {
    try {
      await api.deleteFloor(floorId);
      await refreshData();
      addToast('info', 'Floor Deleted', 'Floor and associated vacant rooms removed.');
    } catch (err: any) {
      addToast('error', 'Failed to Delete Floor', err.message);
      throw err;
    }
  };

  const createRoom = async (payload: {
    floor_number: number;
    room_number: string;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }) => {
    try {
      const res = await api.createRoom(payload);
      await refreshData();
      addToast('success', 'Room Created', `Suite ${res.data.room_number} (${res.data.capacity} beds) added to Floor ${res.data.floor_number}.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Create Room', err.message);
      throw err;
    }
  };

  const bulkCreateRooms = async (payload: {
    floor_number: number;
    room_numbers?: string[];
    prefix?: string;
    start_number?: number;
    end_number?: number;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }) => {
    try {
      const res = await api.bulkCreateRooms(payload);
      await refreshData();
      addToast('success', 'Bulk Rooms Created', `Successfully provisioned ${res.data.length} suites on Floor ${payload.floor_number}.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Bulk Creation Failed', err.message);
      throw err;
    }
  };

  const updateRoom = async (id: string, payload: Partial<Room>) => {
    try {
      const res = await api.updateRoom(id, payload);
      await refreshData();
      addToast('success', 'Room Updated', `Suite ${res.data.room_number} configuration updated.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Update Room', err.message);
      throw err;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await api.deleteRoom(id);
      await refreshData();
      addToast('info', 'Room Deleted', 'Suite removed from property inventory.');
    } catch (err: any) {
      addToast('error', 'Failed to Delete Room', err.message);
      throw err;
    }
  };

  const addBedToRoom = async (roomId: string, price?: number) => {
    try {
      const res = await api.addBedToRoom(roomId, price);
      await refreshData();
      addToast('success', 'Bed Added', `Bed ${res.data.bed_number} added to Suite.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Add Bed', err.message);
      throw err;
    }
  };

  const decreaseBedInRoom = async (roomId: string) => {
    try {
      const res = await api.decreaseBedInRoom(roomId);
      await refreshData();
      addToast('info', 'Bed Removed', `Bed ${res.data.bed_number} removed from Suite.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Remove Bed', err.message);
      throw err;
    }
  };

  const deleteBed = async (bedId: string) => {
    try {
      await api.deleteBed(bedId);
      await refreshData();
      addToast('info', 'Bed Removed', 'Vacant bed removed from room.');
    } catch (err: any) {
      addToast('error', 'Failed to Remove Bed', err.message);
      throw err;
    }
  };

  // ACTION: Staff & Salary
  const addStaff = async (payload: any) => {
    try {
      const res = await api.addStaff(payload);
      await refreshData();
      addToast('success', 'Staff Member Added', `${res.data.name} (${res.data.role}) added to directory.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Add Staff', err.message);
      throw err;
    }
  };

  const recordSalary = async (payload: any) => {
    try {
      const res = await api.recordSalary(payload);
      await refreshData();
      addToast('success', 'Salary Disbursed', `Salary payment recorded and automatically added to expenses.`);
      return res.data;
    } catch (err: any) {
      addToast('error', 'Salary Disbursement Failed', err.message);
      throw err;
    }
  };

  // ACTION: Settings
  const updateSettings = async (payload: any) => {
    try {
      const res = await api.updateSettings(payload);
      await refreshData();
      addToast('success', 'Settings Saved', 'System configuration updated successfully.');
      return res.data;
    } catch (err: any) {
      addToast('error', 'Failed to Update Settings', err.message);
      throw err;
    }
  };

  // ACTION: Reset Demo Database
  const resetDemoDatabase = async () => {
    try {
      const data = await api.resetDemoDatabase();
      applySnapshot(data);
      addToast('info', 'Database Reset', 'Fresh demo data loaded with synchronized relationships.');
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
      throw err;
    }
  };

  // ACTION: Clear All Records / Clean Slate
  const clearAllData = async () => {
    try {
      const data = await api.clearAllData();
      applySnapshot(data);
      addToast('success', 'Database Cleared', 'All demo data removed. You have a clean, fresh production state.');
    } catch (err: any) {
      addToast('error', 'Clear Failed', err.message);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        error,
        activeTab,
        setActiveTab,
        settings,
        floors,
        rooms,
        beds,
        residents,
        payments,
        advances,
        expenses,
        staff,
        salaryPayments,
        maintenanceRequests,
        complaints,
        residentDocuments,
        roomAssignments,
        whatsappMessages,
        notifications,
        auditLogs,
        metrics,
        selectedResidentId,
        setSelectedResidentId,
        selectedRoomId,
        setSelectedRoomId,
        printReceiptPayment,
        setPrintReceiptPayment,
        searchModalOpen,
        setSearchModalOpen,
        addRoomModalOpen,
        setAddRoomModalOpen,
        addResidentModalOpen,
        setAddResidentModalOpen,
        editResidentModalOpen,
        setEditResidentModalOpen,
        editingResident,
        setEditingResident,
        transferModalOpen,
        setTransferModalOpen,
        transferringResident,
        setTransferringResident,
        vacateModalOpen,
        setVacateModalOpen,
        vacatingResident,
        setVacatingResident,
        uploadKYCModalOpen,
        setUploadKYCModalOpen,
        uploadKYCResident,
        setUploadKYCResident,
        openEditResidentModal,
        openTransferResidentModal,
        openVacateResidentModal,
        openUploadKYCModal,
        recordPaymentModalOpen,
        setRecordPaymentModalOpen,
        preselectedResidentForPayment,
        setPreselectedResidentForPayment,
        addExpenseModalOpen,
        setAddExpenseModalOpen,
        toasts,
        addToast,
        removeToast,
        refreshData,
        recordPayment,
        transferRoom,
        markResidentVacated,
        createResident,
        editResident,
        addExpense,
        deleteExpense,
        uploadKYC,
        verifyKYC,
        sendWhatsApp,
        sendDirectWhatsApp,
        createComplaint,
        updateComplaint,
        createMaintenance,
        updateMaintenance,
        createFloor,
        deleteFloor,
        createRoom,
        bulkCreateRooms,
        updateRoom,
        deleteRoom,
        addBedToRoom,
        decreaseBedInRoom,
        deleteBed,
        addStaff,
        recordSalary,
        updateSettings,
        resetDemoDatabase,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
