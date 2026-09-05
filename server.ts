import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  isSupabaseConfigured
} from './server/supabase';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Hanura Casa Backend Engine', timestamp: new Date().toISOString() });
  });

  // Full Database Snapshot
  app.get('/api/bootstrap', (req, res) => {
    try {
      const snapshot = db.getSnapshot();
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: { ...snapshot, metrics } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dashboard Metrics
  app.get('/api/dashboard', (req, res) => {
    try {
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Residents CRUD
  app.post('/api/residents', (req, res) => {
    try {
      const resident = db.createResident(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: resident, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/residents/:id', (req, res) => {
    try {
      const updated = db.editResident(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Room Transfer
  app.post('/api/residents/:id/transfer-room', (req, res) => {
    try {
      const result = db.transferRoom({
        resident_id: req.params.id,
        new_room_id: req.body.new_room_id,
        new_bed_id: req.body.new_bed_id,
        new_bed_number: req.body.new_bed_number,
        transfer_reason: req.body.transfer_reason,
        admin_user: req.body.admin_user
      });
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: result, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Mark Vacated
  app.post('/api/residents/:id/vacate', (req, res) => {
    try {
      const resident = db.markResidentVacated({
        resident_id: req.params.id,
        vacated_reason: req.body.vacated_reason,
        admin_user: req.body.admin_user
      });
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: resident, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Delete Resident permanently
  app.delete('/api/residents/:id', (req, res) => {
    try {
      const result = db.deleteResident(req.params.id, req.body?.admin_user);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: result, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Payments
  app.post('/api/payments', (req, res) => {
    try {
      const payment = db.recordPayment(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: payment, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Room Payment Matrix (Signature Feature)
  app.get('/api/rooms/:id/payment-matrix', (req, res) => {
    try {
      const matrix = db.getRoomPaymentMatrix(req.params.id);
      res.json({ success: true, data: matrix });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // FLOORS, ROOMS & BEDS MANAGEMENT ROUTES
  // ==========================================

  // Create Floor
  app.post('/api/floors', (req, res) => {
    try {
      const floor = db.createFloor(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: floor, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Delete Floor
  app.delete('/api/floors/:id', (req, res) => {
    try {
      db.deleteFloor(req.params.id);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Create Single Room
  app.post('/api/rooms', (req, res) => {
    try {
      const room = db.createRoom(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: room, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Bulk Create Rooms
  app.post('/api/rooms/bulk', (req, res) => {
    try {
      const createdRooms = db.bulkCreateRooms(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: createdRooms, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Update Room
  app.put('/api/rooms/:id', (req, res) => {
    try {
      const room = db.updateRoom(req.params.id, req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: room, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Delete Room
  app.delete('/api/rooms/:id', (req, res) => {
    try {
      db.deleteRoom(req.params.id);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Add Bed to Room
  app.post('/api/rooms/:id/beds', (req, res) => {
    try {
      const bed = db.addBedToRoom(req.params.id, req.body.price);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: bed, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Decrease Bed in Room
  app.post('/api/rooms/:id/decrease-bed', (req, res) => {
    try {
      const bed = db.decreaseBedInRoom(req.params.id);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: bed, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Delete Bed
  app.delete('/api/beds/:id', (req, res) => {
    try {
      db.deleteBed(req.params.id);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Expenses CRUD
  app.post('/api/expenses', (req, res) => {
    try {
      const expense = db.addExpense(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: expense, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/expenses/:id', (req, res) => {
    try {
      db.deleteExpense(req.params.id, req.query.admin_user as string);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Digital KYC
  app.post('/api/kyc/upload', (req, res) => {
    try {
      const doc = db.uploadKYCDocument(req.body);
      res.json({ success: true, data: doc });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/kyc/verify', (req, res) => {
    try {
      const doc = db.updateKYCStatus(req.body);
      res.json({ success: true, data: doc });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // WhatsApp Messaging
  app.post('/api/whatsapp/send', (req, res) => {
    try {
      const result = db.sendWhatsAppMessage(req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Complaints
  app.post('/api/complaints', (req, res) => {
    try {
      const complaint = db.createComplaint(req.body);
      res.json({ success: true, data: complaint });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/complaints/:id', (req, res) => {
    try {
      const complaint = db.updateComplaint(req.params.id, req.body);
      res.json({ success: true, data: complaint });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Maintenance
  app.post('/api/maintenance', (req, res) => {
    try {
      const item = db.createMaintenance(req.body);
      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/maintenance/:id', (req, res) => {
    try {
      const item = db.updateMaintenance(req.params.id, req.body);
      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Staff & Salaries
  app.post('/api/staff', (req, res) => {
    try {
      const staff = db.addStaff(req.body);
      res.json({ success: true, data: staff });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/staff/salary', (req, res) => {
    try {
      const sal = db.recordSalaryPayment(req.body);
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: sal, metrics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Settings
  app.put('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Reset Demo Seed
  app.post('/api/system/reset-demo', (req, res) => {
    try {
      db.seedDemoData();
      const snapshot = db.getSnapshot();
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: { ...snapshot, metrics } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear All Records / Fresh State
  app.post('/api/system/clear-all', (req, res) => {
    try {
      db.clearAllData();
      const snapshot = db.getSnapshot();
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: { ...snapshot, metrics } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Remove Sample Data (Residents, Payments, Transactions) but keep configured rooms & floors
  app.post('/api/system/remove-sample', (req, res) => {
    try {
      db.removeSampleData();
      const snapshot = db.getSnapshot();
      const metrics = db.getDashboardMetrics();
      res.json({ success: true, data: { ...snapshot, metrics } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // SUPABASE CLOUD DATABASE SYNC & STATUS
  // ==========================================
  app.get('/api/database/status', async (req, res) => {
    try {
      const status = await testSupabaseConnection();
      res.json({
        success: true,
        data: status,
        isConfigured: isSupabaseConfigured(),
        sql_schema: SUPABASE_SQL_SCHEMA
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/database/sync', async (req, res) => {
    try {
      const direction = req.body?.direction || 'bidirectional';
      let result;
      if (direction === 'push') {
        result = await db.pushToSupabase();
      } else {
        result = await db.syncWithSupabase();
      }
      const snapshot = db.getSnapshot();
      const metrics = db.getDashboardMetrics();
      res.json({ success: result.success, message: result.message, data: { ...snapshot, metrics } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/database/schema', (req, res) => {
    res.json({
      success: true,
      sql: SUPABASE_SQL_SCHEMA
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (Development / Production)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Hanura Casa Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
