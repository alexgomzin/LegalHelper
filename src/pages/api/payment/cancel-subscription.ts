import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, subscription_id } = req.body;

    if (!user_id || !subscription_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the user exists and has this subscription
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .eq('paddle_subscription_id', subscription_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User or subscription not found' });
    }

    // In a real implementation, you would call Paddle's API to cancel the subscription
    // This is a simplified version that just updates the database

    // Update the user's subscription status
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    // Log the cancellation in the webhook_logs table
    await supabase.from('webhook_logs').insert({
      event_type: 'subscription_cancelled_manually',
      event_data: {
        user_id,
        subscription_id,
        cancelled_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 