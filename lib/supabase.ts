import { createClient } from "@supabase/supabase-js"

// Create a custom supabase client for server-side operations
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server credentials are not configured")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Create a client for client-side operations (with public anon key)
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser credentials are not configured")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

