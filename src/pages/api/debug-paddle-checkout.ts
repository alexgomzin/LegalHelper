import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, customerEmail, userId } = req.body;

    console.log('=== DEBUG PADDLE CHECKOUT ===');
    console.log('Request:', { priceId, customerEmail, userId });

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const apiKey = process.env.PADDLE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'No API key configured' });
    }

    const paddleApiUrl = environment === 'sandbox' 
      ? 'https://sandbox-api.paddle.com/transactions'
      : 'https://api.paddle.com/transactions';

    console.log('Using API URL:', paddleApiUrl);

    const requestBody = {
      items: [
        {
          price_id: priceId || "pri_01jxr3y58530jpe07e9cttnamc",
          quantity: 1
        }
      ],
      customer: {
        email: customerEmail || "test@example.com"
      },
      ...(userId && { custom_data: { user_id: userId } })
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(paddleApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.data) {
      console.log('=== ANALYZING RESPONSE ===');
      console.log('Transaction ID:', data.data.id);
      console.log('Transaction status:', data.data.status);
      console.log('Checkout URL:', data.data.checkout?.url);
      console.log('Items:', data.data.items);
      
      // Check if checkout URL looks like a success redirect or payment page
      const checkoutUrl = data.data.checkout?.url;
      if (checkoutUrl) {
        const isSuccessRedirect = checkoutUrl.includes('purchase=success') || checkoutUrl.includes('dashboard');
        const isPaddlePaymentPage = checkoutUrl.includes('paddle.com') || checkoutUrl.includes('checkout.paddle');
        
        console.log('=== CHECKOUT URL ANALYSIS ===');
        console.log('URL:', checkoutUrl);
        console.log('Looks like success redirect:', isSuccessRedirect);
        console.log('Looks like Paddle payment page:', isPaddlePaymentPage);
        
        if (isSuccessRedirect && !isPaddlePaymentPage) {
          console.log('❌ PROBLEM: Checkout URL is pointing to success page instead of payment page');
          console.log('This suggests the Default Payment Link in Paddle dashboard is misconfigured');
        }
      }
    }

    return res.status(200).json({
      success: response.ok,
      status: response.status,
      data: data,
      analysis: {
        transactionId: data.data?.id,
        status: data.data?.status,
        checkoutUrl: data.data?.checkout?.url,
        isSuccessRedirect: data.data?.checkout?.url?.includes('purchase=success'),
        isPaddlePaymentPage: data.data?.checkout?.url?.includes('paddle.com')
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 