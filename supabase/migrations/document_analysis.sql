-- Create document_analysis table to store document analysis results
CREATE TABLE IF NOT EXISTS public.document_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_id TEXT NOT NULL, -- The client-side generated ID for reference
  status TEXT NOT NULL, -- 'Processing', 'Analyzed', 'Error'
  analysis JSONB, -- Stores the full analysis results as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Enforce unique constraint on user_id + document_id
  UNIQUE(user_id, document_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own document analysis
CREATE POLICY "Users can view their own document analysis" ON public.document_analysis
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own document analysis
CREATE POLICY "Users can insert their own document analysis" ON public.document_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own document analysis
CREATE POLICY "Users can update their own document analysis" ON public.document_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own document analysis
CREATE POLICY "Users can delete their own document analysis" ON public.document_analysis
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster document lookup
CREATE INDEX idx_document_analysis_user_id ON public.document_analysis (user_id);
CREATE INDEX idx_document_analysis_document_id ON public.document_analysis (document_id); 