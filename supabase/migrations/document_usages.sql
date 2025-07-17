-- Create document_usages table to track document analysis history
CREATE TABLE IF NOT EXISTS public.document_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_size INTEGER, -- Size in bytes
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost DECIMAL(10, 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.document_usages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own document usages
CREATE POLICY "Users can view their own document usages" ON public.document_usages
  FOR SELECT USING (auth.uid() = user_id); 