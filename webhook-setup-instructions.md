# Paddle Webhook Setup Instructions

## Problem
Your payment is completing successfully in Paddle, but the credits aren't being added to your account because Paddle isn't notifying your server when transactions complete.

## Solution: Configure Paddle Webhooks

### Step 1: Login to Paddle Dashboard
1. Go to https://sandbox-vendors.paddle.com/ (for sandbox)
2. Login with your Paddle account

### Step 2: Configure Webhook Endpoint
1. Navigate to **Developer Tools** → **Notifications** (or **Webhooks**)
2. Click **Add Endpoint** or **New Webhook**
3. Enter webhook URL: `https://legalhelper.onrender.com/api/payment/webhook`
4. Select these events:
   - ✅ `transaction.completed` (for one-time purchases)
   - ✅ `subscription.created` (if you have subscriptions)
   - ✅ `subscription.updated` (if you have subscriptions)
   - ✅ `subscription.payment_succeeded` (if you have subscriptions)

### Step 3: Test the Webhook
1. Save the webhook configuration
2. Make a test purchase (even $1.50 for single analysis)
3. Check your server logs to see if webhook is received

### Step 4: Verify Setup
After making a test purchase, you should see:
1. Payment completes in Paddle ✅
2. Webhook received in server logs ✅
3. Credits added to your account ✅
4. You can now analyze documents ✅

## If Webhooks Still Don't Work

### Option A: Manual Credit Addition
Use this temporary endpoint to add credits while troubleshooting webhooks:

```bash
curl -X POST https://legalhelper.onrender.com/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@domain.com", "credits": 1}'
```

### Option B: Check Webhook Logs
1. In Paddle Dashboard → Developer Tools → Notifications
2. Check the webhook delivery logs
3. Look for failed deliveries or errors

## Important Notes
- Webhooks are the **proper** way to handle payment completion
- Client-side success callbacks are unreliable
- Webhooks ensure credits are added even if user closes browser
- Always use webhooks for financial transactions

## Current Status
Your Paddle checkout is working perfectly! The only missing piece is the webhook configuration to notify your server when payments complete. 