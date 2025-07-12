import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const apiKey = process.env.PADDLE_API_KEY;
    
    // Check all price IDs
    const priceIds = {
      payPerDocument: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
      pack5: process.env.NEXT_PUBLIC_PADDLE_5_PACK,
      pack15: process.env.NEXT_PUBLIC_PADDLE_15_PACK,
      pack30: process.env.NEXT_PUBLIC_PADDLE_30_PACK,
      subscription: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION,
    };

    // Validate environment variables
    const validation = {
      environment: {
        value: environment,
        valid: ['sandbox', 'production'].includes(environment),
        issue: !['sandbox', 'production'].includes(environment) ? 'Must be "sandbox" or "production"' : null
      },
      vendorId: {
        value: vendorId,
        valid: !!vendorId && /^\d+$/.test(vendorId),
        issue: !vendorId ? 'Missing vendor ID' : !/^\d+$/.test(vendorId) ? 'Must be numeric' : null
      },
      clientToken: {
        value: clientToken ? clientToken.substring(0, 20) + '...' : null,
        valid: !!clientToken,
        issue: !clientToken ? 'Missing client token - THIS IS CRITICAL FOR CHECKOUT' : null,
        expectedFormat: environment === 'production' ? 'Should start with "live_"' : 'Should start with "test_"'
      },
      apiKey: {
        value: apiKey ? apiKey.substring(0, 20) + '...' : null,
        valid: !!apiKey,
        issue: !apiKey ? 'Missing API key' : null,
        expectedFormat: environment === 'production' ? 'Should start with "live_"' : 'Should start with "test_"'
      }
    };

    // Validate price IDs
    const priceValidation = Object.entries(priceIds).map(([key, id]) => ({
      product: key,
      id: id,
      valid: !!id && id.startsWith('pri_'),
      issue: !id ? 'Missing price ID' : !id.startsWith('pri_') ? 'Must start with "pri_"' : null,
      environment_match: environment === 'production' ? 
        (id?.includes('_01') ? 'Looks like production ID' : 'Might be sandbox ID') :
        (id?.includes('_01') ? 'Looks correct' : 'Unknown format')
    }));

    // Test API connectivity if we have credentials
    let apiTest = null;
    if (apiKey) {
      try {
        const apiUrl = environment === 'production' ? 
          'https://api.paddle.com/products' : 
          'https://sandbox-api.paddle.com/products';
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        apiTest = {
          success: response.ok,
          status: response.status,
          message: response.ok ? 'API connection successful' : 'API connection failed',
          error: response.ok ? null : data.error || 'Unknown error',
          url: apiUrl
        };
      } catch (error) {
        apiTest = {
          success: false,
          status: 0,
          message: 'API request failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test a specific price ID if provided
    let priceTest = null;
    const testPriceId = priceIds.payPerDocument;
    if (apiKey && testPriceId) {
      try {
        const apiUrl = environment === 'production' ? 
          `https://api.paddle.com/prices/${testPriceId}` : 
          `https://sandbox-api.paddle.com/prices/${testPriceId}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        priceTest = {
          priceId: testPriceId,
          success: response.ok,
          status: response.status,
          message: response.ok ? 'Price ID is valid' : 'Price ID validation failed',
          error: response.ok ? null : data.error || 'Unknown error',
          data: response.ok ? data : null
        };
      } catch (error) {
        priceTest = {
          priceId: testPriceId,
          success: false,
          status: 0,
          message: 'Price validation request failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // API Key validation
    const apiKeyValidation = {
      value: apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT_SET',
      valid: !!apiKey,
      issue: !apiKey ? 'Missing PADDLE_API_KEY' : null,
      expectedFormat: environment === 'production' ? 'Should start with "pdl_live_"' : 'Should start with "pdl_test_"'
    };

    // Critical issues detection
    const criticalIssues: string[] = [];
    
    if (!vendorId) criticalIssues.push('Missing NEXT_PUBLIC_PADDLE_VENDOR_ID');
    if (!clientToken) criticalIssues.push('Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN');
    if (!apiKey) criticalIssues.push('Missing PADDLE_API_KEY');
    
    // Check if API key matches environment
    if (apiKey) {
      if (environment === 'production' && !apiKey.startsWith('pdl_live_')) {
        criticalIssues.push('Using sandbox API key in production mode');
      } else if (environment === 'sandbox' && !apiKey.startsWith('pdl_test_')) {
        criticalIssues.push('Using production API key in sandbox mode');
      }
    }

    // Generate recommendations
    const recommendations = [];
    if (!clientToken) {
      recommendations.push('1. Go to Paddle Dashboard → Developer Tools → Authentication');
      recommendations.push('2. Create a CLIENT-SIDE token (not server-side)');
      recommendations.push('3. Copy the token and add it as NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in Render');
    }
    if (environment === 'production' && clientToken && !clientToken.startsWith('live_')) {
      recommendations.push('4. Make sure you\'re using PRODUCTION client token (starts with "live_")');
    }
    if (priceValidation.some(p => !p.valid)) {
      recommendations.push('5. Update price IDs to use production versions from Paddle dashboard');
    }

    return res.status(200).json({
      status: criticalIssues.length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
      environment,
      validation,
      priceValidation,
      apiTest,
      priceTest,
      criticalIssues,
      recommendations,
      summary: {
        totalIssues: criticalIssues.length,
        mostLikelyCause: criticalIssues[0] || 'Configuration looks correct',
        nextStep: criticalIssues.length > 0 ? 'Fix critical issues above' : 'Configuration appears correct - check network/firewall'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in full debug:', error);
    return res.status(500).json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 