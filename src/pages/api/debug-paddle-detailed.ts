import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== DETAILED PADDLE DEBUG START ===');
    
    const { priceId, customerEmail, userId } = req.body;
    
    // Log input parameters
    console.log('Input parameters:', {
      priceId,
      customerEmail,
      userId,
      priceIdType: typeof priceId,
      emailType: typeof customerEmail,
      userIdType: typeof userId
    });

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const apiKey = process.env.PADDLE_API_KEY;
    const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;

    console.log('Environment config:', {
      environment,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 30) + '...' : 'MISSING',
      vendorId,
      nodeEnv: process.env.NODE_ENV
    });

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Test multiple request variations to see which one works
    const paddleApiUrl = environment === 'production' 
      ? 'https://api.paddle.com/transactions' 
      : 'https://sandbox-api.paddle.com/transactions';

    console.log('API URL:', paddleApiUrl);

    // Test 1: Minimal request
    const minimalRequest = {
      items: [
        {
          price_id: priceId || "pri_01jxr3y58530jpe07e9cttnamc",
          quantity: 1
        }
      ],
      customer: {
        email: customerEmail || "test@example.com"
      }
    };

    console.log('=== TEST 1: MINIMAL REQUEST ===');
    console.log('Request body:', JSON.stringify(minimalRequest, null, 2));

    try {
      const response1 = await fetch(paddleApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalRequest)
      });

      const data1 = await response1.json();
      console.log('Response 1 status:', response1.status);
      console.log('Response 1 headers:', Object.fromEntries(response1.headers.entries()));
      console.log('Response 1 data:', JSON.stringify(data1, null, 2));

      if (response1.ok) {
        return res.status(200).json({
          success: true,
          test: 'minimal',
          status: response1.status,
          data: data1
        });
      }
    } catch (error1) {
      console.error('Test 1 failed:', error1);
    }

    // Test 2: With checkout URL
    const withCheckoutRequest = {
      items: [
        {
          price_id: priceId || "pri_01jxr3y58530jpe07e9cttnamc",
          quantity: 1
        }
      ],
      customer: {
        email: customerEmail || "test@example.com"
      },
      checkout: {
        url: "https://legalhelper.onrender.com/dashboard?purchase=success"
      }
    };

    console.log('=== TEST 2: WITH CHECKOUT URL ===');
    console.log('Request body:', JSON.stringify(withCheckoutRequest, null, 2));

    try {
      const response2 = await fetch(paddleApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withCheckoutRequest)
      });

      const data2 = await response2.json();
      console.log('Response 2 status:', response2.status);
      console.log('Response 2 data:', JSON.stringify(data2, null, 2));

      if (response2.ok) {
        return res.status(200).json({
          success: true,
          test: 'with_checkout',
          status: response2.status,
          data: data2
        });
      }
    } catch (error2) {
      console.error('Test 2 failed:', error2);
    }

    // Test 3: With custom data
    const withCustomDataRequest = {
      items: [
        {
          price_id: priceId || "pri_01jxr3y58530jpe07e9cttnamc",
          quantity: 1
        }
      ],
      customer: {
        email: customerEmail || "test@example.com"
      },
      custom_data: {
        user_id: userId || "test-user-123"
      },
      checkout: {
        url: "https://legalhelper.onrender.com/dashboard?purchase=success"
      }
    };

    console.log('=== TEST 3: WITH CUSTOM DATA ===');
    console.log('Request body:', JSON.stringify(withCustomDataRequest, null, 2));

    try {
      const response3 = await fetch(paddleApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withCustomDataRequest)
      });

      const data3 = await response3.json();
      console.log('Response 3 status:', response3.status);
      console.log('Response 3 data:', JSON.stringify(data3, null, 2));

      if (response3.ok) {
        return res.status(200).json({
          success: true,
          test: 'with_custom_data',
          status: response3.status,
          data: data3
        });
      }
    } catch (error3) {
      console.error('Test 3 failed:', error3);
    }

    // Test 4: Different price ID format
    const differentPriceRequest = {
      items: [
        {
          price_id: "pri_01jxr3y58530jpe07e9cttnamc", // Hardcoded known good price ID
          quantity: 1
        }
      ],
      customer: {
        email: "test@example.com"
      }
    };

    console.log('=== TEST 4: HARDCODED PRICE ID ===');
    console.log('Request body:', JSON.stringify(differentPriceRequest, null, 2));

    try {
      const response4 = await fetch(paddleApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(differentPriceRequest)
      });

      const data4 = await response4.json();
      console.log('Response 4 status:', response4.status);
      console.log('Response 4 data:', JSON.stringify(data4, null, 2));

      if (response4.ok) {
        return res.status(200).json({
          success: true,
          test: 'hardcoded_price',
          status: response4.status,
          data: data4
        });
      }
    } catch (error4) {
      console.error('Test 4 failed:', error4);
    }

    // If all tests failed, return comprehensive error info
    console.log('=== ALL TESTS FAILED ===');
    
    return res.status(400).json({
      success: false,
      message: 'All test requests failed',
      environment,
      apiKeyConfigured: !!apiKey,
      tests: {
        minimal: 'failed',
        withCheckout: 'failed',
        withCustomData: 'failed',
        hardcodedPrice: 'failed'
      },
      note: 'Check server logs for detailed error information'
    });

  } catch (error) {
    console.error('Debug endpoint failed:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 