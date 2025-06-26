-- Fix service role access to all tables
-- This ensures the API can access the database properly

-- 1. Grant full access to the service role on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 2. Update RLS policies to allow service role access
-- Profiles table
DROP POLICY IF EXISTS "service_role_profiles_policy" ON profiles;
CREATE POLICY "service_role_profiles_policy" ON profiles
FOR ALL USING (
  auth.role() = 'service_role'
  OR auth.uid() = id
);

-- Document usages table  
DROP POLICY IF EXISTS "service_role_document_usages_policy" ON document_usages;
CREATE POLICY "service_role_document_usages_policy" ON document_usages
FOR ALL USING (
  auth.role() = 'service_role'
  OR auth.uid() = user_id
);

-- User purchases table
DROP POLICY IF EXISTS "service_role_user_purchases_policy" ON user_purchases;
CREATE POLICY "service_role_user_purchases_policy" ON user_purchases
FOR ALL USING (
  auth.role() = 'service_role'
  OR auth.uid() = user_id
);

-- Transactions table (if exists)
DROP POLICY IF EXISTS "service_role_transactions_policy" ON transactions;
CREATE POLICY "service_role_transactions_policy" ON transactions
FOR ALL USING (
  auth.role() = 'service_role'
  OR auth.uid() = user_id
);

-- Webhook logs table (if exists)
DROP POLICY IF EXISTS "service_role_webhook_logs_policy" ON webhook_logs;
CREATE POLICY "service_role_webhook_logs_policy" ON webhook_logs
FOR ALL USING (auth.role() = 'service_role');

-- 3. Ensure RLS is enabled but allows service role
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- 4. Check if all tables exist and create missing ones
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  checkout_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  paddle_event_id TEXT UNIQUE,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'received'
);

-- Enable RLS on new tables if they were created
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 