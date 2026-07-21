import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Null when env vars are absent — the app then runs in local-only mode
 * (localStorage), exactly as before the Supabase integration.
 */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null
