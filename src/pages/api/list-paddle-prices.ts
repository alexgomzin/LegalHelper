import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PADDLE_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'PADDLE_API_KEY not configured',
        message: 'Cannot list prices without API key',
        instructions: [
          '1. Go to Paddle Dashboard → Developer Tools → Authentication',
          '2. Create or copy a server-side API key',
          '3. Add it as PADDLE_API_KEY environment variable in Render'
        ]
      });
    }

    console.log('Fetching prices from Paddle sandbox...');
    
    const response = await fetch('https://sandbox-api.paddle.com/prices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Paddle prices response:', { status: response.status, data });

    if (!response.ok) {
      return res.status(response.status).json({
        error: data,
        message: `Failed to fetch prices: ${response.status}`,
        instructions: [
          'Check if API key is correct and has permissions',
          'Verify you\'re using the sandbox API key',
          'Ensure API key is not expired'
        ]
      });
    }

    const prices = data.data || [];
    
    return res.status(200).json({
      success: true,
      totalPrices: prices.length,
      prices: prices.map((price: any) => ({
        id: price.id,
        description: price.description,
        unit_price: price.unit_price,
        currency: price.unit_price?.currency_code,
        amount: price.unit_price?.amount,
        status: price.status,
        product_id: price.product_id,
        created_at: price.created_at
      })),
      recommendations: prices.length > 0 ? [
        'Use one of the existing price IDs above',
        'Update your environment variables with a valid price ID',
        'Make sure the price status is "active"'
      ] : [
        'No prices found - you need to create products and prices first',
        'Go to Paddle Dashboard → Catalog → Products',
        'Create a product, then add a price to it'
      ],
      nextSteps: [
        'Copy a price ID from the list above',
        'Update NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT in Render',
        'Test the checkout again'
      ]
    });

  } catch (error) {
    console.error('Error fetching prices:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to communicate with Paddle API'
    });
  }
} 