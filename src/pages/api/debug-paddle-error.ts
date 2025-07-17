import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== PADDLE ERROR DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { priceId, customerEmail, userId } = req.body;
    
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const apiKey = process.env.PADDLE_API_KEY;
    
    console.log('Environment:', environment);
    console.log('API Key exists:', !!apiKey);
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_SET');
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'No API key configured',
        environment,
        note: 'Set PADDLE_API_KEY environment variable'
      });
    }

    const paddleApiUrl = 'https://api.paddle.com/transactions';
    
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
      // Removed checkout.url to force using dashboard Default Payment Link
    };
    
    console.log('Request URL:', paddleApiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(paddleApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }
    
    return res.status(200).json({
      success: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      requestBody,
      environment,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_SET'
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 