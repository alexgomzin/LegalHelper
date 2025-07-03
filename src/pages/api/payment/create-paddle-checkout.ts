import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, customerEmail, successUrl, cancelUrl, userId } = req.body;

    if (!priceId || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields: priceId and customerEmail' });
    }

    console.log('Creating Paddle Billing checkout for:', { priceId, customerEmail });

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
    const apiKey = process.env.PADDLE_API_KEY;

    // For sandbox mode, try multiple approaches
    if (environment === 'sandbox') {
      console.log('Sandbox mode - trying multiple checkout methods...');
      
      // Method 1: Try API if available
      if (apiKey && vendorId) {
        console.log('Attempting API checkout with credentials...');
        
        const paddleApiUrl = 'https://sandbox-api.paddle.com/transactions';
        
        try {
          const response = await fetch(paddleApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
                user_id: userId
              },
              checkout: {
                url: successUrl || 'https://legalhelper.onrender.com/dashboard?purchase=success'
              }
            })
          });

          const data = await response.json();
          console.log('Paddle API response:', { status: response.status, data });
          
          if (response.ok && data.data && data.data.checkout) {
            console.log('Successfully created checkout via Paddle API');
            return res.status(200).json({
              success: true,
              checkoutUrl: data.data.checkout.url,
              transactionId: data.data.id,
              method: 'api'
            });
          } else {
            console.log('API failed, falling back to direct URL method');
          }
        } catch (apiError) {
          console.log('API request failed, falling back to direct URL method:', apiError);
        }
      }
      
      // Method 2: Direct sandbox URL (works for testing)
      console.log('Using direct sandbox checkout URL...');
      const customData = userId ? `&custom_data[user_id]=${encodeURIComponent(userId)}` : '';
      const directSandboxUrl = `https://sandbox-checkout.paddle.com/checkout?price=${priceId}&customer_email=${encodeURIComponent(customerEmail)}&success_url=${encodeURIComponent(successUrl || 'https://legalhelper.onrender.com/dashboard?purchase=success')}&cancel_url=${encodeURIComponent(cancelUrl || 'https://legalhelper.onrender.com/pricing?purchase=cancelled')}${customData}`;
      
      return res.status(200).json({
        success: true,
        checkoutUrl: directSandboxUrl,
        method: 'direct_sandbox_url',
        note: 'Using direct sandbox URL for testing'
      });
    }

    // Production mode - requires API key
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Paddle API key not configured for production. Please set PADDLE_API_KEY environment variable.',
        note: 'You need to create a Paddle API key in your dashboard under Developer Tools > Authentication'
      });
    }

    if (!vendorId) {
      return res.status(500).json({ error: 'Paddle vendor ID not configured' });
    }

    // Production API call
    const paddleApiUrl = 'https://api.paddle.com/transactions';
    
    try {
      const response = await fetch(paddleApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
            user_id: userId
          },
          checkout: {
            url: successUrl || 'https://legalhelper.onrender.com/dashboard?purchase=success'
          }
        })
      });

      const data = await response.json();
      console.log('Paddle API response:', { status: response.status, data });
      
      if (response.ok && data.data && data.data.checkout) {
        console.log('Successfully created checkout via Paddle API');
        return res.status(200).json({
          success: true,
          checkoutUrl: data.data.checkout.url,
          transactionId: data.data.id,
          method: 'api'
        });
      } else {
        console.error('Production API transaction creation failed:', { status: response.status, data });
        return res.status(400).json({ 
          error: 'Failed to create Paddle checkout',
          details: data.error || 'Unknown error',
          paddleResponse: data
        });
      }
    } catch (apiError) {
      console.error('Production API request failed:', apiError);
      return res.status(500).json({ 
        error: 'Failed to communicate with Paddle API',
        details: apiError instanceof Error ? apiError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 