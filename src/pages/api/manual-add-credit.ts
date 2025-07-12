import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, credits = 1 } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`Manually adding ${credits} credits to ${email}`);
    
    // Find user by email
    const { data: profiles, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    if (findError) {
      console.error('Error finding user:', findError);
      return res.status(500).json({ error: 'Failed to find user', details: findError });
    }
    
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = profiles[0];
    const currentCredits = user.credits_remaining || 0;
    const newCredits = currentCredits + credits;
    
    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        credits_remaining: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error updating credits:', updateError);
      return res.status(500).json({ error: 'Failed to update credits', details: updateError });
    }
    
    // Log the manual addition
    const { error: logError } = await supabase.from('transactions').insert({
      user_id: user.id,
      product_id: 'MANUAL_ADDITION',
      amount: 0,
      checkout_id: `manual-${Date.now()}`,
      transaction_type: 'manual_credit',
      created_at: new Date().toISOString(),
    });
    
    if (logError) {
      console.error('Error logging manual addition:', logError);
    }
    
    console.log(`✅ Successfully added ${credits} credits to ${email}. New balance: ${newCredits}`);
    
    return res.status(200).json({
      success: true,
      user_id: user.id,
      email: user.email,
      credits_added: credits,
      old_balance: currentCredits,
      new_balance: newCredits
    });
    
  } catch (error) {
    console.error('Error in manual add credit:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 