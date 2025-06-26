import { createClient } from '@supabase/supabase-js'

// Set to false to enable real Supabase authentication
const isMockMode = false

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'

if (!isMockMode && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase URL or Anon Key is missing. Authentication will not work properly.')
}

// Create the client-side Supabase client (for browser usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create the server-side Supabase client (for API routes with service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// User type definition based on Supabase auth
export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at?: string
  
  // Monetization fields
  credits_remaining?: number
  subscription_tier?: 'free' | 'credits' | 'pro'
  subscription_status?: 'active' | 'inactive' | 'trial'
  subscription_start_date?: string
  subscription_end_date?: string
  paddle_subscription_id?: string
  paddle_customer_id?: string
} 