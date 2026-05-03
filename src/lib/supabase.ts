// Cliente Supabase. La publishable key es pública y va al cliente — la
// seguridad la garantizan las políticas RLS definidas en la BD, no la clave.
//
// Si en algún momento quieres mover esto a env vars: en Astro bastaría con
// PUBLIC_SUPABASE_URL/PUBLIC_SUPABASE_ANON_KEY y leer import.meta.env.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://macfaiumkuoymjfzkbof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JR02M9XXxdaQYWCgUOzyMg_Zscb2TDW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'tucompra:auth',
  },
});

/** Tipos de las filas que usamos. Coinciden con el SQL del paso 2. */
export interface SnapshotRow {
  share_id: string;
  snapshot: string;        // ciphertext base64 (AES-GCM)
  updated_at: string;      // ISO timestamp
  updated_by: string | null;
}

export interface MemberRow {
  share_id: string;
  user_id: string;
  added_at: string;
}
