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

    // For Paddle Billing, we need to create a transaction and get its checkout URL
    // This requires the PADDLE_API_KEY to be configured
    const apiKey = process.env.PADDLE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Paddle API key not configured. Please set PADDLE_API_KEY environment variable.',
        note: 'You need to create a Paddle API key in your dashboard under Developer Tools > Authentication'
      });
    }

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
          checkout: {
            url: successUrl || 'https://legalhelper.onrender.com/dashboard?purchase=success'
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
        console.error('API transaction creation failed:', { status: response.status, data });
        return res.status(400).json({ 
          error: 'Failed to create Paddle checkout',
          details: data.error || 'Unknown error',
          paddleResponse: data
        });
      }
    } catch (apiError) {
      console.error('API request failed:', apiError);
      return res.status(500).json({ 
        error: 'Failed to communicate with Paddle API',
        details: apiError instanceof Error ? apiError.message : 'Unknown error'
      });
    }

    // This code should not be reached since we handle API response above
    return res.status(500).json({
      error: 'Unexpected code path reached',
      note: 'This should not happen - please check the API implementation'
    });

  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 