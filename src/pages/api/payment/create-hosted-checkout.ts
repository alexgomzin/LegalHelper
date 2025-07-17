import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, customerEmail, userId, successUrl, cancelUrl } = req.body;

    if (!priceId || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields: priceId and customerEmail' });
    }

    console.log('Creating hosted checkout for:', { priceId, customerEmail, userId });

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const apiKey = process.env.PADDLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Paddle API key not configured. Please set PADDLE_API_KEY environment variable.',
      });
    }

    // Use the proper API endpoints for hosted checkouts
    const paddleApiUrl = environment === 'sandbox' 
      ? 'https://sandbox-api.paddle.com/checkouts'
      : 'https://api.paddle.com/checkouts';

    console.log('Using hosted checkout API:', paddleApiUrl);

    // Create a hosted checkout instead of a transaction
    const requestBody = {
      items: [
        {
          price_id: priceId,
          quantity: 1
        }
      ],
      customer_email: customerEmail,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://legalhelper.onrender.com'}/dashboard?purchase=success&_ptxn={transaction_id}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://legalhelper.onrender.com'}/pricing?purchase=cancelled`,
      ...(userId && { custom_data: { user_id: userId } })
    };

    console.log('Hosted checkout request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(paddleApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Hosted checkout response:', { status: response.status, data });

    if (response.ok && data.data) {
      console.log('Successfully created hosted checkout');
      return res.status(200).json({
        success: true,
        checkoutUrl: data.data.url, // This should be the actual Paddle payment page
        checkoutId: data.data.id,
        method: 'hosted_checkout'
      });
    } else {
      console.error('Hosted checkout creation failed:', { status: response.status, data });
      return res.status(400).json({ 
        error: 'Failed to create hosted checkout',
        details: data.error || 'Unknown error',
        paddleResponse: data,
        status: response.status
      });
    }

  } catch (error) {
    console.error('Error creating hosted checkout:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 