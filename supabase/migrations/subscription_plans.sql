-- Create a plans table for available subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price_usd INTEGER NOT NULL, -- Price in cents
  documents_included INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the plans from the monetization strategy
INSERT INTO public.subscription_plans (name, price_usd, documents_included, description)
VALUES 
  ('Free Trial', 0, 1, 'One free document analysis to try the service'),
  ('Pay-as-you-go', 150, 1, 'Pay $1.50 per document analysis'),
  ('5 Analyses Pack', 550, 5, 'Pack of 5 analyses – $0.90 per analysis'),
  ('15 Analyses Pack', 1200, 15, 'Pack of 15 analyses – $0.80 per analysis'),
  ('Bulk Subscription', 3000, 50, '50 analyses per month – $0.60 per analysis')
ON CONFLICT (name) DO UPDATE SET
  price_usd = EXCLUDED.price_usd,
  documents_included = EXCLUDED.documents_included,
  description = EXCLUDED.description,
  updated_at = NOW(); 