import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
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
  const { data: user, error: userError } = await supabaseAdmin
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
    const { error: updateError } = await supabaseAdmin
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
    const { error: txError } = await supabaseAdmin.from('transactions').insert({
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
    const { error: purchaseError } = await supabaseAdmin.from('user_purchases').insert({
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
  console.log('=== HANDLING SUBSCRIPTION CREATED ===');
  console.log('Subscription data:', { subscriptionId, userId, customerId });

  if (!userId) {
    console.error('❌ No user_id found in subscription creation!');
    return;
  }

  // Get current user data
  const { data: user, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('❌ User not found for subscription:', subscriptionId);
    return;
  }

  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

  // Add 50 credits for new subscription + set subscription status
  const oldCredits = user.credits_remaining || 0;
  const newCredits = oldCredits + 50;

  console.log(`💰 Adding 50 subscription credits to user ${userId}`);
  console.log(`Credits: ${oldCredits} → ${newCredits}`);

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      credits_remaining: newCredits,
      subscription_tier: 'pro',
      subscription_status: 'active',
      subscription_start_date: now.toISOString(),
      subscription_end_date: endDate.toISOString(),
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: customerId,
      updated_at: now.toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    console.error('❌ Failed to update subscription user:', updateError);
    throw updateError;
  }

  console.log('✅ Subscription created and 50 credits added successfully');

  // Log the transaction
  const { error: txError } = await supabaseAdmin.from('transactions').insert({
    user_id: userId,
    product_id: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION || 'subscription',
    amount: 30.00,
    checkout_id: subscriptionId,
    transaction_type: 'subscription',
    created_at: now.toISOString(),
  });

  if (txError) {
    console.error('❌ Failed to log subscription transaction:', txError);
  } else {
    console.log('✅ Subscription transaction logged successfully');
  }

  await logWebhookEvent('subscription.created', { subscriptionId, userId, customerId, creditsAdded: 50 });
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscriptionId: string, status: string) {
  // Find user by subscription ID
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  if (user) {
    const mappedStatus = mapPaddleStatusToInternal(status);
    
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: mappedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  await logWebhookEvent('subscription.updated', { subscriptionId, status });
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscriptionId: string) {
  // Find user by subscription ID
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  if (user) {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'inactive',
        subscription_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  await logWebhookEvent('subscription.cancelled', { subscriptionId });
}

// Handle successful subscription payment (monthly renewal)
async function handleSubscriptionPaymentSucceeded(subscriptionId: string) {
  console.log('=== HANDLING SUBSCRIPTION PAYMENT SUCCESS ===');
  console.log('Subscription ID:', subscriptionId);

  // Find user by subscription ID and ensure subscription is active
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  if (user) {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Extend by 1 month

    // Add 50 credits for monthly renewal
    const oldCredits = user.credits_remaining || 0;
    const newCredits = oldCredits + 50;

    console.log(`💰 Adding 50 monthly renewal credits to user ${user.id}`);
    console.log(`Credits: ${oldCredits} → ${newCredits}`);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits_remaining: newCredits,
        subscription_status: 'active',
        subscription_end_date: endDate.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Failed to update subscription renewal:', updateError);
    } else {
      console.log('✅ Subscription renewed and 50 credits added successfully');
    }

    // Log the renewal transaction
    const { error: txError } = await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      product_id: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION || 'subscription',
      amount: 30.00,
      checkout_id: subscriptionId,
      transaction_type: 'subscription-renewal',
      created_at: now.toISOString(),
    });

    if (txError) {
      console.error('❌ Failed to log subscription renewal:', txError);
    }
  }

  await logWebhookEvent('subscription.payment_succeeded', { subscriptionId, creditsAdded: 50 });
}

// Handle failed subscription payment
async function handleSubscriptionPaymentFailed(subscriptionId: string) {
  // Find user by subscription ID
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  if (user) {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  await logWebhookEvent('subscription.payment_failed', { subscriptionId });
}

// Helper function to log webhook events
async function logWebhookEvent(eventType: string, data: any) {
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      event_type: eventType,
      payload: data,
      status: 'processed',
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

// Helper function to map Paddle status to internal status
function mapPaddleStatusToInternal(paddleStatus: string): 'active' | 'inactive' | 'trial' {
  switch (paddleStatus.toLowerCase()) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'paused':
    case 'past_due':
    case 'canceled':
    default:
      return 'inactive';
  }
}

// Helper function for webhook signature verification (placeholder)
function verifyPaddleWebhook(payload: any): boolean {
  // In production, implement proper signature verification
  // using Paddle's public key and the webhook signature
  return true; // For now, always return true
} 