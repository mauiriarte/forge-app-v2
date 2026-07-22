import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Supabase project "Forger". The publishable key is safe to ship in the client
// bundle — it is public by design and all access is gated by row-level security
// (each user can only touch rows where auth.uid() = user_id). Overridable via
// env for local/staging projects.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://ydbojinuugfvwkfgyswl.supabase.co'
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_OZiuYsXSSmxpRqcDsLyr8A_NvUI-JUf'

/** Null only if both the constants and env are blank (local-only fallback). */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null
