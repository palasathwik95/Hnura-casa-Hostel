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

export interface BootstrapResponse extends DatabaseSchema {
  metrics: DashboardMetrics;
}

export const api = {
  async getBootstrap(): Promise<BootstrapResponse> {
    const res = await fetch('/api/bootstrap');
    if (!res.ok) throw new Error('Failed to fetch initial data');
    const json = await res.json();
    return json.data;
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    const json = await res.json();
    return json.data;
  },

  async createResident(payload: any): Promise<{ data: Resident; metrics: DashboardMetrics }> {
    const res = await fetch('/api/residents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create resident');
    }
    return await res.json();
  },

  async editResident(id: string, payload: Partial<Resident>): Promise<{ data: Resident }> {
    const res = await fetch(`/api/residents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update resident');
    }
    return await res.json();
  },

  async transferRoom(residentId: string, payload: {
    new_room_id: string;
    new_bed_id?: string;
    new_bed_number?: number;
    transfer_reason?: string;
    admin_user?: string;
  }) {
    const res = await fetch(`/api/residents/${residentId}/transfer-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to transfer room');
    }
    return await res.json();
  },

  async markResidentVacated(residentId: string, payload: {
    vacated_reason?: string;
    admin_user?: string;
  }) {
    const res = await fetch(`/api/residents/${residentId}/vacate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to mark resident vacated');
    }
    return await res.json();
  },

  async recordPayment(payload: any): Promise<{ data: Payment; metrics: DashboardMetrics }> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record payment');
    }
    return await res.json();
  },

  async getRoomPaymentMatrix(roomId: string) {
    const res = await fetch(`/api/rooms/${roomId}/payment-matrix`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch room payment matrix');
    }
    const json = await res.json();
    return json.data;
  },

  async addExpense(payload: Partial<Expense>): Promise<{ data: Expense; metrics: DashboardMetrics }> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add expense');
    }
    return await res.json();
  },

  async deleteExpense(id: string, adminUser?: string) {
    const res = await fetch(`/api/expenses/${id}${adminUser ? `?admin_user=${encodeURIComponent(adminUser)}` : ''}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete expense');
    }
    return await res.json();
  },

  async uploadKYC(payload: any): Promise<{ data: ResidentDocument }> {
    const res = await fetch('/api/kyc/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload document');
    }
    return await res.json();
  },

  async verifyKYC(payload: {
    document_id: string;
    status: 'VERIFIED' | 'REJECTED';
    rejection_reason?: string;
    verified_by?: string;
  }): Promise<{ data: ResidentDocument }> {
    const res = await fetch('/api/kyc/verify', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update KYC status');
    }
    return await res.json();
  },

  async sendWhatsApp(payload: {
    resident_ids: string[];
    message_type: any;
    custom_text?: string;
    month?: string;
  }): Promise<{ data: { success_count: number; failed_count: number; messages: WhatsAppMessage[] } }> {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to dispatch WhatsApp messages');
    }
    return await res.json();
  },

  async createComplaint(payload: Partial<Complaint>): Promise<{ data: Complaint }> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create complaint');
    }
    return await res.json();
  },

  async updateComplaint(id: string, payload: Partial<Complaint>): Promise<{ data: Complaint }> {
    const res = await fetch(`/api/complaints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update complaint');
    }
    return await res.json();
  },

  async createMaintenance(payload: Partial<MaintenanceRequest>): Promise<{ data: MaintenanceRequest }> {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create maintenance ticket');
    }
    return await res.json();
  },

  async updateMaintenance(id: string, payload: Partial<MaintenanceRequest>): Promise<{ data: MaintenanceRequest }> {
    const res = await fetch(`/api/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update maintenance ticket');
    }
    return await res.json();
  },

  async addStaff(payload: Partial<Staff>): Promise<{ data: Staff }> {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add staff');
    }
    return await res.json();
  },

  async recordSalary(payload: any): Promise<{ data: SalaryPayment; metrics: DashboardMetrics }> {
    const res = await fetch('/api/staff/salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record salary');
    }
    return await res.json();
  },

  // ==========================================
  // FLOORS, ROOMS & BEDS
  // ==========================================
  async createFloor(payload: { floor_number: number; name?: string; description?: string }): Promise<{ data: Floor; metrics: DashboardMetrics }> {
    const res = await fetch('/api/floors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create floor');
    }
    return await res.json();
  },

  async deleteFloor(floorId: string): Promise<{ metrics: DashboardMetrics }> {
    const res = await fetch(`/api/floors/${floorId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete floor');
    }
    return await res.json();
  },

  async createRoom(payload: {
    floor_number: number;
    room_number: string;
    sharing_type?: string;
    capacity: number;
    monthly_fee: number;
    amenities?: string[];
  }): Promise<{ data: Room; metrics: DashboardMetrics }> {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create room');
    }
    return await res.json();
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
    const res = await fetch('/api/rooms/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to bulk create rooms');
    }
    return await res.json();
  },

  async updateRoom(id: string, payload: Partial<Room>): Promise<{ data: Room; metrics: DashboardMetrics }> {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update room');
    }
    return await res.json();
  },

  async deleteRoom(id: string): Promise<{ metrics: DashboardMetrics }> {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete room');
    }
    return await res.json();
  },

  async addBedToRoom(roomId: string, price?: number): Promise<{ data: Bed; metrics: DashboardMetrics }> {
    const res = await fetch(`/api/rooms/${roomId}/beds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add bed to room');
    }
    return await res.json();
  },

  async decreaseBedInRoom(roomId: string): Promise<{ data: Bed; metrics: DashboardMetrics }> {
    const res = await fetch(`/api/rooms/${roomId}/decrease-bed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to decrease bed in room');
    }
    return await res.json();
  },

  async deleteBed(bedId: string): Promise<{ metrics: DashboardMetrics }> {
    const res = await fetch(`/api/beds/${bedId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete bed');
    }
    return await res.json();
  },

  async updateSettings(payload: Partial<SystemSettings>): Promise<{ data: SystemSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update settings');
    }
    return await res.json();
  },

  async resetDemoDatabase(): Promise<BootstrapResponse> {
    const res = await fetch('/api/system/reset-demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo database');
    const json = await res.json();
    return json.data;
  },

  async clearAllData(): Promise<BootstrapResponse> {
    const res = await fetch('/api/system/clear-all', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear database');
    const json = await res.json();
    return json.data;
  }
};
