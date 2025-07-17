import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PADDLE_API_KEY;
    
    return res.status(200).json({
      paddleConfig: {
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 20) + '...' : 'Not set',
        apiKeyLength: apiKey ? apiKey.length : 0,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'not set',
        vendorId: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || 'not set',
        clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? 'Set' : 'Not set',
        priceIds: {
          payPerDocument: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'not set',
          pack5: process.env.NEXT_PUBLIC_PADDLE_5_PACK || 'not set',
          pack15: process.env.NEXT_PUBLIC_PADDLE_15_PACK || 'not set',
          pack30: process.env.NEXT_PUBLIC_PADDLE_30_PACK || 'not set',
          subscription: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION || 'not set'
        }
      },
      troubleshooting: {
        expectedApiKeyFormat: 'pdl_sdbx_apikey_...',
        expectedApiKeyLength: 'Around 70-80 characters',
        status: apiKey ? 
          (apiKey.startsWith('pdl_sdbx_apikey_') ? 'API key format looks correct' : 'API key format might be wrong') : 
          'API key not found in environment'
      },
      recommendations: !apiKey ? [
        'Add PADDLE_API_KEY to your Render environment variables',
        'Go to Paddle Dashboard → Developer Tools → Authentication',
        'Create a new server-side API key',
        'Copy the full key (starts with pdl_sdbx_apikey_)',
        'Add it to Render and redeploy'
      ] : [
        'API key is configured - checking permissions...',
        'If 403 errors persist, recreate the API key in Paddle dashboard',
        'Ensure the API key has "Read" permissions for Products and Prices',
        'Try creating a new API key with all permissions'
      ]
    });

  } catch (error) {
    console.error('Error checking config:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 