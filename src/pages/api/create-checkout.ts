import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userEmail, userId } = req.body;

    if (!priceId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For Paddle Billing, we need to create a checkout session via their API
    // For now, let's try a direct redirect approach
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const baseUrl = environment === 'production' 
      ? 'https://checkout.paddle.com' 
      : 'https://sandbox-checkout.paddle.com';

    // Try different URL formats for Paddle Billing
    const possibleUrls = [
      `${baseUrl}/${priceId}?email=${encodeURIComponent(userEmail)}`,
      `${baseUrl}/checkout?price=${priceId}&email=${encodeURIComponent(userEmail)}`,
      `${baseUrl}/checkout/${priceId}?email=${encodeURIComponent(userEmail)}`,
      `https://buy.paddle.com/product/${priceId}?email=${encodeURIComponent(userEmail)}`
    ];

    return res.status(200).json({
      success: true,
      checkoutUrls: possibleUrls,
      priceId,
      userEmail,
      message: 'Try these URLs to see which one works for Paddle Billing',
      recommendation: 'Use the first URL that doesn\'t show "Page Not Found"'
    });

  } catch (error) {
    console.error('Error creating checkout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 