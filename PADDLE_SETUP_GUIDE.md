# Paddle Integration Setup Guide

## Overview
This guide will help you complete the Paddle payment integration for your LegalHelper application.

## ✅ What's Already Completed

1. **Frontend Components**
   - PaddleProvider component for SDK loading
   - Test page for Paddle functionality
   - Checkout page with Paddle integration
   - Pricing page with purchase buttons

2. **Backend APIs**
   - Webhook handler for payment events
   - Pay-per-document API endpoint
   - Purchase confirmation API
   - Test API for configuration validation

3. **Database Schema**
   - User profiles with Paddle fields
   - Payment tracking tables
   - Webhook logging system

## 🔧 What You Need To Do Next

### Step 1: Update Your Render Environment Variables

Make sure all these environment variables are set in your Render dashboard:

```bash
# Paddle Configuration
NEXT_PUBLIC_PADDLE_VENDOR_ID=YOUR_VENDOR_ID_HERE
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox  # or 'production' for live
NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT=YOUR_PRODUCT_ID_HERE
NEXT_PUBLIC_PADDLE_5_PACK=YOUR_PRODUCT_ID_HERE
NEXT_PUBLIC_PADDLE_15_PACK=YOUR_PRODUCT_ID_HERE
NEXT_PUBLIC_PADDLE_30_PACK=YOUR_PRODUCT_ID_HERE
NEXT_PUBLIC_PADDLE_SUBSCRIPTION=YOUR_PRODUCT_ID_HERE
```

### Step 2: Configure Webhook in Paddle Dashboard

1. Go to your Paddle Dashboard
2. Navigate to **Developer Tools → Notifications** (not "Webhooks")
3. Click **"+ New destination"** to create a new webhook endpoint
4. Fill in the details:
   - **Description**: "LegalHelper Webhook Handler"
   - **URL**: `https://your-app.onrender.com/api/payment/webhook`
   - **Notification Type**: Select "webhook" from the dropdown
   - **Events**: Select these important events:
     - `transaction.completed` (for one-time purchases)
     - `transaction.created`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.past_due`
     - `payment.succeeded`
     - `payment.failed`
5. **Save destination**

### Important Notes:
- Paddle now calls webhooks "Notifications"
- Make sure to select "webhook" as the notification type (not email)
- Your webhook URL should be publicly accessible
- Start with sandbox/test mode first

### Step 3: Run Database Migrations

Apply the payment-related database migrations:

```bash
# If using Supabase, run the SQL migrations
# The payments.sql file has been updated with all required tables
```

### Step 4: Test the Integration

1. **Test Configuration**: Visit `/api/test-paddle` to verify all environment variables
2. **Test Checkout**: Visit `/test-paddle` to test the payment flow
3. **Test Webhook**: Use Paddle's webhook testing tools

### Step 5: Update Product IDs

Replace the product IDs in your Paddle dashboard with your actual ones:

1. **Pay-per-document**: $1.50 one-time payment
2. **5-pack**: $5.50 for 5 analysis credits
3. **15-pack**: $12.00 for 15 analysis credits
4. **30-pack**: $22.50 for 30 analysis credits
5. **Subscription**: $30.00/month for 50 credits

## 🧪 Testing Checklist

- [ ] Environment variables are all set
- [ ] Paddle SDK loads without errors
- [ ] Checkout opens when clicking purchase buttons
- [ ] Webhooks are configured and receiving events
- [ ] Database tables exist and are accessible
- [ ] Test purchases complete successfully
- [ ] User credits are updated after purchase
- [ ] Subscription status updates properly

## 🚀 Going Live

### Before Production:
1. Change `NEXT_PUBLIC_PADDLE_ENVIRONMENT` to `production`
2. Update all product IDs to production versions
3. Test all payment flows thoroughly
4. Verify webhook endpoints are working
5. Enable Paddle webhook signature verification (optional but recommended)

### Production Webhook Verification:
To enable webhook signature verification in production, uncomment the verification code in `/src/pages/api/payment/webhook.ts` and add your Paddle public key as an environment variable.

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Test the `/api/test-paddle` endpoint
4. Check Paddle dashboard for transaction logs
5. Review webhook logs in your database

## 🔧 API Endpoints

- `/api/test-paddle` - Configuration validation
- `/api/payment/webhook` - Paddle webhook handler
- `/api/payment/pay-per-document` - Single document purchase
- `/api/payment/confirm` - Package/subscription confirmation
- `/test-paddle` - Frontend testing page

## 🎯 Next Steps After Setup

1. Monitor payment success rates
2. Set up email notifications for failed payments
3. Create admin dashboard for payment analytics
4. Implement refund handling if needed
5. Add payment history page for users

## 🔍 Troubleshooting Common Issues

### Paddle SDK Not Loading
- Check vendor ID is correct integer
- Verify environment variables are set
- Check browser console for errors

### Webhook Not Receiving Events
- Verify webhook URL is correct
- Check Paddle dashboard webhook configuration
- Test webhook endpoint manually

### Payments Not Updating User Credits
- Check webhook is processing correctly
- Verify database tables exist
- Check user ID mapping is correct

Remember: Start with sandbox mode and thoroughly test before switching to production! 