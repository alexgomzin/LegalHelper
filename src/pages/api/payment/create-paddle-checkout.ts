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
      // Try creating transaction via API
      try {
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
              url: successUrl || `${req.headers.origin}/dashboard?purchase=success`
            }
          })
        });

        const data = await response.json();
        
        if (response.ok && data.data && data.data.checkout) {
          return res.status(200).json({
            success: true,
            checkoutUrl: data.data.checkout.url,
            transactionId: data.data.id,
            method: 'api'
          });
        } else {
          console.warn('API transaction creation failed:', data);
        }
      } catch (apiError) {
        console.warn('API approach failed:', apiError);
      }
    }

    // Fallback: Generate Paddle.js compatible checkout URL
    // This creates a URL that can be used with Paddle.js overlay checkout
    const baseUrl = window.location ? window.location.origin : req.headers.origin;
    
    // Create a checkout URL that will use Paddle.js
    const checkoutUrl = `${baseUrl}/checkout?priceId=${priceId}&email=${encodeURIComponent(customerEmail)}&success=${encodeURIComponent(successUrl || `${baseUrl}/dashboard?purchase=success`)}&cancel=${encodeURIComponent(cancelUrl || `${baseUrl}/pricing`)}`;

    console.log('Generated fallback checkout URL:', checkoutUrl);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      priceId,
      customerEmail,
      environment,
      method: 'fallback',
      note: 'Using fallback method. Configure PADDLE_API_KEY for direct API integration.'
    });

  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 