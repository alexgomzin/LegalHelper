import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== PADDLE WEBHOOK RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Full body:', JSON.stringify(req.body, null, 2));
    
    // Verify the webhook signature (if needed)
    // This is a simplified example, in production you would verify using Paddle's public key
    // const isValidSignature = verifyPaddleWebhook(req.body);
    // if (!isValidSignature) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const { event_type, data } = req.body;
    console.log('Event type:', event_type);
    console.log('Event data:', JSON.stringify(data, null, 2));

    // Handle different webhook events (Paddle Billing format)
    switch (event_type) {
      case 'transaction.completed':
        // One-time purchase completed (credits, pay-per-document)
        await handleTransactionCompleted(data);
        break;

      case 'subscription.created':
        // New subscription created
        await handleSubscriptionCreated(data.id, data.custom_data?.user_id, data.customer_id);
        break;

      case 'subscription.updated':
        // Subscription details updated
        await handleSubscriptionUpdated(data.id, data.status);
        break;

      case 'subscription.canceled':
        // Subscription cancelled
        await handleSubscriptionCancelled(data.id);
        break;

      case 'subscription.past_due':
        // Subscription payment failed and is now past due
        await handleSubscriptionPaymentFailed(data.id);
        break;

      default:
        // Log unknown event but still return 200 to acknowledge
        console.log('Unknown webhook event:', event_type);
    }

    // Always return a 200 response to acknowledge receipt of the webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to acknowledge receipt, otherwise Paddle will retry
    return res.status(200).json({ success: false, error: 'Error processing webhook' });
  }
}

// Helper function to handle completed transactions (one-time purchases)
async function handleTransactionCompleted(transactionData: any) {
  console.log('=== HANDLING TRANSACTION COMPLETED ===');
  console.log('Transaction data:', JSON.stringify(transactionData, null, 2));
  
  const { id: transactionId, customer_id, items, custom_data } = transactionData;
  const userId = custom_data?.user_id;

  console.log('Extracted data:', { transactionId, customer_id, userId });
  console.log('Custom data:', JSON.stringify(custom_data, null, 2));

  if (!userId) {
    console.error('❌ No user_id found in transaction custom_data!');
    console.error('Transaction ID:', transactionId);
    console.error('Custom data received:', custom_data);
    return;
  }

  console.log('✅ Found user_id:', userId);

  // Get user details
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.log('User not found for transaction:', transactionId);
    return;
  }

  // Calculate credits based on items purchased
  let creditsToAdd = 0;
  let totalAmount = 0;

  for (const item of items) {
    const productId = item.price?.id;
    
    if (productId === process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT) {
      creditsToAdd += 1;
      totalAmount += 1.50;
    } else if (productId === process.env.NEXT_PUBLIC_PADDLE_5_PACK) {
      creditsToAdd += 5;
      totalAmount += 5.50;
    } else if (productId === process.env.NEXT_PUBLIC_PADDLE_15_PACK) {
      creditsToAdd += 15;
      totalAmount += 12.00;
    } else if (productId === process.env.NEXT_PUBLIC_PADDLE_30_PACK) {
      creditsToAdd += 30;
      totalAmount += 22.50;
    }
  }

  if (creditsToAdd > 0) {
    console.log(`💰 Adding ${creditsToAdd} credits to user ${userId}`);
    const oldCredits = user.credits_remaining || 0;
    const newCredits = oldCredits + creditsToAdd;
    
    // Update user credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        credits_remaining: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Failed to update user credits:', updateError);
      throw updateError;
    }

    console.log(`✅ Credits updated: ${oldCredits} → ${newCredits}`);

    // Log the transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      product_id: items[0]?.price?.id || 'unknown',
      amount: totalAmount,
      checkout_id: transactionId,
      transaction_type: 'purchase',
      created_at: new Date().toISOString(),
    });

    if (txError) {
      console.error('❌ Failed to log transaction:', txError);
    } else {
      console.log('✅ Transaction logged successfully');
    }

    // Store the purchase record
    const { error: purchaseError } = await supabase.from('user_purchases').insert({
      user_id: userId,
      checkout_id: transactionId,
      product_id: items[0]?.price?.id || 'unknown',
      credits_purchased: creditsToAdd,
      amount_paid: totalAmount,
      purchase_date: new Date().toISOString(),
      status: 'completed'
    });

    if (purchaseError) {
      console.error('❌ Failed to log purchase:', purchaseError);
    } else {
      console.log('✅ Purchase logged successfully');
    }
  } else {
    console.error('❌ No credits to add! Product ID not recognized or invalid');
  }

  // Log the event
  await logWebhookEvent('transaction.completed', { transactionId, userId, creditsToAdd });
}

// Helper function to handle subscription creation
async function handleSubscriptionCreated(subscriptionId: string, userId: string, customerId: string) {
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'pro',
      subscription_status: 'active',
      subscription_start_date: now.toISOString(),
      subscription_end_date: endDate.toISOString(),
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: customerId,
      updated_at: now.toISOString(),
    })
    .eq('id', userId);

  // Log the event
  await logWebhookEvent('subscription_created', { subscriptionId, userId, customerId });
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdated(subscriptionId: string, status: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('paddle_subscription_id', subscriptionId);

  if (!profiles || profiles.length === 0) {
    console.log(`No user found with subscription ID: ${subscriptionId}`);
    return;
  }

  const userId = profiles[0].id;

  await supabase
    .from('profiles')
    .update({
      subscription_status: mapPaddleStatusToInternal(status),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Log the event
  await logWebhookEvent('subscription_updated', { subscriptionId, status, userId });
}

// Helper function to handle subscription cancellations
async function handleSubscriptionCancelled(subscriptionId: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('paddle_subscription_id', subscriptionId);

  if (!profiles || profiles.length === 0) {
    console.log(`No user found with subscription ID: ${subscriptionId}`);
    return;
  }

  const userId = profiles[0].id;

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Log the event
  await logWebhookEvent('subscription_cancelled', { subscriptionId, userId });
}

// Helper function to handle successful subscription payments
async function handleSubscriptionPaymentSucceeded(subscriptionId: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, subscription_end_date')
    .eq('paddle_subscription_id', subscriptionId);

  if (!profiles || profiles.length === 0) {
    console.log(`No user found with subscription ID: ${subscriptionId}`);
    return;
  }

  const userId = profiles[0].id;
  const currentEndDate = new Date(profiles[0].subscription_end_date);
  
  // Extend subscription by one month
  const newEndDate = new Date(currentEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + 1);

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_end_date: newEndDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Log the event
  await logWebhookEvent('subscription_payment_succeeded', { subscriptionId, userId });
}

// Helper function to handle failed subscription payments
async function handleSubscriptionPaymentFailed(subscriptionId: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('paddle_subscription_id', subscriptionId);

  if (!profiles || profiles.length === 0) {
    console.log(`No user found with subscription ID: ${subscriptionId}`);
    return;
  }

  const userId = profiles[0].id;

  // Don't change the subscription status yet, but log the failure
  // Paddle will typically retry payments

  // Log the event
  await logWebhookEvent('subscription_payment_failed', { subscriptionId, userId });
}

// Helper function to log webhook events
async function logWebhookEvent(eventType: string, data: any) {
  await supabase.from('webhook_logs').insert({
    event_type: eventType,
    event_data: data,
    created_at: new Date().toISOString(),
  });
}

// Helper function to map Paddle status to our internal status
function mapPaddleStatusToInternal(paddleStatus: string): 'active' | 'inactive' | 'trial' {
  switch (paddleStatus.toLowerCase()) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'active'; // Still active but past due
    case 'paused':
    case 'deleted':
    case 'canceled':
      return 'inactive';
    default:
      return 'inactive';
  }
}

// Helper function to verify Paddle webhook (simplified example)
// In production, you would implement proper signature verification
function verifyPaddleWebhook(payload: any): boolean {
  // This is a placeholder for actual verification logic
  // https://developer.paddle.com/webhook-reference/verifying-webhooks
  return true;
} 