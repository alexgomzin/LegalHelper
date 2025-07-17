import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, checkout_id } = req.body;

    if (!user_id || !checkout_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add 1 credit to the user's account
    await supabase
      .from('profiles')
      .update({
        credits_remaining: (user.credits_remaining || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    // Log the transaction
    await supabase.from('transactions').insert({
      user_id,
      product_id: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'PAY_PER_DOCUMENT',
      amount: 1.50, // $1.50 per document
      checkout_id,
      created_at: new Date().toISOString(),
    });

    // Store the purchase in our database
    const { error: insertError } = await supabase
      .from('user_purchases')
      .insert({
        user_id,
        checkout_id,
        product_id: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'PAY_PER_DOCUMENT',
        credits_purchased: 1,
        amount_paid: 1.50, // $1.50 for pay-per-document
        purchase_date: new Date().toISOString(),
        status: 'completed'
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 