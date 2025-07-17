import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const apiKey = process.env.PADDLE_API_KEY;

    console.log('=== SIMPLE ERROR DEBUG ===');
    console.log('Environment:', environment);
    console.log('API Key exists:', !!apiKey);
    console.log('API Key format:', apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}` : 'MISSING');

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Use the absolute simplest request possible
    const paddleApiUrl = environment === 'production' 
      ? 'https://api.paddle.com/transactions' 
      : 'https://sandbox-api.paddle.com/transactions';

    const simpleRequest = {
      items: [
        {
          price_id: "pri_01jxr3y58530jpe07e9cttnamc",
          quantity: 1
        }
      ],
      customer: {
        email: "test@example.com"
      }
    };

    console.log('Making request to:', paddleApiUrl);
    console.log('Request body:', JSON.stringify(simpleRequest, null, 2));

    const response = await fetch(paddleApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleRequest)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      const responseText = await response.text();
      console.log('Failed to parse JSON response:', responseText);
      return res.status(500).json({
        error: 'Failed to parse Paddle response',
        status: response.status,
        responseText: responseText,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      });
    }

    console.log('Response data:', JSON.stringify(responseData, null, 2));

    // Return detailed error information
    return res.status(200).json({
      paddleApiUrl,
      environment,
      requestSent: simpleRequest,
      response: {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      },
      apiKeyInfo: {
        exists: !!apiKey,
        format: apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}` : 'MISSING',
        startsWithCorrectPrefix: apiKey ? apiKey.startsWith('pdl_') : false,
        environment: apiKey && apiKey.includes('live') ? 'production' : apiKey && apiKey.includes('sdbx') ? 'sandbox' : 'unknown'
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 