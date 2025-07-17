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

    // Use the correct API endpoints for transactions (which create hosted checkouts)
    const paddleApiUrl = environment === 'sandbox' 
      ? 'https://sandbox-api.paddle.com/transactions'
      : 'https://api.paddle.com/transactions';

    console.log('Using transaction API for hosted checkout:', paddleApiUrl);

    // Create a transaction which automatically creates a hosted checkout
    // For production, we let Paddle use the default payment link configured in the dashboard
    const requestBody = {
      items: [
        {
          price_id: priceId,
          quantity: 1
        }
      ],
      customer: {
        email: customerEmail
      },
      ...(userId && { custom_data: { user_id: userId } })
    };

    // Only add checkout URLs if they're provided and the domain is approved
    if (successUrl || cancelUrl) {
      requestBody.checkout = {
        ...(successUrl && { url: successUrl }),
        ...(cancelUrl && { cancel_url: cancelUrl })
      };
    }

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
      console.log('Successfully created transaction with hosted checkout');
      
      // For draft transactions, we need to handle checkout differently
      if (data.data.status === 'draft') {
        console.log('Transaction is draft, frontend should use Paddle.js with transaction ID');
        
        return res.status(200).json({
          success: true,
          transactionId: data.data.id,
          method: 'paddle_js_transaction',
          status: data.data.status,
          useTransaction: true,
          message: 'Use Paddle.js with transaction ID to open checkout'
        });
      } else {
        // For ready transactions, use the checkout URL from response
      return res.status(200).json({
        success: true,
          checkoutUrl: data.data.checkout?.url,
          checkoutId: data.data.checkout?.id,
          transactionId: data.data.id,
          method: 'transaction_checkout',
          status: data.data.status
      });
      }
    } else {
      console.error('Transaction creation failed:', { status: response.status, data });
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