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
  WhatsAppMessage,
  SystemSettings
} from '../types';
import { localDb } from './localDb';

export interface BootstrapResponse extends DatabaseSchema {
  metrics: DashboardMetrics;
}

// Track whether backend server is online or if we should use local offline engine (e.g. GitHub Pages)
let isLocalMode = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

export const api = {
  async getBootstrap(): Promise<BootstrapResponse> {
    if (isLocalMode) {
      return localDb.getBootstrap();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/api/bootstrap', { signal: controller.signal });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json && json.data && json.data.floors) {
          return json.data;
        }
      }
      throw new Error(`Backend unavailable (status ${res.status})`);
    } catch (err) {
      console.warn('Backend /api/bootstrap unavailable, falling back to browser local DB:', err);
      isLocalMode = true;
      return localDb.getBootstrap();
    }
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (isLocalMode) {
      return localDb.getDashboardMetrics();
    }

    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('Falling back to local metrics calculation:', err);
      return localDb.getDashboardMetrics();
    }
  },

  async createResident(payload: any): Promise<{ data: Resident; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.createResident(payload);
    }
    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create resident');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.createResident(payload);
    }
  },

  async editResident(id: string, payload: Partial<Resident>): Promise<{ data: Resident }> {
    if (isLocalMode) {
      return localDb.editResident(id, payload);
    }
    try {
      const res = await fetch(`/api/residents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update resident');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.editResident(id, payload);
    }
  },

  async transferRoom(residentId: string, payload: {
    new_room_id: string;
    new_bed_id?: string;
    new_bed_number?: number;
    transfer_reason?: string;
    admin_user?: string;
  }) {
    if (isLocalMode) {
      return localDb.transferRoom(residentId, payload);
    }
    try {
      const res = await fetch(`/api/residents/${residentId}/transfer-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to transfer room');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.transferRoom(residentId, payload);
    }
  },

  async markResidentVacated(residentId: string, payload: {
    vacated_reason?: string;
    admin_user?: string;
  }) {
    if (isLocalMode) {
      return localDb.markResidentVacated(residentId, payload);
    }
    try {
      const res = await fetch(`/api/residents/${residentId}/vacate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to mark resident vacated');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.markResidentVacated(residentId, payload);
    }
  },

  async deleteResident(residentId: string, adminUser?: string) {
    if (isLocalMode) {
      return localDb.deleteResident(residentId, adminUser);
    }
    try {
      const res = await fetch(`/api/residents/${residentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_user: adminUser })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete resident');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.deleteResident(residentId, adminUser);
    }
  },

  async recordPayment(payload: any): Promise<{ data: Payment; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.recordPayment(payload);
    }
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to record payment');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.recordPayment(payload);
    }
  },

  async getRoomPaymentMatrix(roomId: string) {
    if (isLocalMode) {
      const snap = localDb.getSnapshot();
      const room = snap.rooms.find(r => r.id === roomId);
      const residents = snap.residents.filter(r => r.current_room_id === roomId);
      const payments = snap.payments.filter(p => p.room_number === room?.room_number);
      return { room, residents, payments };
    }
    try {
      const res = await fetch(`/api/rooms/${roomId}/payment-matrix`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch room payment matrix');
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      const snap = localDb.getSnapshot();
      const room = snap.rooms.find(r => r.id === roomId);
      const residents = snap.residents.filter(r => r.current_room_id === roomId);
      const payments = snap.payments.filter(p => p.room_number === room?.room_number);
      return { room, residents, payments };
    }
  },

  async addExpense(payload: Partial<Expense>): Promise<{ data: Expense; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.addExpense(payload);
    }
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add expense');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.addExpense(payload);
    }
  },

  async deleteExpense(id: string, adminUser?: string) {
    if (isLocalMode) {
      return localDb.deleteExpense(id, adminUser);
    }
    try {
      const res = await fetch(`/api/expenses/${id}${adminUser ? `?admin_user=${encodeURIComponent(adminUser)}` : ''}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete expense');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.deleteExpense(id, adminUser);
    }
  },

  async uploadKYC(payload: any): Promise<{ data: ResidentDocument }> {
    if (isLocalMode) {
      return localDb.uploadKYC(payload);
    }
    try {
      const res = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload document');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.uploadKYC(payload);
    }
  },

  async verifyKYC(payload: {
    document_id: string;
    status: 'VERIFIED' | 'REJECTED';
    rejection_reason?: string;
    verified_by?: string;
  }): Promise<{ data: ResidentDocument }> {
    if (isLocalMode) {
      return localDb.verifyKYC(payload);
    }
    try {
      const res = await fetch('/api/kyc/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update KYC status');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.verifyKYC(payload);
    }
  },

  async sendWhatsApp(payload: {
    resident_ids: string[];
    message_type: any;
    custom_text?: string;
    month?: string;
  }): Promise<{ data: { success_count: number; failed_count: number; messages: WhatsAppMessage[] } }> {
    if (isLocalMode) {
      return localDb.sendWhatsApp(payload);
    }
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to dispatch WhatsApp messages');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend failed, falling back to local DB:', err);
      isLocalMode = true;
      return localDb.sendWhatsApp(payload);
    }
  },

  async createComplaint(payload: Partial<Complaint>): Promise<{ data: Complaint }> {
    if (isLocalMode) {
      return localDb.createComplaint(payload);
    }
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create complaint');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.createComplaint(payload);
    }
  },

  async updateComplaint(id: string, payload: Partial<Complaint>): Promise<{ data: Complaint }> {
    if (isLocalMode) {
      return localDb.updateComplaint(id, payload);
    }
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update complaint');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.updateComplaint(id, payload);
    }
  },

  async createMaintenance(payload: Partial<MaintenanceRequest>): Promise<{ data: MaintenanceRequest }> {
    if (isLocalMode) {
      return localDb.createMaintenance(payload);
    }
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create maintenance ticket');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.createMaintenance(payload);
    }
  },

  async updateMaintenance(id: string, payload: Partial<MaintenanceRequest>): Promise<{ data: MaintenanceRequest }> {
    if (isLocalMode) {
      return localDb.updateMaintenance(id, payload);
    }
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update maintenance ticket');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.updateMaintenance(id, payload);
    }
  },

  async addStaff(payload: Partial<Staff>): Promise<{ data: Staff }> {
    if (isLocalMode) {
      return localDb.addStaff(payload);
    }
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add staff');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.addStaff(payload);
    }
  },

  async recordSalary(payload: any): Promise<{ data: SalaryPayment; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.recordSalary(payload);
    }
    try {
      const res = await fetch('/api/staff/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to record salary');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.recordSalary(payload);
    }
  },

  // ==========================================
  // FLOORS, ROOMS & BEDS
  // ==========================================
  async createFloor(payload: { floor_number: number; name?: string; description?: string }): Promise<{ data: Floor; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.createFloor(payload);
    }
    try {
      const res = await fetch('/api/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create floor');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.createFloor(payload);
    }
  },

  async deleteFloor(floorId: string): Promise<{ metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.deleteFloor(floorId);
    }
    try {
      const res = await fetch(`/api/floors/${floorId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete floor');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.deleteFloor(floorId);
    }
  },

  async createRoom(payload: {
    floor_number: number;
    room_number: string;
    sharing_type?: string;
    capacity: number;
    monthly_fee: number;
    amenities?: string[];
  }): Promise<{ data: Room; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.createRoom(payload);
    }
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create room');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.createRoom(payload);
    }
  },

  async bulkCreateRooms(payload: {
    floor_number: number;
    room_numbers?: string[];
    prefix?: string;
    start_number?: number;
    end_number?: number;
    capacity: number;
    monthly_fee: number;
    sharing_type?: string;
    amenities?: string[];
  }): Promise<{ data: Room[]; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.bulkCreateRooms(payload);
    }
    try {
      const res = await fetch('/api/rooms/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to bulk create rooms');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.bulkCreateRooms(payload);
    }
  },

  async updateRoom(id: string, payload: Partial<Room>): Promise<{ data: Room; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.updateRoom(id, payload);
    }
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update room');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.updateRoom(id, payload);
    }
  },

  async deleteRoom(id: string): Promise<{ metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.deleteRoom(id);
    }
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete room');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.deleteRoom(id);
    }
  },

  async addBedToRoom(roomId: string, price?: number): Promise<{ data: Bed; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.addBedToRoom(roomId, price);
    }
    try {
      const res = await fetch(`/api/rooms/${roomId}/beds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add bed to room');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.addBedToRoom(roomId, price);
    }
  },

  async decreaseBedInRoom(roomId: string): Promise<{ data: Bed; metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.decreaseBedInRoom(roomId);
    }
    try {
      const res = await fetch(`/api/rooms/${roomId}/decrease-bed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to decrease bed in room');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.decreaseBedInRoom(roomId);
    }
  },

  async deleteBed(bedId: string): Promise<{ metrics: DashboardMetrics }> {
    if (isLocalMode) {
      return localDb.deleteBed(bedId);
    }
    try {
      const res = await fetch(`/api/beds/${bedId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete bed');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.deleteBed(bedId);
    }
  },

  async updateSettings(payload: Partial<SystemSettings>): Promise<{ data: SystemSettings }> {
    if (isLocalMode) {
      return localDb.updateSettings(payload);
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update settings');
      }
      return await res.json();
    } catch (err) {
      isLocalMode = true;
      return localDb.updateSettings(payload);
    }
  },

  async resetDemoDatabase(): Promise<BootstrapResponse> {
    if (isLocalMode) {
      return localDb.resetDemoDatabase();
    }
    try {
      const res = await fetch('/api/system/reset-demo', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset demo database');
      const json = await res.json();
      return json.data;
    } catch (err) {
      isLocalMode = true;
      return localDb.resetDemoDatabase();
    }
  },

  async clearAllData(): Promise<BootstrapResponse> {
    if (isLocalMode) {
      return localDb.clearAllData();
    }
    try {
      const res = await fetch('/api/system/clear-all', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear database');
      const json = await res.json();
      return json.data;
    } catch (err) {
      isLocalMode = true;
      return localDb.clearAllData();
    }
  },

  async removeSampleData(): Promise<BootstrapResponse> {
    if (isLocalMode) {
      return localDb.removeSampleData();
    }
    try {
      const res = await fetch('/api/system/remove-sample', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to remove sample data');
      const json = await res.json();
      return json.data;
    } catch (err) {
      isLocalMode = true;
      return localDb.removeSampleData();
    }
  },

  async getDatabaseStatus(): Promise<{
    connected: boolean;
    configured: boolean;
    url?: string;
    message: string;
    sql_schema?: string;
  }> {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
    }
    return {
      connected: false,
      configured: false,
      message: 'Running in Local Storage mode. Configure Supabase in Settings to sync across all devices.'
    };
  },

  async syncDatabase(direction: 'bidirectional' | 'push' = 'bidirectional'): Promise<{
    success: boolean;
    message: string;
    data?: BootstrapResponse;
  }> {
    try {
      const res = await fetch('/api/database/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });
      if (res.ok) {
        return await res.json();
      }
      const errJson = await res.json().catch(() => ({}));
      return { success: false, message: errJson.message || 'Database sync failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during database sync.' };
    }
  },

  async getDatabaseSchema(): Promise<string> {
    try {
      const res = await fetch('/api/database/schema');
      if (res.ok) {
        const json = await res.json();
        return json.sql;
      }
    } catch (err) {
      // Fallback
    }
    return `-- SQL Schema for Supabase
CREATE TABLE IF NOT EXISTS hanura_casa_state (
  id TEXT PRIMARY KEY DEFAULT 'primary_state',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE hanura_casa_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for hanura_casa_state" ON hanura_casa_state FOR ALL USING (true) WITH CHECK (true);`;
  }
};
