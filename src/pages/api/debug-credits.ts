import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== DEBUG CREDITS ENDPOINT ===');
    
    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('Profile error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profiles', details: profileError });
    }
    
    console.log('Found profiles:', profiles?.length || 0);
    
    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (txError) {
      console.error('Transaction error:', txError);
    }
    
    // Get recent purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('user_purchases')
      .select('*')
      .order('purchase_date', { ascending: false })
      .limit(20);
    
    if (purchaseError) {
      console.error('Purchase error:', purchaseError);
    }
    
    // Get webhook logs if they exist
    const { data: webhookLogs, error: webhookError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (webhookError) {
      console.error('Webhook logs error:', webhookError);
    }
    
    const result = {
      profiles: profiles?.map(p => ({
        id: p.id,
        email: p.email,
        credits_remaining: p.credits_remaining,
        subscription_tier: p.subscription_tier,
        created_at: p.created_at,
        updated_at: p.updated_at
      })),
      recent_transactions: transactions || [],
      recent_purchases: purchases || [],
      webhook_logs: webhookLogs || [],
      counts: {
        total_profiles: profiles?.length || 0,
        total_transactions: transactions?.length || 0,
        total_purchases: purchases?.length || 0,
        total_webhook_logs: webhookLogs?.length || 0
      }
    };
    
    console.log('Debug result:', JSON.stringify(result, null, 2));
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 