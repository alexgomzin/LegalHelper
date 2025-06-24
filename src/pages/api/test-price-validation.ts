import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT;
    const apiKey = process.env.PADDLE_API_KEY;
    
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID not configured' });
    }

    // Test 1: Check if we can fetch price details from Paddle API
    if (apiKey) {
      try {
        console.log(`Testing price ID: ${priceId}`);
        
        const response = await fetch(`https://sandbox-api.paddle.com/prices/${priceId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Paddle price response:', { status: response.status, data });

        if (response.ok) {
          return res.status(200).json({
            success: true,
            priceId: priceId,
            priceDetails: data.data,
            status: 'Valid price ID',
            message: 'Price exists and is accessible via API',
            recommendations: [
              'If checkout still fails, check if price is marked as Active',
              'Verify the linked product is published',
              'Ensure tax settings are configured'
            ]
          });
        } else {
          return res.status(200).json({
            success: false,
            priceId: priceId,
            error: data,
            status: 'Price validation failed',
            message: `Paddle API returned ${response.status}: ${data.error?.detail || 'Unknown error'}`,
            recommendations: [
              'Check if price ID exists in your Paddle dashboard',
              'Verify price is created in sandbox environment',
              'Ensure API key has correct permissions'
            ]
          });
        }
      } catch (apiError) {
        console.error('API validation failed:', apiError);
        return res.status(200).json({
          success: false,
          priceId: priceId,
          error: apiError instanceof Error ? apiError.message : 'Unknown error',
          status: 'API request failed',
          message: 'Could not connect to Paddle API',
          fallback: 'Will test basic configuration instead'
        });
      }
    }

    // Test 2: If no API key, just return configuration info
    return res.status(200).json({
      success: true,
      priceId: priceId,
      status: 'Configuration check only',
      message: 'Price ID is configured, but cannot validate with Paddle API (no API key)',
      configuration: {
        priceId: priceId,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
        vendorId: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
        hasClientToken: !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        hasApiKey: !!apiKey
      },
      recommendations: [
        'Manually check price status in Paddle dashboard',
        'Ensure price is Active and product is Published',
        'Add PADDLE_API_KEY for automated validation'
      ]
    });

  } catch (error) {
    console.error('Error validating price:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 