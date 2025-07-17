# Monetization Strategy for Legal-Helper App (Paddle Integration)

## Summary

This file describes the monetization logic for the Legal-Helper platform. The app allows users to upload legal documents and get a GPT-based risk analysis, recommendations, and a summary. Each analysis request consumes OpenAI API tokens, so monetization is essential. We will use [Paddle](https://paddle.com) to manage global payments (subscriptions and credits), as it's suitable for developers in Russia with access to a bank account in a supported country (e.g., Kyrgyzstan, Turkey, etc.).

---

## Tiers & Pricing

### 1. Free Tier and Pay as you go (One-Time Only)
- **Available only after registration**
- **Includes 1 free document analysis**
- **$1,5 per document (Pay-as-you-go)**

- Purpose: help the user test the value of the service before purchasing anything

---

### 2. Product (One-Time Payment)
- **Pack of 5 analyses – $5.50** ($0,9 per analysis)
- **Pack of 15 analyses – $12.00** ($0,8 per analysis)

### 2. Subscription 
- **Pack of 50 analyses – $30.00** ($0,6 per analysis)
-


---


---

## How to Integrate Paddle

### Step 1: Create a Paddle Account
- Go to [Paddle.com](https://paddle.com) and create an account
- Set up your profile with:
  - A valid **bank account** from Kyrgyzstan (or other supported country)
  - A verified **identity document**
  - Add your **website URL** and business model info

---

### Step 2: Add Products in Paddle Dashboard
1. Create 4 products:
   - "1 Document Analyses" (Pay-as you go, One-Time)
   - "5 Document Analyses" (One-Time)
   - "15 Document Analyses" (One-Time)
   - "50 Document Analyses" (One-Time)
2. Create 1 subscription plan:
   - "Legal Pro Plan – 50 analyses/month"

---

### Step 3: Frontend Integration
- Add **Paddle Checkout SDK** to your site
  ```html
  <script src="https://cdn.paddle.com/paddle/paddle.js"></script>
  <script>
    Paddle.Setup({ vendor: YOUR_VENDOR_ID });
  </script>
