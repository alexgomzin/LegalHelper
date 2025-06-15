import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { checkout_id, user_id, product_id } = req.body;

    if (!checkout_id || !user_id || !product_id) {
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

    // Determine what was purchased based on product_id
    switch (product_id) {
      case 'PRODUCT_ID_5_PACK':
        // Add 5 credits to the user's account
        await supabase
          .from('profiles')
          .update({
            credits_remaining: (user.credits_remaining || 0) + 5,
            subscription_tier: 'credits',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);
        break;

      case 'PRODUCT_ID_15_PACK':
        // Add 15 credits to the user's account
        await supabase
          .from('profiles')
          .update({
            credits_remaining: (user.credits_remaining || 0) + 15,
            subscription_tier: 'credits',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);
        break;

      case 'PRODUCT_ID_30_PACK':
        // Add 30 credits to the user's account
        await supabase
          .from('profiles')
          .update({
            credits_remaining: (user.credits_remaining || 0) + 30,
            subscription_tier: 'credits',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);
        break;

      case 'PRODUCT_ID_50_PACK_SUBSCRIPTION':
        // Set up 50-pack subscription
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        await supabase
          .from('profiles')
          .update({
            credits_remaining: (user.credits_remaining || 0) + 50,
            subscription_tier: 'subscription',
            subscription_status: 'active',
            subscription_start_date: now.toISOString(),
            subscription_end_date: endDate.toISOString(),
            paddle_subscription_id: checkout_id,
            updated_at: now.toISOString(),
          })
          .eq('id', user_id);
        break;



      default:
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Log the transaction in a separate transactions table if needed
    // This is optional but good for tracking purchases
    await supabase.from('transactions').insert({
      user_id,
      product_id,
      amount: getProductAmount(product_id),
      checkout_id,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to get the amount for a product
function getProductAmount(productId: string): number {
  switch (productId) {
    case 'PRODUCT_ID_5_PACK':
      return 5.50;
    case 'PRODUCT_ID_15_PACK':
      return 12.00;
    case 'PRODUCT_ID_30_PACK':
      return 22.50;
    case 'PRODUCT_ID_50_PACK_SUBSCRIPTION':
      return 30.00;

    default:
      return 0;
  }
} 