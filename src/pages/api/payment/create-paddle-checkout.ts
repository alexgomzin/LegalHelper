import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, customerEmail, successUrl, cancelUrl } = req.body;

    if (!priceId || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields: priceId and customerEmail' });
    }

    console.log('Creating Paddle Billing checkout for:', { priceId, customerEmail });

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;

    if (!vendorId) {
      return res.status(500).json({ error: 'Paddle vendor ID not configured' });
    }

    // Since we don't have Paddle API key configured yet, we'll create a checkout URL
    // that can be used with Paddle.js or try direct API approach
    
    // For testing purposes, let's try creating a transaction first
    const paddleApiUrl = environment === 'production'
      ? 'https://api.paddle.com/transactions'
      : 'https://sandbox-api.paddle.com/transactions';

    // Skip API approach for now due to Default Payment Link requirement
    console.log('Skipping API approach, using direct URL method instead');

    // Try direct Paddle checkout URL approach
    // For Paddle Billing, we need to use their hosted checkout
    const paddleCheckoutUrl = environment === 'production'
      ? 'https://checkout.paddle.com'
      : 'https://sandbox-checkout.paddle.com';
    
    // Try creating a simple checkout URL
    const checkoutUrl = `${paddleCheckoutUrl}/checkout?price_id=${priceId}&customer_email=${encodeURIComponent(customerEmail)}&success_url=${encodeURIComponent(successUrl || 'https://legalhelper.onrender.com/dashboard?purchase=success')}&cancel_url=${encodeURIComponent(cancelUrl || 'https://legalhelper.onrender.com/pricing')}`;

    console.log('Generated direct Paddle checkout URL:', checkoutUrl);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      priceId,
      customerEmail,
      environment,
      method: 'direct_url',
      note: 'Using direct Paddle checkout URL. This should redirect to Paddle hosted checkout.'
    });

  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 