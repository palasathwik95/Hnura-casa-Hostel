import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
              process.env.SUPABASE_ANON_KEY || 
              process.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: url.trim(), key: key.trim() };
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

export const SUPABASE_SQL_SCHEMA = `-- Run this in your Supabase SQL Editor to prepare the database table:
CREATE TABLE IF NOT EXISTS hanura_casa_state (
  id TEXT PRIMARY KEY DEFAULT 'primary_state',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and grant access
ALTER TABLE hanura_casa_state ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hanura_casa_state' AND policyname = 'Enable all operations for hanura_casa_state'
  ) THEN
    CREATE POLICY "Enable all operations for hanura_casa_state" ON hanura_casa_state
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
`;

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
      // If table doesn't exist yet, we log and return null
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
    console.log('[Supabase] Cloud state successfully updated.');
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
    // Attempt a light ping by querying the table or schema
    const { data, error } = await supabase
      .from('hanura_casa_state')
      .select('id')
      .limit(1);

    if (error) {
      // 42P01 is relation does not exist in postgres
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          connected: true,
          configured: true,
          url,
          message: 'Connected to Supabase! The "hanura_casa_state" table has not been created yet. Please execute the provided SQL setup script.'
        };
      }
      return {
        connected: false,
        configured: true,
        url,
        message: `Supabase returned an error: ${error.message}`
      };
    }

    return {
      connected: true,
      configured: true,
      url,
      message: 'Connected and synchronized with Supabase cloud database!'
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
