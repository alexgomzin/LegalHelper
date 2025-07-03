import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== PAYMENT CONFIRM DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Environment variables:', {
      PAY_PER_DOCUMENT: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
      PACK_5: process.env.NEXT_PUBLIC_PADDLE_5_PACK,
      PACK_15: process.env.NEXT_PUBLIC_PADDLE_15_PACK,
      PACK_30: process.env.NEXT_PUBLIC_PADDLE_30_PACK,
      SUBSCRIPTION: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION
    });

    const { user_id, checkout_id, product_id } = req.body;

    console.log('Extracted fields:', { user_id, checkout_id, product_id });

    if (!user_id || !checkout_id || !product_id) {
      console.log('Missing fields check:', {
        has_user_id: !!user_id,
        has_checkout_id: !!checkout_id,
        has_product_id: !!product_id
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { user_id, checkout_id, product_id },
        required: ['user_id', 'checkout_id', 'product_id']
      });
    }

    // Verify the user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine credits and amount based on product ID
    let creditsToAdd = 0;
    let amount = 0;
    let isSubscription = false;

    console.log('Processing product_id:', product_id);

    if (product_id === process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT) {
      creditsToAdd = 1;
      amount = 1.50;
    } else if (product_id === process.env.NEXT_PUBLIC_PADDLE_5_PACK) {
      creditsToAdd = 5;
      amount = 5.50;
    } else if (product_id === process.env.NEXT_PUBLIC_PADDLE_15_PACK) {
      creditsToAdd = 15;
      amount = 12.00;
    } else if (product_id === process.env.NEXT_PUBLIC_PADDLE_30_PACK) {
      creditsToAdd = 30;
      amount = 22.50;
    } else if (product_id === process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION) {
      creditsToAdd = 50;
      amount = 30.00;
      isSubscription = true;
    } else {
      console.error('Unrecognized product_id:', product_id);
      return res.status(400).json({ 
        error: 'Invalid product ID', 
        received: product_id,
        expected_options: {
          pay_per_document: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
          pack_5: process.env.NEXT_PUBLIC_PADDLE_5_PACK,
          pack_15: process.env.NEXT_PUBLIC_PADDLE_15_PACK,
          pack_30: process.env.NEXT_PUBLIC_PADDLE_30_PACK,
          subscription: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION
        }
      });
    }

    // Update user's credits
    const updateData: any = {
      credits_remaining: (user.credits_remaining || 0) + creditsToAdd,
      updated_at: new Date().toISOString(),
    };

    // If it's a subscription, update subscription fields
    if (isSubscription) {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      updateData.subscription_tier = 'pro';
      updateData.subscription_status = 'active';
      updateData.subscription_start_date = now.toISOString();
      updateData.subscription_end_date = endDate.toISOString();
      updateData.paddle_subscription_id = checkout_id; // Temporary, will be updated by webhook
    }

    await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user_id);

    // Log the transaction
    await supabaseAdmin.from('transactions').insert({
      user_id,
      product_id,
      amount,
      checkout_id,
      transaction_type: isSubscription ? 'subscription' : 'purchase',
      created_at: new Date().toISOString(),
    });

    // Store the purchase in our database
    await supabaseAdmin.from('user_purchases').insert({
      user_id,
      checkout_id,
      product_id,
      credits_purchased: creditsToAdd,
      amount_paid: amount,
      purchase_date: new Date().toISOString(),
      status: 'completed'
    });

    return res.status(200).json({ 
      success: true, 
      credits_added: creditsToAdd,
      new_total: (user.credits_remaining || 0) + creditsToAdd
    });
  } catch (error) {
    console.error('Error processing payment confirmation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 