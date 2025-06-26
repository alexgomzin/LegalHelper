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

    console.log(`=== TEST WEBHOOK: Adding ${credits} credit(s) to ${email} ===`);
    
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
      return res.status(404).json({ error: 'User not found with email: ' + email });
    }
    
    const user = profiles[0];
    const currentCredits = user.credits_remaining || 0;
    const newCredits = currentCredits + credits;
    
    console.log(`User found: ${user.id}, current credits: ${currentCredits}, adding: ${credits}`);
    
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
    
    // Log the test transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      product_id: 'TEST_CREDIT_ADD',
      amount: 1.50,
      checkout_id: 'test-' + Date.now(),
      transaction_type: 'test',
      created_at: new Date().toISOString(),
    });
    
    console.log(`✅ Successfully added ${credits} credits to ${email}. New balance: ${newCredits}`);
    
    return res.status(200).json({
      success: true,
      user_id: user.id,
      email: user.email,
      credits_added: credits,
      old_balance: currentCredits,
      new_balance: newCredits,
      message: 'Credits added successfully! You can now analyze documents.'
    });
    
  } catch (error) {
    console.error('Error in test webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 