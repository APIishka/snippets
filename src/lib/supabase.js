import { createClient } from '@supabase/supabase-js';

/**
 * Required .env:
 *   VITE_SUPABASE_URL=       Supabase project URL
 *   VITE_SUPABASE_ANON_KEY=  Supabase anon/public key
 *   VITE_ADMIN_EMAIL=        Email of the one Auth user used as "password gate" for adding snippets
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
