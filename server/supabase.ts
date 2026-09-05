import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { withSupabase, createSupabaseContext } from '@supabase/server';
import { DatabaseSchema } from '../src/types';

export { withSupabase, createSupabaseContext };

let supabaseInstance: SupabaseClient | null = null;

export const PROJECT_TABLE_NAMES = [
  'residents',
  'rooms',
  'floors',
  'beds',
  'payments',
  'advances',
  'expenses',
  'staff',
  'salary_payments',
  'maintenance_requests',
  'complaints',
  'resident_documents',
  'room_assignments',
  'whatsapp_messages',
  'notifications',
  'audit_logs',
  'settings',
  'hanura_casa_state'
] as const;

export function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  
  const rawSecret = process.env.SUPABASE_SECRET_KEY || '';
  const rawServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const rawPublishable = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  const rawAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  // Filter out any masked placeholder values (e.g. •••••••)
  const secretKey = (rawSecret && !rawSecret.includes('•')) ? rawSecret : rawServiceRole;
  const publishableKey = (rawPublishable && !rawPublishable.includes('•')) ? rawPublishable : rawAnon;
  const key = secretKey || publishableKey || '';

  return {
    url: url.trim(),
    key: key.trim(),
    publishableKey: publishableKey.trim(),
    secretKey: secretKey.trim(),
    jwksUrl: (process.env.SUPABASE_JWKS_URL || '').trim()
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseCredentials();
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log(`[Supabase] Client initialized for project URL: ${url}`);
    return supabaseInstance;
  } catch (err: any) {
    console.error('[Supabase] Failed to initialize client:', err.message);
    return null;
  }
}

// Complete relational SQL schema for all project tables
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- HANURA CASA SUPABASE FULL DATABASE SCHEMA
-- Copy and paste this into your Supabase SQL Editor and click "Run".
-- This creates individual tables with full columns so you can view, edit,
-- and query all your project records directly inside the Supabase Table Editor!
-- =========================================================================

-- 1. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'property_settings',
  property_name TEXT,
  hostel_name TEXT,
  hostel_code TEXT,
  address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  upi_id TEXT,
  currency TEXT DEFAULT '₹',
  default_due_day INT DEFAULT 5,
  late_fee_grace_days INT DEFAULT 3,
  late_fee_amount NUMERIC DEFAULT 250,
  whatsapp_api_configured BOOLEAN DEFAULT false,
  whatsapp_phone_number_id TEXT,
  whatsapp_business_account_id TEXT,
  whatsapp_access_token TEXT,
  whatsapp_webhook_secret TEXT,
  admin_name TEXT,
  admin_email TEXT,
  admin_role TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FLOORS TABLE
CREATE TABLE IF NOT EXISTS floors (
  id TEXT PRIMARY KEY,
  floor_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_rooms INT DEFAULT 0,
  total_beds INT DEFAULT 0,
  occupied_beds INT DEFAULT 0,
  vacant_beds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  floor_id TEXT,
  floor_number INT NOT NULL,
  sharing_type TEXT NOT NULL,
  capacity INT NOT NULL,
  monthly_fee NUMERIC NOT NULL,
  status TEXT DEFAULT 'AVAILABLE',
  amenities JSONB DEFAULT '[]'::jsonb,
  beds JSONB DEFAULT '[]'::jsonb,
  occupied_beds_count INT DEFAULT 0,
  vacant_beds_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BEDS TABLE
CREATE TABLE IF NOT EXISTS beds (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  room_number TEXT,
  floor_number INT,
  bed_number INT NOT NULL,
  status TEXT DEFAULT 'VACANT',
  price NUMERIC,
  current_resident_id TEXT,
  current_resident_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESIDENTS TABLE
CREATE TABLE IF NOT EXISTS residents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  college TEXT,
  college_id TEXT,
  course TEXT,
  academic_year TEXT,
  date_of_birth TEXT,
  aadhaar_number TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  emergency_contact TEXT,
  permanent_address TEXT,
  joining_date TEXT,
  current_room_id TEXT,
  current_room_number TEXT,
  current_bed_id TEXT,
  current_bed_number INT,
  floor_number INT,
  sharing_type TEXT,
  monthly_fee NUMERIC,
  status TEXT DEFAULT 'ACTIVE',
  vacated_date TEXT,
  vacated_reason TEXT,
  kyc_status TEXT DEFAULT 'NOT_STARTED',
  kyc_completion INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  resident_id TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  room_id TEXT,
  room_number TEXT,
  month TEXT NOT NULL,
  expected_amount NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL,
  advance_used NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  payment_date TEXT,
  payment_method TEXT DEFAULT 'UPI',
  transaction_reference TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ADVANCES (SECURITY DEPOSITS) TABLE
CREATE TABLE IF NOT EXISTS advances (
  id TEXT PRIMARY KEY,
  resident_id TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  opening_advance NUMERIC DEFAULT 0,
  current_advance NUMERIC DEFAULT 0,
  transactions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  vendor TEXT,
  paid_to TEXT,
  payment_method TEXT DEFAULT 'UPI',
  description TEXT,
  receipt_url TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  joining_date TEXT,
  monthly_salary NUMERIC NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  photo_url TEXT,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SALARY PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS salary_payments (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_role TEXT,
  month TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  advance NUMERIC DEFAULT 0,
  deduction NUMERIC DEFAULT 0,
  paid NUMERIC NOT NULL,
  balance NUMERIC DEFAULT 0,
  payment_date TEXT,
  payment_method TEXT DEFAULT 'Bank Transfer',
  transaction_ref TEXT,
  status TEXT DEFAULT 'PAID',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MAINTENANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id TEXT PRIMARY KEY,
  title TEXT,
  resident_id TEXT,
  resident_name TEXT,
  room_id TEXT,
  room_number TEXT NOT NULL,
  floor_number INT,
  bed_number INT,
  category TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'MEDIUM',
  assigned_staff TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completion_date TEXT,
  resolution TEXT
);

-- 12. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  resident_id TEXT,
  resident_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'PENDING',
  assigned_person TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TEXT,
  resolution_notes TEXT
);

-- 13. RESIDENT DOCUMENTS (KYC) TABLE
CREATE TABLE IF NOT EXISTS resident_documents (
  id TEXT PRIMARY KEY,
  resident_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  verified_at TEXT,
  status TEXT DEFAULT 'PENDING',
  rejection_reason TEXT
);

-- 14. ROOM ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS room_assignments (
  id TEXT PRIMARY KEY,
  resident_id TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  bed_id TEXT NOT NULL,
  bed_number INT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT DEFAULT 'ACTIVE',
  transfer_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. WHATSAPP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  resident_id TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL,
  template_name TEXT,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'SENT',
  error_message TEXT
);

-- 16. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  link_tab TEXT,
  related_id TEXT
);

-- 17. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  admin_user TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 18. BACKUP SNAPSHOT TABLE
CREATE TABLE IF NOT EXISTS hanura_casa_state (
  id TEXT PRIMARY KEY DEFAULT 'primary_state',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables instant read and write access for your authenticated app
-- =========================================================================
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'settings', 'floors', 'rooms', 'beds', 'residents', 
    'payments', 'advances', 'expenses', 'staff', 'salary_payments', 
    'maintenance_requests', 'complaints', 'resident_documents', 
    'room_assignments', 'whatsapp_messages', 'notifications', 
    'audit_logs', 'hanura_casa_state'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Enable all operations for %I" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Enable all operations for %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;
`;

// Helper: Check which tables exist in Supabase
export async function getExistingSupabaseTables(): Promise<Record<string, boolean>> {
  const supabase = getSupabaseClient();
  const result: Record<string, boolean> = {};

  if (!supabase) {
    PROJECT_TABLE_NAMES.forEach(t => { result[t] = false; });
    return result;
  }

  await Promise.all(
    PROJECT_TABLE_NAMES.map(async (table) => {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        result[table] = !error || (error.code !== 'PGRST205' && !error.message.includes('not find'));
      } catch (err) {
        result[table] = false;
      }
    })
  );

  return result;
}

// Fetch all project tables directly from Supabase
export async function fetchAllTablesFromSupabase(): Promise<DatabaseSchema | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const tableStatus = await getExistingSupabaseTables();
    const hasCoreTables = tableStatus.residents && tableStatus.rooms;

    // If core individual tables exist, load directly from them
    if (hasCoreTables) {
      console.log('[Supabase] Loading data directly from relational tables...');
      const schema: Partial<DatabaseSchema> = {};

      const [
        residentsRes,
        roomsRes,
        floorsRes,
        bedsRes,
        paymentsRes,
        advancesRes,
        expensesRes,
        staffRes,
        salariesRes,
        maintenanceRes,
        complaintsRes,
        documentsRes,
        assignmentsRes,
        messagesRes,
        notificationsRes,
        logsRes,
        settingsRes
      ] = await Promise.all([
        supabase.from('residents').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('floors').select('*'),
        supabase.from('beds').select('*'),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('advances').select('*'),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('staff').select('*'),
        supabase.from('salary_payments').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('resident_documents').select('*'),
        supabase.from('room_assignments').select('*'),
        supabase.from('whatsapp_messages').select('*').order('sent_at', { ascending: false }),
        supabase.from('notifications').select('*').order('timestamp', { ascending: false }),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
        supabase.from('settings').select('*').eq('id', 'property_settings').maybeSingle()
      ]);

      schema.residents = residentsRes.data || [];
      schema.rooms = roomsRes.data || [];
      schema.floors = floorsRes.data || [];
      schema.beds = bedsRes.data || [];
      schema.payments = paymentsRes.data || [];
      schema.advances = advancesRes.data || [];
      schema.expenses = expensesRes.data || [];
      schema.staff = staffRes.data || [];
      schema.salary_payments = salariesRes.data || [];
      schema.maintenance_requests = maintenanceRes.data || [];
      schema.complaints = complaintsRes.data || [];
      schema.resident_documents = documentsRes.data || [];
      schema.room_assignments = assignmentsRes.data || [];
      schema.whatsapp_messages = messagesRes.data || [];
      schema.notifications = notificationsRes.data || [];
      schema.audit_logs = logsRes.data || [];
      if (settingsRes.data) {
        schema.settings = settingsRes.data;
      }

      console.log(`[Supabase] Relational data fetched: ${schema.residents.length} residents, ${schema.rooms.length} rooms, ${schema.payments.length} payments.`);
      return schema as DatabaseSchema;
    }

    // Fallback to hanura_casa_state snapshot if relational tables haven't been created yet
    return await fetchCloudState();
  } catch (err: any) {
    console.error('[Supabase] Error loading from Supabase tables:', err.message);
    return await fetchCloudState();
  }
}

// Sync all database entities into both relational tables and backup snapshot
export async function syncAllTablesToSupabase(data: DatabaseSchema): Promise<{
  success: boolean;
  syncedTables: string[];
  errors: string[];
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, syncedTables: [], errors: ['Supabase client not initialized'] };
  }

  const syncedTables: string[] = [];
  const errors: string[] = [];

  // Always update snapshot
  await saveCloudState(data);
  syncedTables.push('hanura_casa_state');

  const tableStatus = await getExistingSupabaseTables();

  const syncTable = async (table: string, records: any[]) => {
    if (!tableStatus[table]) return;
    try {
      if (records && records.length > 0) {
        const { error } = await supabase.from(table).upsert(records, { onConflict: 'id' });
        if (error) {
          console.warn(`[Supabase] Warning syncing to ${table}:`, error.message);
          errors.push(`${table}: ${error.message}`);
        } else {
          syncedTables.push(table);
        }
      }
    } catch (e: any) {
      errors.push(`${table}: ${e.message}`);
    }
  };

  // Sync Settings
  if (tableStatus['settings'] && data.settings) {
    try {
      await supabase.from('settings').upsert({
        id: 'property_settings',
        ...data.settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      syncedTables.push('settings');
    } catch (e: any) {
      errors.push(`settings: ${e.message}`);
    }
  }

  await Promise.all([
    syncTable('floors', data.floors || []),
    syncTable('rooms', data.rooms || []),
    syncTable('beds', data.beds || []),
    syncTable('residents', data.residents || []),
    syncTable('payments', data.payments || []),
    syncTable('advances', data.advances || []),
    syncTable('expenses', data.expenses || []),
    syncTable('staff', data.staff || []),
    syncTable('salary_payments', data.salary_payments || []),
    syncTable('maintenance_requests', data.maintenance_requests || []),
    syncTable('complaints', data.complaints || []),
    syncTable('resident_documents', data.resident_documents || []),
    syncTable('room_assignments', data.room_assignments || []),
    syncTable('whatsapp_messages', data.whatsapp_messages || []),
    syncTable('notifications', data.notifications || []),
    syncTable('audit_logs', data.audit_logs || [])
  ]);

  console.log(`[Supabase] Synced tables: ${syncedTables.join(', ')}`);
  return {
    success: true,
    syncedTables,
    errors
  };
}

// Save single record to Supabase table
export async function saveRecordToSupabaseTable(table: string, record: any): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(table).upsert(record, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase] Upsert to ${table} error:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[Supabase] Error writing to ${table}:`, err.message);
    return false;
  }
}

// Delete single record from Supabase table
export async function deleteRecordFromSupabaseTable(table: string, id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase] Delete from ${table} error:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[Supabase] Error deleting from ${table}:`, err.message);
    return false;
  }
}

export async function fetchCloudState(): Promise<any | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('hanura_casa_state')
      .select('data, updated_at')
      .eq('id', 'primary_state')
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Could not fetch state from hanura_casa_state:', error.message);
      return null;
    }

    if (data && data.data) {
      console.log(`[Supabase] Successfully loaded state from cloud (last updated: ${data.updated_at})`);
      return data.data;
    }
    return null;
  } catch (err: any) {
    console.error('[Supabase] Exception while fetching state:', err.message);
    return null;
  }
}

export async function saveCloudState(payload: any): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('hanura_casa_state')
      .upsert({
        id: 'primary_state',
        data: payload,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('[Supabase] Failed to sync state to cloud:', error.message);
      return false;
    }
    console.log('[Supabase] Cloud state snapshot successfully updated.');
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception while saving state to cloud:', err.message);
    return false;
  }
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  url?: string;
  message: string;
  tableCount?: number;
  tables?: Record<string, boolean>;
}> {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key || !url.startsWith('http')) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials not configured in environment variables. Please provide SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      configured: true,
      url,
      message: 'Failed to initialize Supabase client with provided credentials.'
    };
  }

  try {
    const tableStatus = await getExistingSupabaseTables();
    const createdTables = Object.entries(tableStatus).filter(([_, exists]) => exists).map(([tbl]) => tbl);

    if (createdTables.length > 0) {
      return {
        connected: true,
        configured: true,
        url,
        message: `Connected to Supabase! (${createdTables.length} tables active: ${createdTables.slice(0, 5).join(', ')}${createdTables.length > 5 ? '...' : ''})`,
        tableCount: createdTables.length,
        tables: tableStatus
      };
    }

    return {
      connected: true,
      configured: true,
      url,
      message: 'Connected to Supabase! Ready to create project tables.',
      tableCount: 0,
      tables: tableStatus
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      url,
      message: `Failed to connect: ${err.message}`
    };
  }
}
