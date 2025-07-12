-- Create missing user_purchases table
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    checkout_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    credits_purchased INTEGER NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    success BOOLEAN DEFAULT FALSE
);

-- Ensure transactions table has the right structure
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'purchase';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_checkout_id ON public.user_purchases(checkout_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at);

-- Enable RLS (Row Level Security) policies if needed
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service role to access these tables
CREATE POLICY IF NOT EXISTS "Allow service role full access to user_purchases" 
ON public.user_purchases FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow service role full access to webhook_logs" 
ON public.webhook_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true); 