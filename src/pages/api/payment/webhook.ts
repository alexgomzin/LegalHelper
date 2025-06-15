import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the webhook signature (if needed)
    // This is a simplified example, in production you would verify using Paddle's public key
    // const isValidSignature = verifyPaddleWebhook(req.body);
    // if (!isValidSignature) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const { alert_name, subscription_id, status, user_id, customer_id } = req.body;

    // Handle different webhook events
    switch (alert_name) {
      case 'subscription_created':
        // New subscription created
        await handleSubscriptionCreated(subscription_id, user_id, customer_id);
        break;

      case 'subscription_updated':
        // Subscription details updated
        await handleSubscriptionUpdated(subscription_id, status);
        break;

      case 'subscription_cancelled':
        // Subscription cancelled
        await handleSubscriptionCancelled(subscription_id);
        break;

      case 'subscription_payment_succeeded':
        // Payment for the subscription succeeded
        await handleSubscriptionPaymentSucceeded(subscription_id);
        break;

      case 'subscription_payment_failed':
        // Payment for the subscription failed
        await handleSubscriptionPaymentFailed(subscription_id);
        break;

      default:
        // Log unknown event but still return 200 to acknowledge
        console.log('Unknown webhook event:', alert_name);
    }

    // Always return a 200 response to acknowledge receipt of the webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to acknowledge receipt, otherwise Paddle will retry
    return res.status(200).json({ success: false, error: 'Error processing webhook' });
  }
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