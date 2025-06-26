import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== SETTING UP DATABASE TABLES ===');
    
    // Create user_purchases table
    const userPurchasesSQL = `
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
    `;
    
    // Create webhook_logs table
    const webhookLogsSQL = `
      CREATE TABLE IF NOT EXISTS public.webhook_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_type TEXT NOT NULL,
          event_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE,
          success BOOLEAN DEFAULT FALSE
      );
    `;
    
    // Add transaction_type column to transactions table
    const transactionsSQL = `
      ALTER TABLE public.transactions 
      ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'purchase';
    `;
    
    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_purchases_checkout_id ON public.user_purchases(checkout_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at);
    `;
    
    // Execute SQL commands
    const { error: purchasesError } = await supabase.rpc('exec_sql', { sql: userPurchasesSQL });
    if (purchasesError) {
      console.error('Error creating user_purchases table:', purchasesError);
    } else {
      console.log('✅ user_purchases table created/verified');
    }
    
    const { error: webhookError } = await supabase.rpc('exec_sql', { sql: webhookLogsSQL });
    if (webhookError) {
      console.error('Error creating webhook_logs table:', webhookError);
    } else {
      console.log('✅ webhook_logs table created/verified');
    }
    
    const { error: transactionsError } = await supabase.rpc('exec_sql', { sql: transactionsSQL });
    if (transactionsError) {
      console.error('Error updating transactions table:', transactionsError);
    } else {
      console.log('✅ transactions table updated');
    }
    
    const { error: indexesError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
    if (indexesError) {
      console.error('Error creating indexes:', indexesError);
    } else {
      console.log('✅ indexes created');
    }
    
    // Alternative approach: Direct table creation using Supabase API
    console.log('Trying alternative approach...');
    
    // Test if tables exist by trying to query them
    const { data: purchasesTest, error: purchasesTestError } = await supabase
      .from('user_purchases')
      .select('id')
      .limit(1);
    
    const { data: webhookTest, error: webhookTestError } = await supabase
      .from('webhook_logs')
      .select('id')
      .limit(1);
    
    const result = {
      success: true,
      tables_status: {
        user_purchases: purchasesTestError ? 'MISSING' : 'EXISTS',
        webhook_logs: webhookTestError ? 'MISSING' : 'EXISTS',
        profiles: 'EXISTS' // We know this exists from earlier
      },
      errors: {
        user_purchases: purchasesError?.message,
        webhook_logs: webhookError?.message,
        transactions: transactionsError?.message,
        indexes: indexesError?.message
      },
      next_steps: [
        'Tables setup attempted',
        'Configure webhook URL in Paddle dashboard',
        'Test webhook endpoint'
      ]
    };
    
    console.log('Database setup result:', result);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error setting up database:', error);
    return res.status(500).json({ 
      error: 'Database setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 