import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== WEBHOOK DEBUG CHECK ===');
    
    // Check if webhook_logs table exists and has recent entries
    const { data: webhookLogs, error: webhookError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Check recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Check recent purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('user_purchases')
      .select('*')
      .order('purchase_date', { ascending: false })
      .limit(5);
    
    // Check all user profiles to see credit balances
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, credits_remaining, subscription_tier, updated_at')
      .order('updated_at', { ascending: false });
    
    const result = {
      webhook_configured: process.env.NEXT_PUBLIC_PADDLE_WEBHOOK_URL || 'Not configured',
      webhook_logs: webhookLogs || [],
      recent_transactions: transactions || [],
      recent_purchases: purchases || [],
      user_profiles: profiles || [],
      errors: {
        webhook_logs: webhookError?.message,
        transactions: txError?.message,
        purchases: purchaseError?.message,
        profiles: profileError?.message
      },
      paddle_config: {
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
        vendor_id: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
        webhook_url: process.env.NEXT_PUBLIC_PADDLE_WEBHOOK_URL,
        has_api_key: !!process.env.PADDLE_API_KEY
      }
    };
    
    console.log('Debug result:', JSON.stringify(result, null, 2));
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in webhook debug:', error);
    return res.status(500).json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 