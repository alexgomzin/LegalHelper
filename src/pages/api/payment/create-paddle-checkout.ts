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

    // Paddle Billing API endpoint
    const paddleApiUrl = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
      ? 'https://api.paddle.com/transactions'
      : 'https://sandbox-api.paddle.com/transactions';

    // Prepare checkout data for Paddle Billing API
    const checkoutData = {
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
    };

    // For now, since we don't have Paddle API key set up, let's try direct checkout URLs
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    
    // Try different Paddle Billing checkout URL formats
    const checkoutUrls = [
      `https://checkout.paddle.com/checkout?_ptxn=${priceId}&customer_email=${encodeURIComponent(customerEmail)}`,
      `https://checkout.paddle.com/${priceId}?customer_email=${encodeURIComponent(customerEmail)}`,
      `https://buy.paddle.com/product/${priceId}?customer_email=${encodeURIComponent(customerEmail)}`,
      `https://www.paddle.com/checkout/${priceId}?customer_email=${encodeURIComponent(customerEmail)}`
    ];

    if (environment === 'sandbox') {
      checkoutUrls.unshift(
        `https://sandbox-checkout.paddle.com/checkout?_ptxn=${priceId}&customer_email=${encodeURIComponent(customerEmail)}`,
        `https://sandbox-checkout.paddle.com/${priceId}?customer_email=${encodeURIComponent(customerEmail)}`
      );
    }

    // Return the first URL to try
    const checkoutUrl = checkoutUrls[0];

    console.log('Generated checkout URL:', checkoutUrl);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      allUrls: checkoutUrls, // For debugging
      priceId,
      customerEmail,
      environment
    });

  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 