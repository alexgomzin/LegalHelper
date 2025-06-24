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

    // Check if we have API key configured
    const apiKey = process.env.PADDLE_API_KEY;
    
    if (apiKey) {
      console.log('Attempting Paddle API transaction creation...');
      // Try creating transaction via API
      try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        const response = await fetch(paddleApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                price_id: priceId,
                quantity: 1
              }
            ],
            customer: {
              email: customerEmail
            },
            custom_data: {
              user_email: customerEmail
            },
            checkout: {
              url: successUrl || `${baseUrl}/dashboard?purchase=success`
            }
          })
        });

        const data = await response.json();
        console.log('Paddle API response:', { status: response.status, data });
        
        if (response.ok && data.data && data.data.checkout) {
          console.log('Successfully created checkout via Paddle API');
          return res.status(200).json({
            success: true,
            checkoutUrl: data.data.checkout.url,
            transactionId: data.data.id,
            method: 'api'
          });
        } else {
          console.warn('API transaction creation failed:', { status: response.status, data });
        }
      } catch (apiError) {
        console.warn('API approach failed:', apiError);
      }
    } else {
      console.log('No PADDLE_API_KEY configured, using fallback method');
    }

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